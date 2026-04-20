import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { User } from '@/types/database'

const CSV_HEADERS: Record<string, string> = {
  email: 'Email',
  name: 'Nome',
  setor: 'Setor',
  estagio: 'Estágio',
  tempo_negocio: 'Tempo de Negócio',
  faturamento: 'Faturamento',
  faturamento_mensal: 'Faturamento Mensal',
  desafio_principal: 'Desafio Principal',
  is_onboarded: 'Onboarded',
  created_at: 'Cadastro',
}

const CSV_COLUMNS = Object.keys(CSV_HEADERS) as (keyof User)[]

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function usersToCsv(users: User[]): string {
  const header = CSV_COLUMNS.map((col) => CSV_HEADERS[col]).join(',')
  const rows = users.map((user) =>
    CSV_COLUMNS.map((col) => escapeCsv(user[col])).join(',')
  )
  return [header, ...rows].join('\n')
}

export async function GET(request: Request) {
  // 1. Validate auth
  const supabase = await createServerClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return new Response(JSON.stringify({ error: 'Nao autorizado' }), {
      status: 401,
    })
  }

  // 2. Check admin
  if (!isAdmin(authUser.email)) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), {
      status: 403,
    })
  }

  // 3. Query all users with service role (bypasses RLS)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: users, error: queryError } = await adminClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (queryError) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar usuarios' }), {
      status: 500,
    })
  }

  // 4. Return CSV or JSON
  const { searchParams } = new URL(request.url)

  if (searchParams.get('format') === 'csv') {
    const today = new Date().toISOString().slice(0, 10)
    return new Response(usersToCsv(users as User[]), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=usuarios-${today}.csv`,
      },
    })
  }

  return Response.json(users)
}
