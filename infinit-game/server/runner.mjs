// Compila e executa o código do jogador (Java e Python) em processos isolados, com tempo limite.
// ATENÇÃO: executar código de terceiros é perigoso. Em produção rode SEMPRE dentro do container
// do Dockerfile (usuário sem privilégios, sem rede, CPU/memória limitadas). Veja o README.

import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ALL_CHALLENGES, deepEqual, testsFor } from '../shared/challenges.js';

const MAX_OUTPUT = 64 * 1024;
const MAX_LOG_LINES = 50;
export const MAX_CODE = 20_000;

const JAVA = process.env.JAVA_BIN ?? 'java';
const JAVAC = process.env.JAVAC_BIN ?? 'javac';
const PYTHON = process.env.PYTHON_BIN ?? 'python3';

/** Ambiente mínimo: nada de variáveis do servidor (tokens, chaves) chega ao código do jogador. */
const cleanEnv = (cwd) => ({ PATH: process.env.PATH ?? '/usr/bin:/bin', HOME: cwd, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8', PYTHONIOENCODING: 'utf-8' });

function available(cmd, args) {
  try {
    return spawnSync(cmd, args, { timeout: 8000, env: cleanEnv(tmpdir()) }).status === 0;
  } catch {
    return false;
  }
}

export const LANG_STATUS = {
  java: available(JAVAC, ['-version']) && available(JAVA, ['-version']),
  python: available(PYTHON, ['--version']),
  javascript: true, // roda no navegador
};

function exec(cmd, args, { cwd, timeout }) {
  return new Promise((resolve) => {
    let out = '';
    let err = '';
    let timedOut = false;
    const child = spawn(cmd, args, { cwd, env: cleanEnv(cwd), detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const kill = () => {
      try {
        process.kill(-child.pid, 'SIGKILL');
      } catch {
        /* já terminou */
      }
    };
    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, timeout);
    child.stdout.on('data', (d) => {
      if (out.length < MAX_OUTPUT) out += d;
      else kill();
    });
    child.stderr.on('data', (d) => {
      if (err.length < MAX_OUTPUT) err += d;
    });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: -1, out, err: String(e.message), timedOut });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, out, err, timedOut });
    });
  });
}

// ───────────────────────── Java ─────────────────────────

const jstr = (s) => JSON.stringify(s); // literais JSON de string são literais Java válidos (exceto \u2028, raro)

function javaLiteral(type, v) {
  switch (type) {
    case 'int':
      return String(Math.trunc(v));
    case 'boolean':
      return v ? 'true' : 'false';
    case 'String':
      return jstr(v);
    case 'int[]':
      return `new int[]{${v.map((x) => Math.trunc(x)).join(', ')}}`;
    case 'String[]':
      return `new String[]{${v.map(jstr).join(', ')}}`;
    case 'int[][]':
      return `new int[][]{${v.map((row) => `{${row.map((x) => Math.trunc(x)).join(', ')}}`).join(', ')}}`;
    default:
      throw new Error(`Tipo Java não suportado: ${type}`);
  }
}

function javaHarness(v, tests, nonce) {
  const calls = tests
    .map((t) => {
      const args = t.input.map((x, i) => javaLiteral(v.params[i][0], x)).join(', ');
      return `    try { Object r = Solucao.${v.fn}(${args}); res.add("{\\"ok\\":true,\\"got\\":" + q(j(r)) + "}"); }
    catch (Throwable e) { res.add("{\\"ok\\":false,\\"err\\":" + q(e.toString()) + "}"); }`;
    })
    .join('\n');

  return `import java.util.*;

public class Main {
  static String q(String s) {
    StringBuilder b = new StringBuilder("\\"");
    for (char c : s.toCharArray()) {
      if (c == '"') b.append("\\\\\\"");
      else if (c == '\\\\') b.append("\\\\\\\\");
      else if (c < 0x20) b.append(String.format("\\\\u%04x", (int) c));
      else b.append(c);
    }
    return b.append('"').toString();
  }
  static String j(Object o) {
    if (o == null) return "null";
    if (o instanceof String s) return q(s);
    if (o instanceof Character c) return q(String.valueOf(c));
    if (o instanceof Number || o instanceof Boolean) return String.valueOf(o);
    if (o instanceof int[] a) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (int x : a) sj.add(String.valueOf(x)); return sj.toString(); }
    if (o instanceof long[] a) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (long x : a) sj.add(String.valueOf(x)); return sj.toString(); }
    if (o instanceof double[] a) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (double x : a) sj.add(String.valueOf(x)); return sj.toString(); }
    if (o instanceof boolean[] a) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (boolean x : a) sj.add(String.valueOf(x)); return sj.toString(); }
    if (o instanceof Object[] a) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (Object x : a) sj.add(j(x)); return sj.toString(); }
    if (o instanceof Collection<?> c) { StringJoiner sj = new StringJoiner(",", "[", "]"); for (Object x : c) sj.add(j(x)); return sj.toString(); }
    return q(String.valueOf(o));
  }
  public static void main(String[] args) {
    List<String> res = new ArrayList<>();
${calls}
    System.out.flush();
    System.out.println();
    System.out.println("${nonce}" + "[" + String.join(",", res) + "]");
  }
}
`;
}

