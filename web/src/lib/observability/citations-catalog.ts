/**
 * Catálogo canônico de gurus e livros da base de conhecimento do Max Impulso.
 * Cada entry define o key (slug para agregação), name (display), e patterns de
 * detecção. Atualizar aqui quando adicionar/remover guru ou livro no prompt.
 *
 * Regras de pattern:
 * - Usar apenas tokens de baixo risco de falso positivo. Nomes únicos como
 *   "Cerbasi" ou "Rufino" podem ir sozinhos; nomes comuns (Rodrigo, Marcus)
 *   precisam do sobrenome.
 * - Títulos de livro entram com o título completo; aliases só quando são
 *   inequívocos (ex: "Start with Why" para "Comece pelo Porquê").
 * - Palavras que também são conceitos genéricos em português (Mindset,
 *   Rework, Essencialismo) aparecem ligadas ao autor quando possível — OU
 *   exigem capitalização distintiva (ver detect-citations.ts).
 */

export type CitationEntry = {
  key: string
  name: string
  patterns: RegExp[]
}

// ============================================================================
// GURUS (13 — alinhados com BASE_CONHECIMENTO)
// ============================================================================

export const GURUS: CitationEntry[] = [
  {
    key: 'marcus_marques',
    name: 'Marcus Marques',
    patterns: [/\bmarcus\s+marques\b/i],
  },
  {
    key: 'thiago_oliveira',
    name: 'Thiago Oliveira',
    patterns: [/\bthiago\s+oliveira\b/i],
  },
  {
    key: 'flavio_augusto',
    name: 'Flávio Augusto',
    patterns: [/\bfl[aá]vio\s+augusto\b/i],
  },
  {
    key: 'thiago_nigro',
    name: 'Thiago Nigro',
    patterns: [/\bthiago\s+nigro\b/i, /\bprimo\s+rico\b/i],
  },
  {
    key: 'nathalia_arcuri',
    name: 'Nathalia Arcuri',
    patterns: [/\bnath[aá]lia\s+arcuri\b/i, /\barcuri\b/i, /\bme\s+poupe\b/i],
  },
  {
    key: 'gustavo_cerbasi',
    name: 'Gustavo Cerbasi',
    patterns: [/\bgustavo\s+cerbasi\b/i, /\bcerbasi\b/i],
  },
  {
    key: 'rodrigo_almeida',
    name: 'Rodrigo Almeida',
    patterns: [/\brodrigo\s+almeida\b/i, /\bm[aá]quina\s+de\s+lucro\b/i],
  },
  {
    key: 'erico_rocha',
    name: 'Érico Rocha',
    patterns: [/\b[eé]rico\s+rocha\b/i],
  },
  {
    key: 'conrado_adolpho',
    name: 'Conrado Adolpho',
    patterns: [/\bconrado\s+adolpho\b/i, /\bconrado\b/i],
  },
  {
    key: 'pedro_sobral',
    name: 'Pedro Sobral',
    patterns: [/\bpedro\s+sobral\b/i],
  },
  {
    key: 'joel_jota',
    name: 'Joel Jota',
    patterns: [/\bjoel\s+jota\b/i],
  },
  {
    key: 'geraldo_rufino',
    name: 'Geraldo Rufino',
    patterns: [/\bgeraldo\s+rufino\b/i, /\brufino\b/i],
  },
  {
    key: 'ana_fontes',
    name: 'Ana Fontes',
    patterns: [
      /\bana\s+fontes\b/i,
      /\brede\s+mulher\s+empreendedora\b/i,
      /\bIRME\b/,
    ],
  },
]

// ============================================================================
// LIVROS (23 — alinhados com BASE_LIVROS; contagem v1.2 de 21/04/2026)
// ============================================================================

