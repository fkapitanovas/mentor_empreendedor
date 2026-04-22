# Bloco de Vendas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expandir a cobertura de "vender mais" no system prompt do Max Impulso, entregando o bloco `vendas.ts` (~480 linhas, 10 seções), adicionando Alfredo Soares como 13º guru em `conhecimento.ts` (~85 linhas), expandindo a entrada Bora Vender em `livros.ts` (~45 linhas), enxugando o módulo 2 do Impulso Stone (dívida de promessa não entregue), e fiando tudo no `index.ts`.

**Architecture:** Pure editorial/string-literal work — 5 arquivos TypeScript, todos exports de const strings. Sem lógica nova. Validação é `npx tsc --noEmit` (deve continuar passando) + `npm run build` (deve gerar sem erros) + smoke test no chat em dev local. Deploy por `vercel --prod --yes` a partir do `web/`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Anthropic SDK (consome o prompt via `buildSystemPrompt()` em `web/src/lib/prompts/index.ts`).

**Spec de referência:** `docs/superpowers/specs/2026-04-22-bloco-vendas-design.md` (commit `42595ce`).

**Convenções do projeto (invioláveis):**
- Plaintext ASCII **sem acentos** (á→a, ç→c, ã→a, ê→e, í→i, ó→o, ú→u, ü→u, â→a, ô→o, õ→o)
- Strings em template literals com continuação de linha (`\` no final da linha) — ver padrão em `conhecimento.ts:1-3`
- Sem emojis, sem markdown dentro das strings
- Seções em MAIÚSCULAS
- "Use quando:" ao final de perfis/seções longas
- Nunca prometer resultado financeiro específico; sempre lembrar "nao e conselho juridico/contabil" quando relevante
- Commits em pt-BR, título curto, corpo explica o porquê

**Comandos úteis (sempre rodar do diretório `web/`):**
```bash
cd /Users/kapi/mentor_empreendedor/web
npx tsc --noEmit          # typecheck
npm run build             # build de produção
npm run dev               # dev server em http://localhost:3000
vercel --prod --yes       # deploy (DO diretório web/, não da raiz)
```

---

## File Structure

Todos os arquivos ficam dentro de `/Users/kapi/mentor_empreendedor/web/src/lib/prompts/`.

| Arquivo | Ação | Responsabilidade após a mudança |
|---|---|---|
| `vendas.ts` | **CRIAR** | Novo bloco, 10 seções temáticas de vendas + 11 estratégias Insta + 13 WhatsApp |
| `conhecimento.ts` | Modificar | Adiciona Alfredo Soares como 13º guru (bloco MARKETING) |
| `livros.ts` | Modificar | Substitui entrada de 3 linhas do Bora Vender por ~45 linhas com frameworks |
| `impulso-stone.ts` | Modificar | Enxuga módulo 2 pra não prometer listas que agora vivem em vendas.ts |
| `index.ts` | Modificar | Importa `BASE_VENDAS`, insere no array de blocos entre ecommerce e ferramentas |

---

## Task 1: Criar `vendas.ts` — o bloco novo completo

**Files:**
- Create: `web/src/lib/prompts/vendas.ts`

Este arquivo é o coração da entrega. 10 seções em sequência, ~480 linhas totais. Depois de criado, o typecheck precisa passar (string template simples; qualquer backslash mal-posicionado quebra).

- [ ] **Step 1.1: Criar o arquivo com o conteúdo completo**

Write em `/Users/kapi/mentor_empreendedor/web/src/lib/prompts/vendas.ts`:

```typescript
export const BASE_VENDAS = `Base dedicada a vendas para microempreendedores brasileiros. \
Este bloco consolida frameworks, scripts acionaveis, tratamento de objecoes, \
copywriting, follow-up, pos-venda e mentalidade de vendedor solo. Use em \
complemento aos perfis de Erico Rocha (lancamentos), Conrado Adolpho (8Ps), \
Pedro Sobral (trafego pago) e Alfredo Soares (vendas consultivas e ecommerce).

1. PRINCIPIOS FUNDAMENTAIS DE VENDA

Definicao de venda (Raul Candeloro, via Alfredo Soares): "vender e ajudar o \
cliente com o produto ou servico que voce vende, com lucro para a empresa". \
Toda venda saudavel resolve um problema real e gera caixa. Nunca force algo \
que o cliente nao precisa — isso volta como reclamacao e destrói reputacao.

CHA — tripe do vendedor profissional:
- Conhecimento: produto (o que vende), mercado (onde vende), concorrencia (o \
que os outros fazem), cliente (quem compra e por que), tendencias (o que vem).
- Habilidades: escutar mais do que falar, fazer perguntas abertas, identificar \
dor, apresentar beneficio (nao caracteristica), negociar sem dar desconto fatal.
- Atitudes: persistencia, disciplina, curiosidade, integridade, servir.

4 mitos que travam o MEI:
(1) "Vendedor tem que ter labia" — FALSO. Escutar vende mais que falar.
(2) "Vendedor nasce pronto" — FALSO. Venda se aprende (CHA).
(3) "O cliente sempre tem razao" — FALSO. Cliente ruim drena energia; demitir \
cliente toxico e uma decisao saudavel.
(4) "Vender e para poucos" — FALSO. Todos somos vendedores (em entrevista, \
namoro, ate para convencer filho a comer brocolis). Postura consultiva > \
postura empurrada.

Use quando: o empreendedor diz "eu nao nasci pra vender", trava por vergonha, \
acha que precisa forcar ou insistir demais, ou confunde venda com enganacao.

---

2. CONHECER QUEM COMPRA (cliente ideal e jornada)

8 perguntas para definir o cliente ideal (Alfredo Soares, Bora Vender p.106):
(1) Qual segmento de mercado? (idade, genero, profissao, renda, local);
(2) Qual tamanho medio do cliente? (ticket, recorrencia);
(3) Qual regiao/bairro concentra os melhores clientes?
(4) Qual o maior desafio ou dor desse cliente?
(5) Qual o menor custo para conquistar esse cliente (CAC)?
(6) Qual o ciclo mais curto de compra (quanto tempo do primeiro contato ao pagamento)?
(7) Qual o melhor canal para encontrar esse cliente (Insta, WhatsApp, indicacao, balcao)?
(8) Qual o maior valor percebido (o que o cliente mais elogia/paga para ter)?

Jornada do consumidor em 4 estagios (Bora Vender p.119):
ESTAGIO I — APRENDIZADO/DESCOBERTA: cliente ainda nao sabe que tem o problema. \
Conteudo: educativo, amplo, sem oferta. Ex.: "5 sinais de que voce precisa trocar \
o sistema de gestao da sua confeitaria".
ESTAGIO II — RECONHECIMENTO DO PROBLEMA: cliente ja sente a dor, busca nome \
para ela. Conteudo: aprofundar dor, mostrar impactos. Ex.: "Por que confeiteira \
perde ate 30% do lucro sem precificar direito".
ESTAGIO III — CONSIDERACAO DA SOLUCAO: cliente compara alternativas. Conteudo: \
comparacoes, cases, demonstracoes. Ex.: "O que olhar na hora de escolher sua \
planilha de precificacao".
ESTAGIO IV — DECISAO DE COMPRA: cliente pronto para pagar, busca confianca \
final. Conteudo: depoimento, garantia, prova social, escassez legitima. Ex.: \
"Ultimas 2 vagas da mentoria esse mes".

Regra dos 20/80 (Bora Vender p.107): os 20% de clientes mais rentaveis formam \
a matriz do cliente ideal. Quem prospectar novo? Gente que se parece com eles. \
Para MEI sem CRM, olhar: quem pagou em dia, quem recomprou, quem indicou, quem \
elogiou publicamente.

Use quando: empreendedor "vende pra todo mundo" e converte pouco, nao sabe em \
quem focar o marketing, ou nao entende por que o mesmo conteudo converte um \
publico e nao outro.

---

3. SCRIPTS DE ABORDAGEM

Scripts textuais prontos — podem ser copiados e adaptados pelo empreendedor.

Declaracao de forca (abertura, Thiago Concer via Bora Vender p.62):
"Sr./Sra. [nome], sou [profissao] aqui em [cidade/bairro]. Ajudo [perfil do \
cliente ideal] a [resultado concreto]. Posso te mostrar como isso funciona em \
2 minutinhos?"

Exemplo confeiteira: "Oi, Ana, sou a Ju, confeiteira aqui do Tatuape. Faco \
bolo pronto com entrega no dia pra mae que nao tem tempo de se preocupar com \
festa infantil. Posso te mostrar em 1 minuto como funciona?"

Primeira mensagem WhatsApp (contato frio):
PASSO 1 — apresenta-se em 1 linha. PASSO 2 — pede permissao. PASSO 3 — entrega \
valor gratuito. PASSO 4 — SO depois oferta (nunca na primeira).
"Oi, [nome]! Sou a [seu nome] da [seu negocio]. Vi que voce segue [perfil X] — \
tenho conteudo sobre [topico]. Posso te mandar uma dica rapida que pode ajudar?"

Primeira mensagem WhatsApp (morno, indicacao):
"Oi, [nome]! A [indicador] me passou seu contato. Ela comentou que voce ta \
procurando [solucao]. Posso te explicar rapidinho como eu trabalho e ver se \
faz sentido?"

DM fria no Instagram (regra das 3 interacoes antes da abordagem):
- Interacao 1: curtir 2-3 posts recentes;
- Interacao 2: comentar algo substancial em 1 post (nao "lindo!", mas pergunta ou conexao);
- Interacao 3: responder 1 story com algo curto;
- So entao mandar DM apresentando-se.

Abordagem de balcao/presencial (quem atende loja, salao, feira):
Abrir com pergunta sobre o CLIENTE, nao sobre o produto. Evitar: "Posso te \
ajudar?" (resposta automatica: "so estou olhando"). Preferir: "E pra usar onde, \
em casa ou trabalho?" / "E presente ou e pra voce?" / "Primeira vez aqui?".

Cold mail para MEI B2B (Bora Vender p.126):
- Assunto personalizado com nome ou empresa (nao generico);
- 3 paragrafos no maximo: (i) contexto que mostra que pesquisou; (ii) problema \
que acredita que o destinatario tem; (iii) CTA com UMA pergunta especifica;
- Remetente identificado (nome + empresa + assinatura);
- NAO e spam: volume pequeno, personalizado, com opt-out honesto.

Apresentar preco sem medo:
- Ancorar no valor percebido ANTES do numero ("esse servico cobre X, Y e Z e \
tem garantia de W");
- Parcelar sempre que possivel ("R$ 480 a vista ou 3x de R$ 170 no cartao");
- Nunca pedir desculpa pelo preco ("e que ta meio caro mesmo..." — nunca);
- Silencio depois de falar o preco: quem fala primeiro perde a ancora.

Use quando: empreendedor "nao sabe o que falar" no primeiro contato, tem lista \
de leads mas nao aborda, ou fala o preco com insegurancia e o cliente percebe.

---

4. 11 ESTRATEGIAS INSTAGRAM + 13 ESTRATEGIAS WHATSAPP

Listas destrinchadas. Cada item tem explicacao breve + exemplo de nicho. \
Nichos ciclados: confeitaria (C), beleza/estetica (B), moda/loja (M), servico \
local (S).

11 ESTRATEGIAS INSTAGRAM (Conrado Adolpho + Camila Porto):
(1) BIO OTIMIZADA EM 3 LINHAS — linha 1: o que faz. Linha 2: para quem. Linha \
3: CTA (link WhatsApp). Ex. (C): "Bolo artesanal entregue no dia / Festa \
infantil sem stress / wa.me/55119XXXX".
(2) HIGHLIGHTS ORGANIZADOS — minimo 5: "precos", "trabalhos", "depoimentos", \
"antes e depois", "duvidas frequentes". Ex. (B): highlight "antes e depois" \
mostra transformacao em cada cliente — vira catalogo.
(3) REELS CURTOS COM PROVA — 15-30s, mostrar processo, resultado ou cliente \
real. Ex. (M): bastidor da costureira montando vestido vende mais que foto \
pronta.
(4) CARROSSEL EDUCATIVO — 7-10 slides, primeiro slide e gancho (titulo \
polemico ou pergunta), ultimo slide e CTA. Ex. (S): "5 erros que voce comete \
na primeira reforma" — cada slide e um erro.
(5) STORIES DIARIOS — rotina, bastidor, produto chegando, cliente recebendo. \
Presenca constante vale mais que post perfeito. Ex. (C): "hoje fazendo bolo de \
aniversario do filho da Ana".
(6) LIVES COM DEMONSTRACAO OU Q&A — 1 vez por semana ou quinzenal, tirar \
duvida ao vivo constroi autoridade rapido. Ex. (B): "perguntas e respostas \
sobre cabelo cacheado, venha participar".
(7) LINK NA BIO COM CATALOGO — Linktree, Beacons ou link direto do WhatsApp. \
Nunca deixar bio sem link — cada visita sem CTA e lead perdido.
(8) PARCERIA COM MICROINFLUENCIADOR LOCAL — permuta (produto em troca de \
post) vale mais que pagar celebridade. 1.000 seguidores engajados do seu bairro \
> 100.000 seguidores aleatorios.
(9) ENQUETE DE STORIES — "qual sabor voce prefere?", "voce ja teve esse \
problema?". Gera interacao + pesquisa gratuita.
(10) RESPOSTA PUBLICA A COMENTARIOS + DIRECT COMO CTA — comentou? responde \
ali e diz "to chamando no direct para explicar melhor". Vira conversa.
(11) CONTEUDO SAZONAL — Dia das Maes, Natal, Black Friday, datas do nicho \
(Dia da Noiva para buffet, Dia das Criancas para loja infantil). Planejar \
15-30 dias antes.

13 ESTRATEGIAS WHATSAPP (Conrado Adolpho + Alfredo Soares + Impulso Stone):
(1) CONTA WHATSAPP BUSINESS SEPARADA DO PESSOAL — celular dedicado se possivel, \
ou numero novo em dual chip. Mistura pessoal/trabalho = mensagens perdidas.
(2) CATALOGO DE PRODUTOS CONFIGURADO — foto, preco, descricao. WhatsApp \
Business → Ferramentas → Catalogo. Vira link compartilhavel.
(3) LINK DE PAGAMENTO — Stone, PagSeguro ou Mercado Pago. Cartao a vista ou \
parcelado em ate 18x. Cliente paga sem sair da conversa.
(4) LISTA DE TRANSMISSAO SEGMENTADA — pedir opt-in antes ("posso te avisar \
quando tiver novidade?"). Segmentar: novos clientes / recorrentes / prospects \
mornos. Nunca grupo — lista de transmissao e diferente (cada um recebe \
individual).
(5) MENSAGENS AUTOMATICAS — boas-vindas (saudacao + prazo de resposta) e \
ausencia (fora do horario comercial). Profissionaliza o atendimento.
(6) RESPOSTAS RAPIDAS — atalhos para perguntas comuns (preco, prazo, \
endereco). "/preco" dispara texto padrao.
(7) ETIQUETAS DE CLIENTE — "novo", "em atendimento", "comprou", "indicacao", \
"reativar". Organiza o pipeline visualmente.
(8) STATUS WHATSAPP COM NOVIDADE — 2-3x por semana. E como story do Insta \
mas apenas contatos que ja tem seu numero veem (publico mais quente).
(9) PRIMEIRA MENSAGEM ESTRATEGICA — apresenta → pede permissao → entrega \
valor → so depois oferta. NAO enviar oferta direta na primeira.
(10) HORARIOS COMERCIAIS RESPEITADOS — nao mandar mensagem as 22h em dia de \
semana. Respeitar WhatsApp alheio = ser convidado pro proximo.
(11) AUDIO CURTO PARA EXPLICACAO COMPLEXA — mais pessoal que texto longo. \
Audio ate 30s. Evitar audio de 3min — ninguem escuta.
(12) FOLLOW-UP PROGRAMADO — gatilho por tempo: 48h apos orcamento enviado, 7 \
dias apos compra, 30 dias apos ultima interacao. Sem seguir, 80% das vendas \
escapam (ver secao 8).
(13) PEDIDO DE INDICACAO APOS CLIENTE SATISFEITO — momento ideal: 24-72h \
depois do cliente elogiar. Script: "que bom que gostou! conhece alguem que \
tambem ta precisando?".

Use quando: empreendedor usa Insta ou WhatsApp "no feeling", sem estrategia. \
Pede as "estrategias do programa Impulso Stone" ou quer saber "o que postar". \
Precisa profissionalizar o canal.

---

5. SPIN SELLING E DESCOBERTA DE DOR

Metodologia de Neil Rackham (via Alfredo Soares, Bora Vender p.125). Perguntas \
que descobrem a dor do cliente ANTES de oferecer a solucao — evita empurrar \
produto.

S — SITUACAO: perguntas de diagnostico. Contexto atual do cliente.
Ex.: "Como voce vende hoje?" "Quantos clientes por mes?" "Por onde eles te \
acham?" "Quanto tempo leva do contato a venda?"

P — PROBLEMA: investigar a dor especifica.
Ex.: "Qual a maior dificuldade nesse processo?" "O que mais te da trabalho?" \
"O que voce tentou e nao funcionou?"

I — IMPLICACAO: dimensionar o custo da dor. Aqui a venda se abre.
Ex.: "E quanto isso te custa em cliente perdido por mes?" "Se seguir assim, \
daqui 6 meses como vai estar?" "Seu concorrente que resolveu isso cresceu \
quanto?"

N — NECESSIDADE DE SOLUCAO: cliente enxerga o valor e pede a solucao.
Ex.: "Se voce tivesse [solucao], o que mudaria?" "Quanto isso valeria pra voce?"

Roteiro de 10 perguntas prontas para nichos comuns:

Para confeiteira:
1. Quantos orcamentos voce manda por semana?
2. Quantos fecham?
3. Por que voce acha que os outros nao fecham?
4. Quanto voce estima que deixa de ganhar por mes assim?

Para prestador de servico local (eletricista, pintor, diarista, personal):
1. Como os clientes te acham hoje?
2. Quanto tempo em media do orcamento ate a contratacao?
3. Ja perdeu cliente por demora na resposta?
4. Quanto voce cobra por hora — e quanto gostaria de cobrar?

Para loja/moda:
1. Qual produto vende mais?
2. Qual produto sobra mais?
3. Ticket medio da sua loja e quanto?
4. Cliente costuma voltar quantos meses depois?

B2B vs B2C: em venda B2B (MEI vendendo para outro MEI ou empresa), rodar a \
sequencia completa pausadamente. Em B2C (MEI vendendo para consumidor final), \
condensar S+P em 2 perguntas, pular para I e N rapido. Consumidor final nao \
aguenta interrogatorio.

Use quando: empreendedor apresenta produto antes de entender cliente, perde \
venda por nao criar urgencia, ou faz orcamento "no automatico" sem \
diagnosticar.

---

6. TRATAMENTO DE OBJECOES

Fato-ancora (Bora Vender p.57): 50% a 70% das vendas sao perdidas NAO porque o \
cliente disse "nao", mas porque NAO DECIDIU. Objecao nao e rejeicao — e pedido \
de mais informacao. Se o cliente falasse "nao" seco, a conversa acabava.

As 6 objecoes mais comuns do MEI brasileiro:

(1) "TA CARO"
- Resposta A — ancoragem reversa: "Caro comparado a que?". Forca o cliente \
a nomear a referencia. Ele pode nem ter comparacao.
- Resposta B — resumo de valor: "Dentro desse valor voce recebe [X, Y, Z]. \
Qual desses seria dispensavel pra voce?"
- Resposta C — parcelamento + combo menor: "Tem uma versao mais enxuta por \
[menor]. Ou parcelo em 3x sem juros esse aqui completo. Qual faz mais sentido?"

(2) "VOU PENSAR"
- Resposta A — especificar a duvida: "Tranquilo. So pra te ajudar a pensar, \
o que especificamente ficou em duvida: preco, prazo, garantia, ou outra coisa?"
- Resposta B — marcar retorno concreto: "Posso te chamar na quinta ou sexta \
pra saber como foi?". Nunca aceitar "vou te chamar" sem marcar.
- Resposta C — condicao com prazo: "Se decidir ate sexta, consigo manter \
essa condicao. Depois disso nao garanto."

(3) "PRECISO FALAR COM MEU MARIDO / MINHA ESPOSA / MEU SOCIO"
- Resposta A — facilitar a conversa: "Entendi. Posso te mandar um resumo \
em texto pra voce mostrar? Isso ajuda a conversa."
- Resposta B — incluir o decisor: "Voces conseguem dar uma olhada juntos \
amanha? Posso ligar nesse horario com os dois."

(4) "TO SEM TEMPO AGORA"
- Resposta A — reagendar concreto: "Entendi. Prefere que eu te chame \
quinta de manha ou sexta a tarde?"
- Resposta B — oferecer assincrono: "Sem problema. Te mando um video de \
1 minuto explicando, voce ve quando der?"

(5) "FIQUEI EM DUVIDA ENTRE VOCE E OUTRA PESSOA"
- Resposta A — perguntar o criterio: "O que ta em duvida? Preco, prazo, \
portfolio, ou algo especifico?"
- Resposta B — mostrar 1 diferencial: "Ali o diferencial da gente e X. Se \
isso importa pra voce, faz sentido. Se nao importa, eles sao uma boa escolha \
tambem." (Nunca falar mal do concorrente — queima voce.)
- Resposta C — garantia ou primeira entrega: "Se topar comecar com a gente, \
a primeira [entrega] e sem custo. Se nao gostar, paramos."

(6) "TA FORA DO MEU ORCAMENTO"
- Resposta A — versao menor: "Tenho uma versao mais enxuta por [X]. Quer \
que eu te mostre?"
- Resposta B — parcelamento estendido: "Consigo parcelar em 6 ou 10x no \
cartao. Isso cabe?"
- Resposta C — descobrir orcamento real: "Me ajuda — quanto seria viavel pra \
voce por mes?". As vezes o gap e menor do que parece; as vezes e grande e \
voce economiza tempo encerrando.

Regra geral: SEMPRE responder a objecao com uma pergunta. Pergunta mantem o \
cliente no jogo; afirmacao fecha a porta.

Use quando: empreendedor perde venda na hora da objecao, aceita "vou pensar" \
como resposta final, trava em cliente que pede desconto, ou fica ofendido \
quando o cliente compara com concorrente.

---

7. COPYWRITING E GATILHOS MENTAIS

4 frameworks de estrutura de texto persuasivo:

AIDA — Atencao → Interesse → Desejo → Acao.
Ex. caption Insta: "(A) Voce perde 3 clientes por dia sem saber. (I) Um estudo \
do Sebrae mostra que 70% dos MEIs nao fazem follow-up. (D) Com a planilha de \
controle voce ve cada oportunidade que ta escapando. (A) Clique no link da \
bio pra baixar gratis."

PAS — Problema → Agitacao → Solucao. Ampliar a dor antes de oferecer.
Ex. bio: "Voce monta orcamento, o cliente some (P). Isso vira R$ mil por mes \
de trabalho jogado fora (A). Eu te ensino a precificar pra fechar mais (S)."

4U — headline tem que ser Util, Unico, Urgente, Ultra-especifico. Falha em \
qualquer dos 4 = headline fraco.
Ex. headline Mercado Livre FRACA: "Bolsa feminina de couro". Ex. FORTE: \
"Bolsa feminina de couro legitimo, tira ajustavel, capacidade 8L — garantia \
de 1 ano, envio no mesmo dia."

BAB — Before / After / Bridge. Estado atual ruim → estado futuro bom → \
seu produto e a ponte.
Ex. caption: "Antes: voce passa 2h fazendo planilha na mao (B). Depois: em 5 \
minutos voce tem relatorio automatico (A). Minha planilha de controle faz \
isso por voce (B)."

9 GATILHOS MENTAIS (Bora Vender p.129-130):
(1) RECIPROCIDADE — entregar valor antes de pedir. Ebook gratis, 1 aula \
liberada, avaliacao sem custo. Quem recebe sente tendencia a retribuir.
(2) ESCASSEZ — "ultimas 3 vagas", "sobram 2 unidades". Real, nunca mentira. \
Cliente percebe escassez fake em segundos.
(3) AUTORIDADE — depoimento de autoridade do nicho, tempo de mercado, \
credencial, numero de clientes atendidos.
(4) COMPROMETIMENTO E CONSISTENCIA — pequenos "sim" que levam ao grande \
"sim". "Posso te mostrar 1 minutinho?" (sim pequeno) → 15 minutos depois \
"vamos fechar?" (sim grande).
(5) MEDO — dor da inacao. "Se voce seguir assim, daqui 6 meses como vai \
estar?". Nao usar para manipular — usar para dimensionar o real.
(6) PROVA SOCIAL — "ja atendi 200 clientes", depoimento em video, foto de \
cliente real usando o produto, review publico.
(7) AFINIDADE — identificacao. "Sei como e ser mae solteira e empreender \
ao mesmo tempo — por isso criei esse metodo". Cliente se reconhece.
(8) EMOCAO — historia de transformacao, resultado humano, desafio superado. \
Venda por emocao, justifica por logica.
(9) POLEMICA — posicionamento forte divide. Usar com consciencia: afasta o \
errado e atrai o ideal. Ex.: "Nao atendo cliente que pede desconto na \
primeira mensagem — e questao de respeito mutuo."

Aplicacoes praticas:
- Bio Instagram 3 linhas: use 4U em cada linha;
- Caption Reels: use PAS ou BAB;
- Status WhatsApp: escassez + prova social ("vagas da semana lotando, so 2 \
horarios livres");
- Headline Mercado Livre: 4U literal;
- Oferta de orcamento: reciprocidade (algo gratis primeiro) + comprometimento \
(pequenos sins).

Use quando: empreendedor escreve post que "nao converte", anuncio que ninguem \
clica, bio generica, ou nao sabe como se diferenciar sem baixar preco.

---

8. FOLLOW-UP E FECHAMENTO

Estatisticas-ancora (Bora Vender p.127):
- 48% dos vendedores NAO fazem nenhum follow-up;
- So 10% fazem mais de 3 contatos;
- 80% das vendas acontecem entre o 5o e o 12o contato;
- A cada 5 minutos sem resposta ao primeiro contato, a chance de fechar cai \
10x.

Traducao para o MEI: quem segue, vende. Quem desiste no 1o "vou pensar", nao \
vende. Follow-up nao e "insistir", e profissionalismo.

Regua de follow-up em 7 tempos (para venda com ciclo de dias a semanas):
(1) NO MOMENTO — responder o primeiro contato em ate 5 minutos. Depois disso, \
a chance cai 10x.
(2) +24h — "Oi [nome], passei aqui pra ver se conseguiu dar uma olhada no \
orcamento que te mandei ontem. Posso tirar alguma duvida?"
(3) +72h — adicionar valor: mandar review de cliente parecido, mandar foto \
de trabalho recente, mandar video de 30s. NAO repetir a oferta.
(4) +7 dias — oferecer condicao ou ajuste: "Olha, to montando minha agenda \
da semana que vem. Se voce topar fechar ate sexta, consigo [bonus ou \
desconto pequeno]."
(5) +15 dias — conteudo relevante SEM oferta: "Vi esse artigo / video / dica \
e lembrei de voce." Manter relacao viva sem parecer vendedor.
(6) +30 dias — pergunta aberta: "E ai, como andam as coisas? O projeto \
seguiu por outro caminho ou ainda faz sentido conversar?"
(7) +60 dias — encerramento com classe: "Oi [nome], vou parar de te chamar \
pra nao incomodar. Fica o convite aberto — qualquer dia que precisar, \
chama." Alguns fecham neste ultimo.

Tecnicas de fechamento:
- FECHAMENTO POR ALTERNATIVA: "Prefere comecar semana que vem ou na outra?" \
(as duas respostas sao "sim").
- FECHAMENTO POR RESUMO DE VALOR: recapitular tudo que vai receber e perguntar \
"faz sentido seguir?".
- FECHAMENTO POR URGENCIA LEGITIMA: "Tenho espaco na agenda ate sexta. \
Depois disso a proxima janela e daqui 3 semanas."
- FECHAMENTO POR GARANTIA: "Voce topa comecar? Se no final da primeira \
[entrega] nao tiver gostado, estorno 100%."

Silencio depois da pergunta de fechamento — NAO falar. Quem fala primeiro \
depois do fechamento quebra a ancora.

Use quando: empreendedor manda orcamento e some, acha que "insistir incomoda", \
nao tem rotina de follow-up, ou perde o timing de resposta (demora horas pra \
responder).

---

9. POS-VENDA, RECOMPRA E INDICACAO

Fundamento (Bora Vender p.120): "cliente so e cliente quando tem sucesso \
usando seu produto". Para loja, e quando a entrega chega e serve. Para \
servico, e quando o resultado aparece. So entao comeca o pos-venda de verdade.

3 momentos ideais para pedir avaliacao:
(1) NO PICO DE ENTUSIASMO — logo apos entrega/fim do servico. Cliente esta com \
emocao alta. Pedir review no Google, no Instagram, em video de 30s.
(2) +7 DIAS — quando o resultado ja apareceu. Perguntar "e ai, como foi?". \
Cliente satisfeito responde — oportunidade de pedir indicacao.
(3) +30 DIAS — quando a lembranca consolidou. Pedir depoimento escrito mais \
detalhado. Serve pra colocar no site ou destaque do Insta.

Carnegie aplicado ao pos-venda MEI (Como Fazer Amigos e Influenciar Pessoas):
- NUNCA criticar, condenar ou queixar-se — nem do cliente anterior, nem de \
concorrente, nem do fornecedor;
- APRECIACAO HONESTA E SINCERA — elogio especifico, nao generico. "Voce \
escolheu um tom mais ousado que fica lindo em voce" > "voce ficou linda";
- DESPERTAR DESEJO NO OUTRO — enquadrar recompra no interesse do CLIENTE, \
nao no seu. "Ja to avisando que em julho vem nova colecao — quis te falar \
porque voce sempre escolhe peca unica e as melhores vao rapido."
- LEMBRAR O NOME do cliente, do filho, do pet, data importante mencionada \
antes. Pequenos detalhes sao gigantes para cliente MEI.

Programa de indicacao simples para MEI solo:
- R$[X] de desconto para QUEM INDICOU + R$[X] para QUEM VEIO indicado — \
reciprocidade dupla;
- Ou: servico/produto extra gratis na proxima compra;
- Timing do pedido: 24-72h depois do cliente elogiar espontaneamente. Nunca \
no momento do elogio (parece oportunista), nunca 30 dias depois (elogio \
esfriou);
- Script: "Ah, que bom que voce gostou! Sabe que indicacao de cliente feliz \
e como eu cresco aqui? Se voce conhecer alguem que tambem ta precisando de \
[servico], posso te pedir pra passar meu contato? Pra quem voce indicar, \
faco um desconto especial — e voce ganha tambem na proxima."
- Cartao de agradecimento escrito a mao, quando possivel — custo zero, \
impacto gigante.

Upsell e cross-sell no varejo/servico local:
- UPSELL (versao maior): no momento do pedido — "por +R$ [X] voce leva o \
combo completo com [Y, Z]".
- CROSS-SELL (produto complementar): na entrega — "quem compra [X] costuma \
levar [Y] tambem, quer ver?".
- Ticket medio como metrica-chave: subir 10% no ticket medio e menos trabalho \
que prospectar 10% mais clientes. Matematica simples que MEI ignora.

Script de reativacao (cliente sem comprar ha 60+ dias):
"Oi [nome], tudo bem? Faz um tempinho que a gente nao fala. Passei so pra \
avisar que [novidade ou condicao atual]. Se fizer sentido pra voce, to por \
aqui — se nao for o momento, sem problema, qualquer hora pode me chamar."

Cliente reclamou:
- Responder em MENOS de 24h — rapidez e 50% da solucao;
- Assumir o erro se houver erro — nao colocar desculpa antes do reconhecimento;
- Oferecer solucao CONCRETA e com prazo — "vou te mandar outro amanha ate \
as 14h";
- Voltar no cliente +7 dias depois pra confirmar que foi resolvido;
- Reclamacao bem tratada gera mais fidelidade que cliente que nunca teve \
problema. Transformar erro em vinculo.

Use quando: empreendedor vende uma vez e perde o cliente, nao pede \
indicacao, nao sabe reativar cliente antigo, ou trata reclamacao na \
defensiva.

---

10. MENTALIDADE E DISCIPLINA DO VENDEDOR

Metas diarias do vendedor MEI solo (Alfredo Soares, Bora Vender p.90):
- Pelo menos 5 contatos novos/dia (DM Insta, WhatsApp, presencial, e-mail);
- 3 follow-ups/dia de leads antigos da regua (secao 8);
- 1 pedido de indicacao/dia apos cliente satisfeito;
- E o suficiente. Pequeno constante vence surto grande inconstante.

Principios de execucao:
- "FEITO E MELHOR QUE PERFEITO" (Tallis Gomes, via Alfredo p.72) — poste com \
foto de celular, lance sem site bonito, grave o Reel sem roteiro — o primeiro \
cliente nao espera voce ficar pronto;
- "FACA RAPIDO, ERRE RAPIDO, APRENDA RAPIDO, REFACA RAPIDO" (mantra XTECH \
p.69) — velocidade de iteracao vence perfeccionismo;
- "PENSAMENTO NAO GERA FLUXO DE CAIXA" (Alfredo p.36) — planilhar o dia \
inteiro nao vende nada. Ligar sim;
- GIVE FIRST — entregar valor antes de pedir. Conteudo gratis, dica gratis, \
avaliacao gratis. Reciprocidade e o gatilho mais subestimado.

Moderar o hustle (equilibrio com Joel Jota):
- Saude, familia, trabalho — NAO inverter a ordem;
- Vender mais nao significa trabalhar 16h por dia. 1h/dia de vendas ativa \
focada supera 8h de procrastinacao misturada com notificacao;
- Disciplina supera motivacao — constancia pequena e diaria vence surto \
grande quinzenal;
- Sono, comida, exercicio nao sao luxo do empreendedor bem-sucedido — sao \
ferramentas de producao.

Rotina minima de vendedor MEI solo (1h/dia dedicada a vendas ativas):
- 20 minutos: PROSPECCAO — 5 contatos novos (DM, WhatsApp, cold);
- 20 minutos: FOLLOW-UP — 3 leads antigos da regua;
- 20 minutos: RELACIONAMENTO — responder DM, comentar no Insta dos clientes, \
pedir indicacao de cliente satisfeito.

Estudo continuo (CHA, 30min/dia):
- Ler/ouvir 1 cliente ideal por semana (audio, review, entrevista);
- Acompanhar 1 concorrente por semana (o que postou, o que ofereceu, o que \
mudou);
- Testar 1 novo formato por mes (Reels no lugar de foto, carrossel no lugar \
de Reels, live no lugar de story).

Frases-ancora para encerrar o ciclo:
- "Nao venda pela internet, use a internet para vender" (Alfredo, p.177) — \
a internet e ferramenta, nao o palco;
- "Seja o melhor para o seu cliente, nao queira ser o melhor do mundo" \
(Alfredo, p.107) — foco onde voce atua, nao comparacao generica;
- "Muito risco, pouco ego" (Alfredo, p.134) — ego paralisa; humildade executa;
- "A vida e a reacao das suas acoes" (Alfredo, p.48) — voce colhe o que \
plantou diariamente.

Use quando: empreendedor procrastina prospeccao, nao tem rotina, "quando \
da eu posto", acha que precisa de curso antes de comecar, ou compara seu \
dia 1 com o dia 1000 do outro.`
`
```

- [ ] **Step 1.2: Rodar typecheck pra confirmar que o arquivo compila**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: sai com exit 0, nenhum erro.

Se falhar com erro de string/template literal, provavelmente um backtick ou `\` quebrou. Revisar o arquivo.

- [ ] **Step 1.3: Verificar quantidade de linhas (~480)**

Run: `wc -l /Users/kapi/mentor_empreendedor/web/src/lib/prompts/vendas.ts`
Expected: aproximadamente 400-550 linhas (o conteúdo exato do Step 1.1 dá em torno de 440-490 linhas — dentro da faixa).

- [ ] **Step 1.4: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/prompts/vendas.ts
git commit -m "$(cat <<'EOF'
feat(prompts): adiciona bloco vendas.ts com 10 secoes

Bloco dedicado a vendas para microempreendedores brasileiros:
1. Principios fundamentais (CHA, 4 mitos)
2. Conhecer quem compra (8 perguntas cliente ideal, jornada 4 estagios)
3. Scripts de abordagem (declaracao de forca, DM Insta, WhatsApp, cold mail)
4. 11 estrategias Instagram + 13 estrategias WhatsApp (resgata divida do
   Impulso Stone modulo 2)
5. SPIN Selling e descoberta de dor
6. Tratamento de 6 objecoes classicas do MEI BR
7. Copywriting e 9 gatilhos mentais (AIDA, PAS, 4U, BAB)
8. Follow-up (regua de 7 tempos) e tecnicas de fechamento
9. Pos-venda, indicacao e reativacao (Carnegie aplicado)
10. Mentalidade e disciplina de vendedor solo

Fonte principal: Bora Vender (Alfredo Soares, Editora Gente 2019).
Referencias cruzadas: Erico Rocha, Conrado Adolpho, Pedro Sobral, Carnegie,
Joel Jota (todos ja no prompt).

Ainda nao vinculado ao system prompt — integracao no index.ts vira na tarefa 5.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Adicionar Alfredo Soares como 13º guru em `conhecimento.ts`

**Files:**
- Modify: `web/src/lib/prompts/conhecimento.ts:356-442` (cabeçalho MARKETING + após Pedro Sobral)

A edição tem 2 partes: (a) ajustar a linha que lista os gurus de MARKETING para incluir Alfredo, (b) inserir o perfil completo de Alfredo logo após o perfil de Pedro Sobral, antes da seção MENTALIDADE.

- [ ] **Step 2.1: Atualizar o cabeçalho do bloco MARKETING**

Edit em `web/src/lib/prompts/conhecimento.ts`:

```
OLD:
Quando for MARKETING, aplique Erico Rocha (funis e lancamentos), Conrado \
Adolpho (8Ps, estrategia digital) e Pedro Sobral (trafego pago acessivel). \

NEW:
Quando for MARKETING, aplique Erico Rocha (funis e lancamentos), Conrado \
Adolpho (8Ps, estrategia digital), Pedro Sobral (trafego pago acessivel) e \
Alfredo Soares (vendas consultivas, ecommerce, mentalidade de execucao). \
```

- [ ] **Step 2.2: Inserir o perfil completo de Alfredo Soares após o perfil de Pedro Sobral**

Localização: logo após a linha que termina "...precisa de estrategia pratica de anuncios." (`conhecimento.ts:442`), e antes da linha em branco + "Quando for MENTALIDADE..." (`conhecimento.ts:444`).

Edit — encontrar o bloco:

```
OLD:
ou precisa de estrategia pratica de anuncios.

Quando for MENTALIDADE, use Joel Jota (alta performance, rotina, disciplina). \

NEW:
ou precisa de estrategia pratica de anuncios. \
\
PERFIL ALFREDO SOARES (@tioricco): Co-fundador da XTECH COMMERCE, plataforma \
de ecommerce que movimentou R$ 547 milhoes em 3 anos e foi vendida para a \
VTEX em dezembro de 2017, quando ele tinha 30 anos. Apos a venda, tornou-se \
Head Global SMB da VTEX. Tambem e fundador da Socialrocket (automacao de \
Instagram) e diretor da Loja Integrada. Autor de "Bora Vender: a melhor \
estrategia e atitude" (Editora Gente, 2019). Comecou aos 17 anos vendendo \
cartoes de visita e imas de geladeira em pontos de taxi no Rio. Carioca, \
referencia nacional em vendas consultivas, ecommerce e mentalidade de \
execucao para o micro e pequeno empreendedor. \
Tese central: EXECUCAO VENCE IDEIA. "O empreendedor nao e inventor, e um \
executor." Pensamento nao gera fluxo de caixa — venda gera. \
Definicao de venda (via Raul Candeloro): "vender e ajudar o cliente com o \
produto ou servico que voce vende, com lucro para a empresa". Venda e servico, \
nao enganacao. \
CHA — tripe do vendedor profissional: (C)onhecimento (produto, mercado, \
cliente), (H)abilidades (escutar, perguntar, identificar dor), (A)titudes \
(persistencia, disciplina, integridade). \
4 fundamentos do funil: Atracao (topo, conteudo educativo), Nutricao \
(relacionamento, conteudo de dor), Conversao (oferta, fechamento), Retencao \
(pos-venda, recompra, indicacao). \
Jornada do consumidor em 4 estagios: (I) Aprendizado/Descoberta — cliente nao \
sabe que tem o problema; (II) Reconhecimento do Problema — cliente identifica \
a dor; (III) Consideracao da Solucao — cliente compara alternativas; (IV) \
Decisao de Compra — cliente pronto para pagar. Conteudo e oferta diferentes \
em cada estagio. \
SPIN Selling aplicado: (S)ituacao, (P)roblema, (I)mplicacao, (N)ecessidade — \
perguntas que descobrem dor antes de oferecer solucao. \
9 gatilhos mentais para construir ofertas: reciprocidade, escassez, autoridade, \
comprometimento/consistencia, medo, prova social, afinidade, emocao, polemica. \
LTV ≥ 3x CAC; CAC paga em ate 12 meses — se nao bate, o modelo nao fecha. \
Estatisticas-ancora de venda: (a) 50-70% das vendas sao perdidas por NAO \
DECISAO do cliente, nao por "nao"; (b) 48% dos vendedores nao fazem nenhum \
follow-up; (c) 80% das vendas acontecem entre o 5o e o 12o contato; (d) apos \
5 minutos sem resposta ao primeiro contato, a chance de fechar cai 10x. \
Filosofia sobre ego e risco: "muito risco, pouco ego" — ego paralisa, faz \
voce achar que merece conforto, impede o give first. Bons negocios sao sempre \
ganha-ganha. \
Cliente como midia: o cliente ideal convive com pessoas do mesmo perfil, entao \
encantar cliente certo gera indicacao organica (micromidia). Demitir cliente \
errado e decisao saudavel — quem paga pouco e reclama muito drena o negocio. \
Estrategia War (crescimento regional): dominar regiao ou nicho menos saturado \
primeiro. XTECH foi Nordeste e Centro-Oeste antes de SP e Sul. Aplicavel a \
MEI que quer ser "o melhor do bairro" antes de ser "o melhor da cidade". \
Frases-chave: "Pensamento nao gera fluxo de caixa." / "Faca rapido, erre \
rapido, aprenda rapido, refaca rapido." / "Feito e melhor que perfeito." / \
"No digital nao existe 'eu acho', existe metrica." / "Nao venda pela \
internet, use a internet para vender." / "Seja o melhor para o seu cliente, \
nao queira ser o melhor do mundo." / "Voce so fica rico criando valor e \
fazendo seu cliente e parceiros ganharem dinheiro." / "Muito risco, pouco \
ego." \
Use quando o empreendedor: precisa estruturar vendas do zero, ja tem produto \
mas nao sabe captar cliente, quer montar ou profissionalizar ecommerce, trava \
por medo de vender ou achar que "nao nasceu pra isso", precisa de disciplina \
e rotina de vendedor solo, quer entender por que esta perdendo venda na \
objecao, ou precisa de mentalidade de execucao ("faca rapido, erre rapido"). \

Quando for MENTALIDADE, use Joel Jota (alta performance, rotina, disciplina). \
```

- [ ] **Step 2.3: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0, nenhum erro.

- [ ] **Step 2.4: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/prompts/conhecimento.ts
git commit -m "$(cat <<'EOF'
feat(prompts): adiciona Alfredo Soares como 13o guru em conhecimento.ts

Alfredo Soares (@tioricco) — co-fundador XTECH COMMERCE (vendida a VTEX em
dez/2017), Head Global SMB da VTEX, autor de "Bora Vender" (2019). Perfil
denso no padrao Erico Rocha: tese de execucao, CHA, funil 4 fundamentos,
jornada 4 estagios, SPIN, 9 gatilhos, LTV/CAC, estatisticas-ancora de
follow-up, estrategia War, 8 frases-chave.

Adicionado ao cabecalho do bloco MARKETING ao lado de Erico/Conrado/Pedro.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Enxugar módulo 2 do `impulso-stone.ts`

**Files:**
- Modify: `web/src/lib/prompts/impulso-stone.ts:11-15`

Promessa não cumprida ("11 estratégias Instagram", "13 estratégias WhatsApp" listadas sem entrega) agora se resolve em `vendas.ts`. Aqui o módulo 2 fica conceitual, com cross-reference sutil.

- [ ] **Step 3.1: Editar as 5 linhas do módulo 2**

Edit em `web/src/lib/prompts/impulso-stone.ts`:

```
OLD:
2. VENDAS E CRESCIMENTO: Escolher redes sociais certas (pesquisar onde o publico \
esta), criar perfil profissional completo, mesclar posts comerciais com dicas \
relevantes, diversificar formatos (imagem, carrossel, video, Reels, Stories, \
lives). Vendas pelo WhatsApp: usar Link de Pagamento para cartao a vista ou \
parcelado em ate 18x. Vendas pelo Instagram: 11 estrategias especificas.

NEW:
2. VENDAS E CRESCIMENTO: Modulo que orienta presenca em redes sociais (perfil \
profissional, mix de conteudo), vendas pelo WhatsApp com Link de Pagamento e \
vendas pelo Instagram. Taticas detalhadas (scripts, 11 estrategias Instagram, \
13 estrategias WhatsApp, tratamento de objecoes, follow-up e pos-venda) estao \
consolidadas na secao de vendas deste agente.
```

- [ ] **Step 3.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/prompts/impulso-stone.ts
git commit -m "$(cat <<'EOF'
chore(prompts): enxuga modulo 2 do Impulso Stone

Modulo 2 prometia "11 estrategias Instagram" sem listar. Agora que vendas.ts
entrega as 11 + 13 de WhatsApp, o modulo do Impulso Stone fica conceitual
e faz cross-reference sutil ao bloco novo. Remove divida de promessa nao
entregue.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Expandir entrada Bora Vender em `livros.ts`

**Files:**
- Modify: `web/src/lib/prompts/livros.ts:967-969`

Entrada atual (3 linhas) substituída por ~45 linhas focadas em **frameworks do livro** (não biografia do Alfredo — essa ficou em `conhecimento.ts`).

- [ ] **Step 4.1: Substituir a entrada**

Edit em `web/src/lib/prompts/livros.ts`:

```
OLD:
- Bora Vender (Alfredo Soares): Use redes como canais de venda ativa. Construa \
autoridade com conteudo, responda rapido, crie funil simples (conteudo → direct → oferta), \
peca indicacoes ativamente.

NEW:
- Bora Vender (Alfredo Soares, Editora Gente 2019, 194pp — co-fundador XTECH \
COMMERCE / VTEX): Conceitos centrais no perfil Alfredo Soares. Frameworks do \
livro aplicaveis ao MEI: \
\
CHA — tripe do vendedor: (C)onhecimento (produto, mercado, concorrencia, \
cliente), (H)abilidades (escuta, empatia, perguntas), (A)titudes (persistencia, \
disciplina, integridade). Vendedor ruim falha em A antes de C ou H. \
\
4 MITOS DE VENDAS (p.59) a desconstruir: (1) vendedor precisa ter labia — falso, \
escutar vende mais; (2) vendedor nasce pronto — falso, se aprende; (3) cliente \
tem sempre razao — falso, cliente toxico drena; (4) vender e para poucos — \
falso, todos vendemos o tempo todo. \
\
5 DICAS DE THIAGO CONCER (via Bora Vender, p.62) para perder medo de vender: \
(1) goste do que vende (sem isso nao sustenta); (2) traduza cada caracteristica \
em beneficio claro; (3) abra com declaracao de forca ("sou X, ajudo Y a \
alcancar Z"); (4) valorize historia da empresa; (5) aproxime-se do cliente via \
redes sociais antes de abordar (curtir, comentar, plantar contexto). \
\
JORNADA DO CONSUMIDOR EM 4 ESTAGIOS (p.119): (I) Aprendizado/Descoberta — nao \
sabe que tem problema; (II) Reconhecimento do Problema — sente a dor; (III) \
Consideracao da Solucao — compara alternativas; (IV) Decisao de Compra — \
pronto pra pagar. Conteudo e oferta mudam em cada estagio. Tentar fechar em I \
e atropelar; esperar demais em IV e perder para o concorrente. \
\
SPIN SELLING APLICADO (Neil Rackham, p.125): (S)ituacao — diagnostico; \
(P)roblema — investigar dor; (I)mplicacao — dimensionar custo da dor; \
(N)ecessidade de solucao — cliente pede a solucao. Roteiro que descobre dor \
antes da oferta. \
\
9 GATILHOS MENTAIS PARA CONSTRUIR OFERTAS (p.129-130): reciprocidade, escassez, \
autoridade, comprometimento/consistencia, medo (da inacao), prova social, \
afinidade, emocao, polemica. Todos eticos quando lastreados em verdade. \
\
ESTATISTICAS-ANCORA DE FOLLOW-UP (p.127): 48% dos vendedores nao fazem nenhum \
follow-up; 10% fazem mais de 3 contatos; 80% das vendas acontecem entre o 5o e \
o 12o contato. Quem persiste com metodo vende. Quem desiste no primeiro "vou \
pensar" nao. \
\
17 ETAPAS PRATICAS PARA MONTAR LOJA VIRTUAL (cap. bonus, com Bruno de Oliveira, \
p.166-174): (1) Proposito; (2) Valores; (3) Planejamento (o que vendo, pra \
quem, fornecedor); (4) Nome; (5) Dominio (.com.br + .com); (6) E-mail \
profissional; (7) Telefone fixo/celular exclusivos; (8) Identidade visual \
(logo, favicon); (9) Redes sociais; (10) Montar time (ou decidir solo); (11) \
Legalizacao (MEI, contador, Simples); (12) MVP do produto; (13) Montar loja \
virtual; (14) Usar gigantes a favor (marketplaces); (15) Fugir dos 3 erros \
fatais (tratar como "lojinha", focar no produto e nao na audiencia, nao \
divulgar); (16) Profissionalizar; (17) Planos de contingencia. \
\
Frases-ancora: "Pensamento nao gera fluxo de caixa." (p.36) / "Faca rapido, \
erre rapido, aprenda rapido, refaca rapido." (p.69, mantra XTECH) / "No \
mundo digital nao existe 'eu acho', existe metrica." (p.111) / "Nao venda \
pela internet, use a internet para vender." (p.177) / "Muito risco, pouco \
ego." (p.134). \
\
Use quando: MEI precisa de manual pratico de vendas consultivas, quer montar \
ou estruturar ecommerce, ou precisa de frameworks tangiveis (CHA, SPIN, funil, \
9 gatilhos, jornada) para profissionalizar o comercial do negocio.
```

- [ ] **Step 4.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 4.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/prompts/livros.ts
git commit -m "$(cat <<'EOF'
feat(prompts): expande entrada Bora Vender em livros.ts

De 3 linhas para ~45 linhas. Foco em FRAMEWORKS do livro aplicaveis ao MEI:
CHA, 4 mitos, 5 dicas Thiago Concer, jornada 4 estagios, SPIN, 9 gatilhos,
estatisticas de follow-up, 17 etapas para ecommerce (capitulo bonus).

Sem duplicar a biografia do Alfredo que vive no perfil do guru em
conhecimento.ts. Padrao de entrada densa (como Obsessao pelo Cliente).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Fiar `BASE_VENDAS` no `index.ts`

**Files:**
- Modify: `web/src/lib/prompts/index.ts`

Até aqui, `vendas.ts` existe mas não está plugado. Esta tarefa liga o fio.

- [ ] **Step 5.1: Adicionar import**

Edit em `web/src/lib/prompts/index.ts`:

```
OLD:
import { BASE_ECOMMERCE } from './ecommerce'
import { BASE_FERRAMENTAS } from './ferramentas'

NEW:
import { BASE_ECOMMERCE } from './ecommerce'
import { BASE_VENDAS } from './vendas'
import { BASE_FERRAMENTAS } from './ferramentas'
```

- [ ] **Step 5.2: Adicionar ao array de blocos**

Edit em `web/src/lib/prompts/index.ts`:

```
OLD:
    BASE_ECOMMERCE,
    BASE_FERRAMENTAS,
  ]

