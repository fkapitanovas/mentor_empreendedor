# Handoff — Mentor Empreendedor

## Estado Atual (2026-04-21)

O projeto tem **dois deploys ativos**:
- **Web App (principal)**: Vercel — https://maximpulso.com.br (DNS propagado, SSL ativo)
- **WhatsApp Chatbot (legado)**: Railway — deprioritizado

### O que está funcionando — Web App

**Chat:**
- Chat com streaming SSE (Claude Sonnet 4.6 → ReadableStream)
- Múltiplas conversas com sidebar, título auto-gerado via Haiku
- System prompt modular (14 blocos): 12 gurus, 22 livros, 9 regras de conflito, formalização MEI, e-commerce, ferramentas práticas, referências por nicho
- Diagnóstico via conversa (onboarding orgânico via tags `[PERFIL_EXTRAIDO]`/`[PERFIL_ATUALIZADO]`)
- Tags limpas no client (useChat) + ao carregar do DB (defesa em profundidade)
- Memória de longo prazo: resumos a cada 20 mensagens
- Contexto: 100 últimas msgs + resumo comprimido
- Suggestion chips no empty state (3 perguntas clicáveis)

**Design — "Tropical Maximalista" (redesign 2026-04-21, direção B aprovada):**
- Fontes: **Bricolage Grotesque** (display variável) + **IBM Plex Sans** (body)
- Paleta: **jungle `#0F3E2A` + coral `#F87171` + sol `#FCD34D` + creme `#FFF8E7`**; dark mode `#0A1A12`
- Tokens nomeados em `globals.css`: `--ink`, `--coral`, `--sun`, `--cream`, `--jungle`
- Gradientes tokenizados: `--gradient-brand` (verde→jungle), `--gradient-brand-strong` (coral→sol), `--gradient-brand-text`, `--gradient-tropical`
- **Hard shadows signature**: `.shadow-hard-sm/md/lg` (solid, sem blur — 4/6/10px offset)
- **Gradient mesh animado**: `.tropical-mesh` (drift 24s) nos fundos de auth e onboarding
- **Grain overlay global** via `body::after` (SVG turbulence + mix-blend-mode overlay, 55% light / 35% dark)
- Cards: `border: 3px ink` + `rounded-3xl` + `shadow-hard-lg` + shapes decorativos (círculo coral `-top-3 -left-3` + quadrado amarelo `rotate-12` bottom-right)
- Brand badge rotacionado `-2deg`: pill `bg-primary` com M amarela em círculo + "MAX IMPULSO" uppercase tracking-widest
- Bolhas do chat: assistant bordada 2px ink + bg-card + avatar sol bordado; user bg-coral text-cream border ink
- Empty state: "Oi 👋🏽 Sou o Max." (Bricolage extrabold + emoji com animate-wave + stroke-outline italic)
- Chips de sugestão rotacionados (sun / coral / primary), stagger 80ms, hover rotaciona para 0
- Auth: títulos com ênfase em gradient coral→sol ("bora", "Em 30 segundos.", "Calma.", "senha forte.")
- Password strength: 5 barras coral/sol/emerald (tokens)
- Theme toggle: ícone dinâmico (Sun/Moon/Monitor conforme `theme`), `mounted` pattern p/ hydration

**Acessibilidade (auditoria 2026-04-21):**
- WCAG AA: contraste `--muted-foreground 5.5:1`; `aria-live="polite"` streaming; `role="log"` no chat
- Skip-link visible-on-focus para `#main-content`; landmarks `banner/navigation/main`
- `aria-current="page"` nas conversas ativas; `role="listitem"` nos items
- Stop-streaming com AbortController; retry inline em erros; auto-scroll inteligente com `shouldStickRef`
- `autoComplete` e `inputMode` em todos inputs; `reduced-motion` respeitado globalmente
- PWA: manifest.webmanifest + ícones 192/512/maskable + apple-icon + opengraph-image (next/og)

**Auth:**
- Email + senha (Supabase Auth)
- Esqueci senha, redefinir senha, confirmação de email
- Auth callback: /auth/callback troca code por session
- Toggle de senha em todos os campos

