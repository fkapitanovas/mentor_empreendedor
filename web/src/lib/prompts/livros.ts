/**
 * Resumos dos 22 livros que compõem a base de conhecimento do Max Impulso.
 *
 * Fontes:
 * - Lista de livros e conceitos-âncora: docs/agente_microempreendedor.docx
 *   (documento com os 12 gurus + 22 livros curados pela equipe Impulso Stone)
 * - Livros lidos na íntegra em PDF (conceitos enriquecidos além do docx):
 *   - docs/Geração de Valor – Flávio Augusto.pdf
 *   - docs/Geração de Valor 2 - Flávio Augusto (Revisado).pdf
 *   - docs/Geração de Valor 3 - Flávio Augusto.pdf
 *   - docs/O Poder do Hábito - Charles Duhigg.pdf
 *
 * Deduplicação: conceitos centrais dos gurus que têm perfil dedicado
 * (Flavio Augusto, Thiago Nigro, Nathalia Arcuri, Gustavo Cerbasi, Rodrigo
 * Almeida, Conrado Adolpho, Thiago Oliveira, Geraldo Rufino) ficam em
 * ./conhecimento.ts; este arquivo só traz COMPLEMENTOS dos livros desses
 * autores e livros de autores sem perfil próprio.
 */
export const BASE_LIVROS = `Base de conhecimento de livros. Use estes conceitos para fundamentar suas \
orientacoes, sem necessariamente citar os titulos — integre as ideias naturalmente. \
Conceitos detalhados dos gurus (Flavio Augusto, Thiago Nigro, Nathalia Arcuri, \
Gustavo Cerbasi, Rodrigo Almeida, Conrado Adolpho, Thiago Oliveira, Geraldo Rufino) \
ja estao nos perfis da base de conhecimento — aqui ficam apenas conceitos \
complementares e livros de autores sem perfil proprio.

GESTAO E MENTALIDADE EMPREENDEDORA:
- Geracao de Valor — Trilogia (Flavio Augusto): Conceitos centrais no perfil. \
Complemento do livro: roteiro pratico se tivesse 18 anos — vender produto, viver \
com metade do que ganha, criar modelos recorrentes, fabricar produto proprio, \
ampliar mix, criar canais de distribuicao, no auge vender a companhia.
- O Mito do Empreendedor (Michael Gerber): Trabalhe PELO negocio, nao so NO negocio. \
Documente processos, crie sistemas, pense no MEI como franquia que funcionaria sem voce.
- Empresas Feitas para Vencer (Jim Collins): Descubra a interseccao entre o que faz \
de melhor, o que te apaixona e o que gera dinheiro. Disciplina e consistencia vencem \
estrategias brilhantes pontuais.
- O Lado Dificil das Coisas Dificeis (Ben Horowitz): Momentos dificeis fazem parte. \
Foque no que pode controlar, tome decisoes dificeis rapido, cuide da saude mental.
- Seja Foda! (Caio Carneiro): Sucesso vem de disciplina nos pequenos habitos diarios. \
Cuide da energia, faca networking, assuma 100% de responsabilidade.

FINANCAS:
- Do Mil ao Milhao (Thiago Nigro): Conceitos centrais no perfil (3 pilares, ARCA, \
hierarquia financeira). Complemento: metodo PMA para novos negocios (Paixao + Mercado \
+ Aptidao), comecar no negocio de outra pessoa para aprender sem risco, criar MVP \
com custo minimo para testar.
- Me Poupe! (Nathalia Arcuri): Conceitos centrais no perfil. Complemento do livro: \
regra pratica "se nao cabe no orcamento, nao cabe na sua vida", automatizar \
investimentos como debito automatico para nao depender de disciplina.
- Casais Inteligentes Enriquecem Juntos (Gustavo Cerbasi): Conceitos centrais no \
perfil. Complemento: 5 perfis financeiros (poupadores, gastadores, descontrolados, \
desligados, financistas) — identificar o perfil do casal ajuda a resolver conflitos.
- Lucro Primeiro (Mike Michalowicz): A contabilidade tradicional usa Vendas - Despesas \
= Lucro, tratando lucro como "sobras". O metodo Lucro Primeiro inverte: Vendas - Lucro \
= Despesas. Ao retirar o lucro ANTES de pagar qualquer coisa, o empreendedor e forcado \
a gerir o negocio com o que resta, promovendo eficiencia. Sistema de contas bancarias \
separadas (analogia dos "pratos pequenos"): (1) Conta de Lucro — retirar primeiro, \
(2) Pagamento do Proprietario (pro-labore), (3) Impostos, (4) Despesas Operacionais — \
so o que sobrar. Manter contas de Lucro e Impostos em banco diferente e de dificil \
acesso para evitar saques por impulso. Ritmo 10/25: processar alocacoes nos dias 10 e \
25 de cada mes. Comecar pequeno: mesmo 1% para a conta de lucro ja estabelece o habito. \
Fazer Avaliacao Instantanea para entender a saude real do negocio — focar na "Receita \
Real" (nao bruta). Definir PAMs (Percentuais de Alocacao de Meta) para cada conta. \
Alerta para a "Ilusao do Crescimento": vender mais sem lucratividade cria um monstro \
maior e mais caro. Rentabilidade vem de eficiencia operacional e de focar nos melhores \
clientes — demitir clientes que trazem prejuizo. Para sair de dividas: "Congelamento \
de Dividas" (parar gastos e renegociar), "So Mais Um Dia" (adiar compras 24h). "Teoria \
do Wedge": economizar metade de qualquer aumento de renda para evitar inflacao do \
estilo de vida. "Lucratividade nao e evento futuro, e habito diario." \
Use quando o empreendedor: fatura mas nao sobra dinheiro, nao sabe quanto realmente \
lucra, precisa organizar financas do negocio com metodo simples, mistura lucro com \
despesas, ou precisa de disciplina financeira. Complementa perfeitamente o Rodrigo \
Almeida (Lucro2x) e o Thiago Nigro (investir antes de gastar).
- Pai Rico, Pai Pobre (Robert Kiyosaki): Diferencie ativos (colocam dinheiro no bolso) \
de passivos (tiram dinheiro do bolso). Seu MEI e um ativo — trate como investimento. \
Quadrante do fluxo de caixa: Empregado → Autonomo → Dono → Investidor. O objetivo e \
migrar para a direita. Busque renda que nao dependa 100% das suas horas. "Os ricos \
compram ativos, os pobres compram passivos pensando que sao ativos."

MARKETING E VENDAS:
- 8Ps do Marketing Digital (Conrado Adolpho): Conceitos centrais no perfil. \
Complemento: funil de vendas em 3 etapas — Topo (atrair com conteudo sobre dores), \
Meio (quebrar objecoes), Fundo (oferta irresistivel para quem ja esta pronto).
- Bora Vender (Alfredo Soares): Use redes como canais de venda ativa. Construa \
autoridade com conteudo, responda rapido, crie funil simples (conteudo → direct → oferta), \
peca indicacoes ativamente.
- Comece pelo Porque (Simon Sinek): Defina por que seu negocio existe alem do dinheiro. \
Comunique proposito em tudo (bio, apresentacao, WhatsApp Business). Clientes fieis se \
conectam com seu porque.
- Como Fazer Amigos e Influenciar Pessoas (Dale Carnegie): Escute mais que fale, use \
o nome do cliente, resolva problemas com empatia, faca o outro se sentir importante.

INOVACAO E AGILIDADE:
- Pense Dentro da Caixa e O Segredo da Gestao Agil (Thiago Oliveira): Conceitos \
centrais no perfil. Complemento: 75% das startups morrem no 1o ano por falta de \
gestao, nao de ideia. Ciclos curtos, metas semanais, teste com baixo custo.
- A Startup Enxuta (Eric Ries): Valide demanda antes de investir. Crie MVP, colete \
feedback real, pivote se necessario. Metricas de vaidade nao pagam boletos.
- Rework (Jason Fried): Lance rapido, evite planejamento excessivo, diga nao a maioria \
das oportunidades. Negocio pequeno e lucrativo > grande e endividado.
- De Zero a Um (Peter Thiel): Encontre nicho especifico e domine-o. Construa algo \
dificil de copiar: relacionamento, conhecimento especializado, reputacao local.
- Inovacao em Modelos de Negocios (Gustavo Caetano): Repense como cobra (assinatura, \
pacote, recorrencia). Adapte ideias de outros setores. Teste em pequena escala.

HABITOS E PRODUTIVIDADE:
- O Poder do Habito (Charles Duhigg): Loop do habito: deixa (gatilho) → rotina (acao) \
→ recompensa (satisfacao). Para mudar: mantenha a deixa e a recompensa, troque a rotina. \
Habitos angulares mudam tudo em cascata — para o MEI: controle financeiro diario, \
prospeccao diaria, postagem consistente. Para mudar: (1) isole a deixa, (2) identifique \
a rotina, (3) experimente recompensas diferentes, (4) insista ate virar automatico. \
Mude um habito de cada vez.

INSPIRACAO:
- O Catador de Sonhos e O Poder da Positividade (Geraldo Rufino): Conceitos centrais \
no perfil. Complemento: "A melhor maneira de nao ter medo do futuro e viver o seu \
melhor presente."
- Sonho Grande (Cristiane Correa): Lemann, Telles e Sicupira — metas claras e \
mensuraveis, corte custos desnecessarios, cerque-se de pessoas melhores, pense grande.`
