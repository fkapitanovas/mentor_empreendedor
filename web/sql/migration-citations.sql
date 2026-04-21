-- Observabilidade do prompt: log de citações (gurus + livros) por mensagem do assistente.
-- Permite iterar a curadoria com base em "o que o Max cita por estágio/setor".
--
-- Executar no SQL Editor do Supabase após migration-web.sql.

create table if not exists public.prompt_citations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  -- snapshot do perfil no momento da citação (o perfil pode mudar depois)
  user_setor text,
  user_estagio text,
  user_faturamento_mensal integer,

  -- citação
  citation_type text not null check (citation_type in ('guru','livro')),
  citation_key text not null,   -- slug canônico: flavio_augusto, pai_rico_pai_pobre
  citation_name text not null,  -- nome exibido: "Flávio Augusto", "Pai Rico, Pai Pobre"
  citation_count integer not null default 1,  -- vezes que apareceu na mesma mensagem

  created_at timestamptz not null default now()
);

create index if not exists idx_citations_user_created
  on public.prompt_citations(user_id, created_at desc);
create index if not exists idx_citations_estagio_type
  on public.prompt_citations(user_estagio, citation_type);
create index if not exists idx_citations_setor_type
  on public.prompt_citations(user_setor, citation_type);
create index if not exists idx_citations_key
  on public.prompt_citations(citation_key, citation_type);
create index if not exists idx_citations_message
  on public.prompt_citations(message_id);

alter table public.prompt_citations enable row level security;

-- Sem policies de SELECT/INSERT para usuários comuns: writes e reads
-- passam pelo service-role via /api/chat e /api/admin/citations.