**Admin:**
- Página `/admin` com tabela de perfis de empreendedores
- Exportação CSV via `/api/admin/users?format=csv`
- Protegido por `ADMIN_EMAILS` env var (validação server-side)
- Admins: fkapitanovas@gmail.com, fabio.kapitanovas@me.com

**Email (Resend via SMTP):**
- Provedor: Resend (smtp.resend.com:465, user: resend)
- Sender: `Max Impulso <noreply@maximpulso.com.br>`
- Domínio: maximpulso.com.br (registrado, DNS em propagação — verificar em resend.com/domains)
- Configurado no Supabase Dashboard → Auth → SMTP Settings (via Management API)
- Email confirmation habilitado (mailer_autoconfirm: false)
- Templates pt-BR com branding Max Impulso (logo verde, botão emerald, fundo off-white)
- Subjects: "Confirme seu cadastro no Max Impulso", "Redefinir sua senha — Max Impulso"
- Tela de registro mostra email para o qual foi enviado + instrução de verificar spam

**Conteúdo do System Prompt (14 blocos):**
1. Identidade e Tom
2. Base de Conhecimento (12 gurus: Marcus Marques, Flávio Augusto, Thiago Oliveira, Thiago Nigro, Nathalia Arcuri, Gustavo Cerbasi, Rodrigo Almeida, Érico Rocha, Conrado Adolpho, Pedro Sobral, Joel Jota, Geraldo Rufino, Ana Fontes)
3. Base de Livros (22 livros incl. Lucro Primeiro — deduplicada vs perfis de gurus)
4. Regras de Interação
5. Personalização por Estágio
6. Resolução de Conflitos (9 tensões documentadas)
7. Referências Nichadas (confeitaria 4 refs, beleza 5 refs, marketing, finanças populares, moda, gastronomia, MEI geral)
8. Base Institucional
9. Base Impulso Stone
10. Formalização MEI (DAS 2026, obrigações, migração ME, reforma tributária)
11. E-commerce (Mercado Livre, Shopee, Amazon, Instagram Shopping, WhatsApp Business, logística)
12. Ferramentas Práticas (financeiro, CRM, design, pagamentos, IA — escalonadas por faturamento)
13. Diagnóstico/Atualização de Perfil (dinâmico)
14. Contexto do Usuário + Histórico Resumido (dinâmico)

### Tabelas no Supabase
- `users` — perfil do empreendedor (email, name, setor, estagio, faturamento, etc.)
- `conversations` — conversas com FK para users
- `messages` — histórico (role: user/assistant, conversation_id)
- `conversation_summaries` — resumos comprimidos por conversa

### URLs e Acessos
- **Web App (prod)**: https://maximpulso.com.br
- **Admin**: https://maximpulso.com.br/admin
- **URL Vercel original**: https://web-theta-ashen-35.vercel.app (ainda ativa como alias)
- **GitHub**: https://github.com/fkapitanovas/mentor_empreendedor
- **Supabase**: https://supabase.com/dashboard/project/wlpglssnqkjsydjylxjj
- **Vercel**: vercel.com (projeto `web` no team fabio-kapitanovas-projects)
- **Resend**: https://resend.com/domains (domínio maximpulso.com.br verificado)
- **WhatsApp (legado)**: https://faithful-intuition-production-82bb.up.railway.app

### Env Vars (Vercel — production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `ADMIN_EMAILS` — fkapitanovas@gmail.com,fabio.kapitanovas@me.com

### Como fazer deploy
```bash
cd web
npm run lint && npx tsc --noEmit && npm run build   # Verificar build local
git add . && git commit -m "..." && git push origin main
vercel --prod --yes                                  # Deploy produção (do dir web/)
```

> **Nota:** o push direto para `main` pode ser bloqueado pelo Auto Mode classifier — nesse caso rodar o `git push` manualmente.

