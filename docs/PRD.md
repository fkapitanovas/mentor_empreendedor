# PRD — Max Impulso (Mentor Virtual para Microempreendedores)

> **Versão**: 1.2 · **Data**: 21/04/2026 · **Domínio de produção**: https://maximpulso.com.br
> **Stack**: Next.js 16 + React 19 + Supabase + Claude Sonnet 4.6 + Resend
> **Escopo deste documento**: especificação da base de conhecimento, matrizes de personalização, fontes curadas e mecanismo de adequação de respostas por fase do negócio e setor.

---

## 1. Visão do Produto

### 1.1 Proposta de valor

Mentor virtual 24/7 para **microempreendedores brasileiros** (MEIs, MEs e autônomos com faturamento até R$ 360 mil/ano). Combina a expertise de 13 gurus de empreendedorismo + 23 livros curados + 26 influenciadores nichados + 4 fontes institucionais em conversas naturais pelo navegador. Foco em conselho **prático, brasileiro, acolhedor** — como um amigo experiente que entende MEI, Simples Nacional, PIX, WhatsApp Business e a realidade da confeitaria de bairro ou da esteticista autônoma.

### 1.2 Público-alvo (personas prioritárias)

| Persona | Estágio | Desafio típico | Canal de atração |
|---|---|---|---|
| **Esteticista / Cabeleireira** | Iniciante (0-1 ano) | Precificação + primeiros clientes | Instagram + indicação |
| **Confeiteira caseira** | Iniciante → Crescimento | Precificar doces/bolos + escalar produção | YouTube + Instagram |
| **Lojista de moda** | Crescimento (1-3 anos) | Vendas online + marketplace + estoque | Shopee/Mercado Livre |
| **Manicure autônoma** | Iniciante | Sair do informal, precificar | Instagram local |
| **Serviço local** (pet shop, assistência técnica, consertos) | Crescimento → Consolidado | Marketing local + contratação | Google Meu Negócio |
| **Creator / Infoprodutor** | Crescimento | Monetização + funil | YouTube + Instagram |

### 1.3 Diferenciação

- **Contextualização brasileira nativa**: não é LLM respondendo em PT com conselhos americanos genéricos. Todo conselho vem ancorado em MEI, Simples Nacional, DAS, NFS-e, Bolsa Família, CadÚnico, Pronampe, PIX, WhatsApp Business.
- **Gurus locais integrados**: Marcus Marques, Flávio Augusto, Thiago Nigro, Nathalia Arcuri, Conrado Adolpho, Geraldo Rufino, Ana Fontes, Thiago Oliveira — não só "Steve Jobs e Jeff Bezos".
- **Influenciadores nichados**: confeiteira fala com linguagem de Marrara Bortoloti; esteticista com linguagem de Natalia Beauty; finanças populares com Nath Finanças.
- **Resolução de conflitos entre gurus**: quando há tensão (ex.: reinvestir tudo vs. pagar-se primeiro), o prompt tem regras explícitas de priorização por estágio.
- **Sem conselho jurídico/contábil definitivo**: em dúvida tributária, o sistema sempre recomenda contador + orientações gratuitas do Sebrae.

---

## 2. Arquitetura do System Prompt

### 2.1 Visão geral

O sistema injeta um **system prompt composto por 14 blocos modulares** (+ 2 dinâmicos) em cada requisição de chat. O prompt é construído por `buildSystemPrompt(user, summary)` em `web/src/lib/prompts/index.ts`:

```
buildSystemPrompt(user, summary)
    │
    ├── [1] IDENTIDADE_E_TOM                 ~170 tokens
    ├── [2] BASE_CONHECIMENTO (13 gurus)     ~12.200 tokens
    ├── [3] BASE_LIVROS (23 livros)          ~32.500 tokens
    ├── [4] REGRAS_INTERACAO                 ~360 tokens
    ├── [5] PERSONALIZACAO_ESTAGIO           ~170 tokens
    ├── [6] RESOLUCAO_CONFLITOS (9 tensões)  ~1.100 tokens
    ├── [7] REFERENCIAS_NICHO (26 influ.)    ~2.250 tokens
    ├── [8] BASE_INSTITUCIONAL (Sebrae/gov)  ~2.050 tokens
    ├── [9] BASE_IMPULSO_STONE               ~1.100 tokens
    ├── [10] BASE_FORMALIZACAO (MEI/ME)      ~1.350 tokens
    ├── [11] BASE_ECOMMERCE                  ~1.550 tokens
    ├── [12] BASE_FERRAMENTAS                ~1.530 tokens
    │
    ├── [13-DIN] Se onboarded:
    │       ├── CONTEXTO_DO_USUARIO_ATUAL    ~120 tokens
    │       └── INSTRUCOES_ATUALIZACAO_PERFIL ~420 tokens
    │   Senão:
    │       └── INSTRUCOES_DIAGNOSTICO       ~440 tokens
    │
    └── [14-DIN] Se existe summary:
            └── HISTORICO_RESUMIDO           variável
```

**Tokens totais típicos do system prompt**: ~57.200 tokens (≈ 29% do contexto de 200k do Sonnet 4.6).
**Prompt caching ativo** (`cache_control: ephemeral` em `api/chat/route.ts`) — hit cache reduz latência e custo em ~90%.

### 2.2 Camadas conceituais

Os 14 blocos se organizam em 4 camadas lógicas:

