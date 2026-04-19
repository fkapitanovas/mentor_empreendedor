export interface User {
  id: string
  email: string | null
  name: string | null
  setor: string | null
  estagio: string | null
  tempo_negocio: string | null
  faturamento: string | null
  tempo_negocio_meses: number | null
  faturamento_mensal: number | null
  desafio_principal: string | null
  is_onboarded: boolean
  skipped_onboarding: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  conversation_id: string
  summary: string
  messages_covered: number
  created_at: string
  updated_at: string
}
