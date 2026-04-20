# Handoff — Mentor Empreendedor

## Estado Atual (2026-04-20)

O projeto tem **dois deploys ativos**:
- **Web App (principal)**: Vercel — https://web-theta-ashen-35.vercel.app
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

**Design — "Tropical & Vibrante" (redesign 2026-04-20):**
- Fontes: Plus Jakarta Sans (headings) + DM Sans (body)
- Paleta: emerald (#059669) + amber (#F59E0B), dark mode neutro (#111111)
- Bolhas assimétricas: assistente com canto achatado esquerdo (bg-secondary), usuário com gradiente emerald→teal
- Header 56px, sidebar bg-muted com botão gradiente, active item com borda verde
- Auth pages: dot grid background, ícones nos inputs, botões gradiente
- Settings: segmented theme control (Light | Dark | Sistema)
- Profile: badges coloridos por estágio (amber/green/blue)
- Onboarding: barra de progresso, ícones por campo
- Animações: fade-in + slide-up em mensagens, cursor `|` pulsante no streaming

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
- **Web App**: https://web-theta-ashen-35.vercel.app
- **Admin**: https://web-theta-ashen-35.vercel.app/admin
- **GitHub**: https://github.com/fkapitanovas/mentor_empreendedor
- **Supabase**: https://supabase.com/dashboard/project/wlpglssnqkjsydjylxjj
- **Vercel**: vercel.com (projeto `web`)
- **Resend**: https://resend.com/domains (domínio maximpulso.com.br)
- **Domínio**: maximpulso.com.br (futuro domínio do app)
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
npm run build        # Verificar build local
git add . && git commit && git push origin main
vercel --prod        # Deploy produção
```

### Próximos passos prioritários
1. **Testar emails Resend** — aguardar propagação DNS do maximpulso.com.br, testar confirmação de cadastro + reset de senha
2. **Testar fluxo completo em produção** — registro → email confirmação → onboarding → chat → perfil → dark mode → reset senha
3. **Configurar domínio maximpulso.com.br no Vercel** — DNS A/CNAME, SSL automático
4. **PostHog analytics** — rastrear uso, retenção, funil de conversão
5. **Nichos sub-representados** — pet, alimentação geral, serviços domésticos, artesanato (ver todo.md)

### Decisões técnicas relevantes
- **Design system**: Plus Jakarta Sans + DM Sans, emerald/amber, dark neutro. CSS variables em globals.css, `font-heading` para Jakarta, `font-sans` para DM Sans
- **Admin via env var**: `ADMIN_EMAILS` (comma-separated), sem coluna de role no banco. Validação server-side com service role key para bypassar RLS
- **cleanProfileTags defesa em profundidade**: limpa tags no streaming (parciais), no done event (completas), E ao carregar do DB (loadMessages). Qualquer camada que falhe, outra pega
- **Livros deduplicados**: conteúdo detalhado fica no perfil do guru (conhecimento.ts), livros.ts só tem complementos e livros sem guru dedicado
- **Conflitos explícitos**: 9 regras com prioridade definida (ex: Thiago Nigro para finanças, Érico Rocha para marketing, Kiyosaki para dívidas, Geraldo Rufino para jornada)
- **Email via Resend SMTP**: configurado no Supabase (não no código). Templates customizados via Management API. Domínio maximpulso.com.br. Supabase Site URL deve apontar para o app (não localhost)
