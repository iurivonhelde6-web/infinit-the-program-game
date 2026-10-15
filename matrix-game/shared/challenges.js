// Desafios do jogo, compartilhados entre o navegador (Vite) e o servidor de compilação (Node).
// 3 dificuldades × 10 fases × 3 linguagens: Java (Morpheus), Python (Neo) e JavaScript (Trinity).

/** @typedef {'java' | 'python' | 'javascript'} Lang */
/** @typedef {'iniciante' | 'intermediario' | 'senior'} Difficulty */

export const LANGS = /** @type {const} */ (['java', 'python', 'javascript']);
export const LEVELS_PER_DIFFICULTY = 10;

/**
 * Regras de cada dificuldade.
 * hints.idleMs: revela a próxima dica após esse tempo sem digitar.
 * hints.failAt: revela a próxima dica a partir dessa tentativa errada.
 * hints.kind: 'solution' mostra o caminho (até o código); 'concept' só orienta, sem entregar o resultado.
 */
export const DIFFICULTIES = {
  iniciante: {
    id: 'iniciante',
    label: 'INICIANTE',
    xp: 100,
    color: '#00ff41',
    summary: 'Problemas muito fáceis e fáceis.',
    rules: 'Dicas com a solução se você ficar 2 min sem escrever ou errar a primeira tentativa.',
    hints: { idleMs: 120_000, failAt: 1, kind: 'solution' },
  },
  intermediario: {
    id: 'intermediario',
    label: 'INTERMEDIÁRIO',
    xp: 150,
    color: '#ffd23f',
    summary: 'Começa fácil e sobe para o nível de um dev pleno.',
    rules: 'Dicas sem mostrar o resultado após 3 min sem escrever ou ao errar a segunda tentativa.',
    hints: { idleMs: 180_000, failAt: 2, kind: 'concept' },
  },
  senior: {
    id: 'senior',
    label: 'SÊNIOR',
    xp: 200,
    color: '#ff4d4d',
    summary: 'Problemas complexos de algoritmos e estruturas de dados.',
    rules: 'Sem dicas. Só você e o código.',
    hints: null,
  },
};
export const DIFFICULTY_ORDER = /** @type {const} */ (['iniciante', 'intermediario', 'senior']);

/** Palavras que mudam de acordo com a linguagem, usadas nos textos das missões. */
export const WORDS = {
  java: { unit: 'o método', a_list: 'um array', a_list_new: 'um novo array', a_matrix: 'uma matriz (int[][])', true: 'true', false: 'false' },
  python: { unit: 'a função', a_list: 'uma lista', a_list_new: 'uma nova lista', a_matrix: 'uma lista de listas', true: 'True', false: 'False' },
  javascript: { unit: 'a função', a_list: 'um array', a_list_new: 'um novo array', a_matrix: 'um array de arrays', true: 'true', false: 'false' },
};

const snake = (s) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());

/**
 * Monta as três variantes a partir da assinatura Java.
 * params: [tipoJava, nome][] — tipos: int, int[], int[][], String, String[], boolean
 */
function sig(fn, params, ret, hints = {}, extra = {}) {
  const names = params.map(([, n]) => n);
  return {
    java: { fn, params, ret, hints: hints.java, ...extra.java },
    python: { fn: snake(fn), params: names.map(snake), hints: hints.python, ...extra.python },
    javascript: { fn, params: names, hints: hints.javascript, ...extra.javascript },
  };
}

const fizz = (n, asText = false) =>
  Array.from({ length: n }, (_, i) => {
    const k = i + 1;
    const v = k % 15 === 0 ? 'FizzBuzz' : k % 3 === 0 ? 'Fizz' : k % 5 === 0 ? 'Buzz' : k;
    return asText ? String(v) : v;
  });

const JAVA_NOTE = 'Em Java todo código vive dentro de uma classe. Escreva sua solução dentro da classe Solucao, no método já declarado.';
const PY_NOTE = 'Em Python a indentação define os blocos: tudo que pertence à função fica 4 espaços para dentro.';

