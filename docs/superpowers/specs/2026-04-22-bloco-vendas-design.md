# Design — Bloco dedicado a Vendas no system prompt

**Data:** 2026-04-22
**Autor:** fkapitanovas (via Claude)
**Status:** Aprovado para implementação

## Contexto

Teste com empreendedor real sinalizou que a sessão "vender mais" está rasa. Mapeamento mostrou que o conteúdo sobre vendas vive espalhado entre os blocos `impulso-stone.ts` (módulo 2 — 5 linhas, com listas prometidas e não entregues), `conhecimento.ts` (perfis de Érico Rocha, Conrado Adolpho, Pedro Sobral), `ecommerce.ts` (canais online) e `livros.ts` (3 linhas sobre Bora Vender de Alfredo Soares, 10 linhas sobre Carnegie). Nenhum bloco trata sistematicamente: scripts de abordagem, objeções, negociação, copywriting, follow-up, pós-venda, indicação e disciplina de vendedor solo.

Dado que o usuário classificou "vender mais" como o assunto mais importante para o empreendedor, o bloco novo deve ser um dos mais densos do prompt, no nível dos perfis de guru em `conhecimento.ts`.

## Objetivo

Transformar "vender mais" num bloco denso e autossuficiente do system prompt, usando:

- **Alfredo Soares** (Bora Vender, Editora Gente 2019) como nova voz-âncora — co-fundador XTECH COMMERCE (vendida à VTEX em dez/2017), Head Global SMB da VTEX, fundador da Socialrocket
- **Érico Rocha, Conrado Adolpho, Pedro Sobral** (já no prompt) como vozes re-mobilizadas sem duplicação
- **Carnegie** (já no prompt) como base de relacionamento/atendimento
- **Impulso Stone** como fonte institucional de táticas pt-BR, com a dívida das "11 estratégias Instagram" e "13 estratégias WhatsApp" finalmente entregue

## Mudanças em 5 arquivos

### 1. Criar `web/src/lib/prompts/vendas.ts` (~480 linhas)

Exporta `export const BASE_VENDAS`. 10 seções, cada uma terminando com linha "Use quando: [gatilho de ativação]" (padrão dos perfis de guru existentes).

**Seção 1 — Princípios fundamentais (~35 linhas)**
- Definição de Raul Candeloro (via Alfredo): "vender é ajudar o cliente com o produto ou serviço que você vende, com lucro para a empresa"
- CHA — Conhecimento (produto, mercado, concorrência, cliente), Habilidades (escuta, empatia, persuasão, negociação), Atitudes (persistência, disciplina, curiosidade, integridade)
- 4 mitos de vendas (p.59 Bora Vender): (1) vendedor tem que ter lábia; (2) vendedor nasce pronto; (3) cliente tem sempre razão; (4) vender é para poucos — cada um refutado em 1-2 linhas
- Postura consultiva vs empurrada — ajudar a decidir ≠ forçar a compra
- "Todos somos vendedores" — vender está em entrevista de emprego, namoro, filho pedindo brinquedo
- **Use quando:** empreendedor trava por medo de vender ou acha que "não nasceu pra isso"

**Seção 2 — Conhecer quem compra (~40 linhas)**
- 8 perguntas pra definir cliente ideal (p.106 Bora Vender): (1) qual segmento?; (2) qual tamanho médio?; (3) qual região?; (4) qual maior desafio?; (5) qual menor CAC?; (6) qual ciclo mais curto?; (7) qual melhor canal de prospecção?; (8) qual maior valor percebido?
- Jornada do consumidor em 4 estágios (p.119 Bora Vender): (I) Aprendizado/Descoberta — ainda não sabe que tem o problema; (II) Reconhecimento do Problema — identifica a dor; (III) Consideração da Solução — compara alternativas; (IV) Decisão de Compra — pronto pra pagar. Conteúdo e oferta diferentes pra cada estágio.
- Regra 80/20: os 20% de clientes mais rentáveis formam a matriz do cliente ideal — prospectar novos que se parecem com eles
- Como identificar o cliente ideal MEI BR sem CRM: olhar histórico WhatsApp, quem pagou em dia, quem recomprou, quem indicou
- **Use quando:** empreendedor "vende pra todo mundo" e tem conversão baixa; não sabe em quem focar marketing

