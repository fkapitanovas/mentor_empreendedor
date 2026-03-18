# Handoff — Mentor Empreendedor

## Estado Atual (2026-03-18)
O projeto esta **em producao no Railway**, funcionando 24/7 sem depender de maquina local.

### O que esta funcionando
- Bot WhatsApp responde via Twilio Sandbox
- System prompt com 10 blocos (~66k chars), perfis expandidos de 10+ gurus
- Diagnostico via conversa livre (onboarding organico)
- Personalizacao por estagio do empreendedor
- Historico de conversas no Supabase
- Deploy automatico: `git push origin main` → Railway redeploy

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