// ═══════════════════════════ INICIANTE ═══════════════════════════
const INICIANTE = [
  {
    id: 101,
    title: 'A Primeira Porta',
    description: 'Bem-vindo, {hero}. A primeira porta da Matrix abre com o dobro do código exibido. Crie {unit} "{fn}" que recebe um número n e retorna o seu dobro.',
    tests: [{ input: [2], expected: 4 }, { input: [5], expected: 10 }, { input: [-1], expected: -2 }, { input: [0], expected: 0 }],
    variants: sig('dobrar', [['int', 'n']], 'int', {
      java: ['Um método devolve valores com "return". Troque o "return 0;" pelo cálculo.', 'O dobro de n é n * 2. Escreva: return n * 2;'],
      python: ['Uma função devolve valores com "return". Substitua o "pass".', 'O dobro de n é n * 2. Escreva: return n * 2'],
      javascript: ['Uma função devolve valores com a palavra "return".', 'O dobro de n é n * 2. Escreva: return n * 2;'],
    }, { java: { note: JAVA_NOTE }, python: { note: PY_NOTE } }),
  },
  {
    id: 102,
    title: 'Identificação',
    description: 'O hotel pede identificação na porta. Crie {unit} "{fn}" que recebe um nome e retorna o texto "Olá, NOME!". Exemplo: para "Neo" o resultado é "Olá, Neo!".',
    tests: [{ input: ['Neo'], expected: 'Olá, Neo!' }, { input: ['Trinity'], expected: 'Olá, Trinity!' }, { input: [''], expected: 'Olá, !' }],
    variants: sig('saudar', [['String', 'nome']], 'String', {
      java: ['Strings se juntam com o operador +.', 'return "Olá, " + nome + "!";'],
      python: ['Strings se juntam com + ou com f-strings (f"...").', 'return "Olá, " + nome + "!"'],
      javascript: ['Strings se juntam com + ou com template strings (crase).', 'return "Olá, " + nome + "!";'],
    }),
  },
  {
    id: 103,
    title: 'Par ou Ímpar',
    description: 'O painel pisca em ciclos pares e ímpares. Crie {unit} "{fn}" que recebe um número inteiro e retorna {true} se ele for par e {false} se for ímpar.',
    tests: [{ input: [4], expected: true }, { input: [7], expected: false }, { input: [0], expected: true }, { input: [-3], expected: false }],
    variants: sig('ehPar', [['int', 'n']], 'boolean', {
      java: ['O operador % devolve o resto da divisão. Todo número par tem resto 0 quando dividido por 2.', 'return n % 2 == 0;'],
      python: ['O operador % devolve o resto da divisão. Todo número par tem resto 0 quando dividido por 2.', 'return n % 2 == 0'],
      javascript: ['O operador % devolve o resto da divisão. Todo número par tem resto 0 quando dividido por 2.', 'return n % 2 === 0;'],
    }),
  },
  {
    id: 104,
    title: 'Somando Sinais',
    description: 'Os carros no viaduto enviam sinais numéricos. Crie {unit} "{fn}" que recebe {a_list} de números e retorna a soma de todos eles (se não houver números, a soma é 0).',
    tests: [{ input: [[1, 2, 3]], expected: 6 }, { input: [[10, -5, 5]], expected: 10 }, { input: [[]], expected: 0 }],
    variants: sig('somarTudo', [['int[]', 'arr']], 'int', {
      java: ['Crie int total = 0; e percorra o array com for (int n : arr).', 'int total = 0; for (int n : arr) total += n; return total;'],
      python: ['Crie total = 0 e percorra a lista com "for n in arr:".', 'Python já tem isso pronto: return sum(arr)'],
      javascript: ['Crie let total = 0 e percorra com for (const n of arr).', 'return arr.reduce((total, n) => total + n, 0);'],
    }),
  },
  {
    id: 105,
    title: 'O Sinal Mais Forte',
    description: 'Dois sinais chegam ao topo da torre. Crie {unit} "{fn}" que recebe dois números a e b e retorna o maior deles (se forem iguais, retorne qualquer um).',
    tests: [{ input: [3, 9], expected: 9 }, { input: [10, 2], expected: 10 }, { input: [-1, -5], expected: -1 }, { input: [4, 4], expected: 4 }],
    variants: sig('maiorDeDois', [['int', 'a'], ['int', 'b']], 'int', {
      java: ['Compare os dois com if (a > b) e retorne o vencedor.', 'return Math.max(a, b);'],
      python: ['Compare os dois com "if a > b:" e retorne o vencedor.', 'return max(a, b)'],
      javascript: ['Compare os dois com if (a > b) e retorne o vencedor.', 'return Math.max(a, b);'],
    }),
  },
  {
    id: 106,
    title: 'Padrões na Ilusão',
    description: 'A ilusão repete letras para parecer real. Crie {unit} "{fn}" que recebe um texto e uma letra e retorna quantas vezes essa letra aparece no texto (diferenciando maiúsculas de minúsculas).',
    tests: [{ input: ['banana', 'a'], expected: 3 }, { input: ['Matrix', 'x'], expected: 1 }, { input: ['Neo', 'z'], expected: 0 }, { input: ['', 'a'], expected: 0 }],
    variants: sig('contarLetra', [['String', 'texto'], ['String', 'letra']], 'int', {
      java: ['Percorra o texto com for (char c : texto.toCharArray()) e compare cada c com letra.charAt(0).', 'int total = 0; for (char c : texto.toCharArray()) if (c == letra.charAt(0)) total++; return total;'],
      python: ['Percorra o texto com "for c in texto:" e compare cada c com letra.', 'Strings têm um método pronto: return texto.count(letra)'],
      javascript: ['Percorra o texto com for (const c of texto) e compare cada c com letra.', 'return [...texto].filter(c => c === letra).length;'],
    }),
  },
  {
    id: 107,
    title: 'Invertendo o Código',
    description: 'Smith está perto. Para despistá-lo, envie a mensagem de trás para frente. Crie {unit} "{fn}" que recebe um texto e o retorna invertido.',
    tests: [{ input: ['Matrix'], expected: 'xirtaM' }, { input: ['Neo'], expected: 'oeN' }, { input: [''], expected: '' }],
    variants: sig('reverter', [['String', 'texto']], 'String', {
      java: ['A classe StringBuilder tem um método reverse().', 'return new StringBuilder(texto).reverse().toString();'],
      python: ['O fatiamento (slicing) de strings aceita passo negativo.', 'return texto[::-1]'],
      javascript: ['Strings não têm .reverse(), mas arrays têm: converta com texto.split("").', 'return texto.split("").reverse().join("");'],
    }),
  },
  {
    id: 108,
    title: 'O Escolhido',
    description: 'Atrás da fachada há uma lista de nomes. Crie {unit} "{fn}" que recebe {a_list} de nomes e retorna {true} se "Neo" estiver presente, e {false} caso contrário.',
    tests: [{ input: [['Morpheus', 'Trinity', 'Neo']], expected: true }, { input: [['Agente Smith', 'Agente Brown']], expected: false }, { input: [[]], expected: false }],
    variants: sig('encontrarNeo', [['String[]', 'nomes']], 'boolean', {
      java: ['Percorra o array e compare cada nome com "Neo" usando .equals() (nunca use == com Strings).', 'return Arrays.asList(nomes).contains("Neo");'],
      python: ['O operador "in" diz se um item está na lista.', 'return "Neo" in nomes'],
      javascript: ['Arrays têm um método que responde "este valor está aqui?" com true/false.', 'return nomes.includes("Neo");'],
    }),
  },
  {
    id: 109,
    title: 'Rastreando Sinais',
    description: 'O reflexo no asfalto esconde vogais. Crie {unit} "{fn}" que recebe um texto e retorna quantas vogais (a, e, i, o, u — maiúsculas ou minúsculas, sem acento) ele tem.',
    tests: [{ input: ['Matrix'], expected: 2 }, { input: ['Neo'], expected: 2 }, { input: ['xyz'], expected: 0 }, { input: ['AEIOU'], expected: 5 }],
    variants: sig('contarVogais', [['String', 'texto']], 'int', {
      java: ['Percorra texto.toLowerCase().toCharArray() e teste se "aeiou".indexOf(c) >= 0.', 'int c = 0; for (char ch : texto.toLowerCase().toCharArray()) if ("aeiou".indexOf(ch) >= 0) c++; return c;'],
      python: ['Percorra texto.lower() e teste "letra in \'aeiou\'".', 'return sum(1 for l in texto.lower() if l in "aeiou")'],
      javascript: ['Percorra texto.toLowerCase() com for...of e teste "aeiou".includes(letra).', 'return [...texto.toLowerCase()].filter(l => "aeiou".includes(l)).length;'],
    }),
  },
  {
    id: 110,
    title: 'Fatorial da Fonte',
    description: 'A Fonte só reconhece quem domina a repetição. Crie {unit} "{fn}" que recebe um inteiro n ≥ 0 e retorna n! (n × (n-1) × ... × 1). Lembre-se: o fatorial de 0 é 1.',
    tests: [{ input: [0], expected: 1 }, { input: [1], expected: 1 }, { input: [5], expected: 120 }, { input: [6], expected: 720 }],
    variants: sig('fatorial', [['int', 'n']], 'int', {
      java: ['Comece com int resultado = 1; e multiplique por i em um for de 2 até n.', 'int r = 1; for (int i = 2; i <= n; i++) r *= i; return r;'],
      python: ['Comece com resultado = 1 e multiplique em "for i in range(2, n + 1):".', 'r = 1\n    for i in range(2, n + 1):\n        r *= i\n    return r'],
      javascript: ['Comece com let resultado = 1 e multiplique em um for de 2 até n.', 'let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;'],
    }),
  },
];