export const LIVROS: CitationEntry[] = [
  {
    key: 'geracao_de_valor',
    name: 'Geração de Valor (trilogia)',
    patterns: [/\bgera[cç][aã]o\s+de\s+valor\b/i],
  },
  {
    key: 'o_mito_do_empreendedor',
    name: 'O Mito do Empreendedor',
    patterns: [/\bmito\s+do\s+empreendedor\b/i, /\bE-Myth\b/i],
  },
  {
    key: 'empresas_feitas_para_vencer',
    name: 'Empresas Feitas para Vencer',
    patterns: [
      /\bempresas\s+feitas\s+para\s+vencer\b/i,
      /\bGood\s+to\s+Great\b/i,
    ],
  },
  {
    key: 'seja_foda',
    name: 'Seja Foda!',
    patterns: [/\bseja\s+foda\b/i],
  },
  {
    key: 'negocios_assunto_de_mulheres',
    name: 'Negócios: Um Assunto de Mulheres',
    patterns: [/\bneg[oó]cios[: ]+um\s+assunto\s+de\s+mulheres\b/i],
  },
  {
    key: 'mindset_dweck',
    name: 'Mindset (Carol Dweck)',
    // "Mindset" sozinho é palavra genérica; exige Dweck ou título completo
    patterns: [
      /\bmindset\b[^\n]{0,60}\bdweck\b/i,
      /\bdweck\b[^\n]{0,60}\bmindset\b/i,
      /\bmindset\s*[-—–]\s*a\s+nova\s+psicologia\b/i,
      /\bcarol\s+dweck\b/i,
    ],
  },
  {
    key: 'obsessao_pelo_cliente',
    name: 'Obsessão pelo Cliente (Working Backwards)',
    patterns: [
      /\bobsess[aã]o\s+pelo\s+cliente\b/i,
      /\bworking\s+backwards\b/i,
    ],
  },
  {
    key: 'do_mil_ao_milhao',
    name: 'Do Mil ao Milhão',
    patterns: [/\bdo\s+mil\s+ao\s+milh[aã]o\b/i],
  },
  {
    key: 'me_poupe',
    name: 'Me Poupe!',
    patterns: [/\bme\s+poupe\b/i],
  },
  {
    key: 'casais_inteligentes',
    name: 'Casais Inteligentes Enriquecem Juntos',
    patterns: [/\bcasais\s+inteligentes\b/i],
  },
  {
    key: 'lucro_primeiro',
    name: 'Lucro Primeiro',
    patterns: [/\blucro\s+primeiro\b/i, /\bProfit\s+First\b/i],
  },
  {
    key: 'pai_rico_pai_pobre',
    name: 'Pai Rico, Pai Pobre',
    patterns: [/\bpai\s+rico[, ]+pai\s+pobre\b/i, /\bRich\s+Dad\b/i],
  },
  {
    key: '8ps_marketing_digital',
    name: '8Ps do Marketing Digital',
    patterns: [/\b8\s*ps\s+do\s+marketing\s+digital\b/i],
  },
  {
    key: 'bora_vender',
    name: 'Bora Vender',
    patterns: [/\bbora\s+vender\b/i],
  },
  {
    key: 'comece_pelo_porque',
    name: 'Comece pelo Porquê',
    patterns: [/\bcomece\s+pelo\s+por\s*qu[eê]\b/i, /\bStart\s+with\s+Why\b/i],
  },
  {
    key: 'como_fazer_amigos',
    name: 'Como Fazer Amigos e Influenciar Pessoas',
    patterns: [
      /\bcomo\s+fazer\s+amigos\s+e\s+influenciar\s+pessoas\b/i,
      /\bdale\s+carnegie\b/i,
    ],
  },
  {
    key: 'pense_dentro_da_caixa',
    name: 'Pense Dentro da Caixa / Gestão Ágil',
    patterns: [
      /\bpense\s+dentro\s+da\s+caixa\b/i,
      /\bsegredo\s+da\s+gest[aã]o\s+[aá]gil\b/i,
    ],
  },
  {
    key: 'startup_enxuta',
    name: 'A Startup Enxuta',
    patterns: [/\b(a\s+)?startup\s+enxuta\b/i, /\bLean\s+Startup\b/i],
  },
  {
    key: 'rework',
    name: 'Rework',
    // "Rework" sozinho pode ser confundido com verbo em inglês; exige Fried ou contexto
    patterns: [
      /\bjason\s+fried\b/i,
      /\blivro\s+rework\b/i,
      /\bRework\s*\(Jason\b/i,
    ],
  },
  {
    key: 'inovacao_modelos_negocios',
    name: 'Inovação em Modelos de Negócios',
    patterns: [
      /\binova[cç][aã]o\s+em\s+modelos\s+de\s+neg[oó]cios\b/i,
      /\bgustavo\s+caetano\b/i,
    ],
  },
  {
    key: 'poder_do_habito',
    name: 'O Poder do Hábito',
    patterns: [/\bpoder\s+do\s+h[aá]bito\b/i, /\bcharles\s+duhigg\b/i],
  },
  {
    key: 'essencialismo',
    name: 'Essencialismo',
    // Word é rara o suficiente em PT para não gerar falso positivo relevante
    patterns: [/\bessencialismo\b/i, /\bgreg\s+mckeown\b/i],
  },
  {
    key: 'catador_de_sonhos',
    name: 'O Catador de Sonhos / Poder da Positividade',
    patterns: [
      /\bcatador\s+de\s+sonhos\b/i,
      /\bpoder\s+da\s+positividade\b/i,
    ],
  },
]