### Commits relevantes (2026-04-21)
- `0debe65` — 31 achados da 1ª auditoria UI/UX/Performance implementados (5 fases, WCAG AA, PWA, etc.)
- `d6e2228` — 6 achados de polimento da 2ª auditoria (autoComplete, inputMode, metadata por página, toast quota, lazy AlertDialog)
- `55af1a9` — Redesign Tropical Maximalista (direção B): Bricolage + IBM Plex, paleta jungle/coral/sol/creme, hard shadows, gradient mesh, grain
- `619f5ad` — Heading contextual no /login: "Bora empreender." (primeira vez) vs "Volta aí, bora crescer." (retornando) via flag em localStorage
- `9f0a8dd` — Atalhos FAB de scroll no chat (↑↓ no canto inferior direito quando conversa tem 4+ mensagens). Funcionando em mobile + desktop após 4 iterações de debug de Tailwind v4 + safe-area.
- `d1c2bbb` — `.vercelignore` na raiz (guard parcial contra deploys acidentais fora de `web/`)

### Próximos passos prioritários
1. **PostHog analytics** — rastrear uso, retenção, funil de conversão
2. **Nichos sub-representados** — pet, alimentação geral, serviços domésticos, artesanato (ver todo.md)
3. **Service Worker opcional** — PWA fase 2 (offline chat cacheable, install prompt ativo)
4. **Gaps de conteúdo do prompt** — jurídico/compliance, saúde mental/burnout, métricas CAC/LTV

### Decisões técnicas relevantes
- **Design system "Tropical"**: tudo via CSS tokens em `globals.css`. Cores nomeadas `--ink --coral --sun --cream --jungle`. Gradientes tokenizados. Hard shadows canônicos. Nunca hardcodar `emerald-X` / `amber-X` fora de globals.
- **Auditoria em fases**: skill `ui-ux-pro-max` para correção (WCAG, performance, forms) + skill `frontend-design` para caráter/identidade visual.
- **Admin via env var**: `ADMIN_EMAILS` (comma-separated), sem coluna de role no banco. Validação server-side com service role key para bypassar RLS.
- **cleanProfileTags defesa em profundidade**: limpa tags no streaming (parciais), no done event (completas), E ao carregar do DB (loadMessages). Qualquer camada que falhe, outra pega.
- **Livros deduplicados**: conteúdo detalhado fica no perfil do guru (conhecimento.ts), livros.ts só tem complementos e livros sem guru dedicado.
- **Conflitos explícitos**: 9 regras com prioridade definida (ex: Thiago Nigro para finanças, Érico Rocha para marketing, Kiyosaki para dívidas, Geraldo Rufino para jornada).
- **Email via Resend SMTP**: configurado no Supabase (não no código). Templates customizados via Management API. Domínio maximpulso.com.br. Supabase Site URL deve apontar para `https://maximpulso.com.br`.
- **Scroll auto-stick no chat**: listener nativo passive no viewport do base-ui scroll-area + `shouldStickRef` com threshold 80px. Evita forçar scroll quando usuário rolou para cima durante streaming.
- **AlertDialog lazy-loaded**: `DeleteConversationDialog` em arquivo separado, importado via `next/dynamic({ ssr: false, loading: () => null })` para tirar Radix AlertDialog primitives do bundle inicial do chat.
- **Fontes via `next/font/google`**: Bricolage Grotesque (weights 500/600/700/800) + IBM Plex Sans (400/500/600/700). Nunca importar via `<link>` — sempre `next/font` para otimização automática.
- **Middleware matcher expandido**: exclui `manifest.webmanifest|icon|apple-icon|opengraph-image|*.png|svg|...` para que assets PWA não sejam redirecionados para `/login`.
- **Heading contextual no /login**: flag `max-has-logged-in` em localStorage, setada após `signInWithPassword` OK. Default em modo privado / primeira visita: "Bora empreender."; retornando: "Volta aí, bora crescer.". Diferenciação só client-side (sem cookie/header porque a página é 'use client').
- **FABs de scroll no chat**: posicionados com **inline style** `{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }`, NÃO via arbitrary Tailwind — JIT v4 escapa vírgulas dentro de calc() inconsistente no mobile. `fixed inset-x-0 flex justify-end px-3` com `z-[60]` para escapar stacking contexts. Ações via `scrollIntoView` em refs (topRef + bottomRef) — não depende de detectar viewport do base-ui ScrollArea.
- **Deploy Vercel guard**: `.vercelignore` na raiz mitiga deploys acidentais (antes criavam projeto duplicado `mentor_empreendedor`). SEMPRE rodar deploy com `cd web && vercel --prod --yes` em linha única.