**Seção 3 — Scripts de abordagem (~55 linhas)**
Com scripts textuais prontos (entre aspas pra Claude poder copiar):
- Declaração de força (Thiago Concer, p.62): "Sr./Sra. [nome], sou [profissão] aqui em [cidade/bairro]. Ajudo [perfil do cliente ideal] a [resultado concreto]. Posso te mostrar como isso funciona em 2 minutos?"
- Primeira mensagem WhatsApp (fria): apresenta-se → pede permissão → entrega valor gratuito → só depois oferta
- Primeira mensagem WhatsApp (morno, indicação): "Oi [nome], a [indicador] comentou que você tá procurando [solução]. Posso te explicar rapidinho o que faço?"
- DM fria Instagram: comentar post primeiro → responder story → mandar DM depois de 2-3 interações
- Abordagem de balcão/presencial: abrir com pergunta aberta sobre o cliente ("quem vai usar?"), não sobre o produto
- Cold mail MEI B2B (p.126 Bora Vender): assunto personalizado → 3 parágrafos no máximo → uma pergunta específica no final → remetente identificado; **não é spam**
- Apresentar preço sem medo: ancorar no valor percebido antes do número, parcelar sempre, nunca pedir desculpa pelo preço
- **Use quando:** empreendedor "não sabe o que falar" no primeiro contato; tem lista de leads mas não aborda

**Seção 4 — 11 estratégias Instagram + 13 estratégias WhatsApp (~75 linhas)**
Resgata a dívida do Impulso Stone módulo 2. Cada estratégia em 1 linha de explicação + 1 exemplo concreto de 1 nicho (ciclado entre confeitaria, beleza, loja/moda, serviço local — não todas as 4 em todas as estratégias).

11 estratégias Instagram (linkadas a Conrado Adolpho e Camila Porto):
1. Bio otimizada — 3 linhas que dizem o que faz, pra quem, como contratar (link WhatsApp)
2. Highlights organizados — "preços", "trabalhos", "depoimentos", "antes e depois", "perguntas frequentes"
3. Reels curtos com prova (antes/depois, processo, cliente feliz)
4. Carrossel educativo — 7-10 slides, primeiro slide é gancho
5. Stories diários (mostrar rotina, bastidor, cliente real)
6. Lives com demonstração ou Q&A
7. Link na bio com catálogo (Linktree, Beacons, ou WhatsApp direto)
8. Parceria com microinfluenciador local (permuta > pagamento)
9. Enquete de stories pra escutar público
10. Resposta pública a comentários + direct como CTA
11. Conteúdo sazonal (Dia das Mães, Black Friday, datas do nicho)

13 estratégias WhatsApp (Conrado Adolpho + Alfredo Soares):
1. Conta WhatsApp Business separada da pessoal (celular dedicado se possível)
2. Catálogo de produtos configurado (foto, preço, descrição)
3. Link de Pagamento (Stone/PagSeguro/Mercado Pago) — cartão à vista ou parcelado em até 18x
4. Lista de transmissão — pedir opt-in antes, segmentar por interesse
5. Mensagens automáticas de boas-vindas e ausência
6. Respostas rápidas pra perguntas comuns (preço, prazo, endereço)
7. Etiquetas pra organizar clientes (novo/em atendimento/comprou/indicação)
8. Stories (status) com conteúdo novo 2-3x por semana
9. Primeira mensagem estratégica: apresentar → pedir permissão → NÃO enviar oferta direta
10. Horários comerciais respeitados (não mandar 22h em dia de semana)
11. Áudio curto quando for explicar algo complexo (mais pessoal que texto longo)
12. Follow-up programado com gatilho de tempo (48h após orçamento, 7 dias após compra)
13. Pedido de indicação após cliente satisfeito: "Conhece alguém que tá precisando?"

