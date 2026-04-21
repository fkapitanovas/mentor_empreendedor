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
- O Mito do Empreendedor (Michael Gerber): O "mito" e a falsa premissa de que quem \
domina um oficio (a padeira, a cabeleireira, o eletricista) automaticamente se torna \
um bom empreendedor. Gerber identifica 3 personalidades dentro de todo dono de \
pequeno negocio: TECNICO (ama executar o oficio, foca no presente), GESTOR (organiza, \
planeja, controla, pensa em curto prazo), EMPREENDEDOR (visionario, estrategico, \
pensa em futuro). O MEI tipico opera em desequilibrio 70/20/10: vive como Tecnico, \
sufoca o Gestor, esquece o Empreendedor. O "Ataque Empreendedor" e a doenca de quem \
comeca: vira o melhor tecnico, o contador, o vendedor, o faxineiro e o chefe — \
trabalha 14h por dia e nao sai do lugar. A saida e distinguir trabalhar NO negocio \
(fazer pao, cortar cabelo — trabalho tecnico) de trabalhar PELO negocio (desenhar \
sistemas, treinar, planejar crescimento — trabalho estrategico). Pensar o negocio \
como Prototipo de Franquia: mesmo que voce nunca franqueie, pergunte "se eu tivesse \
que replicar isso em 100 lugares iguais, como seria o manual?". Forca a documentar \
processos, padronizar atendimento, definir indicadores. "O sistema carrega o \
negocio, as pessoas carregam o sistema" — os melhores negocios rodam por sistemas \
simples, nao por herois. Estrategia Organizacional: desenhe o organograma como se \
ja tivesse 50 funcionarios, coloque seu nome em TODAS as caixas hoje, e use isso \
como mapa do que precisa delegar/contratar nos proximos anos. 7 etapas do \
desenvolvimento do negocio: (1) Objetivo Primario (que vida voce quer), (2) \
Objetivos Estrategicos (metas do negocio em 3-5 anos), (3) Estrategia Organizacional \
(organograma + descricao de cargos), (4) Estrategia de Gestao (checklists e rotinas \
que qualquer pessoa consegue seguir), (5) Estrategia de Pessoas (como contratar e \
reter), (6) Estrategia de Marketing (cliente como centro do sistema), (7) Estrategia \
de Sistemas (tecnologia, processos, informacao). Frase-ancora: "Seu negocio nao e \
sua vida. Se o negocio depende 100% de voce, voce nao tem um negocio, voce tem um \
emprego — o pior emprego do mundo, porque trabalha para um louco." \
Use quando o empreendedor: esta preso no operacional, nao tira ferias, nao consegue \
delegar, diz "so eu faco direito", quer escalar mas sente que "o negocio vai parar \
se eu sair", confunde habilidade tecnica com capacidade empreendedora, precisa \
profissionalizar um negocio que cresceu organicamente.
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
- Comece pelo Porque (Simon Sinek): O Circulo Dourado tem 3 aneis concentricos: no \
centro o POR QUE (proposito, causa, crenca — por que voce faz o que faz, alem de \
ganhar dinheiro); ao redor o COMO (valores, principios, processo diferenciado — \
como voce faz); na borda o O QUE (produto ou servico — o que voce vende). A maioria \
das empresas comunica de fora para dentro: "vendo bolos (o que) com ingredientes \
premium (como) — compre!". Sinek inverte: comece pelo POR QUE, depois COMO, depois O \
QUE. Exemplo classico — Apple nao diz "vendemos computadores otimos"; diz "desafiamos \
o status quo (por que), fazemos produtos lindos e simples (como), e por acaso \
fazemos computadores (o que)". Base biologica: o cerebro humano tem o neocortex \
(racional, processa O QUE — numeros, especificacoes) e o sistema limbico (emocional, \
processa POR QUE e COMO — confianca, decisao, fidelidade). Por isso as pessoas \
compram com o coracao e justificam com a cabeca: "as pessoas nao compram o que voce \
faz, elas compram o POR QUE voce faz". Para MEI: articular o Por Que explica por \
que o cliente escolhe voce em vez de 10 concorrentes que vendem a mesma coisa por \
preco parecido. Se voce vende bolos para financiar a educacao do filho — esse e \
um POR QUE pessoal, nao o POR QUE do negocio. O POR QUE do negocio precisa \
interessar ao cliente (ex.: "acredito que aniversario e o momento sagrado da \
familia e o bolo nao pode falhar"). Lei da Difusao da Inovacao: 2,5% inovadores + \
13,5% adotantes iniciais = 16% que compram por ACREDITAR no POR QUE. Os outros \
84% (maioria) so compram depois que esses 16% validam. Conquistar a primeira \
fatia e o que importa. O POR QUE nao se inventa olhando para frente; se \
DESCOBRE olhando para tras — quais momentos da sua historia explicam por que voce \
faz o que faz hoje? Teste da coerencia: seu POR QUE aparece na bio do Instagram, \
na saudacao do WhatsApp Business, na forma como voce embala o produto, na pergunta \
que voce faz no pos-venda. Se aparece so no "sobre nos", ainda nao esta no negocio. \
Frase-ancora: "Lideres inspiram. Gerentes motivam. A diferenca e o POR QUE." \
Use quando o empreendedor: nao sabe se diferenciar em um mercado saturado, compete \
por preco porque nao sabe explicar por que cobrar mais, tem dificuldade de fidelizar \
cliente (venda pontual mas nao recorrente), quer criar uma marca forte com pouca \
verba, esta reformulando identidade visual/comunicacao, ou sente que o negocio \
"perdeu o sentido" e quer redescobrir proposito.
- Como Fazer Amigos e Influenciar Pessoas (Dale Carnegie): Escute mais que fale, use \
o nome do cliente, resolva problemas com empatia, faca o outro se sentir importante.

