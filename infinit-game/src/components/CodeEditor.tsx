import { Fragment, useMemo, useRef, type KeyboardEvent, type ReactNode, type UIEvent } from 'react';
import type { Lang } from '../../shared/challenges';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  lang: Lang;
  fileName?: string;
};

const KEYWORDS: Record<Lang, string> = {
  javascript: 'function|return|const|let|var|if|else|for|while|do|of|in|new|break|continue|switch|case|default|typeof|throw|try|catch|class|async|await',
  java: 'public|private|protected|static|final|class|void|int|long|double|float|char|boolean|byte|short|String|return|if|else|for|while|do|new|break|continue|switch|case|default|throw|throws|try|catch|finally|import|package|extends|implements|interface|var|this|super',
  python: 'def|return|if|elif|else|for|while|in|not|and|or|is|pass|import|from|as|class|lambda|with|try|except|finally|raise|yield|break|continue|global|nonlocal|del|assert',
};
const LITERALS: Record<Lang, string> = {
  javascript: 'true|false|null|undefined|NaN|Infinity',
  java: 'true|false|null',
  python: 'True|False|None',
};
const COMMENT: Record<Lang, string> = {
  javascript: String.raw`\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)`,
  java: String.raw`\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)`,
  python: String.raw`#[^\n]*`,
};
const STRINGS = '"(?:\\\\.|[^"\\\\\\n])*"?|\'(?:\\\\.|[^\'\\\\\\n])*\'?|`(?:\\\\.|[^`\\\\])*`?';

const tokenCache = new Map<Lang, RegExp>();
function tokenRe(lang: Lang) {
  let re = tokenCache.get(lang);
  if (!re) {
    re = new RegExp(
      `(${COMMENT[lang]})|(${STRINGS})|(\\b\\d+(?:\\.\\d+)?\\b)|(\\b(?:${KEYWORDS[lang]})\\b)|(\\b(?:${LITERALS[lang]})\\b)|(\\b[A-Za-z_$][\\w$]*(?=\\())`,
      'g',
    );
    tokenCache.set(lang, re);
  }
  return re;
}
const CLASSES = ['', 'tk-com', 'tk-str', 'tk-num', 'tk-kw', 'tk-lit', 'tk-fn'];

function highlight(src: string, lang: Lang): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of src.matchAll(tokenRe(lang))) {
    const at = m.index ?? 0;
    if (at > last) out.push(<Fragment key={key++}>{src.slice(last, at)}</Fragment>);
    const g = m.findIndex((v, i) => i > 0 && v !== undefined);
    out.push(
      <span key={key++} className={CLASSES[g]}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < src.length) out.push(<Fragment key={key++}>{src.slice(last)}</Fragment>);
  return out;
}

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

/** Insere texto preservando o histórico de desfazer (Ctrl+Z) quando o navegador permite. */
function insert(el: HTMLTextAreaElement, text: string) {
  el.focus();
  if (!document.execCommand('insertText', false, text)) {
    const { selectionStart: s, selectionEnd: e, value } = el;
    el.value = value.slice(0, s) + text + value.slice(e);
    el.setSelectionRange(s + text.length, s + text.length);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function CodeEditor({ value, onChange, onRun, lang, fileName }: Props) {
  const unit = lang === 'javascript' ? '  ' : '    ';
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => value.split('\n').length, [value]);
  const highlighted = useMemo(() => highlight(value, lang), [value, lang]);

  const syncScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === 'Escape') {
      el.blur(); // permite sair do editor com Tab (acessibilidade por teclado)
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      insert(el, unit);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, s))![0];
      const before = value[s - 1];
      const after = value[end];
      const opens = before === '{' || (lang === 'python' && /:\s*$/.test(value.slice(lineStart, s)));
      if (before === '{' && after === '}') {
        insert(el, `\n${indent}${unit}\n${indent}`);
        const pos = s + 1 + indent.length + unit.length;
        el.setSelectionRange(pos, pos);
      } else {
        insert(el, `\n${indent}${opens ? unit : ''}`);
      }
      return;
    }

    if (e.key === 'Backspace' && s === end && PAIRS[value[s - 1]] === value[s]) {
      e.preventDefault();
      el.setSelectionRange(s - 1, s + 1);
      insert(el, '');
      return;
    }

    if (e.key in PAIRS && s === end) {
      const next = value[s];
      // Aspas logo após uma palavra são apóstrofos/fechamentos, não abertura de string.
      if ((e.key === '"' || e.key === "'" || e.key === '`') && (next === e.key || /\w/.test(value[s - 1] ?? ''))) {
        if (next === e.key) {
          e.preventDefault();
          el.setSelectionRange(s + 1, s + 1);
        }
        return;
      }
      e.preventDefault();
      insert(el, e.key + PAIRS[e.key]);
      el.setSelectionRange(s + 1, s + 1);
      return;
    }

    if (CLOSERS.has(e.key) && s === end && value[s] === e.key) {
      e.preventDefault();
      el.setSelectionRange(s + 1, s + 1);
    }
  };

  return (
    <div className="editor" onClick={() => taRef.current?.focus()}>
      {fileName && <div className="editor__tab">{fileName}</div>}
      <div className="editor__gutter" ref={gutterRef} aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <div className="editor__body">
        <pre className="editor__pre" ref={preRef} aria-hidden="true">
          {highlighted}
          {'\n'}
        </pre>
        <textarea
          ref={taRef}
          className="editor__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          aria-label={`Editor de código ${lang}. Pressione Control Enter para executar, Escape para sair do editor.`}
        />
      </div>
    </div>
  );
}