- **Use quando:** empreendedor usa Insta/WhatsApp sem estratégia, só postando quando lembra

**Seção 5 — SPIN Selling e descoberta de dor (~40 linhas)**
Baseado em Neil Rackham (via Alfredo, p.125 Bora Vender).

- S (Situação) — perguntas de diagnóstico: "Como você vende hoje?" "Quantos clientes por mês?"
- P (Problema) — investigar dor: "Qual a maior dificuldade nesse processo?"
- I (Implicação) — dimensionar consequência: "E quanto isso te custa por mês em cliente perdido?"
- N (Necessidade de solução) — cliente enxerga o valor: "Se tivesse X, o que mudaria?"

Roteiro de 10 perguntas prontas para diferentes nichos:
- Para confeiteira: "Quantos orçamentos você manda por semana? Quantos fecham? Por que os outros não fecham? Quanto você deixa de ganhar?"
- Para prestador de serviço local: "Como os clientes te acham hoje? Quanto demora do orçamento à contratação? Já perdeu cliente por demora?"

Quando usar em B2B vs B2C: B2B pede sequência completa; B2C condensa em 2-3 perguntas antes da oferta.

- **Use quando:** empreendedor apresenta produto antes de entender cliente; perde venda por não criar urgência

**Seção 6 — Tratamento de objeções (~55 linhas)**
50-70% das vendas são perdidas por não-decisão do cliente (p.57 Bora Vender). Cada objeção tem 2-3 respostas prontas.

As 6 objeções clássicas do MEI BR:

1. **"Tá caro"** → (a) "Caro comparado a quê?" (ancoragem); (b) resumir o valor incluso; (c) oferecer parcelamento ou combo menor
2. **"Vou pensar"** → (a) "O que especificamente te deixou em dúvida?"; (b) "Quando posso te chamar pra saber?" (marca follow-up concreto); (c) oferecer condição com prazo curto
3. **"Preciso falar com meu marido/sócio"** → (a) "Faz sentido. Posso mandar um resumo em texto pra facilitar a conversa?"; (b) agendar retorno com ambos
4. **"Tô sem tempo agora"** → (a) "Entendi. Prefere que eu te chame quinta ou sexta?"; (b) oferecer conteúdo assíncrono (vídeo curto, pdf)
5. **"Fiquei em dúvida entre você e outra pessoa"** → (a) perguntar o que está em dúvida; (b) mostrar 1 diferencial concreto (não falar mal do concorrente); (c) oferecer garantia ou primeira entrega sem custo
6. **"Tá fora do meu orçamento"** → (a) oferecer versão menor; (b) parcelar mais; (c) descobrir orçamento real ("quanto seria viável pra você?")

Filosofia: objeção não é rejeição, é pedido de mais informação. Se o cliente falasse "não" seco, a conversa acabava.

- **Use quando:** empreendedor perde venda na hora da objeção, aceita "vou pensar" como resposta final, trava em cliente que pede desconto

**Seção 7 — Copywriting e gatilhos mentais (~55 linhas)**

4 frameworks de estrutura:
- **AIDA** — Atenção, Interesse, Desejo, Ação
- **PAS** — Problema, Agitação (ampliar a dor), Solução
- **4U** — headline tem que ser Útil, Único, Urgente, Ultra-específico
- **BAB** — Before (situação ruim), After (situação boa), Bridge (seu produto)

9 gatilhos mentais (p.129-130 Bora Vender):
1. Reciprocidade — entregar valor antes de pedir
2. Escassez — "últimas 3 vagas"
3. Autoridade — depoimento, especialização, tempo no mercado
4. Comprometimento e consistência — pequenos "sim" que levam ao grande "sim"
5. Medo — dor da inação ("quanto você perde por mês sem isso?")
6. Prova social — "já atendi 200+ clientes"
7. Afinidade — identificação ("sei como é ser mãe solteira e empreender")
8. Emoção — história, transformação, resultado humano
9. Polêmica — usar com cuidado — posicionamento forte afasta errado e atrai ideal

