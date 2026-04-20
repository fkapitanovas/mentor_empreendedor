# Admin Export — Design Spec

**Data**: 2026-04-20
**Projeto**: Mentor Empreendedor (web app)
**Escopo**: Página admin protegida por email com listagem e exportação CSV de perfis de empreendedores

## Identificação de Admin

- Env var `ADMIN_EMAILS` (comma-separated, ex: `fkapitanovas@gmail.com`)
- Checada server-side no API route via `SUPABASE_SERVICE_ROLE_KEY`
- Sem coluna de role no banco — zero migrations

## API Route: `GET /api/admin/users`

- Valida auth: `supabase.auth.getUser()`
- Checa se `user.email` está em `process.env.ADMIN_EMAILS` (split por vírgula, trim)
- Se não for admin: retorna 403 `{ error: "Acesso negado" }`
- Usa Supabase client com service role key para bypassar RLS
- Query: `SELECT * FROM users ORDER BY created_at DESC`
- Query param `?format=csv`:
  - Se presente: retorna CSV com `Content-Type: text/csv` e `Content-Disposition: attachment; filename=usuarios-YYYY-MM-DD.csv`
  - Se ausente: retorna JSON array

**Colunas exportadas (CSV):**
- email
- name (Nome)
- setor (Setor)
- estagio (Estágio)
- tempo_negocio (Tempo de Negócio)
- faturamento (Faturamento)
- faturamento_mensal (Faturamento Mensal)
- desafio_principal (Desafio Principal)
- is_onboarded (Onboarded)
- created_at (Cadastro)

**Header do CSV:** nomes legíveis em português (ex: "Nome", "Setor", não nomes de coluna raw)

## Página `/admin`

Client component (`'use client'`).

**Layout:**
- `max-w-5xl mx-auto px-4 py-8`
- Back button: "Voltar ao chat" (link para `/`)
- Título: "Painel Admin" em font-heading
- Contagem de usuários: "X empreendedores cadastrados"

**Tabela:**
- Colunas: Nome, Email, Setor, Estágio, Faturamento, Desafio, Cadastro
- Scroll horizontal em mobile (`overflow-x-auto`)
- Rows alternados com bg sutil
- Badge colorida para estágio (mesmas cores do profile: amber/emerald/blue)
- Data formatada: `dd/mm/yyyy`

**Botão Export:**
- "Exportar CSV" com ícone Download
- Gradiente emerald (consistente com o design system)
- `onClick: window.location.href = '/api/admin/users?format=csv'`

**Estado de loading:** skeleton da tabela enquanto carrega

**Acesso negado:**
- Se API retorna 403, mostra mensagem "Acesso restrito a administradores"
- Link "Voltar ao chat"

## Segurança

- Admin validado server-side (API route), nunca no client
- Service role key usada apenas no server (env var `SUPABASE_SERVICE_ROLE_KEY`)
- Rota `/admin` é acessível a qualquer usuário autenticado, mas só mostra dados se for admin
- Middleware não precisa de mudança — trata `/admin` como rota autenticada normal
