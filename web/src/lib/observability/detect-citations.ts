import { GURUS, LIVROS, type CitationEntry } from './citations-catalog'

export type DetectedCitation = {
  type: 'guru' | 'livro'
  key: string
  name: string
  count: number
}

function countMatches(text: string, patterns: RegExp[]): number {
  let count = 0
  for (const p of patterns) {
    // Garantir global flag para contar todas as ocorrências sem reescrever o catálogo
    const global = p.flags.includes('g') ? p : new RegExp(p.source, p.flags + 'g')
    const matches = text.match(global)
    if (matches) count += matches.length
  }
  return count
}

function detectGroup(
  text: string,
  entries: CitationEntry[],
  type: 'guru' | 'livro'
): DetectedCitation[] {
  const out: DetectedCitation[] = []
  for (const entry of entries) {
    const count = countMatches(text, entry.patterns)
    if (count > 0) {
      out.push({ type, key: entry.key, name: entry.name, count })
    }
  }
  return out
}

/**
 * Detecta citações de gurus e livros no texto (normalmente a resposta do
 * assistente). Retorna 1 entrada por citation_key com o total de ocorrências.
 *
 * Nota: o texto deve ser o resultado de cleanResponse() — sem tags
 * [PERFIL_EXTRAIDO] / [PERFIL_ATUALIZADO].
 */
export function detectCitations(text: string): DetectedCitation[] {
  if (!text || text.length === 0) return []
  return [
    ...detectGroup(text, GURUS, 'guru'),
    ...detectGroup(text, LIVROS, 'livro'),
  ]
}