Aplicações práticas:
- Bio Instagram em 3 linhas (4U)
- Caption de Reels (PAS)
- Status WhatsApp (escassez + prova social)
- Headline Mercado Livre (4U literal)
- Oferta de orçamento (reciprocidade + comprometimento)

- **Use quando:** empreendedor escreve texto que "não converte"; não sabe como diferenciar anúncio

**Seção 8 — Follow-up e fechamento (~35 linhas)**

Estatísticas-âncora (p.127 Bora Vender):
- 48% dos vendedores não fazem nenhum follow-up
- Só 10% fazem mais de 3 contatos
- 80% das vendas acontecem entre o 5º e o 12º contato
- A cada 5 minutos sem resposta após primeiro contato, a chance de fechar cai 10×

Régua de follow-up em 7 tempos (para venda com ciclo de dias):
1. No momento (resposta ao primeiro contato)
2. +24h — "passei aqui pra ver se conseguiu ver meu orçamento"
3. +72h — resposta com valor adicional (case, review, vídeo curto)
4. +7 dias — nova oferta ou condição
5. +15 dias — conteúdo relevante (sem oferta — apenas manter relação)
6. +30 dias — pergunta aberta ("o projeto seguiu por outro caminho?")
7. +60 dias — "vou parar de insistir, mas fica o convite" (encerramento com classe)

Técnicas de fechamento:
- Fechamento por alternativa: "Prefere começar semana que vem ou na outra?"
- Fechamento por resumo de valor: recapitular tudo que vai receber e pedir confirmação
- Fechamento por urgência legítima: "tenho espaço na agenda até sexta"

- **Use quando:** empreendedor manda orçamento e some; acha que "ficar mandando mensagem incomoda"

**Seção 9 — Pós-venda, recompra e indicação (~50 linhas)**

Fundamento (p.120 Bora Vender): "cliente só é cliente quando tem sucesso usando seu produto" — pra loja, é quando entrega chega e serve; pra serviço, é quando o resultado aparece. Só então começa o pós-venda de verdade.

3 momentos pra pedir avaliação:
1. No "pico de entusiasmo" — entrega do produto/fim do serviço (imediato)
2. 7 dias depois — quando o resultado já apareceu
3. 30 dias depois — quando a lembrança consolidou

Carnegie aplicado ao pós-venda MEI:
- Nunca criticar, condenar, queixar (do cliente ou de outro concorrente)
- Apreciação honesta e sincera (elogio específico, não genérico)
- Despertar desejo no outro (enquadrar recompra no interesse do cliente)
- Lembrar o nome do cliente (e de filho/pet/data importante mencionada antes)

Programa de indicação simples (MEI solo):
- R$X de desconto pra quem indicou E pra quem veio — reciprocidade dupla
- Cartão de agradecimento escrito a mão quando possível
- Pedido direto: "conhece alguém que tá precisando?" — timing ideal é 24-72h após cliente elogiar

Upsell e cross-sell no varejo/serviço local:
- Upsell: oferecer versão maior na hora do pedido ("por +R$X você leva o combo")
- Cross-sell: oferecer complemento na entrega ("quem compra X costuma levar Y")
- Ticket médio como métrica-chave: subir 10% no ticket é menos trabalho que prospectar 10% mais clientes

Script de reativação ("faz 60 dias que não compra"):
"Oi [nome], faz um tempo que a gente não fala. Tudo bem? Passei pra avisar que [novidade/condição] — se fizer sentido, tô por aqui."

Cliente que reclamou: responder em <24h, assumir erro quando houver, oferecer solução concreta, voltar no cliente depois de 7 dias pra confirmar que foi resolvido. Reclamação bem tratada gera mais fidelidade que cliente sem problema.

- **Use quando:** empreendedor vende uma vez e perde cliente; não pede indicação; não sabe reativar cliente antigo

