# Mentor Empreendedor - Tarefas

## Etapa 1: Setup do Projeto ✅
- [x] Criar estrutura de pastas
- [x] requirements.txt
- [x] .env.example
- [x] .gitignore
- [x] Inicializar git repo

## Etapa 2: Supabase ✅
- [x] Criar projeto no supabase.com
- [x] Executar schema.sql no SQL Editor do Supabase
- [x] Pegar Project URL + anon key
- [x] Criar .env com credenciais do Supabase
- [x] Fix: ALTER phone VARCHAR(20) -> VARCHAR(50) (formato Twilio: whatsapp:+55...)

## Etapa 3: Codigo ✅
- [x] System prompt modular (5 blocos + referencias nichadas + diagnostico)
- [x] Config, Supabase service, Mentor service, Twilio service
- [x] Webhook router (POST /webhook), FastAPI main (GET /health)
- [x] Pydantic schemas
- [x] Fix: typing Optional[] para compatibilidade Python 3.9
- [x] Fix: python-multipart para Form data do Twilio

## Etapa 4: Credenciais ✅
- [x] ANTHROPIC_API_KEY
- [x] TWILIO_ACCOUNT_SID
- [x] TWILIO_AUTH_TOKEN

## Etapa 5: Teste ✅
- [x] pip install -r requirements.txt
- [x] Rodar uvicorn localmente
- [x] Instalar e configurar ngrok
- [x] Configurar URL do webhook no Twilio sandbox
- [x] Testar fluxo completo via WhatsApp — FUNCIONANDO

## Etapa 6: Enriquecimento da Base de Conhecimento ✅
- [x] Extrair lista de 22 livros do agente_microempreendedor (1).docx
- [x] Criar resumos executivos dos 22 livros (conceitos acionaveis por tema)
- [x] Integrar BASE_LIVROS como novo bloco no system prompt
- [x] Pesquisar perfil do Thiago Oliveira (Instagram, artigos, livros)
- [x] Atualizar BASE_CONHECIMENTO com trajetoria completa do Thiago Oliveira
- [x] Enriquecer resumos dos livros Pense Dentro da Caixa e Gestao Agil

## Status
- **MVP funcional e testado via WhatsApp**
- **System prompt: 11.207 caracteres (7 blocos)**
- Servidor local: uvicorn na porta 8000
- Tunel: ngrok (URL muda a cada reinicio no plano free)
- Nota: ao reiniciar ngrok, atualizar URL no Twilio sandbox

## Conteudo do System Prompt (blocos)
1. Identidade e Tom
2. Base de Conhecimento por Tema (gurus por pilar + perfil expandido Thiago Oliveira)
3. Base de Livros (22 resumos executivos por tema)
4. Regras de Interacao (7 regras)
5. Personalizacao por Estagio (iniciante/crescimento/consolidado)
6. Resolucao de Conflitos (5 tensoes mapeadas)
7. Referencias Nichadas por Setor (confeitaria, beleza, marketing, financas, moda, gastronomia, MEI)
+ Instrucoes de Diagnostico (onboarding via conversa livre) ou Contexto do Usuario (pos-onboarding)

## Proximas melhorias possiveis
- [ ] Pesquisar e expandir perfis de outros gurus (Marcus Marques, Flavio Augusto, etc.)
- [ ] Deploy em producao (Railway, Render, ou similar)
- [ ] Dominio fixo para webhook (ngrok pago ou deploy)
- [ ] Testes automatizados
- [ ] Rate limiting
- [ ] Logging estruturado