// ═══════════════════════════ INTERMEDIÁRIO ═══════════════════════════
// Dicas conceituais (compartilhadas entre as linguagens): orientam sem entregar o resultado.
const INTERMEDIARIO = [
  {
    id: 201,
    title: 'Filtrando a Realidade',
    description: 'Os Agentes estão por toda parte. Crie {unit} "{fn}" que recebe {a_list} de nomes e retorna {a_list_new} apenas com os nomes que NÃO começam com "Agente", mantendo a ordem.',
    tests: [
      { input: [['Neo', 'Agente Smith', 'Trinity', 'Agente Brown']], expected: ['Neo', 'Trinity'] },
      { input: [['Agente Jones', 'Agente Smith']], expected: [] },
      { input: [['Morpheus']], expected: ['Morpheus'] },
    ],
    hints: ['Monte uma coleção nova e inclua nela apenas os nomes aprovados.', 'As três linguagens têm um método de string para saber se um texto começa com um prefixo.'],
    variants: sig('filtrarAgentes', [['String[]', 'nomes']], 'String[]', {}, { java: { note: JAVA_NOTE } }),
  },
  {
    id: 202,
    title: 'Espelho Perfeito',
    description: 'A fechadura do hotel aceita apenas palíndromos. Crie {unit} "{fn}" que recebe um texto e retorna {true} se ele for um palíndromo considerando apenas letras (a-z, sem acento) e dígitos, ignorando maiúsculas, espaços e pontuação.',
    tests: [
      { input: ['A sacada da casa!'], expected: true },
      { input: ['Roma me tem amor.'], expected: true },
      { input: ['Neo'], expected: false },
      { input: [''], expected: true },
      { input: ['12_3-21'], expected: true },
      { input: ['Matrix 2'], expected: false },
    ],
    hints: ['Normalize primeiro: mantenha só letras e dígitos, tudo em minúsculas.', 'Compare o texto normalizado com o seu inverso — ou use dois índices andando das pontas para o centro.'],
    variants: sig('ehPalindromo', [['String', 'texto']], 'boolean'),
  },
  {
    id: 203,
    title: 'Protocolo FizzBuzz',
    description: 'O painel só aceita o protocolo antigo. Crie {unit} "{fn}" que recebe n e retorna {a_list} com os itens de 1 até n: múltiplos de 3 viram "Fizz", de 5 viram "Buzz", de ambos viram "FizzBuzz"; os demais continuam sendo o próprio número.',
    tests: [{ input: [5], expected: fizz(5) }, { input: [15], expected: fizz(15) }, { input: [1], expected: [1] }, { input: [0], expected: [] }],
    hints: ['Percorra de 1 até n montando o resultado item a item.', 'A ordem dos testes importa: verifique primeiro o caso mais específico (múltiplo de 3 e de 5 ao mesmo tempo).'],
    variants: sig('fizzMatrix', [['int', 'n']], 'String[]', {}, {
      java: {
        description: 'O painel só aceita o protocolo antigo. Crie {unit} "{fn}" que recebe n e retorna um array de String com os itens de 1 até n: múltiplos de 3 viram "Fizz", de 5 viram "Buzz", de ambos viram "FizzBuzz"; os demais viram o próprio número como texto ("1", "2"...).',
        tests: [{ input: [5], expected: fizz(5, true) }, { input: [15], expected: fizz(15, true) }, { input: [1], expected: ['1'] }, { input: [0], expected: [] }],
      },
    }),
  },
  {
    id: 204,
    title: 'Palavra-Chave',
    description: 'Interceptamos uma transmissão dos Agentes. Crie {unit} "{fn}" que recebe um texto (palavras separadas por um espaço) e retorna, em minúsculas, a palavra mais frequente — sem diferenciar maiúsculas. Em caso de empate, vence a que aparece primeiro no texto.',
    tests: [
      { input: ['o agente viu o neo e o agente fugiu'], expected: 'o' },
      { input: ['Neo neo TRINITY trinity trinity'], expected: 'trinity' },
      { input: ['matrix'], expected: 'matrix' },
      { input: ['a b b a'], expected: 'a' },
    ],
    hints: ['Use um dicionário/mapa para contar quantas vezes cada palavra (já em minúsculas) aparece.', 'Para o desempate, percorra as palavras na ordem original e fique com a primeira que tem a contagem máxima.'],
    variants: sig('palavraMaisFrequente', [['String', 'texto']], 'String'),
  },
  {
    id: 205,
    title: 'Sem Repetições',
    description: 'A torre recebe pacotes duplicados. Crie {unit} "{fn}" que recebe {a_list} de números e retorna {a_list_new} sem duplicados, mantendo a ordem da primeira ocorrência de cada número.',
    tests: [{ input: [[1, 2, 2, 3, 1]], expected: [1, 2, 3] }, { input: [[]], expected: [] }, { input: [[5, 5, 5]], expected: [5] }, { input: [[3, 1, 3, 2, 1]], expected: [3, 1, 2] }],
    hints: ['Guarde os números já vistos em um conjunto (Set): consultar um Set é muito mais rápido que procurar em uma lista.', 'Faça uma única passada: só adicione ao resultado o que ainda não está no conjunto.'],
    variants: sig('removerDuplicados', [['int[]', 'nums']], 'int[]'),
  },
  {
    id: 206,
    title: 'O Vice-Líder',
    description: 'A ilusão esconde o segundo sinal mais forte. Crie {unit} "{fn}" que recebe {a_list} de números ≥ 0 e retorna o segundo maior valor DISTINTO. Se ele não existir, retorne -1.',
    tests: [{ input: [[3, 9, 2, 9]], expected: 3 }, { input: [[5]], expected: -1 }, { input: [[7, 7]], expected: -1 }, { input: [[1, 2]], expected: 1 }, { input: [[10, 4, 8, 6]], expected: 8 }],
    hints: ['Não precisa ordenar: dá para resolver em uma única passada guardando os dois maiores valores vistos.', 'Cuidado com repetidos: o segundo maior precisa ser estritamente menor que o maior.'],
    variants: sig('segundoMaior', [['int[]', 'nums']], 'int'),
  },
  {
    id: 207,
    title: 'Portas Balanceadas',
    description: 'Smith tranca as saídas com símbolos. Crie {unit} "{fn}" que recebe um texto formado por ( ) [ ] { } e retorna {true} se todos os símbolos abrem e fecham na ordem correta.',
    tests: [
      { input: ['()[]{}'], expected: true },
      { input: ['([{}])'], expected: true },
      { input: ['(]'], expected: false },
      { input: ['(('], expected: false },
      { input: [''], expected: true },
      { input: ['{[()()]}'], expected: true },
      { input: [')('], expected: false },
    ],
    hints: ['Use uma pilha: cada símbolo que abre é empilhado.', 'Cada símbolo que fecha precisa combinar com o topo da pilha; no final, a pilha precisa estar vazia.'],
    variants: sig('validarParenteses', [['String', 's']], 'boolean'),
  },
  {
    id: 208,
    title: 'Compressão de Dados',
    description: 'A fachada guarda dados repetidos. Crie {unit} "{fn}" que comprime um texto contando letras iguais seguidas: "aaabcc" vira "a3b1c2". Texto vazio retorna texto vazio.',
    tests: [{ input: ['aaabcc'], expected: 'a3b1c2' }, { input: [''], expected: '' }, { input: ['x'], expected: 'x1' }, { input: ['aabbaa'], expected: 'a2b2a2' }, { input: ['zzzzzzzzzzzz'], expected: 'z12' }],
    hints: ['Percorra o texto contando quantas vezes seguidas o mesmo caractere aparece.', 'Quando o caractere muda (ou o texto termina), registre "caractere + contagem". Em Java, use StringBuilder.'],
    variants: sig('comprimir', [['String', 's']], 'String'),
  },
  {
    id: 209,
    title: 'Rotação de Fase',
    description: 'O reflexo está deslocado. Crie {unit} "{fn}" que recebe {a_list} e um número k e retorna {a_list_new} rotacionado k posições para a direita (k pode ser maior que o tamanho).',
    tests: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] },
      { input: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { input: [[1, 2, 3], 4], expected: [3, 1, 2] },
      { input: [[], 3], expected: [] },
      { input: [[7], 100], expected: [7] },
    ],
    hints: ['Rotacionar n vezes um array de tamanho n deixa tudo igual — use o resto da divisão para reduzir k.', 'Pense em para qual índice cada elemento vai depois da rotação (cuidado com o array vazio).'],
    variants: sig('rotacionar', [['int[]', 'nums'], ['int', 'k']], 'int[]'),
  },
  {
    id: 210,
    title: 'A Chave Dupla',
    description: 'A Fonte exige uma chave em duas partes. Crie {unit} "{fn}" que recebe {a_list} de números e um alvo e retorna os índices [i, j] (i < j) dos dois números cuja soma é o alvo. Sempre existe exatamente uma resposta.',
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[1, 5, 9, -2], 7], expected: [2, 3] },
    ],
    hints: ['Dois laços aninhados funcionam, mas um dev pleno resolve em uma única passada.', 'Para cada número, pergunte a um mapa se o complemento (alvo − número) já apareceu e em qual índice.'],
    variants: sig('doisNumeros', [['int[]', 'nums'], ['int', 'alvo']], 'int[]'),
  },
];

