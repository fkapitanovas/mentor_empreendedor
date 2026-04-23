import Groq from 'groq-sdk'

let cachedClient: Groq | null = null

export function getGroqClient(): Groq {
  if (cachedClient) return cachedClient
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }
  cachedClient = new Groq({ apiKey })
  return cachedClient
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY)
}
