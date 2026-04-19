import type { User } from '@/types/database'
import { IDENTIDADE_E_TOM } from './identidade'
import { BASE_CONHECIMENTO } from './conhecimento'
import { BASE_LIVROS } from './livros'
import { REGRAS_INTERACAO } from './regras'
import { PERSONALIZACAO_ESTAGIO } from './personalizacao'
import { RESOLUCAO_CONFLITOS } from './conflitos'
import { REFERENCIAS_NICHO } from './nichos'
import { BASE_INSTITUCIONAL } from './institucional'
import { BASE_IMPULSO_STONE } from './impulso-stone'
import { INSTRUCOES_DIAGNOSTICO } from './diagnostico'
import { INSTRUCOES_ATUALIZACAO_PERFIL } from './atualizacao-perfil'

export function buildSystemPrompt(user: User | null, summary?: string | null): string {
  const blocks: string[] = [
    IDENTIDADE_E_TOM,
    BASE_CONHECIMENTO,
    BASE_LIVROS,
    REGRAS_INTERACAO,
    PERSONALIZACAO_ESTAGIO,
    RESOLUCAO_CONFLITOS,
    REFERENCIAS_NICHO,
    BASE_INSTITUCIONAL,
    BASE_IMPULSO_STONE,
  ]

  if (user?.is_onboarded) {
    const contexto = `CONTEXTO DO USUARIO ATUAL:
- Nome: ${user.name || 'empreendedor'}
- Setor: ${user.setor || 'nao informado'}
- Estagio: ${user.estagio || 'iniciante'}
- Tempo de negocio: ${user.tempo_negocio || 'nao informado'}
- Faturamento: ${user.faturamento || 'nao informado'}
- Desafio principal: ${user.desafio_principal || 'nao informado'}

O usuario ja completou o diagnostico. Personalize suas respostas para o estagio "${user.estagio || 'iniciante'}" e o setor "${user.setor || 'nao informado'}".`
    blocks.push(contexto)
    blocks.push(INSTRUCOES_ATUALIZACAO_PERFIL)
  } else {
    blocks.push(INSTRUCOES_DIAGNOSTICO)
  }

  if (summary) {
    blocks.push(`HISTORICO RESUMIDO DAS CONVERSAS ANTERIORES:
${summary}

Use este historico para dar continuidade ao acompanhamento. NAO repita conselhos ja dados. Acompanhe o progresso do usuario e retome pendencias quando relevante.`)
  }

  return blocks.join('\n\n---\n\n')
}