**Seção 10 — Mentalidade e disciplina do vendedor (~40 linhas)**

Metas diárias (Bora Vender p.90):
- Pelo menos 5 contatos novos/dia (DM, WhatsApp, presencial)
- 3 follow-ups/dia de leads antigos
- 1 pedido de indicação/dia (após cliente satisfeito)

Princípios de execução:
- "Feito é melhor que perfeito" (Tallis Gomes, via Alfredo p.72)
- "Faça rápido, erre rápido, aprenda rápido, refaça rápido" (mantra XTECH p.69)
- "Pensamento não gera fluxo de caixa" (p.36)
- Give first — entregar valor antes de pedir (conceito do Vale do Silício, via Alfredo p.151)

Moderar o hustle (equilíbrio com Joel Jota):
- Saúde, família, trabalho — não inverta a ordem
- Vender mais ≠ trabalhar 16h por dia
- Disciplina > motivação (constância pequena vence surto grande)

Rotina de vendedor MEI solo (1h/dia dedicada a vendas ativas):
- 20 min: prospecção (5 contatos novos)
- 20 min: follow-up de leads antigos
- 20 min: conteúdo/resposta de DM/recepção

Estudo contínuo (CHA — 30 min/dia mesmo):
- Ler 1 cliente ideal por semana (escutar áudio, ler avaliação)
- Acompanhar 1 concorrente por semana
- Testar 1 novo formato de post por mês

Frases-âncora de fechamento da seção (Bora Vender):
- "Não venda pela internet, use a internet para vender" (p.177)
- "Seja o melhor para o seu cliente, não queira ser o melhor do mundo" (p.107)
- "Muito risco, pouco ego" (p.134)

- **Use quando:** empreendedor procrastina prospecção; não tem rotina; "quando dá eu posto"

### 2. Expandir `web/src/lib/prompts/conhecimento.ts` — Alfredo Soares como 13º guru (~85 linhas)

Inserir no bloco MARKETING, depois de Pedro Sobral, com padrão denso (estilo Érico Rocha).

Estrutura:
- **Linha de introdução no cabeçalho MARKETING** — ajustar para: "Quando for MARKETING, aplique Erico Rocha (funis e lancamentos), Conrado Adolpho (8Ps, estrategia digital), Pedro Sobral (trafego pago acessivel) e Alfredo Soares (vendas consultivas, ecommerce, mentalidade de execucao)."
- **Perfil Alfredo Soares (@tioricco):**
  - Bio curta — co-fundador XTECH COMMERCE, plataforma de ecommerce que movimentou R$547 mi em 3 anos e foi vendida pra VTEX em dez/2017; Head Global SMB da VTEX; fundador Socialrocket; autor de "Bora Vender" (Editora Gente 2019); começou aos 17 anos vendendo cartão de visita em ponto de táxi no Rio
  - Tese central — execução vence ideia; venda é ajudar o cliente com lucro; cliente é sua melhor mídia
  - Frameworks dele (cada um em 1-2 linhas): CHA; funil 4 fundamentos (Atração/Nutrição/Conversão/Retenção); jornada em 4 estágios; SPIN Selling aplicado; 9 gatilhos; LTV ≥ 3× CAC; meta SMART; follow-up 5-12 contatos; "estratégia War" (dominar região menos saturada primeiro)
  - Estatísticas marcantes — 50-70% das vendas perdidas por não-decisão; 48% dos vendedores não fazem follow-up; 80% das vendas acontecem entre 5º-12º contato
  - Filosofia sobre ego e risco — "muito risco, pouco ego"; give first; demitir cliente errado
  - Frases-âncora (5-7, com atribuição): "pensamento não gera fluxo de caixa"; "faça rápido, erre rápido, aprenda rápido, refaça rápido"; "feito é melhor que perfeito" (Tallis, repetido por Alfredo); "no digital não existe 'eu acho', existe métrica"; "não venda pela internet, use a internet para vender"; "seja o melhor para o seu cliente, não queira ser o melhor do mundo"; "você só fica rico criando valor e fazendo cliente e parceiros ganharem dinheiro"
  - Use quando: MEI precisa estruturar vendas do zero; já tem produto mas não sabe captar cliente; quer montar e-commerce; trava por medo de vender; precisa de disciplina/mentalidade de execução; quer entender por que está perdendo venda na objeção

