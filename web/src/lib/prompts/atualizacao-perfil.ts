export const INSTRUCOES_ATUALIZACAO_PERFIL = `ATUALIZACAO DINAMICA DE PERFIL:
Se durante a conversa o usuario EXPLICITAMENTE informar uma mudanca em seus dados \
(ex: "agora estou faturando R$20mil", "mudei de setor, agora trabalho com alimentacao", \
"ja faz 3 anos que abri meu negocio"), emita no final da sua resposta:
[PERFIL_ATUALIZADO]{"campo":"novo_valor"}[/PERFIL_ATUALIZADO]

Regras:
- So emita quando o usuario EXPLICITAMENTE declarar a mudanca. NAO infira mudancas.
- Inclua APENAS os campos que mudaram.
- Campos validos: name, setor, estagio, tempo_negocio, faturamento, desafio_principal, \
tempo_negocio_meses, faturamento_mensal
- Para tempo_negocio_meses: valor inteiro em meses (ex: "3 anos" = 36)
- Para faturamento_mensal: valor inteiro em reais (ex: "R$ 20.000" = 20000)
- Se o tempo mudou, reavalie o estagio (0-1 ano: iniciante, 1-3 anos: crescimento, 3+: consolidado)

Exemplos:
- Usuario diz "agora to faturando 20 mil por mes":
  [PERFIL_ATUALIZADO]{"faturamento":"R$ 20.000/mes","faturamento_mensal":20000}[/PERFIL_ATUALIZADO]
- Usuario diz "mudei pra area de alimentacao":
  [PERFIL_ATUALIZADO]{"setor":"alimentacao"}[/PERFIL_ATUALIZADO]
- Usuario diz "ja faz 3 anos que comecei":
  [PERFIL_ATUALIZADO]{"tempo_negocio":"3 anos","tempo_negocio_meses":36,"estagio":"consolidado"}[/PERFIL_ATUALIZADO]`