/** Converte "Solucao.java:5: error: ..." em mensagens amigáveis. */
function javacErrors(stderr, dir, v) {
  const text = stderr.replaceAll(dir + '/', '').replace(/^Picked up .*\n/gm, '').trim();
  if (/^Main\.java/m.test(text) && !/^Solucao\.java/m.test(text)) {
    const sig = `public static ${v.ret} ${v.fn}(${v.params.map(([t]) => t).join(', ')})`;
    return `Não encontrei o método esperado na classe Solucao.\nConfira o nome da classe e a assinatura: ${sig}`;
  }
  return text
    .split('\n')
    .filter((l) => !/^\d+ errors?$/.test(l.trim()))
    .join('\n')
    .replace(/Solucao\.java:(\d+): error:/g, 'Linha $1: erro:')
    .slice(0, 4000);
}

async function runJava(dir, code, challenge, nonce) {
  const v = challenge.variants.java;
  const tests = testsFor(challenge, 'java');
  if (!/\bclass\s+Solucao\b/.test(code)) {
    return { fatal: 'Seu código precisa declarar a classe "Solucao" (public class Solucao { ... }).' };
  }
  await writeFile(join(dir, 'Solucao.java'), code.replace(/^\s*package\s+[\w.]+\s*;/m, ''));
  await writeFile(join(dir, 'Main.java'), javaHarness(v, tests, nonce));

  const c = await exec(JAVAC, ['-encoding', 'UTF-8', '-nowarn', '-J-Xmx256m', '-d', 'out', 'Solucao.java', 'Main.java'], { cwd: dir, timeout: 25000 });
  if (c.timedOut) return { fatal: 'O compilador demorou demais. Tente novamente.' };
  if (c.code !== 0) return { fatal: 'Erro de compilação:\n' + javacErrors(c.err, dir, v), compile: true };

  const r = await exec(JAVA, ['-Xmx160m', '-Xss16m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', '-Dfile.encoding=UTF-8', '-cp', 'out', 'Main'], { cwd: dir, timeout: 6000 });
  return parseRun(r, nonce, tests);
}

// ───────────────────────── Python ─────────────────────────

function pythonHarness(v, tests, nonce) {
  const data = JSON.stringify(JSON.stringify(tests.map((t) => t.input)));
  return `import json, sys, copy, traceback
sys.setrecursionlimit(3000)
NONCE = ${JSON.stringify(nonce)}
def emit(obj):
    sys.stdout.flush()
    print()
    print(NONCE + json.dumps(obj, ensure_ascii=False))
    sys.stdout.flush()
src = open("solucao.py", encoding="utf-8").read()
try:
    code = compile(src, "solucao.py", "exec")
except SyntaxError as e:
    emit({"fatal": "Erro de sintaxe na linha %s: %s" % (e.lineno, e.msg), "compile": True}); sys.exit(0)
ns = {"__name__": "solucao"}
try:
    exec(code, ns)
except BaseException as e:
    emit({"fatal": "Erro ao carregar o código: " + "".join(traceback.format_exception_only(type(e), e)).strip()}); sys.exit(0)
fn = ns.get(${JSON.stringify(v.fn)})
if not callable(fn):
    emit({"fatal": 'Não encontrei a função "${v.fn}". Confira o nome (def ${v.fn}(...)).'}); sys.exit(0)
res = []
for args in json.loads(${data}):
    try:
        r = fn(*copy.deepcopy(args))
        try:
            got = json.dumps(r, ensure_ascii=False)
        except TypeError:
            got = json.dumps(repr(r), ensure_ascii=False)
        res.append({"ok": True, "got": got})
    except RecursionError:
        res.append({"ok": False, "err": "RecursionError: recursão infinita?"})
    except BaseException as e:
        res.append({"ok": False, "err": type(e).__name__ + ": " + str(e)})
emit(res)
`;
}

