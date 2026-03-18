# Handoff — Mentor Empreendedor

## Estado Atual (2026-03-18)
O projeto esta **em producao no Railway**, funcionando 24/7 sem depender de maquina local.

### O que esta funcionando
- Bot WhatsApp responde via Twilio Sandbox
- System prompt com 10 blocos + 2 dinamicos (~66k chars), perfis expandidos de 10+ gurus
- Diagnostico via conversa livre (onboarding organico)
- Personalizacao por estagio do empreendedor
- Historico de 100 mensagens no contexto do Claude
- Campos padronizados para analytics (`tempo_negocio_meses`, `faturamento_mensal`) com parsing automatico
- Atualizacao dinamica de perfil: Claude detecta mudancas explicitas do usuario via tag `[PERFIL_ATUALIZADO]`
- Memoria de longo prazo: resumos de conversa gerados a cada 20 mensagens (5 secoes estruturadas)
- Resumos injetados no system prompt para continuidade entre conversas
- Deploy automatico: `git push origin main` → Railway redeploy

### Tabelas no Supabase
- `users` — perfil do empreendedor (campos texto + campos inteiros padronizados)
- `messages` — historico de mensagens (role: user/assistant)
- `conversation_summaries` — 1 linha por usuario, resumo comprimido + contador de msgs cobertas

### Fluxo do Webhook (POST /webhook)
1. Identifica/cria usuario pelo telefone
2. Carrega historico (100 msgs) + resumo existente
3. Gera resposta do mentor (resumo no system prompt)
4. Extrai perfil (`[PERFIL_EXTRAIDO]` ou `[PERFIL_ATUALIZADO]`) e atualiza banco
5. Salva mensagens no historico
6. Envia resposta via WhatsApp
7. Se 20+ msgs novas desde ultimo resumo → gera novo resumo (pos-resposta, nao atrasa usuario)

### URLs e Acessos
- **Producao**: https://faithful-intuition-production-82bb.up.railway.app
- **Health check**: https://faithful-intuition-production-82bb.up.railway.app/health
- **Webhook Twilio**: https://faithful-intuition-production-82bb.up.railway.app/webhook
- **Dev local (ngrok)**: https://toylike-chelsey-esophageal.ngrok-free.dev
- **GitHub**: https://github.com/fkapitanovas/mentor_empreendedor
- **Supabase**: https://wlpglssnqkjsydjylxjj.supabase.co
- **Railway dashboard**: railway.app (login com GitHub fkapitanovas)
- **Twilio console**: console.twilio.com (sandbox WhatsApp)

### Env Vars (Railway)
7 variaveis configuradas no dashboard do Railway:
- `ANTHROPIC_API_KEY` — Claude API
- `CLAUDE_MODEL` — claude-sonnet-4-6
- `SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_KEY` — anon key do Supabase
- `TWILIO_ACCOUNT_SID` — SID da conta Twilio
- `TWILIO_AUTH_TOKEN` — auth token Twilio
- `TWILIO_WHATSAPP_FROM` — whatsapp:+14155238886 (sandbox)

### Como fazer deploy
1. Fazer alteracoes no codigo
2. `git add` + `git commit` + `git push origin main`
3. Railway detecta automaticamente e faz redeploy
4. Verificar logs no dashboard do Railway

### Como rodar localmente (dev)
1. `cd ~/Mentor_Empreendedor`
2. `python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
3. Em outro terminal: `ngrok http --domain toylike-chelsey-esophageal.ngrok-free.dev 8000`
4. Trocar webhook no Twilio para URL do ngrok + `/webhook`
5. Ao terminar dev, trocar webhook de volta para URL do Railway

### Proximos passos prioritarios
1. **Sair do Twilio Sandbox** — migrar para WhatsApp Business API (numero proprio)
2. **Testes automatizados** — garantir que mudancas nao quebrem o bot
3. **Rate limiting** — proteger contra spam/abuso no webhook
4. **Logging estruturado** — facilitar debug em producao
5. **Monitoramento** — alertas se o bot cair ou der erro
6. **Backup Supabase** — proteger dados de usuarios e historico

### Decisoes tecnicas tomadas
- **Railway** escolhido por simplicidade (zero config, sem cold start). Render free tem cold start de 30-60s e Twilio da timeout em 15s
- **ngrok static domain** mantido para dev local (gratuito, URL fixa)
- `load_dotenv()` funciona tanto com `.env` local quanto sem ele (Railway injeta env vars)
- `Procfile` usa `$PORT` dinamico (Railway atribui automaticamente)
- **Contexto 100 msgs** (~20k tokens adicionais no input, bem dentro do limite do Sonnet)
- **Campos texto mantidos** ao lado dos inteiros (nao substitui, complementa) — backward compatible
- **Resumo pos-resposta**: gerado apos enviar WhatsApp para nao atrasar a resposta ao usuario
- **Upsert com on_conflict**: 1 linha por usuario na tabela de resumos, sem acumular registros
- **Parsing Python como fallback**: campos inteiros sao parseados tanto pelo Claude (prompt) quanto pelo Python (`_standardize_profile_fields`)
