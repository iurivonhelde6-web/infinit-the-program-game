// Confere os 90 desafios (3 dificuldades × 10 fases × 3 linguagens):
// a solução de referência passa em todos os testes e o código inicial é reprovado.
// Uso: npm run validate   (ou: npm run validate -- senior)
import { ALL_CHALLENGES, LANGS, deepEqual, starterCode, testsFor } from '../shared/challenges.js';
import { LANG_STATUS, runSubmission } from './runner.mjs';

// Corpo das soluções de referência (entram no lugar do "Seu código aqui").
const SOL = {
  java: {
    101: 'return n * 2;',
    102: 'return "Olá, " + nome + "!";',
    103: 'return n % 2 == 0;',
    104: 'int t = 0; for (int x : arr) t += x; return t;',
    105: 'return Math.max(a, b);',
    106: 'int c = 0; for (char ch : texto.toCharArray()) if (ch == letra.charAt(0)) c++; return c;',
    107: 'return new StringBuilder(texto).reverse().toString();',
    108: 'return Arrays.asList(nomes).contains("Rick");',
    109: 'int c = 0; for (char ch : texto.toLowerCase().toCharArray()) if ("aeiou".indexOf(ch) >= 0) c++; return c;',
    110: 'int r = 1; for (int i = 2; i <= n; i++) r *= i; return r;',
    201: 'List<String> r = new ArrayList<>(); for (String s : nomes) if (!s.startsWith("Agente")) r.add(s); return r.toArray(new String[0]);',
    202: 'String l = texto.toLowerCase().replaceAll("[^a-z0-9]", ""); return l.equals(new StringBuilder(l).reverse().toString());',
    203: 'String[] r = new String[n]; for (int i = 1; i <= n; i++) r[i-1] = i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : String.valueOf(i); return r;',
    204: 'Map<String,Integer> c = new HashMap<>(); String[] ws = texto.toLowerCase().split(" "); int best = 0; for (String w : ws) best = Math.max(best, c.merge(w, 1, Integer::sum)); for (String w : ws) if (c.get(w) == best) return w; return "";',
    205: 'LinkedHashSet<Integer> s = new LinkedHashSet<>(); for (int x : nums) s.add(x); return s.stream().mapToInt(Integer::intValue).toArray();',
    206: 'int a = -1, b = -1; for (int x : nums) { if (x > a) { b = a; a = x; } else if (x < a && x > b) b = x; } return b;',
    207: 'Deque<Character> st = new ArrayDeque<>(); for (char ch : s.toCharArray()) { if ("([{".indexOf(ch) >= 0) st.push(ch); else { if (st.isEmpty()) return false; char o = st.pop(); if ("([{".indexOf(o) != ")]}".indexOf(ch)) return false; } } return st.isEmpty();',
    208: 'StringBuilder sb = new StringBuilder(); int i = 0; while (i < s.length()) { int j = i; while (j < s.length() && s.charAt(j) == s.charAt(i)) j++; sb.append(s.charAt(i)).append(j - i); i = j; } return sb.toString();',
    209: 'int n = nums.length; int[] r = new int[n]; for (int i = 0; i < n; i++) r[(i + k) % n] = nums[i]; return r;',
    210: 'Map<Integer,Integer> m = new HashMap<>(); for (int i = 0; i < nums.length; i++) { Integer j = m.get(alvo - nums[i]); if (j != null) return new int[]{j, i}; m.put(nums[i], i); } return new int[0];',
    301: 'int[] t = new int[nums.length]; int len = 0; for (int x : nums) { int i = Arrays.binarySearch(t, 0, len, x); if (i < 0) i = -(i + 1); t[i] = x; if (i == len) len++; } return len;',
    302: 'int R = grade.length, C = grade[0].length; int[] d = new int[C]; d[0] = grade[0][0] == 0 ? 1 : 0; for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) { if (grade[i][j] == 1) d[j] = 0; else if (j > 0) d[j] += d[j-1]; } return d[C-1];',
    303: 'Map<Character,Integer> last = new HashMap<>(); int best = 0, start = 0; for (int i = 0; i < s.length(); i++) { Integer p = last.get(s.charAt(i)); if (p != null && p >= start) start = p + 1; last.put(s.charAt(i), i); best = Math.max(best, i - start + 1); } return best;',
    304: 'return new Object() { String e = expr.replace(" ", ""); int p = 0; int expr() { int v = term(); while (p < e.length() && (e.charAt(p) == \'+\' || e.charAt(p) == \'-\')) { char o = e.charAt(p++); int r = term(); v = o == \'+\' ? v + r : v - r; } return v; } int term() { int v = fac(); while (p < e.length() && (e.charAt(p) == \'*\' || e.charAt(p) == \'/\')) { char o = e.charAt(p++); int r = fac(); v = o == \'*\' ? v * r : v / r; } return v; } int fac() { if (e.charAt(p) == \'(\') { p++; int v = expr(); p++; return v; } int v = 0; while (p < e.length() && Character.isDigit(e.charAt(p))) v = v * 10 + (e.charAt(p++) - \'0\'); return v; } }.expr();',
    305: 'int R = grade.length, C = grade[0].length, n = 0; boolean[][] seen = new boolean[R][C]; for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) if (grade[i][j] == 1 && !seen[i][j]) { n++; Deque<int[]> st = new ArrayDeque<>(); st.push(new int[]{i, j}); seen[i][j] = true; while (!st.isEmpty()) { int[] c = st.pop(); int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}}; for (int[] d : dirs) { int y = c[0] + d[0], x = c[1] + d[1]; if (y >= 0 && y < R && x >= 0 && x < C && grade[y][x] == 1 && !seen[y][x]) { seen[y][x] = true; st.push(new int[]{y, x}); } } } } return n;',
    306: 'int R = grade.length, C = grade[0].length; int[][] d = new int[R][C]; for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) d[i][j] = grade[i][j] + (i == 0 && j == 0 ? 0 : Math.min(i > 0 ? d[i-1][j] : Integer.MAX_VALUE, j > 0 ? d[i][j-1] : Integer.MAX_VALUE)); return d[R-1][C-1];',
    307: 'int[][] d = new int[a.length() + 1][b.length() + 1]; for (int i = 0; i <= a.length(); i++) d[i][0] = i; for (int j = 0; j <= b.length(); j++) d[0][j] = j; for (int i = 1; i <= a.length(); i++) for (int j = 1; j <= b.length(); j++) d[i][j] = Math.min(Math.min(d[i-1][j] + 1, d[i][j-1] + 1), d[i-1][j-1] + (a.charAt(i-1) == b.charAt(j-1) ? 0 : 1)); return d[a.length()][b.length()];',
    308: 'Arrays.sort(intervalos, (x, y) -> x[0] - y[0]); List<int[]> r = new ArrayList<>(); for (int[] it : intervalos) { if (!r.isEmpty() && r.get(r.size() - 1)[1] >= it[0]) r.get(r.size() - 1)[1] = Math.max(r.get(r.size() - 1)[1], it[1]); else r.add(new int[]{it[0], it[1]}); } return r.toArray(new int[0][]);',
    309: 'int[] d = new int[valor + 1]; Arrays.fill(d, Integer.MAX_VALUE); d[0] = 0; for (int v = 1; v <= valor; v++) for (int m : moedas) if (m <= v && d[v - m] != Integer.MAX_VALUE) d[v] = Math.min(d[v], d[v - m] + 1); return d[valor] == Integer.MAX_VALUE ? -1 : d[valor];',
    310: 'return new Object() { int go(int r, int cols, int d1, int d2) { if (r == n) return 1; int t = 0; for (int c = 0; c < n; c++) { if ((cols >> c & 1) == 1 || (d1 >> (r + c) & 1) == 1 || (d2 >> (r - c + n) & 1) == 1) continue; t += go(r + 1, cols | 1 << c, d1 | 1 << (r + c), d2 | 1 << (r - c + n)); } return t; } }.go(0, 0, 0, 0);',
  },
  python: {
    101: 'return n * 2',
    102: 'return f"Olá, {nome}!"',
    103: 'return n % 2 == 0',
    104: 'return sum(arr)',
    105: 'return max(a, b)',
    106: 'return texto.count(letra)',
    107: 'return texto[::-1]',
    108: 'return "Rick" in nomes',
    109: 'return sum(1 for l in texto.lower() if l in "aeiou")',
    110: 'r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r',
    201: 'return [n for n in nomes if not n.startswith("Agente")]',
    202: 'l = "".join(c for c in texto.lower() if c in "abcdefghijklmnopqrstuvwxyz0123456789")\n    return l == l[::-1]',
    203: 'return ["FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else i for i in range(1, n + 1)]',
    204: 'ws = texto.lower().split(" ")\n    c = {}\n    for w in ws: c[w] = c.get(w, 0) + 1\n    m = max(c.values())\n    return next(w for w in ws if c[w] == m)',
    205: 'return list(dict.fromkeys(nums))',
    206: 'd = sorted(set(nums), reverse=True)\n    return d[1] if len(d) > 1 else -1',
    207: 'p = {")": "(", "]": "[", "}": "{"}\n    st = []\n    for ch in s:\n        if ch in "([{": st.append(ch)\n        elif not st or st.pop() != p[ch]: return False\n    return not st',
    208: 'from itertools import groupby\n    return "".join(k + str(len(list(g))) for k, g in groupby(s))',
    209: 'if not nums: return []\n    k %= len(nums)\n    return nums[-k:] + nums[:-k] if k else nums[:]',
    210: 'm = {}\n    for i, x in enumerate(nums):\n        if alvo - x in m: return [m[alvo - x], i]\n        m[x] = i',
    301: 'from bisect import bisect_left\n    t = []\n    for x in nums:\n        i = bisect_left(t, x)\n        if i == len(t): t.append(x)\n        else: t[i] = x\n    return len(t)',
    302: 'C = len(grade[0])\n    d = [0] * C\n    d[0] = 1 if grade[0][0] == 0 else 0\n    for row in grade:\n        for j in range(C):\n            if row[j] == 1: d[j] = 0\n            elif j: d[j] += d[j - 1]\n    return d[-1]',
    303: 'last, start, best = {}, 0, 0\n    for i, ch in enumerate(s):\n        if last.get(ch, -1) >= start: start = last[ch] + 1\n        last[ch] = i\n        best = max(best, i - start + 1)\n    return best',
    304: 'e = expr.replace(" ", "")\n    pos = [0]\n    def peek(): return e[pos[0]] if pos[0] < len(e) else ""\n    def fac():\n        if peek() == "(":\n            pos[0] += 1; v = ex(); pos[0] += 1; return v\n        v = 0\n        while peek().isdigit(): v = v * 10 + int(e[pos[0]]); pos[0] += 1\n        return v\n    def term():\n        v = fac()\n        while peek() in ("*", "/") and peek():\n            o = peek(); pos[0] += 1; r = fac()\n            v = v * r if o == "*" else int(v / r)\n        return v\n    def ex():\n        v = term()\n        while peek() in ("+", "-") and peek():\n            o = peek(); pos[0] += 1; r = term()\n            v = v + r if o == "+" else v - r\n        return v\n    return ex()',
    305: 'R, C = len(grade), len(grade[0]); seen = set(); n = 0\n    for i in range(R):\n        for j in range(C):\n            if grade[i][j] == 1 and (i, j) not in seen:\n                n += 1; st = [(i, j)]; seen.add((i, j))\n                while st:\n                    y, x = st.pop()\n                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a, b = y + dy, x + dx\n                        if 0 <= a < R and 0 <= b < C and grade[a][b] == 1 and (a, b) not in seen:\n                            seen.add((a, b)); st.append((a, b))\n    return n',
    306: 'R, C = len(grade), len(grade[0])\n    d = [[0] * C for _ in range(R)]\n    for i in range(R):\n        for j in range(C):\n            prev = [d[i-1][j]] if i else []\n            prev += [d[i][j-1]] if j else []\n            d[i][j] = grade[i][j] + (min(prev) if prev else 0)\n    return d[-1][-1]',
    307: 'd = list(range(len(b) + 1))\n    for i in range(1, len(a) + 1):\n        prev, d[0] = d[0], i\n        for j in range(1, len(b) + 1):\n            prev, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] != b[j - 1]))\n    return d[-1]',
    308: 'r = []\n    for s, e in sorted(intervalos):\n        if r and r[-1][1] >= s: r[-1][1] = max(r[-1][1], e)\n        else: r.append([s, e])\n    return r',
    309: 'INF = float("inf"); d = [0] + [INF] * valor\n    for v in range(1, valor + 1):\n        for m in moedas:\n            if m <= v: d[v] = min(d[v], d[v - m] + 1)\n    return -1 if d[valor] == INF else d[valor]',
    310: 'def go(r, cols, d1, d2):\n        if r == n: return 1\n        return sum(go(r + 1, cols | 1 << c, d1 | 1 << (r + c), d2 | 1 << (r - c + n)) for c in range(n) if not (cols >> c & 1 or d1 >> (r + c) & 1 or d2 >> (r - c + n) & 1))\n    return go(0, 0, 0, 0)',
  },
  javascript: {
    101: 'return n * 2;',
    102: 'return `Olá, ${nome}!`;',
    103: 'return n % 2 === 0;',
    104: 'return arr.reduce((t, n) => t + n, 0);',
    105: 'return Math.max(a, b);',
    106: 'return [...texto].filter(c => c === letra).length;',
    107: 'return texto.split("").reverse().join("");',
    108: 'return nomes.includes("Rick");',
    109: 'return [...texto.toLowerCase()].filter(l => "aeiou".includes(l)).length;',
    110: 'let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;',
    201: 'return nomes.filter(n => !n.startsWith("Agente"));',
    202: 'const l = texto.toLowerCase().replace(/[^a-z0-9]/g, ""); return l === [...l].reverse().join("");',
    203: 'const r = []; for (let i = 1; i <= n; i++) r.push(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : i); return r;',
    204: 'const ws = texto.toLowerCase().split(" "); const c = new Map(); for (const w of ws) c.set(w, (c.get(w) ?? 0) + 1); const m = Math.max(...c.values()); return ws.find(w => c.get(w) === m);',
    205: 'return [...new Set(nums)];',
    206: 'const d = [...new Set(nums)].sort((a, b) => b - a); return d.length > 1 ? d[1] : -1;',
    207: 'const p = { ")": "(", "]": "[", "}": "{" }; const st = []; for (const ch of s) { if ("([{".includes(ch)) st.push(ch); else if (st.pop() !== p[ch]) return false; } return st.length === 0;',
    208: 'return (s.match(/(.)\\1*/g) ?? []).map(g => g[0] + g.length).join("");',
    209: 'const n = nums.length; if (!n) return []; k %= n; return [...nums.slice(n - k), ...nums.slice(0, n - k)];',
    210: 'const m = new Map(); for (let i = 0; i < nums.length; i++) { if (m.has(alvo - nums[i])) return [m.get(alvo - nums[i]), i]; m.set(nums[i], i); }',
    301: 'const t = []; for (const x of nums) { let lo = 0, hi = t.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (t[mid] < x) lo = mid + 1; else hi = mid; } t[lo] = x; } return t.length;',
    302: 'const C = grade[0].length; const d = Array(C).fill(0); d[0] = grade[0][0] === 0 ? 1 : 0; for (const row of grade) for (let j = 0; j < C; j++) { if (row[j] === 1) d[j] = 0; else if (j) d[j] += d[j - 1]; } return d[C - 1];',
    303: 'const last = new Map(); let start = 0, best = 0; [...s].forEach((ch, i) => { if ((last.get(ch) ?? -1) >= start) start = last.get(ch) + 1; last.set(ch, i); best = Math.max(best, i - start + 1); }); return best;',
    304: 'const e = expr.replace(/ /g, ""); let p = 0; const ex = () => { let v = term(); while (e[p] === "+" || e[p] === "-") { const o = e[p++]; const r = term(); v = o === "+" ? v + r : v - r; } return v; }; const term = () => { let v = fac(); while (e[p] === "*" || e[p] === "/") { const o = e[p++]; const r = fac(); v = o === "*" ? v * r : Math.trunc(v / r); } return v; }; const fac = () => { if (e[p] === "(") { p++; const v = ex(); p++; return v; } let v = 0; while (p < e.length && /[0-9]/.test(e[p])) v = v * 10 + Number(e[p++]); return v; }; return ex();',
    305: 'const R = grade.length, C = grade[0].length; const seen = grade.map(r => r.map(() => false)); let n = 0; for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { if (grade[i][j] !== 1 || seen[i][j]) continue; n++; const st = [[i, j]]; seen[i][j] = true; while (st.length) { const [y, x] = st.pop(); for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a = y + dy, b = x + dx; if (a >= 0 && a < R && b >= 0 && b < C && grade[a][b] === 1 && !seen[a][b]) { seen[a][b] = true; st.push([a, b]); } } } } return n;',
    306: 'const R = grade.length, C = grade[0].length; const d = grade.map(r => r.slice()); for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) { if (!i && !j) continue; d[i][j] += Math.min(i ? d[i-1][j] : Infinity, j ? d[i][j-1] : Infinity); } return d[R-1][C-1];',
    307: 'const d = Array.from({ length: b.length + 1 }, (_, j) => j); for (let i = 1; i <= a.length; i++) { let prev = d[0]; d[0] = i; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = Math.min(d[j] + 1, d[j-1] + 1, prev + (a[i-1] === b[j-1] ? 0 : 1)); prev = t; } } return d[b.length];',
    308: 'const r = []; for (const [s, e] of [...intervalos].sort((x, y) => x[0] - y[0])) { if (r.length && r[r.length-1][1] >= s) r[r.length-1][1] = Math.max(r[r.length-1][1], e); else r.push([s, e]); } return r;',
    309: 'const d = Array(valor + 1).fill(Infinity); d[0] = 0; for (let v = 1; v <= valor; v++) for (const m of moedas) if (m <= v) d[v] = Math.min(d[v], d[v - m] + 1); return d[valor] === Infinity ? -1 : d[valor];',
    310: 'const go = (r, cols, d1, d2) => { if (r === n) return 1; let t = 0; for (let c = 0; c < n; c++) { if ((cols >> c & 1) || (d1 >> (r + c) & 1) || (d2 >> (r - c + n) & 1)) continue; t += go(r + 1, cols | 1 << c, d1 | 1 << (r + c), d2 | 1 << (r - c + n)); } return t; }; return go(0, 0, 0, 0);',
  },
};