NEW:
    BASE_ECOMMERCE,
    BASE_VENDAS,
    BASE_FERRAMENTAS,
  ]
```

- [ ] **Step 5.3: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0. O import precisa bater com o export `BASE_VENDAS` criado na Task 1.

- [ ] **Step 5.4: Build completo**

Run: `cd /Users/kapi/mentor_empreendedor/web && npm run build`
Expected: build completa sem erros. Saída típica: "✓ Compiled successfully" / "Generating static pages".

Se falhar — ler o erro, diagnosticar. Os erros mais prováveis são: (a) template literal com backtick não-escapado em vendas.ts; (b) variável dentro do template string sem `$` (o arquivo é puramente estático, então `${` nunca deveria aparecer — se apareceu por engano, vira erro de referência).

- [ ] **Step 5.5: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/prompts/index.ts
git commit -m "$(cat <<'EOF'
feat(prompts): integra BASE_VENDAS no system prompt

vendas.ts agora faz parte do buildSystemPrompt() — posicionado entre
BASE_ECOMMERCE e BASE_FERRAMENTAS na sequencia tematica (institucional →
Impulso Stone → formalizacao → ecommerce → vendas → ferramentas).

Prompt total sobe de ~59k para ~70k tokens (~35% do contexto 200k).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Smoke test em dev local

Validação manual antes do deploy. O build já passou — agora confirmar que o chat renderiza e o mentor puxa conteúdo novo.

**Files:** (nenhum, só execução)

- [ ] **Step 6.1: Subir dev server em background**

Run: `cd /Users/kapi/mentor_empreendedor/web && npm run dev`
Expected: "Ready in [X]s" + URL tipo `http://localhost:3000` (ou próxima porta livre se 3000 estiver ocupada).

Deixar rodando em background. Usar Bash com `run_in_background: true`.

- [ ] **Step 6.2: Abrir o chat e testar 3 prompts**

Abrir `http://localhost:3000` no browser (ou a porta que o dev server escolheu). Logar com usuário existente ou criar um (se fluxo de onboarding engatar, pular o formulário para testar mais rápido).

Testar 3 prompts distintos e validar que a resposta traz conteúdo do novo bloco:

**Teste A — "como vender mais"**
Esperado: resposta menciona pelo menos um framework do novo bloco (CHA, jornada de 4 estágios, SPIN ou declaração de força). Não deve ser só bullets genéricos.

**Teste B — "meu cliente fala que tá caro, o que faço?"**
Esperado: resposta traz pelo menos 2 das 3 respostas prontas da seção 6 ("caro comparado a quê?", resumo de valor, parcelamento).

**Teste C — "quais são as 11 estratégias de Instagram?"**
Esperado: resposta lista as 11 estratégias (ou pelo menos 7-8, com números) — a dívida do Impulso Stone está entregue.

Se algum teste falha em trazer conteúdo novo, não é bug de código — é peso editorial: o prompt ficou longo e Claude precisa de sinal mais explícito. Nesse caso, abrir issue/nota pra iterar (não bloqueia deploy).

- [ ] **Step 6.3: Parar o dev server**

Usar KillShell ou Ctrl+C no terminal do background. Ou deixar rodando se for seguir pro deploy imediato.

---

## Task 7: Deploy em produção

**Files:** (nenhum)

⚠️ **Armadilha conhecida (memória da sessão):** sempre `cd web && vercel --prod --yes` numa linha só — deploys da raiz criam projeto duplicado acidental. Ver `feedback_vercel_deploy_dir.md` na memória do usuário.

- [ ] **Step 7.1: Deploy**

Run: `cd /Users/kapi/mentor_empreendedor/web && vercel --prod --yes`
Expected: sai URL de produção (ex: `https://maximpulso.com.br` ou `https://[project].vercel.app`). Build no Vercel replica o `npm run build` local.

- [ ] **Step 7.2: Fumaça pós-deploy**

Abrir `https://maximpulso.com.br` no browser, fazer login e rodar o Teste A do Step 6.2 contra prod. Confirmar que responde normalmente (latência <3s, resposta chega por streaming).

- [ ] **Step 7.3: Monitorar `/admin/citations`**

Acessar `https://maximpulso.com.br/admin/citations` com conta admin. Não precisa ter dado pra ver logo (precisa de conversas novas). Objetivo: ao longo das próximas horas/dias, confirmar que "Alfredo Soares" e "Bora Vender" aparecem como fontes citadas.

Se o dashboard não estiver reconhecendo o Alfredo, pode ser necessário atualizar o catálogo em `lib/observability/citations-catalog.ts` — mas isso é follow-up, não bloqueia esta entrega.

---

## Self-review (feito durante a escrita)

**Cobertura do spec:** todos os 5 arquivos listados no spec têm tarefa dedicada. As 10 seções do `vendas.ts` (princípios, cliente, scripts, 11+13 estratégias, SPIN, objeções, copy, follow-up, pós-venda, mentalidade) estão na Task 1. O perfil de Alfredo com todos os elementos (bio, tese, CHA, funil, jornada, SPIN, gatilhos, LTV/CAC, estatísticas, frases) está na Task 2. Enxugamento do módulo 2 e expansão do Bora Vender em `livros.ts` são Tasks 3 e 4. Integração no `index.ts` é Task 5. Build + smoke + deploy são Tasks 6-7.

**Placeholders:** nenhum "TBD", "TODO", "fill in details". Todas as seções têm código/texto literal.

**Consistência:** `BASE_VENDAS` é o export name usado consistentemente na Task 1 (definido), Task 5 (importado). `@tioricco` é o handle do Alfredo em ambas as ocorrências (conhecimento.ts + livros.ts). Numeração de páginas do Bora Vender (p.36, 57, 62, 69, 72, 90, 107, 111, 119, 120, 125, 127, 129-130, 134, 177) consistente entre os arquivos.

**Escopo:** um plano, cinco arquivos, ~605 linhas de conteúdo editorial. Build check e smoke test como testes funcionais (não TDD tradicional — o que se testa aqui é a integração com o sistema de prompt, não unidade lógica).

**Ambiguidade:** "aproximadamente 400-550 linhas" na Step 1.3 — propositalmente faixa, já que o conteúdo do Step 1.1 pode dar qualquer valor entre 440-490 dependendo de como o editor contar linhas continuadas com `\`. Resto é concreto.
