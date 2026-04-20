# Design Overhaul — Max Impulso

**Data**: 2026-04-20
**Projeto**: Mentor Empreendedor (web app)
**Escopo**: Redesign completo da interface

## Direção Estética

**Tropical & Vibrante** — verde esmeralda + tons quentes (âmbar/amarelo). Cara brasileira, energia de crescimento. Fundo claro e limpo com toques de cor viva. Equilíbrio entre profissional e acolhedor. Público: microempreendedores brasileiros (MEIs, food trucks, salões, confeitarias).

## Sistema de Cores

### Light Mode — "Tropical Day"

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#FFFDF7` | Fundo principal (off-white quente) |
| `--foreground` | `#1A1A17` | Texto principal |
| `--primary` | `#059669` | Ações, links, accents (emerald-600) |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `#F0FDF4` | Fundo de bolhas do assistente (green-50) |
| `--secondary-foreground` | `#1A1A17` | Texto nas bolhas |
| `--accent` | `#F59E0B` | Badges, destaques (amber-500) |
| `--accent-foreground` | `#78350F` | Texto sobre accent |
| `--muted` | `#F5F3EE` | Fundo sidebar, áreas neutras |
| `--muted-foreground` | `#78716C` | Texto secundário (stone-500) |
| `--card` | `#FFFFFF` | Cards e surfaces |
| `--card-foreground` | `#1A1A17` | Texto em cards |
| `--border` | `#E7E5DF` | Bordas (warm gray) |
| `--input` | `#E7E5DF` | Borda de inputs |
| `--ring` | `#059669` | Focus ring = primary |
| `--destructive` | `#DC2626` | Erros e ações destrutivas |
| `--destructive-foreground` | `#FFFFFF` | Texto sobre destructive |

### Dark Mode — "Neutral Night"

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `#111111` | Fundo principal |
| `--foreground` | `#E5E7EB` | Texto principal |
| `--primary` | `#10B981` | Primary mais brilhante (emerald-500) |
| `--primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `--secondary` | `#1A2E1F` | Bolhas do assistente (verde-escuro sutil) |
| `--secondary-foreground` | `#D1FAE5` | Texto nas bolhas |
| `--accent` | `#F59E0B` | Badges |
| `--accent-foreground` | `#78350F` | Texto sobre accent |
| `--muted` | `#1A1A1A` | Sidebar, áreas neutras |
| `--muted-foreground` | `#9CA3AF` | Texto secundário |
| `--card` | `#161616` | Cards |
| `--card-foreground` | `#E5E7EB` | Texto em cards |
| `--border` | `rgba(255,255,255,0.08)` | Bordas sutis |
| `--input` | `rgba(255,255,255,0.08)` | Borda de inputs |
| `--ring` | `#10B981` | Focus ring |
| `--destructive` | `#DC2626` | Erros |
| `--destructive-foreground` | `#FFFFFF` | Texto sobre destructive |

### Gradientes

- `--gradient-primary`: `linear-gradient(135deg, #10B981, #059669)` — botões, avatar do mentor
- `--gradient-user`: `linear-gradient(135deg, #059669, #0D9488)` — bolha do usuário

## Tipografia

### Fontes (via next/font/google)

| Uso | Fonte | Pesos | CSS Variable |
|-----|-------|-------|-------------|
| Display | Plus Jakarta Sans | 600, 700, 800 | `--font-display` |
| Body | DM Sans | 400, 500, 600 | `--font-body` |

### Escala Tipográfica

| Nome | Tamanho | Peso | Fonte | Onde |
|------|---------|------|-------|------|
| `heading-xl` | 24px | 800 | Jakarta | Título auth pages |
| `heading-lg` | 20px | 700 | Jakarta | Título settings/profile |
| `heading-md` | 16px | 700 | Jakarta | Nome "Max Impulso" no header |
| `heading-sm` | 14px | 600 | Jakarta | Títulos de seção, sidebar header |
| `body` | 14px | 400 | DM Sans | Mensagens do chat, texto geral |
| `body-medium` | 14px | 500 | DM Sans | Labels, botões |
| `caption` | 12px | 500 | DM Sans | Timestamps, badges, hints |
| `tiny` | 11px | 500 | DM Sans | Metadata mínima |