| Camada | Blocos | Função |
|---|---|---|
| **Identidade** | identidade, regras | Quem Max é, como fala |
| **Conhecimento** | conhecimento, livros, referencias_nicho | **O QUE** ele sabe |
| **Adaptação** | personalizacao, conflitos, contexto_usuario | **COMO** adequa por perfil |
| **Realidade BR** | institucional, impulso_stone, formalizacao, ecommerce, ferramentas | **ONDE** aplica |

---

## 3. Matriz 1 — Fase do Negócio × Assunto

### 3.1 Fases codificadas no sistema

Detectadas automaticamente durante o onboarding (ver `INSTRUCOES_DIAGNOSTICO`) e persistidas em `user.estagio`:

| Enum | Tempo de negócio | Faturamento típico | Comportamento esperado |
|---|---|---|---|
| `iniciante` | 0-1 ano | R$ 0 – R$ 5 mil/mês | Ideação, formalização, primeiros clientes |
| `crescimento` | 1-3 anos | R$ 5-15 mil/mês | Processos, canais, delegação inicial |
| `consolidado` | 3+ anos | R$ 15 mil+/mês | Eficiência, escala, governança básica |

### 3.2 Matriz Fase × Assunto

| **Assunto** | **Iniciante (0-1 ano)** | **Crescimento (1-3 anos)** | **Consolidado (3+ anos)** |
|---|---|---|---|
| **Mentalidade / Propósito** | Superação, coragem, persistência (Rufino, Ana Fontes) + **Mindset "Ainda"** | Propósito articulado (Sinek) + disciplina (Carneiro/Joel Jota) | Liderança visionária (Gerber/Perspectiva), legado (Collins Nível 5) |
| **Formalização** | **Foco principal**: abrir MEI grátis gov.br, DAS, DASN, NFS-e 2026 | Migração MEI → ME (quando ultrapassar R$ 81k), CRT 4, contador obrigatório | Simples Nacional avançado, Fator R, planejamento tributário |
| **Precificação** | Markup básico (Impulso Stone), não misturar PF/PJ | Precificação estratégica (Sinek — valor), oferta completa | Valor percebido + margem por canal, demitir cliente ruim (Lucro Primeiro) |
| **Finanças** | Separar PF/PJ dia 1, registrar entradas/saídas (Arcuri caixinhas + Impulso Stone) | **Lucro Primeiro**: 5 contas + TAPs 5/50/15/30, ritmo 10/25 | Avaliação Instantânea trimestral, The Vault, distribuição 50/50, regra longevidade |
| **Vendas / Atração** | WhatsApp Business + Google Meu Negócio (gratuitos) + Canva | Instagram com funil (Conrado 8Ps), Link na Bio, catálogo | Multi-canal, trafego pago (Sobral), lançamento interno (Érico Rocha) |
| **Marketing de Conteúdo** | Postar consistente, vencer "medo de aparecer" (Mindset) | Construir audiência (Carneiro disciplina, 40-50% conteúdo educativo) | Autoridade de nicho, parceria com micro-influenciadores |
| **Operação / Processos** | Ação > planejamento elaborado; fazer e ajustar | **O Mito do Empreendedor** (Gerber): 3 personalidades, protótipo de franquia | Manual de Operações (Gerber), 6-pager (Amazon), métricas semanais (WBR) |
| **Equipe / Contratação** | Sozinho — Regra das Pessoas Normais, primeiro freelance | **Bar Raiser** simplificado, Contrato de Posição, primeira CLT | Cultura, 14 Leadership Principles, Single-Threaded Leader |
| **Crédito** | Microcrédito inicial (Banco Pérola/Impulso Stone, ≤ R$ 5k) | **Pronampe** (Selic + 6%), PROCRED 360 (Selic + 5%) | Análise de ROI de dívida boa vs ruim (Kiyosaki) |
| **Produtividade / Foco** | **Essencialismo** — escolher UM canal, UM produto estrela | Rotinas automatizadas (Duhigg + McKeown), delegar trivial | Remoção do caminhante mais lento (A Meta), OP1/OP2 anual |
| **Tecnologia** | WhatsApp Business + Canva + Google Meu Negócio | Meta Business Suite + CapCut + CRM grátis (HubSpot) | ERP (Bling/Tiny/Conta Azul) + automações + ChatGPT/Claude |

### 3.3 Como o sistema adapta respostas por fase

Três mecanismos combinados:

**Mecanismo A — `PERSONALIZACAO_ESTAGIO` (bloco 5)**:
Instrução direta ao modelo para escolher o **estilo de voz** conforme estágio:
- Iniciante → Arcuri + Rufino (acolhedor, simples)
- Crescimento → Marques + Flávio Augusto + Thiago Oliveira (desafiador, processos)
- Consolidado → Nigro + Oliveira (estratégico, escala)

**Mecanismo B — `CONTEXTO_DO_USUARIO_ATUAL` (bloco 13)**:
Injetado dinamicamente com os dados coletados no onboarding:
```
- Nome: Maria
- Setor: confeitaria
- Estagio: crescimento
- Tempo de negocio: 18 meses
- Faturamento: R$ 8.000/mes
- Desafio principal: precificar corretamente

Personalize suas respostas para o estagio "crescimento" e o setor "confeitaria".
```