async function runPython(dir, code, challenge, nonce) {
  const v = challenge.variants.python;
  const tests = testsFor(challenge, 'python');
  await writeFile(join(dir, 'solucao.py'), code);
  await writeFile(join(dir, 'harness.py'), pythonHarness(v, tests, nonce));
  const r = await exec(PYTHON, ['-I', '-S', '-B', 'harness.py'], { cwd: dir, timeout: 5000 });
  return parseRun(r, nonce, tests);
}

// ───────────────────────── Comum ─────────────────────────

const show = (v) => JSON.stringify(v);

function parseRun(r, nonce, tests) {
  if (r.timedOut) return { fatal: 'Tempo esgotado. Existe um loop infinito (ou uma recursão sem fim) no seu código?' };
  const lines = r.out.split('\n');
  const idx = lines.findLastIndex((l) => l.startsWith(nonce));
  const logs = lines
    .slice(0, idx === -1 ? lines.length : idx)
    .filter((l, i, arr) => !(i === arr.length - 1 && l === ''))
    .slice(0, MAX_LOG_LINES);

  if (idx === -1) {
    const err = r.err.replace(/^Picked up .*\n/gm, '').trim();
    return { fatal: err ? 'Erro na execução:\n' + err.slice(0, 3000) : 'O programa terminou antes de rodar os testes (System.exit / exit()?).', logs };
  }
  const payload = JSON.parse(lines[idx].slice(nonce.length));
  if (!Array.isArray(payload)) return { fatal: payload.fatal, compile: payload.compile, logs };

  const results = payload.map((p, i) => {
    const t = tests[i];
    const input = t.input.map(show).join(', ');
    if (!p.ok) return { input, expected: show(t.expected), error: p.err, passed: false };
    let actual;
    try {
      actual = JSON.parse(p.got);
    } catch {
      actual = p.got;
    }
    return { input, expected: show(t.expected), actual: show(actual), passed: deepEqual(actual, t.expected) };
  });
  return { results, logs };
}

/**
 * Executa um código para um desafio. Retorna o mesmo formato usado pelo frontend:
 * { success, fatal?, compile?, error?, results[], logs[] }
 */
export async function runSubmission({ lang, challengeId, code }) {
  const challenge = ALL_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return { success: false, fatal: true, error: 'Desafio não encontrado.', results: [], logs: [] };
  if (lang !== 'java' && lang !== 'python') return { success: false, fatal: true, error: 'Linguagem não suportada no servidor.', results: [], logs: [] };
  if (!LANG_STATUS[lang]) return { success: false, fatal: true, error: `O servidor não tem ${lang === 'java' ? 'o JDK (javac/java)' : 'o Python 3'} instalado.`, results: [], logs: [] };
  if (typeof code !== 'string' || code.length > MAX_CODE) return { success: false, fatal: true, error: 'Código vazio ou grande demais.', results: [], logs: [] };

  const dir = await mkdtemp(join(tmpdir(), 'infinit-'));
  const nonce = `@@INFINIT-${randomBytes(12).toString('hex')}@@`;
  try {
    const r = lang === 'java' ? await runJava(dir, code, challenge, nonce) : await runPython(dir, code, challenge, nonce);
    if (r.fatal) return { success: false, fatal: true, compile: !!r.compile, error: r.fatal, results: [], logs: r.logs ?? [] };
    return { success: r.results.every((x) => x.passed), results: r.results, logs: r.logs };
  } catch (e) {
    return { success: false, fatal: true, error: 'Falha interna ao executar: ' + (e instanceof Error ? e.message : String(e)), results: [], logs: [] };
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