### Espaçamento (base 4px)

- `xs`: 4px — gap mínimo
- `sm`: 8px — dentro de componentes
- `md`: 12px — entre elementos relacionados
- `lg`: 16px — padding de cards/bolhas
- `xl`: 24px — entre seções
- `2xl`: 32px — margens de página
- `3xl`: 48px — separação de blocos auth

### Border Radius

- `sm`: 8px — inputs, badges
- `md`: 12px — cards, sidebar items
- `lg`: 16px — bolhas de chat
- `xl`: 20px — bolhas maiores
- `full`: 9999px — avatares, botão send

## Chat Interface

### Header

- Altura: 56px (h-14)
- Esquerda: hamburger (mobile) + avatar "M" gradiente (32x32, rounded-xl) + "Max Impulso" em Jakarta 700 cor primary
- Direita: theme toggle + avatar do usuário (dropdown)
- Border-bottom substituído por `box-shadow: 0 1px 0 var(--border)`
- Background: `var(--background)`

### Sidebar

- Background: `var(--muted)`
- Header: botão "Nova conversa" full-width, gradiente primary, ícone Plus, Jakarta 600
- Conversation items:
  - Padding 12px 16px, rounded-xl
  - Hover: bg-background com transição 150ms
  - Ativo: bg-background + borda esquerda 3px primary + font-weight 500
  - Texto: DM Sans 14px, single-line truncado
  - Subtitle: timestamp relativo em caption, cor muted-foreground
- Agrupamento por data: "Hoje", "Ontem", "Esta semana" — labels tiny uppercase muted-foreground

### Message Bubbles

**Assistente:**
- Avatar 32x32 rounded-xl com gradiente primary
- Bolha: bg-secondary, rounded-2xl com rounded-tl-md (canto achatado indica origem)
- Max-width: min(720px, 85%)
- Texto: DM Sans 14px, line-height 1.7, cor foreground
- Bold dentro de mensagens: color primary + font-weight 600
- Headings ###: Jakarta 600 15px, margin-top 16px
- Borda: 1px solid border (light) ou 1px solid rgba(16,185,129,0.1) (dark)

**Usuário:**
- Sem avatar (alinhado à direita)
- Bolha: gradient-user (verde→teal), texto branco
- rounded-2xl com rounded-tr-md (espelhado)
- Max-width: min(480px, 75%) — mais estreita

### Chat Input

- Container: sem border-top, com `box-shadow: 0 -4px 12px rgba(0,0,0,0.03)` (sombra ascendente)
- Textarea: rounded-2xl, border 1.5px, bg-card
  - Focus: border primary + ring primary/20
  - Placeholder: DM Sans 400, muted-foreground
  - Auto-grow: max 5 linhas
- Botão Send: 44x44, rounded-xl, gradiente primary
  - Disabled: opacity 30%
  - Hover: scale 1.05 + shadow-md
  - Transição: 150ms ease

### Empty State

- Avatar grande: 64x64, gradiente primary, "M" em Jakarta 800
- Título: "Olá! Sou o Max Impulso" — Jakarta 800 24px, gradient-primary como text (bg-clip-text)
- Subtítulo: "Seu mentor de negócios" — DM Sans 16px, muted-foreground
- 3 suggestion chips:
  - "Como precificar meu produto?"
  - "Devo me formalizar como MEI?"
  - "Como atrair mais clientes?"
  - Estilo: bg-secondary, border 1px border, rounded-xl, padding 10px 16px
  - Hover: bg-primary/5, border-primary/30
  - Clicáveis — enviam a mensagem direto
  - Staggered fade-in (50ms delay entre cada)

### Streaming & Typing

- Streaming: mesma bolha do assistente. Sem texto: 3 dots bounce. Com texto: cursor `|` pulsante
- Typing indicator: 3 dots bounce (delays 0ms, 150ms, 300ms) dentro de bolha com avatar

## Auth Pages

### Layout Geral

