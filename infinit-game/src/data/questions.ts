import type { Difficulty } from '../../shared/challenges';

/** Pergunta de múltipla escolha. `a` é o índice da alternativa correta em `o`. */
export type Question = { q: string; o: string[]; a: number; e: string };

/** XP bônus por pergunta acertada, por dificuldade. */
export const QUIZ_XP: Record<Difficulty, number> = { iniciante: 10, intermediario: 15, senior: 25 };

/** Quem conduz o interrogatório em cada fase. */
export const QUIZ_HOST = ['OPERADOR', 'AGENTE SMITH', 'OPERADOR', 'AGENTE SMITH', 'O ORÁCULO', 'AGENTE SMITH', 'AGENTE SMITH', 'OPERADOR', 'O ORÁCULO', 'O ARQUITETO'];

/** 10 fases × 2 perguntas por dificuldade. */
export const QUESTIONS: Record<Difficulty, Question[][]> = {
  iniciante: [
    [
      { q: 'O Operador diz: "Preciso guardar quantos Agentes estão na avenida em um lugar da memória com um nome." Como isso se chama em programação?', o: ['Uma variável', 'Um comentário', 'Um loop', 'Um erro de compilação'], a: 0, e: 'Variáveis são nomes que guardam valores na memória para usarmos depois.' },
      { q: 'O INFINIT pergunta: "Rick acordou?". Que valores um booleano pode ter para responder?', o: ['Qualquer número', 'Apenas verdadeiro ou falso', 'Apenas textos', 'Uma lista de nomes'], a: 1, e: 'Booleanos têm só dois valores: true/false (True/False em Python).' },
    ],
    [
      { q: 'Para montar "Olá, Rick!" juntando "Olá, " com o nome do visitante, você está fazendo uma…', o: ['Divisão inteira', 'Concatenação de strings', 'Recursão', 'Compilação'], a: 1, e: 'Concatenar é juntar textos. Em Java, Python e JavaScript o operador + faz isso com strings.' },
      { q: 'O recepcionista do hotel escreveu `// porta 1101 trancada` no código. O que essa linha faz quando o programa roda?', o: ['Tranca a porta', 'Gera um erro', 'Nada: é um comentário e é ignorado', 'Cria uma variável chamada porta'], a: 2, e: 'Comentários servem para humanos lerem; o computador os ignora. Em Python o comentário começa com #.' },
    ],
    [
      { q: 'O painel pisca ENQUANTO houver sinal. Qual estrutura repete um bloco enquanto uma condição for verdadeira?', o: ['if', 'return', 'while', 'import'], a: 2, e: 'O while repete o bloco enquanto a condição for verdadeira. O if executa no máximo uma vez.' },
      { q: 'Qual expressão é verdadeira para TODO número par n?', o: ['n % 2 == 0', 'n / 2 == 0', 'n * 2 == 0', 'n - 2 == 0'], a: 0, e: 'O operador % devolve o resto da divisão. Números pares têm resto 0 quando divididos por 2.' },
    ],
    [
      { q: 'Os carros do viaduto estão guardados em uma lista. Em Java, Python e JavaScript, qual é o índice do PRIMEIRO carro?', o: ['1', '0', '-1', 'Depende do humor do INFINIT'], a: 1, e: 'Listas e arrays começam no índice 0. O último fica em tamanho - 1.' },
      { q: 'Você vai somar os sinais de uma lista. Qual deve ser o valor inicial do acumulador para que uma lista vazia some 0?', o: ['1', '-1', 'null', '0'], a: 3, e: 'Começar com 0 garante o resultado certo mesmo quando não há nenhum item para somar.' },
    ],
    [
      { q: 'No topo da torre: `if (a > b) maior = a; else maior = b;`. Se a = 3 e b = 9, quanto vale `maior`?', o: ['3', '9', '12', 'Nada, dá erro'], a: 1, e: '3 > 9 é falso, então o else é executado e maior recebe b, que vale 9.' },
      { q: 'Para que serve o `return` dentro de uma função?', o: ['Reiniciar o programa', 'Imprimir na tela', 'Devolver um valor para quem chamou a função', 'Criar um loop infinito'], a: 2, e: 'O return encerra a função e entrega o resultado para quem a chamou. Imprimir é print/console.log/System.out.println.' },
    ],
    [
      { q: 'A ilusão escreveu "Rick" e "rick". Ao comparar essas duas strings, a maioria das linguagens considera que elas são…', o: ['Diferentes: a comparação diferencia maiúsculas de minúsculas', 'Iguais', 'Iguais só às sextas-feiras', 'Números'], a: 0, e: 'Por padrão a comparação de textos é "case sensitive". Para ignorar, converta os dois com toLowerCase()/lower().' },
      { q: 'Quantos caracteres tem a string "Weller"?', o: ['5', '6', '7', '0'], a: 1, e: 'W-e-l-l-e-r: 6 caracteres. Use .length (Java/JS) ou len() (Python) para descobrir.' },
    ],
    [
      { q: 'Smith ri: "Seu programa nem começou a rodar. Faltou um ponto e vírgula." Que tipo de erro é esse?', o: ['Erro de lógica', 'Erro de rede', 'Erro de sintaxe / compilação', 'Loop infinito'], a: 2, e: 'Erros de sintaxe impedem o código de ser compilado ou interpretado: ele nem chega a executar.' },
      { q: 'Seu código roda sem travar, mas devolve 11 quando deveria devolver 10. Esse é um erro de…', o: ['Lógica', 'Sintaxe', 'Hardware', 'Compilação'], a: 0, e: 'O programa é válido, mas a lógica está errada. Testes existem justamente para pegar esse tipo de erro.' },
    ],
    [
      { q: 'Para saber se "Rick" está em uma lista de nomes, a forma mais direta é…', o: ['Somar todos os nomes', 'Usar um método de busca como includes / contains / in', 'Ordenar a lista e apagá-la', 'Converter a lista para número'], a: 1, e: 'JavaScript tem includes, Java tem contains (em listas) e Python tem o operador in.' },
      { q: 'A fachada mostra `nomes[2]` para a lista ["Weller", "VH", "Rick"]. Qual nome aparece?', o: ['Weller', 'VH', 'Rick', 'Erro'], a: 2, e: 'Índices começam em 0: nomes[0] = Weller, nomes[1] = VH, nomes[2] = Rick.' },
    ],
    [
      { q: 'No reflexo do asfalto: `for (int i = 0; i < 3; i++)`. Quantas vezes o bloco executa?', o: ['2', '4', 'Infinitas', '3'], a: 3, e: 'i assume 0, 1 e 2. Quando chega a 3, a condição i < 3 fica falsa e o loop para.' },
      { q: 'Déjà vu! Um loop cuja condição de parada nunca é atingida é chamado de…', o: ['Loop infinito', 'Recursão de cauda', 'Variável global', 'Constante'], a: 0, e: 'Sem uma condição de parada alcançável, o loop roda para sempre — e o jogo encerra a execução depois de alguns segundos.' },
    ],
    [
      { q: 'O Arquiteto pergunta: quanto vale 4! (fatorial de 4)?', o: ['8', '16', '24', '10'], a: 2, e: '4! = 4 × 3 × 2 × 1 = 24.' },
      { q: 'Uma função que chama a si mesma, como um fatorial recursivo, usa…', o: ['Herança', 'Recursão', 'Polimorfismo', 'Compilação cruzada'], a: 1, e: 'Recursão é uma função chamando a si mesma até chegar a um caso base (como fatorial(0) = 1).' },
    ],
  ],

  intermediario: [
    [
      { q: 'O Operador precisa checar milhares de vezes por segundo se um nome está em uma lista de 1 milhão de Agentes. Qual estrutura deixa essa busca O(1) em média?', o: ['Lista / array', 'Pilha', 'Conjunto (Set) ou mapa baseado em hash', 'Fila'], a: 2, e: 'Estruturas de hash (HashSet, set, Set) encontram um item em tempo constante médio; numa lista a busca é O(n).' },
      { q: 'Qual é a complexidade de percorrer uma única vez todos os n nomes de um array?', o: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], a: 2, e: 'Visitar cada elemento uma vez cresce linearmente com n.' },
    ],
    [
      { q: 'A fechadura do hotel verifica palíndromos comparando as pontas até o meio com dois índices. Quanta memória EXTRA isso usa?', o: ['O(n)', 'O(1)', 'O(n²)', 'O(log n)'], a: 1, e: 'Dois índices ocupam espaço constante. Criar uma cópia invertida da string usaria O(n).' },
      { q: 'Em Java, por que `nome == "Rick"` pode dar false mesmo quando o texto é igual?', o: ['Porque Java não tem strings', 'Porque "Rick" é palavra reservada', 'Porque == só funciona com números negativos', 'Porque == compara referências; para comparar o conteúdo use .equals()'], a: 3, e: 'Com objetos, == compara se são o mesmo objeto na memória. O conteúdo é comparado com equals().' },
    ],
    [
      { q: 'No FizzBuzz, por que testar "múltiplo de 15" antes de "múltiplo de 3"?', o: ['Porque senão o caso mais específico nunca é alcançado', 'Porque 15 é maior', 'Por estilo de código apenas', 'Para economizar memória'], a: 0, e: 'Todo múltiplo de 15 também é múltiplo de 3: se o teste do 3 vier antes, ele "rouba" o caso.' },
      { q: 'O painel expõe uma API REST. Qual método HTTP é idempotente e usado para LER um recurso?', o: ['POST', 'PATCH', 'GET', 'CONNECT'], a: 2, e: 'GET só lê e pode ser repetido sem efeito colateral. POST cria recursos e não é idempotente.' },
    ],
    [
      { q: 'Para contar quantas vezes cada palavra aparece em uma transmissão dos Agentes, a estrutura mais adequada é…', o: ['Um mapa / dicionário palavra → contagem', 'Uma pilha', 'Uma árvore vazia', 'Duas variáveis inteiras'], a: 0, e: 'Mapas (HashMap, dict, Map) associam cada palavra à sua contagem com acesso O(1) médio.' },
      { q: 'Ordenar n itens com um bom algoritmo de comparação (merge sort, Timsort) custa, no pior caso…', o: ['O(n)', 'O(log n)', 'O(n²)', 'O(n log n)'], a: 3, e: 'O(n log n) é o limite inferior para ordenação baseada em comparações.' },
    ],
    [
      { q: 'A torre recebe pacotes duplicados. Ao remover duplicados com LinkedHashSet (Java), dict (Python 3.7+) ou Set (JS), a ordem dos itens…', o: ['É embaralhada', 'É mantida na ordem de inserção', 'Fica ordenada numericamente', 'Se perde sempre'], a: 1, e: 'Essas estruturas preservam a ordem de inserção. Um HashSet comum do Java não garante ordem.' },
      { q: 'Qual princípio do SOLID diz que uma classe deve ter apenas um motivo para mudar?', o: ['Aberto/Fechado', 'Substituição de Liskov', 'Responsabilidade Única (SRP)', 'Inversão de Dependência'], a: 2, e: 'SRP: cada módulo cuida de uma única responsabilidade, o que facilita manutenção e testes.' },
    ],
    [
      { q: 'Achar o segundo maior valor em uma única passada, guardando os dois maiores, custa…', o: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'], a: 0, e: 'Uma passada linear basta; ordenar seria O(n log n) sem necessidade.' },
      { q: 'A ilusão altera sua lista por dentro de uma função sem você perceber. Que prática evita esse efeito colateral?', o: ['Usar variáveis globais', 'Desligar o garbage collector', 'Usar mais loops', 'Imutabilidade: devolver uma nova coleção em vez de alterar a recebida'], a: 3, e: 'Funções que não modificam seus argumentos são mais previsíveis e fáceis de testar.' },
    ],
    [
      { q: 'Validar ( [ { exige lembrar do último símbolo aberto primeiro. Qual estrutura segue LIFO (último a entrar, primeiro a sair)?', o: ['Fila', 'Heap', 'Grafo', 'Pilha'], a: 3, e: 'Pilha (stack) é LIFO. Fila (queue) é FIFO.' },
      { q: "Smith tenta logar com `' OR '1'='1`. Qual é a defesa correta contra SQL Injection?", o: ['Consultas parametrizadas (prepared statements)', 'Esconder o banco de dados', 'Usar só letras maiúsculas', 'Aumentar o timeout'], a: 0, e: 'Com parâmetros, a entrada do usuário nunca é interpretada como SQL.' },
    ],
    [
      { q: 'Em Java, concatenar strings com + dentro de um loop grande é lento porque…', o: ['A JVM proíbe loops', 'Strings são imutáveis: cada + cria um novo objeto. Prefira StringBuilder', 'O + só funciona com números', 'O garbage collector desliga'], a: 1, e: 'StringBuilder acumula em um buffer mutável e evita criar milhares de objetos intermediários.' },
      { q: 'No Git, qual comando cria um novo ramo para trabalhar sem afetar a main?', o: ['git push --force', 'git reset --hard', 'git switch -c nome (ou git checkout -b nome)', 'git clean -fd'], a: 2, e: 'Branches isolam o trabalho; depois você integra via merge ou pull request.' },
    ],
    [
      { q: 'Para rotacionar um array de tamanho n por k posições quando k > n, qual operação evita trabalho inútil?', o: ['k % n', 'k * n', 'k - 1', 'n / k'], a: 0, e: 'Rotacionar n vezes devolve o array original, então só o resto k % n importa.' },
      { q: 'Você escreveu um teste que verifica uma única função isolada, sem banco nem rede. Esse é um teste…', o: ['End-to-end', 'De carga', 'De unidade', 'Manual'], a: 2, e: 'Testes de unidade são rápidos e isolados; end-to-end exercitam o sistema inteiro.' },
    ],
    [
      { q: 'O Arquiteto exige achar dois números que somam o alvo usando um mapa hash em uma passada. Qual é o custo?', o: ['O(n²) tempo e O(1) memória', 'O(log n) tempo', 'O(n) tempo e O(n) memória', 'O(1) tempo'], a: 2, e: 'Troca-se memória (o mapa) por tempo: uma única passada em vez de dois loops aninhados.' },
      { q: 'Em JavaScript, o que `await` faz dentro de uma função async?', o: ['Bloqueia o navegador inteiro', 'Pausa só aquela função até a Promise resolver, sem travar o event loop', 'Cria uma nova thread', 'Converte a Promise em string'], a: 1, e: 'O restante da aplicação continua rodando; a função retoma quando a Promise é resolvida.' },
    ],
  ],

  senior: [
    [
      { q: 'Na solução O(n log n) da maior subsequência crescente, a busca binária funciona porque o array auxiliar de "caudas" é…', o: ['Sempre ordenado', 'Sempre vazio', 'Uma pilha LIFO', 'Um heap máximo'], a: 0, e: 'tails[i] guarda a menor cauda possível de uma subsequência de tamanho i+1, e essa sequência é crescente.' },
      { q: 'Inserir no fim de um array dinâmico que dobra de capacidade quando enche custa, em tempo amortizado…', o: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'], a: 1, e: 'As cópias ocasionais somam O(n) ao longo de n inserções: O(1) amortizado por inserção.' },
    ],
    [
      { q: 'Contar caminhos na grade reaproveitando resultados de subproblemas sobrepostos é a essência de…', o: ['Algoritmo guloso', 'Força bruta', 'Programação dinâmica', 'Divisão e conquista sem sobreposição'], a: 2, e: 'DP = subproblemas sobrepostos + subestrutura ótima, resolvidos uma única vez e reaproveitados.' },
      { q: 'Duas threads de Agentes incrementam o mesmo contador sem sincronização e o total sai menor que o esperado. Isso é…', o: ['Um deadlock', 'Uma condição de corrida (race condition)', 'Um stack overflow', 'Um memory leak'], a: 1, e: 'x++ não é atômico (ler, somar, escrever). Use locks, AtomicInteger ou estruturas thread-safe.' },
    ],
    [
      { q: 'Na janela deslizante sem caracteres repetidos, por que o algoritmo é O(n) mesmo com dois ponteiros?', o: ['Porque usa recursão', 'Porque a string é pequena', 'Porque ordena antes', 'Cada ponteiro só avança, então cada caractere entra e sai da janela no máximo uma vez'], a: 3, e: 'O total de movimentos dos dois ponteiros é limitado por 2n.' },
      { q: 'Segundo o teorema CAP, durante uma partição de rede um sistema distribuído precisa escolher entre…', o: ['Consistência e Disponibilidade', 'Latência e Throughput', 'Segurança e Custo', 'CPU e Memória'], a: 0, e: 'Com a rede partida (P), ou o sistema recusa requisições para ficar consistente (CP) ou responde com dados possivelmente desatualizados (AP).' },
    ],
    [
      { q: 'Para avaliar `2+3*4` respeitando precedência sem eval, uma abordagem clássica é…', o: ['Ordenar os caracteres', 'Parser descendente recursivo ou o algoritmo Shunting-yard de Dijkstra', 'Busca binária', 'Fazer hash dos operadores'], a: 1, e: 'Cada nível de precedência vira uma função (expressão → termo → fator) ou usa-se uma pilha de operadores.' },
      { q: 'Uma API de pagamento recebe a mesma requisição duas vezes por causa de um retry. Para cobrar só uma vez, o endpoint deve ser…', o: ['Assíncrono', 'Paginado', 'Idempotente (por exemplo, com uma chave de idempotência)', 'Stateless'], a: 2, e: 'Idempotência garante que repetir a mesma operação produz o mesmo efeito de executá-la uma vez.' },
    ],
    [
      { q: 'Contar ilhas com DFS recursiva em uma grade 2000 × 2000 toda de 1 pode quebrar porque…', o: ['A grade é pequena demais', 'DFS não visita vizinhos', 'A recursão estoura a pilha de chamadas: use DFS/BFS iterativa com pilha ou fila explícita', 'Ilhas não são grafos'], a: 2, e: 'Uma única ilha de 4 milhões de células gera recursão profunda demais para a pilha padrão.' },
      { q: 'Qual estrutura une conjuntos e responde "estão conectados?" em tempo quase constante amortizado?', o: ['Union-Find com compressão de caminho e união por rank', 'Lista ligada', 'Fila de prioridade', 'Trie'], a: 0, e: 'Com as duas otimizações, o custo amortizado é O(α(n)), praticamente constante.' },
    ],
    [
      { q: 'Por que Dijkstra NÃO garante o menor caminho com arestas de peso negativo?', o: ['Porque só funciona em árvores', 'Porque usa recursão', 'Porque ignora o vértice inicial', 'Porque fecha um vértice assumindo que nenhum caminho futuro o tornará mais barato'], a: 3, e: 'Uma aresta negativa descoberta depois pode baratear um vértice já fechado. Use Bellman-Ford nesse caso.' },
      { q: 'Na grade de menor custo (só direita/baixo), qual propriedade torna a programação dinâmica válida?', o: ['Subestrutura ótima: o melhor caminho até uma célula vem do melhor caminho até uma vizinha anterior', 'Custos negativos', 'A grade ser quadrada', 'Os caminhos poderem voltar'], a: 0, e: 'Como só se anda para direita/baixo, não há ciclos: cada célula depende apenas de cima e da esquerda.' },
    ],
    [
      { q: 'A distância de edição usa uma tabela (m+1) × (n+1). Como reduzir a memória para O(min(m, n))?', o: ['Usando recursão sem memoização', 'Guardando apenas a linha anterior e a linha atual da tabela', 'Ordenando as strings', 'É impossível'], a: 1, e: 'Cada célula depende só da linha anterior e da célula à esquerda.' },
      { q: 'Smith se replica sem parar: objetos continuam referenciados em um cache estático e nunca são coletados. Isso é…', o: ['Condição de corrida', 'Deadlock', 'Vazamento de memória (memory leak)', 'Overflow de inteiro'], a: 2, e: 'O garbage collector só libera o que não é mais alcançável. Caches sem limite ou expiração vazam memória.' },
    ],
    [
      { q: 'Fundir intervalos custa O(n log n). Qual etapa domina esse custo?', o: ['A ordenação pelo início', 'A varredura linear', 'A alocação do resultado', 'A comparação final'], a: 0, e: 'Depois de ordenar, uma varredura O(n) funde tudo.' },
      { q: 'As quatro condições de Coffman precisam valer juntas para haver deadlock. Qual delas NÃO é uma dessas condições?', o: ['Exclusão mútua', 'Posse e espera', 'Não preempção', 'Idempotência'], a: 3, e: 'As condições são exclusão mútua, posse e espera, não preempção e espera circular.' },
    ],
    [
      { q: 'Por que escolher sempre a maior moeda (guloso) falha para moedas [1, 5, 6, 9] e valor 11?', o: ['Porque 11 é primo', 'Ele pega 9+1+1 (3 moedas), mas 5+6 usa só 2: o problema não tem a propriedade da escolha gulosa', 'Porque faltam moedas de 2', 'O guloso sempre acerta'], a: 1, e: 'Para sistemas de moedas arbitrários, a solução ótima exige programação dinâmica.' },
      { q: 'A aplicação lê do cache e, quando não encontra, busca no banco e preenche o cache. Esse padrão se chama…', o: ['Write-through', 'Event sourcing', 'Cache-aside (lazy loading)', 'Circuit breaker'], a: 2, e: 'No cache-aside a aplicação controla o cache; no write-through toda escrita passa pelo cache.' },
    ],
    [
      { q: 'No N-Rainhas por backtracking, usar máscaras de bits para colunas e diagonais melhora…', o: ['A complexidade para polinomial', 'A verificação de conflito para O(1) por posição', 'A memória para O(n²)', 'Nada'], a: 1, e: 'O problema continua exponencial, mas cada teste de conflito vira uma operação de bits.' },
      { q: 'O Arquiteto pergunta: se alguém provar que um problema NP-completo tem algoritmo polinomial, então…', o: ['P = NP', 'P ≠ NP', 'Todos os problemas viram O(1)', 'O INFINIT trava'], a: 0, e: 'Todo problema em NP se reduz polinomialmente a um NP-completo; resolver um em tempo polinomial resolve todos.' },
    ],
  ],
};