function solve(c, lang) {
  const start = starterCode(c, lang);
  const body = SOL[lang][c.id];
  if (lang === 'java') return start.replace(/\/\/ Seu código aqui\n\s*return [^;]+;/, () => body);
  if (lang === 'python') return start.replace(/# Seu código aqui\n\s*pass/, () => body);
  return start.replace('// Seu código aqui', () => body);
}

/** JavaScript roda no navegador; aqui avaliamos com new Function para validar os dados. */
function runJs(code, c) {
  const v = c.variants.javascript;
  try {
    const f = new Function(`${code}\nreturn ${v.fn};`)();
    return testsFor(c, 'javascript').every((t) => {
      try {
        return deepEqual(f(...structuredClone(t.input)), t.expected);
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

const only = process.argv[2];
const list = ALL_CHALLENGES.filter((c) => !only || String(c.id).startsWith({ iniciante: '1', intermediario: '2', senior: '3' }[only] ?? only));
let bad = 0;
console.log('Linguagens:', LANG_STATUS, '\n');
for (const lang of LANGS) {
  for (const c of list) {
    let ok, stubFails;
    if (lang === 'javascript') {
      ok = runJs(solve(c, lang), c);
      stubFails = !runJs(starterCode(c, lang), c);
    } else {
      const r = await runSubmission({ lang, challengeId: c.id, code: solve(c, lang) });
      ok = r.success;
      if (!ok) console.log(JSON.stringify(r, null, 1).slice(0, 1500));
      stubFails = !(await runSubmission({ lang, challengeId: c.id, code: starterCode(c, lang) })).success;
    }
    console.log(`${lang.padEnd(10)} #${c.id} ${c.title.padEnd(26)} solução ${ok ? 'OK ' : 'FALHOU'} | inicial reprova ${stubFails ? 'OK' : 'NÃO'}`);
    if (!ok || !stubFails) bad++;
  }
}
console.log(bad ? `\n${bad} problema(s).` : `\nOs ${list.length * LANGS.length} desafios estão válidos.`);
process.exit(bad ? 1 : 0);