### 3. Enxugar `web/src/lib/prompts/impulso-stone.ts` — módulo 2

Atual (linhas 11-15):
```
2. VENDAS E CRESCIMENTO: Escolher redes sociais certas (pesquisar onde o publico
esta), criar perfil profissional completo, mesclar posts comerciais com dicas
relevantes, diversificar formatos (imagem, carrossel, video, Reels, Stories,
lives). Vendas pelo WhatsApp: usar Link de Pagamento para cartao a vista ou
parcelado em ate 18x. Vendas pelo Instagram: 11 estrategias especificas.
```

Novo:
```
2. VENDAS E CRESCIMENTO: Modulo que orienta presenca em redes sociais (perfil
profissional, mix de conteudo), vendas pelo WhatsApp com Link de Pagamento, e
vendas pelo Instagram. Taticas detalhadas de venda, scripts, tratamento de
objecoes, follow-up e posvenda estao na secao de vendas do agente.
```

Reduz a dívida (não promete número sem entregar) e cria cross-reference sutil pra Claude puxar o bloco `vendas.ts` quando o assunto for operacional.

### 4. Expandir `web/src/lib/prompts/livros.ts` — entrada Bora Vender (~45 linhas)

Substituir as 3 linhas atuais (linhas 967-969) por entrada no padrão "Obsessão pelo Cliente" (densa, focada em frameworks aplicáveis ao MEI, sem duplicar biografia do Alfredo que fica no perfil do guru).

Estrutura:
- Linha 1 — título, autor, ano, editora, página count
- Bloco 1 — CHA (Conhecimento/Habilidades/Atitudes) detalhado
- Bloco 2 — 4 mitos de vendas refutados + 5 dicas de Thiago Concer pra perder o medo de vender
- Bloco 3 — Jornada do consumidor em 4 estágios e conteúdo/oferta por estágio
- Bloco 4 — SPIN Selling aplicado (Situação/Problema/Implicação/Necessidade) com roteiro curto
- Bloco 5 — 9 gatilhos para construir ofertas (lista numerada)
- Bloco 6 — Estatísticas de follow-up (48%/10%/80%/5-12 contatos)
- Bloco 7 — 17 etapas pra montar loja virtual (do capítulo bônus) em lista numerada
- Bloco 8 — Frases-âncora (top 5, atribuídas)
- Linha final — "Use quando: MEI precisa de manual pratico de vendas, quer montar ecommerce estruturado, ou precisa de frameworks (CHA, SPIN, funil, gatilhos) pra profissionalizar o comercial."

### 5. Ajustar `web/src/lib/prompts/index.ts`

Adicionar `BASE_VENDAS` ao array de blocos, posicionado entre `BASE_ECOMMERCE` e `BASE_FERRAMENTAS` (sequência temática: formalização → ecommerce → vendas → ferramentas).

```typescript
import { BASE_VENDAS } from './vendas'
// ...
const blocks: string[] = [
  IDENTIDADE_E_TOM,
  BASE_CONHECIMENTO,
  BASE_LIVROS,
  REGRAS_INTERACAO,
  PERSONALIZACAO_ESTAGIO,
  RESOLUCAO_CONFLITOS,
  REFERENCIAS_NICHO,
  BASE_INSTITUCIONAL,
  BASE_IMPULSO_STONE,
  BASE_FORMALIZACAO,
  BASE_ECOMMERCE,
  BASE_VENDAS,        // NOVO
  BASE_FERRAMENTAS,
]
```

## Estilo editorial (sem exceções)

