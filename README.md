# The Infinit - Programming Game

Jogo para aprender **Java, Python e JavaScript** resolvendo desafios em cenas no estilo 32 bits.

| Personagem | Linguagem  | Onde o código roda                         |
|------------|------------|--------------------------------------------|
| Weller     | Java       | `javac` + JVM no servidor (compilação real) |
| Rick       | Python     | CPython 3 no servidor                       |
| VH         | JavaScript | Web Worker no navegador                     |

## Rodar localmente

Pré-requisitos: Node 20+, **JDK 17+** (`javac` e `java` no PATH) e **Python 3**.

```bash
npm install
npm run dev        # Vite + API de compilação no mesmo servidor (http://localhost:5173)
npm run validate   # confere os 90 desafios (3 níveis × 10 fases × 3 linguagens) com os compiladores reais
```

Produção sem Docker: `npm run build && npm start` → http://localhost:8787

## Deploy

**Recomendado: Docker** (Render, Fly.io, Railway, uma VPS…). A imagem já traz Java 17 e Python 3:

```bash
docker build -t matrix-game .
docker run --rm -p 8787:8787 --read-only --tmpfs /tmp:exec,size=128m \
  --memory=768m --cpus=1 --pids-limit=200 matrix-game
```

**Vercel**: só hospeda o frontend estático. VH (JavaScript) funciona sozinha; para Weller e Rick,
suba o container acima em outro lugar e configure na Vercel `VITE_RUNNER_URL=https://seu-runner` e,
no container, `CORS_ORIGIN=https://seu-site.vercel.app`.

### Segurança do servidor de compilação

Executar código de terceiros é perigoso. O servidor já limita tempo (javac 25 s, execução 5–6 s),
memória da JVM, tamanho do código e da saída, execuções simultâneas (`MAX_PARALLEL`) e por IP
(`RATE_PER_MIN`), e roda cada envio em uma pasta temporária com ambiente limpo (nenhuma variável do
servidor chega ao código do jogador). **Mesmo assim, exponha publicamente só dentro do container**,
com usuário sem privilégios e os limites do `docker run` acima.

## Como o jogo funciona

1. **Abertura**: chuva de código →  em tela cheia → *CHOOSE YOUR DESTINY*.
   O jogador escolhe clicando na pílula. A trilha (`public/assets/soundtrack.mp3`) começa
   junto com a chuva e toca sem parar o jogo inteiro; se o navegador bloquear o som automático, aparece
   antes uma tela "ENTRAR NA INFINIT" pedindo um clique (exigência dos navegadores).
2. **Dificuldade** (antes do personagem) — cada uma tem seus próprios 10 desafios:

   | Nível | Desafios | Dicas | Pergunta errada |
   |---|---|---|---|
   | Iniciante | muito fáceis e fáceis | com o caminho da solução, após **2 min sem escrever** ou ao **errar a 1ª tentativa** | perde o bônus de XP |
   | Intermediário | 1ª fácil, depois nível pleno | conceituais, sem mostrar o resultado, após **3 min sem escrever** ou ao **errar a 2ª tentativa** | perde o bônus de XP |
   | Sênior | algoritmos complexos (DP, grafos, parser, backtracking…) | **nenhuma** | custa 1 integridade |

3. **Personagem**: Weller (Java), Rick (Python) ou VH (JavaScript).
4. **Prólogo** + **10 fases**. Cada fase tem:
   - um **capítulo** da história (cena própria, continuação da narrativa);
   - um **interrogatório** com 2 perguntas de múltipla escolha sobre Infinit + programação no nível escolhido
     (60 perguntas no total, com explicação da resposta);
   - o **desafio de código** compilado/executado de verdade. Acertou → cena do personagem; errou → Agente
     Smith. Erros de compilação não custam integridade; com 3 testes falhos o Smith te captura (o progresso fica salvo).
5. XP por fase: código (100 / 150 / 200 conforme o nível, −25% por dica revelada) + bônus das perguntas.
   Patente final: Recruta, Operador ou O Escolhido. O progresso é salvo por dificuldade e personagem.

O jogo detecta máquinas sem aceleração de vídeo e liga um **modo leve** (ou force com `?fx=low` / `?fx=high`).

## Estrutura

```
shared/challenges.js     desafios, assinaturas e testes (usado pelo navegador e pelo servidor)
server/runner.mjs        compila/executa Java e Python com tempo limite
server/api.mjs           rotas /api/run e /api/health
server/index.mjs         servidor de produção (dist/ + API), sem dependências
server/validate.mjs      valida os 90 desafios com soluções de referência
src/screens/             Splash, DifficultySelect, CharacterSelect, Story, Chapter, Quiz, Mission, Captured, Outro
src/data/questions.ts    as 60 perguntas do interrogatório
src/data/chapters.ts     os 10 capítulos da história
src/components/Stage.tsx palco das cenas (câmera, chuva, neblina, glitch, personagens)
src/lib/mini3d.ts        motor 3D em WebGL puro (pílulas, emblemas e hologramas)
src/data/scenes.ts       as 10 cenas dos setores
src/data/heroes.ts       personagens, linguagens e falas
public/assets/           arte (pôster, cidades, recortes dos personagens, Smith)
```

## Adicionar um desafio

Cada dificuldade tem exatamente 10 fases (uma por capítulo/cena). Para trocar um desafio, edite o objeto em
`shared/challenges.js` (as três variantes são geradas pela assinatura Java em `sig()`), atualize a solução de
referência em `server/validate.mjs` e rode `npm run validate`.
