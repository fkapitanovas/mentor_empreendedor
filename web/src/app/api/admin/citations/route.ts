import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

type CitationRow = {
  citation_type: 'guru' | 'livro'
  citation_key: string
  citation_name: string
  citation_count: number
  user_setor: string | null
  user_estagio: string | null
  user_id: string
  created_at: string
}

type RankingItem = {
  type: 'guru' | 'livro'
  key: string
  name: string
  total: number           // soma de citation_count
  mentions: number        // número de mensagens em que apareceu
  uniqueUsers: number     // usuários distintos que viram
  byEstagio: Record<string, number>
  bySetor: Record<string, number>
}

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

export async function GET(request: Request) {
  // 1. Auth
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

  if (!isAdmin(authUser.email)) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), {
      status: 403,
    })
  }

  // 2. Parse filters
  const { searchParams } = new URL(request.url)
  const estagio = searchParams.get('estagio') || undefined
  const setor = searchParams.get('setor') || undefined
  const since = searchParams.get('since') || undefined // ISO date string
  const rawLimit = Number(searchParams.get('limit') ?? '2000')
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(100, rawLimit), 10000)
    : 2000

  // 3. Query com service-role (bypass RLS)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = admin
    .from('prompt_citations')
    .select(
      'citation_type,citation_key,citation_name,citation_count,user_setor,user_estagio,user_id,created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit)

  if (estagio) query = query.eq('user_estagio', estagio)
  if (setor) query = query.eq('user_setor', setor)
  if (since) query = query.gte('created_at', since)

  const { data, error } = await query

  if (error) {
    return new Response(
      JSON.stringify({ error: 'Erro ao buscar citações', detail: error.message }),
      { status: 500 }
    )
  }

  const rows = (data || []) as CitationRow[]

  // 4. Agregar em memória (~2k linhas → barato)
  const buckets = new Map<string, RankingItem>()
  const userSets = new Map<string, Set<string>>()

  for (const r of rows) {
    const bucketKey = `${r.citation_type}:${r.citation_key}`
    let b = buckets.get(bucketKey)
    if (!b) {
      b = {
        type: r.citation_type,
        key: r.citation_key,
        name: r.citation_name,
        total: 0,
        mentions: 0,
        uniqueUsers: 0,
        byEstagio: {},
        bySetor: {},
      }
      buckets.set(bucketKey, b)
      userSets.set(bucketKey, new Set())
    }
    b.total += r.citation_count
    b.mentions += 1
    userSets.get(bucketKey)!.add(r.user_id)

    const estKey = r.user_estagio || '(sem perfil)'
    b.byEstagio[estKey] = (b.byEstagio[estKey] || 0) + r.citation_count

    const setKey = r.user_setor || '(sem perfil)'
    b.bySetor[setKey] = (b.bySetor[setKey] || 0) + r.citation_count
  }

  for (const [k, set] of userSets.entries()) {
    const b = buckets.get(k)
    if (b) b.uniqueUsers = set.size
  }

  const items = Array.from(buckets.values()).sort((a, b) => b.total - a.total)
  const gurus = items.filter((i) => i.type === 'guru')
  const livros = items.filter((i) => i.type === 'livro')

  return Response.json({
    filters: { estagio, setor, since, limit },
    sampleSize: rows.length,
    gurus,
    livros,
  })
}