**Mecanismo C — `RESOLUCAO_CONFLITOS` (bloco 6)**:
9 regras explícitas de priorização quando gurus discordam. Muitas delas são **condicionadas por estágio**:
- Regra #1 (Processo vs Ação): *"Para INICIANTES, priorize ação e vendas; para EM CRESCIMENTO e CONSOLIDADOS, introduza processos"*
- Regra #2 (Bootstrapping vs Escala): *"Escala ágil só faz sentido quando modelo validado"*
- Regra #3 (Ágil vs Processual): *"Comece ágil; conforme ganhar complexidade, introduza estrutura"*
- Regra #4 (Alta performance vs realidade): *"Adapte exigência ao contexto real; nunca gere culpa"*
- Regra #7 (Marketing): *"Iniciante com orçamento zero → lançamento semente; trafego pago só quando produto validado"*
- Regra #9 (Jornada): *"Dedicação intensa no início é normal; equilíbrio é objetivo de longo prazo"*

---

## 4. Matriz 2 — Tipo de Negócio × Guru / Influenciador

### 4.1 Gurus generalistas (base em `conhecimento.ts`)

13 perfis extensos (~1.000 tokens cada), com biografia, conceitos centrais, frases-âncora e "Use quando...":

| Guru | Área forte | Aplica a quê |
|---|---|---|
| **Marcus Marques** | Gestão PMEs (PPR, KPIs) | Crescimento, consolidado com equipe |
| **Flávio Augusto** | Vendas, mentalidade, Geração de Valor | Iniciante e crescimento precisando vender |
| **Thiago Oliveira** | Gestão ágil, execução enxuta | Crescimento com múltiplas frentes |
| **Thiago Nigro** | Finanças pessoais (Do Mil ao Milhão) | Todos — hierarquia financeira |
| **Nathalia Arcuri** | Finanças pessoais populares (Me Poupe) | Iniciante, educação básica |
| **Gustavo Cerbasi** | Finanças casais/família | Empreendedor casado/família |
| **Rodrigo Almeida** | Lucro2x (pequenas empresas) | Crescimento querendo margem |
| **Érico Rocha** | Fórmula de Lançamento (infoproduto) | Creators, coaches, serviços digitais |
| **Conrado Adolpho** | 8Ps do Marketing Digital | Todos, marketing estruturado |
| **Pedro Sobral** | Tráfego pago Facebook/Instagram | Crescimento com oferta validada |
| **Joel Jota** | Alta performance (atletas-CEOs) | Qualquer estágio, disciplina/hábitos |
| **Geraldo Rufino** | Superação (catador → milionário) | Iniciante em crise, inspiração |
| **Ana Fontes** | Empreendedorismo feminino (RME/IRME) | Empreendedora mulher, contexto de gênero, maternidade+negócio, irmandade feminina |

> **Separação perfil × livro (v1.1)**: O `conhecimento.ts` mantém apenas o perfil biográfico/institucional de Ana Fontes (RME, Instituto RME, programas, prêmios, filosofia). Os conceitos específicos do livro *Negócios: um assunto de mulheres* (Jandaíra, 2022) — 7 atitudes empreendedoras, mãe possível, os 4 cuidados em sociedade familiar, irmandade feminina como alternativa ao networking — estão em `livros.ts`. Este padrão segue a regra de deduplicação do projeto: perfil de guru fica em `conhecimento.ts`; conteúdo de obra autoral fica em `livros.ts`.

> **Curadoria v1.2 (21/04/2026) — poda de livros fora da realidade MEI**: Três livros removidos por terem público original incompatível com micro/pequeno empreendedor brasileiro: **De Zero a Um** (Thiel — escrito para founder de startup de VC buscando monopólio global); **O Lado Difícil das Coisas Difíceis** (Horowitz — CEO com rodadas de VC, IPOs, layoffs em massa); **Sonho Grande** (Correa — biografia Lemann/Telles/Sicupira de aquisições bilionárias). Três livros reduzidos a apenas os conceitos universais: **Obsessão pelo Cliente** (195 → 45 linhas, mantendo Customer Obsession + Input vs Output Metrics + PR/FAQ simplificado + "mecanismos > intenções"); **Empresas Feitas para Vencer** (35 → 15 linhas, mantendo Hedgehog + Cultura de Disciplina); **A Startup Enxuta** (30 → 15 linhas, mantendo MVP + Build-Measure-Learn + métricas de vaidade vs acionáveis). Resultado: 26 → 23 livros, ~36.200 → ~32.500 tokens em `livros.ts`, ~10% de margem adicional para futuros livros alinhados (gap identificado: $100M Offers, Chris Voss, Radical Candor).

### 4.2 Influenciadores nichados (base em `nichos.ts`)

Ativados quando `user.setor` bate com o nicho:

#### Confeitaria / Doces (4 refs profundas)

| Influencer | Especialidade | Use quando... |
|---|---|---|
| **Marrara Bortoloti** | Precificação + gestão + método do zero | Confeiteira precisa precificar corretamente ou montar do zero |
| **Chef Leo Oliveira** | Escala de produção, técnicas profissionais | Quer profissionalizar produção, escalar volume |
| **Confeiteiro Empreendedor** | Lado "empresa" do negócio de doces | Já sabe fazer, precisa do "empresarial" |
| **Bruna Ramos** | Receitas faça-e-venda, baixo custo | Começando do zero com pouco capital |

#### Beleza / Estética (5 refs profundas)

