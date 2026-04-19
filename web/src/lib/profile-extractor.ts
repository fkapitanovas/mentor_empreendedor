/**
 * Profile extraction and parsing utilities.
 * Ported from Python: app/services/mentor.py
 */

/**
 * Extracts profile data from the [PERFIL_EXTRAIDO] tag in Claude's response.
 */
export function extractProfile(text: string): Record<string, unknown> | null {
  const match = text.match(/\[PERFIL_EXTRAIDO\]([\s\S]*?)\[\/PERFIL_EXTRAIDO\]/)
  if (!match) {
    return null
  }

  try {
    const data = JSON.parse(match[1]) as Record<string, unknown>
    const filtered: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== null) {
        filtered[k] = v
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : null
  } catch {
    return null
  }
}

/**
 * Extracts profile update data from the [PERFIL_ATUALIZADO] tag in Claude's response.
 */
export function extractProfileUpdate(text: string): Record<string, unknown> | null {
  const match = text.match(/\[PERFIL_ATUALIZADO\]([\s\S]*?)\[\/PERFIL_ATUALIZADO\]/)
  if (!match) {
    return null
  }

  try {
    const data = JSON.parse(match[1]) as Record<string, unknown>
    const filtered: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(data)) {
      if (v !== null) {
        filtered[k] = v
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : null
  } catch {
    return null
  }
}

/**
 * Converts text describing business duration to integer months.
 *
 * Examples: "2 anos" -> 24, "6 meses" -> 6, "1 ano e meio" -> 18
 */
export function parseTempoMeses(texto: string): number | null {
  if (!texto) {
    return null
  }
  const lower = texto.toLowerCase().trim()

  let meses = 0
  let found = false

  // Busca anos
  const matchAnos = lower.match(/(\d+)\s*anos?/)
  if (matchAnos) {
    meses += parseInt(matchAnos[1], 10) * 12
    found = true
  }

  // Busca meses
  const matchMeses = lower.match(/(\d+)\s*mes(?:es)?/)
  if (matchMeses) {
    meses += parseInt(matchMeses[1], 10)
    found = true
  }

  // "meio" ou "1/2" adiciona 6 meses
  if (lower.includes('meio') || lower.includes('1/2')) {
    meses += 6
    found = true
  }

  return found ? meses : null
}

/**
 * Converts revenue text to monthly integer value in BRL.
 *
 * Examples: "R$ 10.000/mes" -> 10000, "5mil" -> 5000, "15k" -> 15000
 */
export function parseFaturamento(texto: string): number | null {
  if (!texto) {
    return null
  }
  let lower = texto.toLowerCase().trim()

  // Remove prefixos monetarios e espacos
  lower = lower.replace(/r\$\s*/g, '')
  lower = lower.replace(/\/m[eê]s/g, '')
  lower = lower.replace(/\s+/g, '')

  // Tenta formato com 'mil' ou 'k'
  const matchMil = lower.match(/([\d.,]+)\s*(?:mil|k)/)
  if (matchMil) {
    const valorStr = matchMil[1].replace(/\./g, '').replace(',', '.')
    const valor = parseFloat(valorStr) * 1000
    if (!isNaN(valor)) {
      return Math.floor(valor)
    }
    return null
  }

  // Tenta formato numerico direto (ex: 10.000,00)
  const matchDecimal = lower.match(/([\d.]+),(\d{2})$/)
  if (matchDecimal) {
    const valorStr = matchDecimal[1].replace(/\./g, '') + '.' + matchDecimal[2]
    const valor = parseFloat(valorStr)
    if (!isNaN(valor)) {
      return Math.floor(valor)
    }
    return null
  }

  // Tenta formato numerico simples (ex: 10.000 ou 10000)
  const matchNum = lower.match(/([\d.]+)/)
  if (matchNum) {
    const valorStr = matchNum[1].replace(/\./g, '')
    const valor = parseInt(valorStr, 10)
    if (!isNaN(valor) && valor > 0) {
      return valor
    }
    return null
  }

  return null
}

/**
 * Removes both profile tag patterns from the visible text.
 */
export function cleanResponse(text: string): string {
  let clean = text.replace(/\[PERFIL_EXTRAIDO\][\s\S]*?\[\/PERFIL_EXTRAIDO\]/g, '')
  clean = clean.replace(/\[PERFIL_ATUALIZADO\][\s\S]*?\[\/PERFIL_ATUALIZADO\]/g, '')
  return clean.trim()
}

/**
 * Adds standardized integer fields to a profile dict by parsing text fields.
 */
export function standardizeProfileFields(
  data: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data }

  // Parsear tempo_negocio -> tempo_negocio_meses
  if (data.tempo_negocio && typeof data.tempo_negocio === 'string') {
    const meses = parseTempoMeses(data.tempo_negocio)
    if (meses !== null) {
      result.tempo_negocio_meses = meses
    }
  }

  // Parsear faturamento -> faturamento_mensal
  if (data.faturamento && typeof data.faturamento === 'string') {
    const valor = parseFaturamento(data.faturamento)
    if (valor !== null) {
      result.faturamento_mensal = valor
    }
  }

  // Se Claude ja enviou os campos inteiros diretamente, manter
  if (
    'tempo_negocio_meses' in data &&
    data.tempo_negocio_meses !== null &&
    data.tempo_negocio_meses !== undefined
  ) {
    result.tempo_negocio_meses = data.tempo_negocio_meses
  }
  if (
    'faturamento_mensal' in data &&
    data.faturamento_mensal !== null &&
    data.faturamento_mensal !== undefined
  ) {
    result.faturamento_mensal = data.faturamento_mensal
  }

  return result
}