// ═══════════════════════════ SÊNIOR (sem dicas) ═══════════════════════════
const SENIOR = [
  {
    id: 301,
    title: 'Sequência do Despertar',
    description: 'Para acordar de vez, encontre o padrão escondido no ruído. Crie {unit} "{fn}" que recebe {a_list} de inteiros e retorna o tamanho da maior subsequência estritamente crescente (os elementos não precisam ser vizinhos). Busque O(n log n).',
    tests: [
      { input: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { input: [[0, 1, 0, 3, 2, 3]], expected: 4 },
      { input: [[7, 7, 7, 7]], expected: 1 },
      { input: [[]], expected: 0 },
      { input: [[1, 2, 3, 4, 5, 6, 7, 8]], expected: 8 },
      { input: [[8, 7, 6, 5]], expected: 1 },
    ],
    variants: sig('maiorSequenciaCrescente', [['int[]', 'nums']], 'int', {}, { java: { note: JAVA_NOTE } }),
  },
  {
    id: 302,
    title: 'Rotas pelo Hotel',
    description: 'Os corredores do hotel formam uma grade. Crie {unit} "{fn}" que recebe {a_matrix} (0 = livre, 1 = bloqueado) e retorna quantos caminhos existem do canto superior esquerdo ao inferior direito, andando só para a direita ou para baixo.',
    tests: [
      { input: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expected: 2 },
      { input: [[[0, 1], [0, 0]]], expected: 1 },
      { input: [[[1]]], expected: 0 },
      { input: [[[0]]], expected: 1 },
      { input: [[[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]], expected: 10 },
      { input: [[[0, 0], [1, 1], [0, 0]]], expected: 0 },
    ],
    variants: sig('caminhos', [['int[][]', 'grade']], 'int'),
  },
  {
    id: 303,
    title: 'Janela sem Eco',
    description: 'O sinal do painel não pode repetir caracteres. Crie {unit} "{fn}" que recebe um texto e retorna o tamanho do maior trecho contínuo sem caracteres repetidos. Busque O(n).',
    tests: [
      { input: ['abcabcbb'], expected: 3 },
      { input: ['bbbbb'], expected: 1 },
      { input: ['pwwkew'], expected: 3 },
      { input: [''], expected: 0 },
      { input: ['dvdf'], expected: 3 },
      { input: ['abba'], expected: 2 },
    ],
    variants: sig('maiorTrechoSemRepeticao', [['String', 's']], 'int'),
  },
  {
    id: 304,
    title: 'O Interpretador',
    description: 'O sistema de tráfego roda num interpretador quebrado. Crie {unit} "{fn}" que recebe uma expressão com inteiros não negativos, + - * /, parênteses e espaços e retorna o resultado, respeitando a precedência. A divisão é inteira (descarta a parte decimal). Proibido usar eval.',
    tests: [
      { input: ['2+3*4'], expected: 14 },
      { input: ['(2+3)*4'], expected: 20 },
      { input: [' 10 / 3 '], expected: 3 },
      { input: ['2*(3+(4-1))/2'], expected: 6 },
      { input: ['42'], expected: 42 },
      { input: ['1-2-3'], expected: -4 },
      { input: ['8/2/2'], expected: 2 },
      { input: ['100-(20+30)*2'], expected: 0 },
    ],
    variants: sig('avaliar', [['String', 'expr']], 'int'),
  },
  {
    id: 305,
    title: 'Ilhas de Dados',
    description: 'Do alto da torre, a cidade vira um mapa de bits. Crie {unit} "{fn}" que recebe {a_matrix} de 0 e 1 e retorna quantas ilhas existem (grupos de 1 ligados na horizontal ou vertical).',
    tests: [
      { input: [[[1, 1, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]], expected: 2 },
      { input: [[[0, 0], [0, 0]]], expected: 0 },
      { input: [[[1]]], expected: 1 },
      { input: [[[1, 0, 1], [0, 1, 0], [1, 0, 1]]], expected: 5 },
      { input: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expected: 1 },
    ],
    variants: sig('contarIlhas', [['int[][]', 'grade']], 'int'),
  },
  {
    id: 306,
    title: 'Caminho de Menor Custo',
    description: 'A ilusão cobra um preço por cada passo. Crie {unit} "{fn}" que recebe {a_matrix} de custos ≥ 0 e retorna a menor soma possível de um caminho do canto superior esquerdo ao inferior direito, andando só para a direita ou para baixo.',
    tests: [
      { input: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expected: 7 },
      { input: [[[1, 2, 3], [4, 5, 6]]], expected: 12 },
      { input: [[[5]]], expected: 5 },
      { input: [[[1, 2], [1, 1]]], expected: 3 },
    ],
    variants: sig('menorCusto', [['int[][]', 'grade']], 'int'),
  },
  {
    id: 307,
    title: 'Distância entre Mundos',
    description: 'Smith tenta se passar por você alterando seu código letra a letra. Crie {unit} "{fn}" que recebe dois textos e retorna a distância de edição entre eles: o menor número de inserções, remoções ou trocas de um caractere para transformar o primeiro no segundo.',
    tests: [
      { input: ['horse', 'ros'], expected: 3 },
      { input: ['intention', 'execution'], expected: 5 },
      { input: ['', 'abc'], expected: 3 },
      { input: ['neo', 'neo'], expected: 0 },
      { input: ['matrix', 'matriz'], expected: 1 },
      { input: ['kitten', 'sitting'], expected: 3 },
    ],
    variants: sig('distanciaEdicao', [['String', 'a'], ['String', 'b']], 'int'),
  },
  {
    id: 308,
    title: 'Fusão de Intervalos',
    description: 'A memória da fachada está fragmentada. Crie {unit} "{fn}" que recebe {a_list} de intervalos [início, fim] (em qualquer ordem) e retorna os intervalos fundidos, ordenados pelo início. Intervalos que se tocam também se fundem ([1,4] e [4,5] viram [1,5]).',
    tests: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[5, 7], [1, 2]]], expected: [[1, 2], [5, 7]] },
      { input: [[]], expected: [] },
      { input: [[[1, 10], [2, 3], [4, 5]]], expected: [[1, 10]] },
    ],
    variants: sig('mesclarIntervalos', [['int[][]', 'intervalos']], 'int[][]'),
  },
  {
    id: 309,
    title: 'Troco Mínimo',
    description: 'Cada reflexo custa energia. Crie {unit} "{fn}" que recebe {a_list} de valores de moedas (quantidade ilimitada de cada) e um valor, e retorna o menor número de moedas que somam exatamente esse valor, ou -1 se for impossível.',
    tests: [
      { input: [[1, 2, 5], 11], expected: 3 },
      { input: [[2], 3], expected: -1 },
      { input: [[1], 0], expected: 0 },
      { input: [[1, 5, 6, 9], 11], expected: 2 },
      { input: [[186, 419, 83, 408], 6249], expected: 20 },
    ],
    variants: sig('trocoMinimo', [['int[]', 'moedas'], ['int', 'valor']], 'int'),
  },
  {
    id: 310,
    title: 'As Rainhas do Arquiteto',
    description: 'O Arquiteto propõe o teste final: posicionar n rainhas em um tabuleiro n × n sem que nenhuma ataque outra (linha, coluna ou diagonal). Crie {unit} "{fn}" que recebe n e retorna quantas soluções distintas existem.',
    tests: [
      { input: [1], expected: 1 },
      { input: [2], expected: 0 },
      { input: [3], expected: 0 },
      { input: [4], expected: 2 },
      { input: [5], expected: 10 },
      { input: [6], expected: 4 },
      { input: [8], expected: 92 },
    ],
    variants: sig('nRainhas', [['int', 'n']], 'int'),
  },
];