| Influencer | Especialidade | Use quando... |
|---|---|---|
| **Natalia Beauty** | Escalar estética (3 fases: Especialista → Generalista → Nexialista) | Esteticista quer escalar, sair do "faço tudo" |
| **Karen Bachini** | Marca própria de beleza, 3 pilares | Quer criar marca, monetizar audiência |
| **Lash Business** | Gestão de negócio de cílios | Lash designer, escalar para studio |
| **Manicure Empreendedora** | Transformar manicure em empreendedora | Manicure sair do informal, montar salão |
| **Marketing para Salão** | Marketing local (Google, Instagram) | Atrair clientes, presença online básica |

#### Outros nichos (referências mais curtas)

- **Marketing Digital**: Ana Tex (funil simples), Camila Porto (Instagram vendas), Rafael Kiso (growth)
- **Finanças Populares**: Nath Finanças (baixa renda), Favelado Investidor (investimento simples), Grana Preta (periférica)
- **Moda / Loja**: Ana Bochi (loja online moda), Loja Lucrativa (vendas moda MEI)
- **Gastronomia**: Hamburguer Perfeito (food business prático)
- **MEI Geral**: Vida de MEI (rotina e dia a dia)

### 4.3 Matriz Tipo de Negócio × Recomendação

| Tipo de negócio | Gurus primários | Influenciadores primários | Livros mais usados |
|---|---|---|---|
| **Confeitaria caseira** | Arcuri, Rufino, Ana Fontes | Bruna Ramos, Marrara Bortoloti | Lucro Primeiro, Mindset, Pai Rico |
| **Confeitaria escalando** | Marques, Flávio Augusto, Nigro | Chef Leo Oliveira, Confeiteiro Empreendedor | Gerber (Mito), Lucro Primeiro, Essencialismo |
| **Esteticista autônoma** | Arcuri, Ana Fontes, Flávio | Marketing para Salão, Manicure Empreendedora | Sinek, Duhigg, Mindset |
| **Clínica de estética** | Marques, Thiago Oliveira | Natalia Beauty (3 fases) | Gerber, Obsessão pelo Cliente, Collins |
| **Moda / Loja física** | Flávio Augusto, Conrado | Ana Bochi, Loja Lucrativa | Comece pelo Porquê, Lucro Primeiro |
| **E-commerce / Marketplace** | Conrado, Sobral, Nigro | Camila Porto, Rafael Kiso | A Startup Enxuta, 8Ps, Obsessão pelo Cliente |
| **Serviço local** (pet, oficina) | Marques, Rodrigo Almeida | Marketing para Salão (Google local) | Gerber, Como Fazer Amigos |
| **Food business** (hambúrguer, lanche) | Marques, Flávio Augusto | Hamburguer Perfeito | Gerber, Lucro Primeiro, Kiyosaki |
| **Creator / Infoprodutor** | Érico Rocha, Conrado, Sobral | Nath Araújo | Comece pelo Porquê, Hooked (a integrar) |
| **Finanças periferia/popular** | Arcuri, Nigro | Nath Finanças, Grana Preta, Favelado Investidor | Pai Rico, Me Poupe!, Mindset |

### 4.4 Como o sistema seleciona