- Fundo: var(--background) com grid de pontos sutil (var(--border) opacidade 40%)
- Card centralizado: max-w-md, bg-card, rounded-2xl, shadow-lg
- Padding interno: 32px

### Branding (acima do card)

- Avatar 48x48 gradiente primary, "M" em Jakarta 800
- "Max Impulso" — Jakarta 700 20px, cor primary
- "Seu mentor de negócios" — DM Sans 14px, muted-foreground
- Gap 24px entre branding e card

### Formulários

- Labels: Jakarta 600 13px, foreground
- Inputs: h-11 (44px), rounded-xl, border 1.5px var(--border)
  - Focus: border primary, ring primary/20
  - Ícone à esquerda (Mail, Lock) em muted-foreground
  - Toggle senha: Eye/EyeOff à direita
- Botão submit: full-width, h-12, rounded-xl, gradiente primary, Jakarta 600
  - Hover: sombra + leve scale
  - Loading: spinner + texto
- Erros: bg-destructive/10, border-destructive/20, rounded-lg, padding 12px, ícone AlertCircle + DM Sans 13px

### Links

- "Esqueci minha senha" — DM Sans 13px, primary, à direita abaixo do campo senha
- "Criar conta" / "Já tem conta?" — abaixo do card, DM Sans 14px, link primary com underline on hover

### Estado de Sucesso

- CheckCircle 48px, cor primary
- Animação: fade-in + scale 0.8→1, 200ms ease-out
- Título: Jakarta 700 20px
- Subtítulo: DM Sans 14px, muted-foreground

## Onboarding

- Layout das auth pages (grid de pontos, card centralizado)
- Card max-w-lg
- Título: "Conte um pouco sobre seu negócio" — Jakarta 700 20px
- Subtítulo: "Isso ajuda o Max a dar dicas mais certeiras. Pode pular se preferir." — DM Sans 14px, muted-foreground
- Campos com ícones à esquerda: User, Briefcase, Clock, DollarSign, Target
- Barra de progresso sutil no topo do card: bg-primary/20 preenchendo bg-primary conforme campos preenchidos
- Dois botões:
  - "Pular" — outline, rounded-xl, h-12
  - "Salvar" — gradiente primary, rounded-xl, h-12

## Profile

- Layout: max-w-lg mx-auto py-8 px-4
- Back: ghost button ArrowLeft + "Voltar" DM Sans 14px
- Título: Jakarta 700 20px
- Card único com campos
- Select "Estágio" com badge colorida:
  - Iniciante: bg-amber-100 text-amber-700
  - Em Crescimento: bg-emerald-100 text-emerald-700
  - Consolidado: bg-blue-100 text-blue-700
- Botão salvar: full-width, gradiente primary, ícone Save

## Settings

- Layout igual Profile
- Seções em cards separados com gap 16px:
  - **Aparência**: ícone Palette em primary. Segmented control para tema (Light | Dark | Sistema)
  - **Segurança**: ícone Shield em primary. Campos de senha
  - **Conta**: borda destructive/20 sutil. Ícone Trash2 em destructive. AlertDialog para confirmação

## Animações

### Transições Globais

- Todos hover/focus: `transition: all 150ms ease`
- Mudança de tema: instantânea (sem transição)

### Chat

- Mensagens novas: fade-in + slide-up 8px, 200ms ease-out
- Suggestion chips: staggered fade-in, 50ms delay entre cada
- Botão send hover: scale(1.05) + shadow-md, 150ms
- Streaming cursor: opacity pulsando 0→1, 1s ease-in-out infinite

### Sidebar

- Items hover: background-color 150ms
- Item ativo borda: slide-in esquerda, 150ms ease-out
- Nova conversa: fade-in + slide-down

### Auth & Forms

- Botão loading: crossfade texto → spinner
- Sucesso: ícone scale(0.8→1) + opacity(0→1), 200ms ease-out
- Erro: shake horizontal 2px 300ms, fade-in mensagem

### Typing Indicator

- 3 dots bounce delays escalonados (0ms, 150ms, 300ms), dentro da bolha com avatar