export const CHALLENGES = { iniciante: INICIANTE, intermediario: INTERMEDIARIO, senior: SENIOR };
export const ALL_CHALLENGES = [...INICIANTE, ...INTERMEDIARIO, ...SENIOR];

const JAVA_DEFAULT = { int: '0', boolean: 'false', String: '""', 'int[]': 'new int[0]', 'String[]': 'new String[0]', 'int[][]': 'new int[0][]' };

/** Código inicial que aparece no editor. */
export function starterCode(challenge, lang) {
  const v = challenge.variants[lang];
  if (lang === 'java') {
    const params = v.params.map(([t, n]) => `${t} ${n}`).join(', ');
    return `import java.util.*;\n\npublic class Solucao {\n\n    public static ${v.ret} ${v.fn}(${params}) {\n        // Seu código aqui\n        return ${JAVA_DEFAULT[v.ret]};\n    }\n}\n`;
  }
  if (lang === 'python') return `def ${v.fn}(${v.params.join(', ')}):\n    # Seu código aqui\n    pass\n`;
  return `function ${v.fn}(${v.params.join(', ')}) {\n  // Seu código aqui\n  \n}\n`;
}

export function testsFor(challenge, lang) {
  return challenge.variants[lang].tests ?? challenge.tests;
}

/** Dicas da variante (iniciante: por linguagem, com o caminho da solução) ou do desafio (intermediário). */
export function hintsFor(challenge, lang) {
  return challenge.variants[lang].hints ?? challenge.hints ?? [];
}

export function missionText(challenge, lang, hero) {
  const v = challenge.variants[lang];
  const words = { ...WORDS[lang], fn: v.fn, hero };
  return (v.description ?? challenge.description).replace(/\{(\w+)\}/g, (_, k) => words[k] ?? `{${k}}`);
}

export function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]));
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
}
