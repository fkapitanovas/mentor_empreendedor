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

## Etapa 7: Enriquecimento de Perfis de Gurus ✅
- [x] Perfil expandido Flavio Augusto (trilogia Geracao de Valor + pesquisa web)
  - Biografia completa: Jabour/RJ, vendedor com fichas de telefone, Wise Up, Orlando City
  - Dados financeiros: vendas R$877M / US$400M, Forbes R$1.3bi
  - Metodo de venda ativa, 8 degraus de escala, proposito > produto
  - Triade (visao/coragem/competencia), 7 habitos dos perdedores
  - Conceitos novos: gordura mental, construcao de equity, inteligencia emocional, familia no negocio
  - Frases-chave extraidas dos livros e entrevistas

## Etapa 8: Dominio Fixo para Webhook ✅
- [x] Configurar dominio estatico gratuito do ngrok
- [x] Dominio: toylike-chelsey-esophageal.ngrok-free.dev
- [x] Webhook Twilio: https://toylike-chelsey-esophageal.ngrok-free.dev/webhook
- [x] Comando: ngrok http --domain toylike-chelsey-esophageal.ngrok-free.dev 8000
- [x] URL fixa — nao precisa mais atualizar no Twilio ao reiniciar

## Etapa 9: Deploy em Producao (Railway) 🔲
- [x] Criar Procfile (uvicorn com $PORT)
- [x] Criar runtime.txt (python-3.9.18)
- [x] Atualizar CLAUDE.md com info de deploy
- [ ] Push Procfile + runtime.txt para GitHub
- [ ] Criar conta no Railway e conectar repo GitHub
- [ ] Configurar 7 env vars no dashboard do Railway
- [ ] Gerar dominio publico no Railway (Settings > Networking)
- [ ] Atualizar webhook URL no Twilio para URL do Railway + /webhook
- [ ] Testar /health no navegador
- [ ] Testar fluxo completo via WhatsApp em producao

## Status
- **MVP funcional e testado via WhatsApp**
- **System prompt: 66.334 caracteres (10 blocos)**
- **Deploy: Railway (em andamento)**
- Servidor local (dev): uvicorn na porta 8000 + ngrok
- Producao: Railway (auto-deploy via git push)

## Conteudo do System Prompt (blocos)
1. Identidade e Tom (469 chars)
2. Base de Conhecimento por Tema (35.841 chars) — perfis expandidos: Marcus Marques, Thiago Oliveira, Flavio Augusto, Thiago Nigro, Nathalia Arcuri, Gustavo Cerbasi, Erico Rocha, Conrado Adolpho, Pedro Sobral, Joel Jota + outros
3. Base de Livros (9.150 chars) — 22 resumos executivos por tema
4. Regras de Interacao (1.172 chars) — 7 regras
5. Personalizacao por Estagio (509 chars) — iniciante/crescimento/consolidado
6. Resolucao de Conflitos (1.131 chars) — 5 tensoes mapeadas
7. Referencias Nichadas por Setor (7.291 chars) — confeitaria, beleza, marketing, financas, moda, gastronomia, MEI
8. Base Institucional (6.594 chars) — Sebrae, Receita Federal, Portal MEI, gov.br
9. Base Impulso Stone (3.211 chars) — treinamentos do programa Impulso
10. Instrucoes de Diagnostico (966 chars) — onboarding via conversa livre
+ Contexto do Usuario (pos-onboarding, dinamico)

## Proximas melhorias possiveis
- [ ] Deploy em producao (Railway) — Etapa 9 acima
- [ ] Testes automatizados
- [ ] Rate limiting
- [ ] Logging estruturado