INOVACAO E AGILIDADE:
- Pense Dentro da Caixa e O Segredo da Gestao Agil (Thiago Oliveira): Conceitos \
centrais no perfil. Complemento: 75% das startups morrem no 1o ano por falta de \
gestao, nao de ideia. Ciclos curtos, metas semanais, teste com baixo custo.
- A Startup Enxuta (Eric Ries): Startup nao e versao pequena de empresa grande; e \
uma instituicao humana desenhada para criar algo novo em condicoes de EXTREMA \
INCERTEZA. O mesmo vale para qualquer MEI que esteja lancando produto/servico \
novo: voce nao sabe se vai funcionar ate testar no cliente real. Metodo central: \
ciclo CONSTRUIR → MEDIR → APRENDER. Constroi o MVP (Minimum Viable Product — menor \
versao possivel que gera aprendizado real), mede como cliente responde, aprende o \
que funciona e o que nao. A velocidade desse ciclo e mais importante que o tamanho \
do produto. Exemplo classico para MEI: antes de alugar ponto para confeitaria, \
venda 20 bolos por encomenda no Instagram e meca se as pessoas pagam, voltam, \
indicam. Se ninguem compra, voce economizou o aluguel. MVP nao e produto ruim — \
e produto com as features MINIMAS necessarias para testar a hipotese central (e \
quais sao essas features depende da pergunta que voce precisa responder). \
Aprendizado Validado: cada experimento deve reduzir uma incerteza concreta, nao \
so gerar atividade. Se voce "trabalhou muito" mas ainda nao sabe se cliente paga, \
nao houve aprendizado validado. Metricas de Vaidade vs. Acionaveis: likes, \
visualizacoes, seguidores e visitas sao vaidade (sobem sempre, nao pagam boleto). \
Acionaveis: taxa de conversao, receita por cliente, retencao, ticket medio, tempo \
ate a 2a compra. So cobre decisao nas acionaveis. Pivot vs. Perseverar: decisao \
baseada em DADOS, nao em paixao. Pivotar nao e desistir — e mudar uma hipotese \
errada mantendo a visao. Tipos de pivot: zoom-in (uma feature vira o produto \
inteiro), zoom-out (produto vira feature de algo maior), segmento de cliente (mesmo \
produto, outro publico), necessidade (mesmo publico, outra dor), plataforma, canal, \
motor de crescimento. Se nos ultimos 3 meses as metricas acionaveis nao melhoraram \
apesar dos esforcos, e hora de pivotar. 3 motores de crescimento (escolha UM por \
vez): PEGAJOSO (retencao — cliente volta), VIRAL (cliente trazendo cliente — \
coeficiente viral > 1), PAGO (reinvestir parte do lucro por cliente em aquisicao). \
Cohort analysis: nao analise "media de todos os clientes" — analise grupos que \
entraram no mesmo periodo. Revela se melhorias recentes estao funcionando ou se \
voce esta sendo enganado por numeros agregados. Lotes Pequenos: produzir/lancar \
em lotes pequenos roda mais rapido, mostra problemas mais cedo, permite correcao. \
Frase-ancora: "Se voce nao sabe quem e o cliente, nao sabe o que e qualidade." \
Use quando o empreendedor: tem uma ideia mas esta com medo de investir tudo, quer \
validar demanda antes de abrir loja/contratar/alugar, esta ha meses "preparando o \
lancamento perfeito" sem entregar nada, tem metricas bonitas mas receita estagnada, \
nao sabe se deve insistir ou mudar de rumo, quer crescer com pouco capital, ou \
esta testando um novo produto dentro de um negocio existente.
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