- Plaintext ASCII sem acentos (converter á → a, ç → c, etc.) — padrão de todos os blocos
- Seções com título em MAIÚSCULAS
- Listas numeradas quando o conteúdo original é ordenado
- Scripts/frases prontas entre aspas simples ou duplas — Claude pode copiar literalmente
- "Use quando:" ao final de blocos maiores (padrão dos perfis de guru)
- Linguagem prática, tom acolhedor mas direto (identidade do agente já definida em `identidade.ts`)
- Nunca prometer resultado financeiro específico
- Lembrete ocasional "nao e conselho juridico/contabil" quando relevante

## Cuidados e limites (validados)

- **Moderar hustle** — cruzar com Joel Jota (saúde/família/trabalho, sono, recuperação). Alfredo tem cultura de intensidade que precisa ser balanceada pra MEI solo não queimar
- **Táticas no limite ético** — não incluir "foto em escritório emprestado", "0800 fake", "três nomes no atendimento" do Alfredo. Manter só posicionamento legítimo (sonoridade do nome, percepção via conteúdo, parcerias genuínas)
- **Conteúdo datado** — ignorar Buscapé (morto), Socialrocket (automação Insta fere ToS atual), Wordpress/CorelDRAW específicos. Manter princípios, atualizar exemplos
- **M&A/valuation** (cap 9) — inaplicável a MEI, ignorar
- **TikTok/Reels** — o livro é de 2019 e não cobre. Mencionar brevemente onde natural (ex: seção 4, estratégia Instagram 3 "Reels curtos"), sem inventar material denso
- **Cross-validar com `conflitos.ts`** — garantir que o novo bloco não contradiz as 9 regras de resolução de tensões já definidas

## Impacto no token budget

| Bloco | Linhas atuais | Linhas novas | Delta |
|---|---|---|---|
| `vendas.ts` (novo) | 0 | ~480 | +480 |
| `conhecimento.ts` (Alfredo) | 567 | ~652 | +85 |
| `livros.ts` (Bora Vender) | 1.674 | ~1.716 | +42 |
| `impulso-stone.ts` (módulo 2) | 51 | ~48 | -3 |
| `index.ts` | 57 | ~58 | +1 |
| **Total** | | | **~+605 linhas** |

Estimativa de tokens: +605 linhas × ~16-20 tokens/linha = **+10-12k tokens**.

Prompt total: ~59k → ~70k tokens (~35% do contexto 200k). Dentro de folga confortável.

## Critérios de sucesso

1. Um empreendedor pergunta "como vender mais pela Internet" e recebe resposta com **scripts concretos**, não bullets genéricos
2. Um empreendedor traz objeção ("meu cliente fala que tá caro") e o mentor responde com **2-3 opções testadas** em vez de conselho vago
3. Ao pedir "estratégias de Instagram", o mentor **lista as 11** com exemplo do nicho do empreendedor
4. Promessa "11 estratégias Instagram / 13 WhatsApp" do Impulso Stone não aparece sem entrega
5. Alfredo Soares é citado pelo mentor **no contexto certo** (execução, e-commerce, objeção, follow-up), não como "mais um guru genérico"
6. Prompt continua respondendo em <3s p95 (sem regressão de latência por tamanho)
7. Observabilidade (`prompt_citations`) passa a registrar "Alfredo Soares" como fonte citada

## Plano de implementação (alto nível, detalhamento fica pro writing-plans)

1. Criar `vendas.ts` com as 10 seções (maior peça)
2. Adicionar Alfredo Soares em `conhecimento.ts` (perfil denso)
3. Enxugar módulo 2 do `impulso-stone.ts`
4. Expandir entrada Bora Vender em `livros.ts`
5. Integrar `BASE_VENDAS` no `index.ts`
6. Validar build (`npm run build` + `npx tsc --noEmit`)
7. Testar em dev local (`npm run dev`) — cenários: "como vender mais", "meu cliente diz que tá caro", "11 estratégias Instagram", "como fazer follow-up sem parecer chato"
8. Deploy (`cd web && vercel --prod --yes`)
9. Monitorar `/admin/citations` pra ver citações do Alfredo emergindo