A seleção é **implícita**: o LLM lê `user.setor` (injetado no bloco 13) + descrições dos nichos (bloco 7) + descrições dos gurus (bloco 2) e escolhe integrar os conceitos relevantes **sem citar os nomes** (regra #4 em `REGRAS_INTERACAO`: "explique de forma acessível sem necessariamente citar o nome do guru").

Isso permite que a resposta a uma esteticista use naturalmente a linguagem das 3 fases de Natalia Beauty (Especialista → Generalista → Nexialista) sem parecer propaganda.

---

## 5. Fontes Institucionais Curadas

Quatro fontes externas alimentam o sistema com dados oficiais e verificáveis, permitindo o conselho brasileiro-nativo.

### 5.1 Sebrae (Serviço Brasileiro de Apoio às Micro e Pequenas Empresas)

**Onde está no sistema**: `BASE_INSTITUCIONAL` + `BASE_FORMALIZACAO` + `BASE_FERRAMENTAS`.

**O que endereça**:

| Tópico | Dado / Orientação |
|---|---|
| **Mortalidade de negócios** | 29% dos MEIs fecham em até 5 anos; 60% das empresas em geral (IBGE); principais causas: falta de planejamento, gestão financeira ineficaz (misturar PF/PJ), desconhecimento de mercado, capital de giro insuficiente |
| **Distribuição do empreendedorismo** | 77% dos pequenos negócios abertos no Brasil são MEIs |
| **Cursos gratuitos** | +348 cursos online com certificado (sebrae.com.br/cursosonline) em trilhas: **Comece** (iniciando) / **Faça** (mantendo) / **Alcance** (crescendo) — mapeia diretamente nos 3 estágios do Max |
| **Consultorias gratuitas** | Presenciais e online sobre formalização, plano de negócios, precificação |
| **Ferramentas** | Templates de plano de negócios, Canvas, calculadoras de precificação |
| **Emissor NF-e gratuito** | emissornfe.sebrae.com.br (complementa NFS-e do Portal Nacional) |

**Como o Max usa**: quando o empreendedor pergunta sobre capacitação, Max direciona para Sebrae. Quando é sobre estatística ("quantos MEIs fecham?"), Max cita o dado do Sebrae para validar o conselho.

### 5.2 gov.br (Portal Nacional do Governo Federal)

**Onde está no sistema**: `BASE_INSTITUCIONAL` + `BASE_FORMALIZACAO`.

**O que endereça**:

| Tópico | Dado / Orientação |
|---|---|
| **Portal do Empreendedor** | Formalização MEI 100% grátis e online (gov.br/mei). Gera CNPJ na hora. Requer conta gov.br nível **Prata ou Ouro** |
| **Portal Nacional NFS-e** | Desde 01/01/2026, **obrigatório** para todos os prestadores de serviço. Emissão via portal (nfse.gov.br) ou app NFS-e Mobile. Sem certificado digital para MEI |
| **PGMEI** | Geração do DAS mensal, parcelamento (até 60 parcelas, mínimo R$50) |
| **Portal e-CAC (Receita Federal)** | Acesso ao Pronampe, autorização de compartilhamento de dados |
| **Portal do Simples Nacional** | DASN-SIMEI (declaração anual até 31/maio), regularização |
| **Contrata+Brasil** | Plataforma de licitações com tratamento diferenciado para MEI/ME (até R$80 mil contratação exclusiva, empate ficto) |
| **CadÚnico** | Base para Bolsa Família — MEI pode receber se renda per capita familiar ≤ R$218/pessoa/mês |
| **INSS / Previdência** | Regras de aposentadoria, complementação 15% via GPS (R$243,15/mês em 2026) |

**Valores-chave 2026** (derivados do gov.br):
- Salário mínimo: R$ 1.621
- Limite MEI: R$ 81.000/ano (R$ 251.600 MEI Caminhoneiro)
- DAS Comércio: R$ 82,05 | DAS Serviços: R$ 86,05 | DAS Comércio+Serviços: R$ 87,05
- Desenquadramento: até 20% excesso = ok (migra em janeiro); acima de 20% = retroativo

**Novidades 2025-2026 registradas**:
- Reforma Tributária: MEI mantido, isento de IBS/CBS (campos informativos até 2033)
- **Nanoempreendedor**: nova categoria até R$ 40.500/ano, isento de CBS/IBS (não pode ser MEI simultaneamente)
- **Super MEI (NÃO em vigor)**: 3 PLPs em tramitação — R$ 130k, R$ 140k, R$ 150k. Max explicita que são propostas, não realidade

### 5.3 Stone (Stone Co. — adquirente)

**Onde está no sistema**: `BASE_IMPULSO_STONE` (dedicada) + `BASE_FERRAMENTAS` (menções a Stone/Ton como meio de pagamento).

**O que endereça**:

| Tópico | Conteúdo |
|---|---|
| **Ton** (subproduto Stone para MEI) | Maquininha com taxas competitivas, recebimento em 1 dia, app com gestão de vendas, Link de Pagamento |
| **Stone PagLeve** | Link de pagamento para vendas a distância, parcelamento em até 18x |
| **Blog Stone** (blog.stone.com.br) | Artigos práticos sobre finanças, gestão, empreendedorismo, marketing e vendas |
| **Conteúdo Stone profundo** | Guias sobre precificação (com calculadora), margem de lucro, fluxo de caixa, vendas por WhatsApp (13 estratégias), Instagram (11 estratégias), marketing digital (7 estratégias), marketing de conteúdo (8 estratégias) |
| **EducaTon** | Hub de educação gratuito (finanças, gestão, técnicas de venda) |

**Como o Max usa**: quando empreendedor pergunta sobre maquininha, Stone/Ton aparece entre opções junto com Mercado Pago, InfinitePay. Para conteúdo gratuito avançado, Max direciona para blog.stone.com.br.

### 5.4 Impulso Stone (Programa de inclusão do Instituto Stone)

**Onde está no sistema**: `BASE_IMPULSO_STONE` (8 módulos estruturados).

**O que é**: iniciativa gratuita de **educação + microcrédito + mentoria** do Instituto Stone para microempreendedores. Funciona 100% pelo **WhatsApp**. Parceiros: **Banco Pérola** (microcrédito), **RediRedi** (catálogos digitais + vendas WhatsApp), **BNDES** (inclusão financeira).

**Os 8 módulos do Impulso Stone** (mapeados como currículo):

| Módulo | Cobertura | Fase do MEI que atende |
|---|---|---|
| **1. Começando do Zero** | Autoanálise, plano de negócios, formalização MEI, pesquisa de mercado | Pré-iniciante → iniciante |
| **2. Vendas e Crescimento** | Redes sociais certas, perfil profissional, formatos diversificados. Link de Pagamento (até 18x). **11 estratégias Instagram + 13 WhatsApp** | Iniciante → crescimento |
| **3. Planejamento Financeiro** | Separar PF/PJ, fluxo de caixa diário, capital de giro, categorização de despesas | Todos os estágios |
| **4. Precificação** | Fórmula: preço = custo + despesas + margem. Markup, componentes completos. Sebrae como fonte das estatísticas de precificação errada como causa de falência | Iniciante → crescimento |
| **5. Acesso a Crédito** | Microcrédito via Banco Pérola. Parceria BNDES | Iniciante precisando de capital |
| **6. Mentoria** | +400 colaboradores Stone como mentores voluntários. Sessões com Augusto Lins (cofundador Stone) | Todos que engajam |
| **7. Atendimento ao Cliente** | Responder rápido, omnicanalidade, fidelização (cupons 1ª compra) | Crescimento → consolidado |
| **8. Comunidade** | Rede de empreendedores, peer-to-peer | Todos |

**Diferença entre Stone e Impulso Stone no sistema**:
- **Stone**: serviços comerciais (maquininha Ton, Link de Pagamento) + conteúdo aberto (blog)
- **Impulso Stone**: **programa gratuito de capacitação** com currículo estruturado + microcrédito + mentoria (equivalente local do SBA americano)

**Lista de influenciadores Impulso Stone** (fonte: `docs/influencers_impulso_stone.xlsx`): é a base de onde saem os 26 influenciadores nichados em `nichos.ts` — são nomes selecionados pela equipe Impulso Stone por sua **afinidade MEI** (índice 4-5) e relevância por setor.

### 5.5 Matriz consolidada: Fonte × O que endereça

| Pergunta típica do MEI | Fonte primária | Onde no prompt |
|---|---|---|
| "Como abrir MEI?" | gov.br/mei | `BASE_FORMALIZACAO` |
| "Quanto pago de DAS?" | gov.br (Receita) | `BASE_INSTITUCIONAL` |
| "Onde faço curso grátis de gestão?" | Sebrae + Impulso Stone | `BASE_INSTITUCIONAL` + `BASE_IMPULSO_STONE` |
| "Como emitir NFS-e?" | Portal Nacional gov.br/nfse | `BASE_INSTITUCIONAL` |
| "Perdi o prazo da DASN, e agora?" | gov.br/Simples | `BASE_INSTITUCIONAL` + `BASE_FORMALIZACAO` |
| "Quero microcrédito" | Banco Pérola (via Impulso Stone), Pronampe (gov.br) | `BASE_IMPULSO_STONE` + `BASE_INSTITUCIONAL` |
| "Como precificar meu bolo?" | Sebrae + Impulso Stone + Marrara Bortoloti | `BASE_INSTITUCIONAL` + `BASE_IMPULSO_STONE` + `REFERENCIAS_NICHO` |
| "Qual maquininha usar?" | Stone (Ton), Mercado Pago, InfinitePay | `BASE_FERRAMENTAS` |
| "Sou MEI e vou receber Bolsa Família?" | gov.br (CadÚnico) | `BASE_INSTITUCIONAL` |
| "Fazer lançamento de infoproduto?" | Érico Rocha (guru) + gov.br para regulamentação | `BASE_CONHECIMENTO` + `BASE_INSTITUCIONAL` |

---

## 6. Mecanismo de Adequação de Respostas

Como o sistema *transforma* 53k tokens de conhecimento em **uma resposta certa para o MEI certo no momento certo**.

### 6.1 Fluxo de uma mensagem

```
Usuário digita: "Como precifico meus bolos?"
            │
            ▼
┌──────────────────────────────────────────────┐
│ 1. API /api/chat recebe (route.ts)           │
│    - Carrega user do Supabase                │
│    - Carrega últimas 100 mensagens           │
│    - Carrega resumo comprimido               │
└──────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ 2. buildSystemPrompt(user, summary)           │
│    - Injeta 12 blocos estáticos (cacheados) │
│    - Injeta CONTEXTO (user.setor/estagio)   │
│    - Injeta INSTRUCOES (diagnostico ou      │
│      atualizacao conforme is_onboarded)     │
│    - Injeta summary se existir               │
└──────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ 3. Claude Sonnet 4.6 recebe:                 │
│    - System prompt completo (~53k tokens)   │
│    - 100 últimas mensagens                  │
│    - Mensagem atual do usuário               │
└──────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ 4. Claude gera resposta:                     │
│    - Identifica: setor=confeitaria          │
│    - Puxa: conceitos de Marrara Bortoloti   │
│      (nichos) + Impulso Stone Precificação  │
│      (módulo 4) + Sebrae (causa de falência)│
│    - Aplica REGRAS_INTERACAO (5 passos máx, │
│      analogias brasileiras, etc.)           │
│    - Aplica PERSONALIZACAO (estilo Arcuri   │
│      se iniciante, Marques se crescimento)  │
│    - Aplica CONFLITOS se tensão aparecer    │
└──────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────┐
│ 5. Stream SSE para o cliente                 │
│    - useChat renderiza em tempo real         │
│    - cleanProfileTags() limpa tags internas  │
│      [PERFIL_EXTRAIDO] / [PERFIL_ATUALIZADO] │
│    - Se tags presentes: atualiza Supabase    │
└──────────────────────────────────────────────┘
```

### 6.2 Regras de interação que forçam qualidade (bloco 4)

10 regras obrigatórias codificadas em `REGRAS_INTERACAO`:

1. Sempre entender contexto primeiro (setor, tempo, desafio)
2. Respostas acionáveis com máximo **5 passos**
3. **Analogias do cotidiano brasileiro** obrigatórias
4. Citar conceitos sem necessariamente citar nome do guru (explicação acessível)
5. Perguntar se quer aprofundar
6. Dúvidas tributárias → sempre recomendar contador (nunca conselho legal definitivo)
7. **Celebrar conquistas** (por menores que sejam)
8. **Não repetir perguntas** já respondidas no histórico
9. Entregar valor primeiro, perguntar depois (máximo 1 pergunta)
10. Agrupar perguntas (2-3 por mensagem, nunca uma só)

### 6.3 Resolução de 9 tensões entre gurus (bloco 6)

Quando o LLM tem dois caminhos possíveis (ex.: reinvestir tudo vs. pagar-se primeiro), as 9 regras em `RESOLUCAO_CONFLITOS` priorizam:

| # | Tensão | Regra de decisão |
|---|---|---|
| 1 | Processo vs Ação | Iniciante = ação; crescimento/consolidado = processo |
| 2 | Bootstrapping vs Escala | Iniciante = orgânico; escala só com modelo validado |
| 3 | Gestão ágil vs Processual | Comece ágil, introduza estrutura conforme complexidade |
| 4 | Alta performance vs Realidade | Adapte exigência; nunca gere culpa |
| 5 | Escala vs Sustentabilidade | **Pergunte** se quer crescer antes de recomendar escala |
| 6 | Finanças PF vs Reinvestir tudo | Priorize Nigro: 10-20% sempre reservado antes de reinvestir |
| 7 | Marketing (lançamento vs funil vs trafego) | Iniciante = Érico semente; validado = Conrado funil; amplificar = Sobral ads |
| 8 | Dívida boa vs eliminar toda dívida | Priorize Kiyosaki: dívida boa é alavancagem para ativo com retorno claro |
| 9 | Jornada intensa vs equilíbrio | Início = intenso (Rufino); maturidade = equilíbrio (Jota); nunca glorifique burnout |

### 6.4 Diagnóstico implícito (bloco 13-DIN)

**Durante onboarding** (is_onboarded = false): Max conduz conversa natural, extrai `name`, `setor`, `estagio`, `tempo_negocio`, `faturamento`, `desafio_principal`. Quando tem informação suficiente, emite tag interna:

```
[PERFIL_EXTRAIDO]{"setor":"confeitaria","estagio":"iniciante",...}[/PERFIL_EXTRAIDO]
```

API intercepta a tag, salva em Supabase, `is_onboarded=true`. A tag é **removida do texto renderizado** via `cleanProfileTags()` — usuário nunca a vê.

**Em conversas subsequentes**: `INSTRUCOES_ATUALIZACAO_PERFIL` permite que o usuário atualize perfil **organicamente** ("agora tô faturando 20 mil"). Max emite tag `[PERFIL_ATUALIZADO]` para persistir. Reavalia `estagio` se `tempo_negocio` mudou.

### 6.5 Memória de longo prazo (summary)

A cada **20 mensagens**, `summary.ts` roda um Claude Haiku 4.5 que gera um resumo comprimido (~2k tokens) do progresso do usuário. Esse resumo é injetado no system prompt (bloco 14-DIN):

```
HISTORICO RESUMIDO DAS CONVERSAS ANTERIORES:
Maria, confeiteira há 18 meses, faturamento R$ 8k/mês.
Decidiu abrir MEI em março. Implementou separação PF/PJ.
Testando precificação com planilha. Próximo passo combinado:
migrar para Instagram Shopping e testar 1 campanha paga pequena.

Use este historico para dar continuidade ao acompanhamento.
NAO repita conselhos ja dados.
```

Isso permite continuidade **entre sessões** — Max não esquece que já conversou sobre precificação, não sugere de novo "abrir MEI" quando já está aberto.

---

## 7. Métricas de Qualidade (propostas)

Mecanismos para monitorar e iterar o prompt:

| Métrica | Como medir | Meta |
|---|---|---|
| **Cobertura de fases** | % de perguntas em que o `estagio` identificado no prompt bate com o conselho dado | ≥ 90% |
| **Aderência de nicho** | Quando `user.setor` preenchido, % de respostas que citam conceito do influencer do nicho | ≥ 70% |
| **Taxa de recomendação de contador** | % de perguntas tributárias com disclaimer contador | 100% |
| **Recall de hábitos** | Em conversa longa (20+ msgs), bot referencia hábitos/pendências anteriores corretamente | ≥ 85% |
| **Cache hit rate** | % de requests com prompt cache hit | ≥ 80% |
| **TTFT (Time to First Token)** | Latência do primeiro token da resposta | < 2s (hit) / < 5s (miss) |
| **Tamanho do system prompt** | Tokens totais injetados | ≤ 80k (saudável); alerta > 100k |
| **Tamanho do livros.ts** | Tokens do maior bloco | ≤ 40k (confortável) |

### 7.1 Estado atual (21/04/2026, pós-v1.2)

- System prompt total: **~57.200 tokens** (29% do context window Sonnet 4.6)
- `livros.ts`: **~32.500 tokens** (57% do prompt) — 23 livros, 7 no padrão deep
- `conhecimento.ts`: **~12.200 tokens** (21% do prompt) — 13 perfis de guru
- **Margem**: saudável. Alvo confortável de `livros.ts` é 40k tokens (margem ~19% = espaço para ~3 livros deep ou ~8 médios)

---

## 8. Limitações Conhecidas e Roadmap

### 8.1 Limitações atuais

| Limitação | Mitigação atual | Próximo passo |
|---|---|---|
| `livros.ts` cresce linearmente com cada livro | Padrão de duas profundidades (complemento vs deep) | Avaliar RAG semântico quando passar 40k tokens |
| Seleção de nicho é implícita (LLM escolhe) | Descrições detalhadas de influencers | Roteamento explícito por setor se fidelidade cair |
| Invalidação de cache a cada edit | Prompt caching ativo | Agrupar edits em batches semanais |
| Nicho geográfico (Sudeste vs Nordeste) não tratado | Exemplos brasileiros genéricos | Coletar exemplos regionais de influenciadores |
| Ausência de dados de ROI real dos livros citados | — | Logging de qual livro é citado por estágio/setor |

### 8.2 Gaps de conteúdo identificados (matriz já mapeada)

| Gap | Livro candidato | Prioridade |
|---|---|---|
| Precificação tática / oferta irresistível | **$100M Offers** (Hormozi) | Alta |
| Negociação / objeções | **Nunca Divida a Diferença** (Voss) | Média |
| Liderança da primeira contratação | **Radical Candor** (Kim Scott) | Média |
| Saúde mental do empreendedor | **A Coragem de Ser Imperfeito** (Brené Brown) | Baixa |
| Conteúdo / copywriting narrativo | **Storybrand** (Donald Miller) | Baixa |

### 8.3 Livros já removidos na curadoria v1.2 (NÃO voltar)

Para evitar que futuras curadorias "reintroduzam" livros inadequados por nostalgia canônica:

| Livro removido | Motivo de exclusão permanente |
|---|---|
| **De Zero a Um** (Thiel) | Público original: founder de startup de VC buscando monopólio. Mindset "competição é para perdedores" desalinhado com MEI buscando 30-50 clientes leais. |
| **O Lado Difícil** (Horowitz) | Público original: CEO com VC, demissões em massa, IPO, aquisição. Fora da realidade do MEI que quita boleto e emite NFS-e. |
| **Sonho Grande** (Correa) | Biografia Lemann/Telles/Sicupira (AmBev, InBev, Burger King, Kraft-Heinz). Puramente narrativo. Filosofia 3G de corte agressivo de custos polêmica para negócio de relacionamento. |

### 8.3 Próximos passos arquiteturais

1. **Observabilidade do prompt**: logar (a) qual livro foi citado, (b) qual guru foi referenciado, (c) qual fase/setor foi adaptado em cada resposta — para feedback no acervo.
2. **A/B test de caminhos**: testar se citar o nome do guru (vs esconder) aumenta engajamento.
3. **Nichos regionais**: expandir influenciadores para Norte/Nordeste.
4. **Sucessão de perfil**: notificar usuário quando `estagio` muda automaticamente (ex.: "percebi que você passou para fase de crescimento!").
5. **Roteamento de modelo**: Haiku 4.5 para respostas simples, Sonnet 4.6 para complexas — reduz custo.

---

## 9. Anexos

### 9.1 Estrutura de diretórios dos prompts

```
web/src/lib/prompts/
├── index.ts                 # Orquestração dos 14 blocos
├── identidade.ts            # Bloco 1 — quem Max é
├── conhecimento.ts          # Bloco 2 — 13 gurus detalhados
├── livros.ts                # Bloco 3 — 25 livros (6 deep, resto médio)
├── regras.ts                # Bloco 4 — 10 regras de interação
├── personalizacao.ts        # Bloco 5 — estilos por estágio
├── conflitos.ts             # Bloco 6 — 9 tensões entre gurus
├── nichos.ts                # Bloco 7 — 26 influenciadores
├── institucional.ts         # Bloco 8 — Sebrae + gov.br
├── impulso-stone.ts         # Bloco 9 — programa Stone
├── formalizacao.ts          # Bloco 10 — MEI/ME/tributos
├── ecommerce.ts             # Bloco 11 — marketplaces
├── ferramentas.ts           # Bloco 12 — apps recomendados
├── diagnostico.ts           # Bloco 13-DIN (se NÃO onboarded)
└── atualizacao-perfil.ts    # Bloco 13-DIN (se onboarded)
```

### 9.2 Fontes originais (em `docs/`)

- `agente_microempreendedor.docx` — documento-mãe da curadoria (12 gurus + 22 livros iniciais da equipe Impulso Stone)
- `influencers_impulso_stone.xlsx` — planilha de influenciadores nichados com afinidade MEI (4-5)
- `Geração de Valor – Flávio Augusto.pdf` (+ vol 2 e 3) — lidos na íntegra para enriquecimento
- `O Poder do Hábito - Charles Duhigg.pdf` — **obsoleto** (5pp, resumo); substituído por leitura integral do PDF original em 21/04/2026

### 9.3 Campos de perfil do usuário (Supabase `public.users`)

| Campo | Tipo | Preenchimento | Uso |
|---|---|---|---|
| `name` | text | Onboarding | Personalizar vocativo |
| `setor` | text | Onboarding | Ativar nicho |
| `estagio` | enum | Inferido (tempo_negocio_meses) | Selecionar estilo + regras de conflito |
| `tempo_negocio` | text | Onboarding | Inferir estagio |
| `tempo_negocio_meses` | integer | Padronizado | Cálculo exato de estagio |
| `faturamento` | text | Onboarding | Contextualizar recomendações |
| `faturamento_mensal` | integer | Padronizado | Aplicar TAPs corretos (Lucro Primeiro) |
| `desafio_principal` | text | Onboarding | Foco inicial da conversa |
| `is_onboarded` | boolean | Default false | Gate do diagnóstico |

### 9.4 Modelos LLM em uso

| Função | Modelo | Justificativa |
|---|---|---|
| **Chat principal** | `claude-sonnet-4-6` | Qualidade + context window 200k + prompt caching |
| **Título automático de conversa** | `claude-haiku-4-5` | Rápido e barato para tarefa simples |
| **Resumo comprimido de conversa** | `claude-haiku-4-5` | Rápido, baixo custo, contexto suficiente |

---

**FIM do PRD v1.0** · Próxima revisão prevista quando `livros.ts` atingir 40k tokens OU quando arquitetura mudar para RAG.
