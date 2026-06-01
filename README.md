# Maximus Agendamentos Barbearias

Sistema web para gerenciamento de agendamentos em barbearias, desenvolvido como projeto acadêmico de TCC.

---

## Acesso ao Projeto

- **Aplicação em produção:** https://maximus-agendamentos-barbearias.vercel.app
- **Repositório:** https://github.com/RomanoBoldrin/maximus-agendamentos-barbearias

---

## Sobre o Projeto

O **Maximus Agendamentos Barbearias** é um projeto acadêmico que consiste em um sistema web desenvolvido o gerenciamento centralizado de horários, serviços e profissionais de uma barbearia.

Concebido sob a premissa de máxima conveniência e excelência de experiência de uso, o sistema atua em duas frentes principais:

1.  **Fluxo do Cliente (Público e Não Autenticado):** Permite que qualquer cliente agende seu atendimento em poucos segundos diretamente pelo navegador, sem a necessidade de criar contas ou efetuar login.
2.  **Painel de Gestão (Autenticado):** Uma área administrativa protegida onde gestores (administradores) e profissionais (barbeiros) controlam as operações diárias, visualizam métricas e gerenciam os recursos do estabelecimento.

O projeto foi intencionalmente desenhado para atuar no modelo de **barbearia única** (single-barbershop). Não há suporte nativo a multi-inquilinato (multi-tenancy) ou tabelas de franquias/unidades no banco de dados para esta versão do projeto.

---

## Proposta do Trabalho

### Origem da Ideia

A ideia do projeto surgiu da observação de gargalos comuns na rotina de barbearias locais de pequeno e médio porte. Muitas dessas empresas ainda controlam seus agendamentos de forma analógica (cadernos de papel) ou semi-automatizada (mensagens de WhatsApp manual e planilhas avulsas). Esses processos manuais geram sobrecarga de comunicação para o barbeiro e atrito para o cliente, que muitas vezes precisa aguardar respostas para saber se há horários livres.

### Problemas Identificados

- **Conflitos de Horário:** Duplicidade de marcações para o mesmo profissional.
- **Dificuldade de Rastreamento:** Dificuldade em prever a ocupação real do dia ou da semana.
- **Descentralização de Informações:** Ausência de um catálogo único de serviços e de escalas de trabalho de funcionários.
- **Dependência de Comunicação Manual:** Perda de tempo administrativo com digitação e confirmações de horários.
- **Atrito no Agendamento:** Clientes desistem de marcar atendimentos pela demora em obter opções de horários.

### Mercado-Alvo

- Barbearias independentes, tradicionais ou modernizadas.
- Pequenos e médios negócios de cuidados masculinos e estética que atuam exclusivamente sob hora marcada ou que desejam adotar este modelo.
- Empreendedores do segmento que buscam digitalizar e profissionalizar seu atendimento sem investir em plataformas corporativas complexas ou caras.

### Oportunidades Identificadas

- **Digitalização Prática:** Trazer a barbearia para o ambiente digital por meio de uma aplicação web responsiva e rápida.
- **Redução de Erros:** Automatizar a verificação de disponibilidade, eliminando erros humanos de marcação.
- **Autonomia do Cliente:** Permitir o agendamento a qualquer hora do dia ou da noite, direto do celular.
- **Gestão Centralizada:** Prover ao administrador métricas claras de faturamento e produtividade em um painel gerencial.
- **Evolução Comercial:** Estabelecer uma fundação sólida de código para a futura evolução da plataforma.

---

## Solução Encontrada

### Fluxo do Cliente

O fluxo de agendamento público é focado na simplicidade e na velocidade de conversão:

1.  **Escolha do Serviço:** O cliente visualiza a lista completa de procedimentos cadastrados, com suas respectivas durações e preços.
2.  **Seleção do Profissional:** O cliente escolhe o barbeiro de sua preferência.
3.  **Calendário e Horários Dinâmicos:** A tela apresenta os dias disponíveis e as faixas de horário calculadas em tempo real. Horários passados, conflitantes ou coincidentes com o almoço do profissional são bloqueados automaticamente.
4.  **Dados Pessoais:** O cliente preenche apenas o seu nome e telefone celular de contato.
5.  **Recibo Digital / Resumo:** Após a confirmação, o cliente é redirecionado para uma URL única contendo o resumo completo do seu agendamento (identificado pelo código UUID da transação). Através dessa tela, o cliente pode realizar o cancelamento de forma autônoma.
6.  **Edição Simplificada:** Como decisão de design para o MVP, a edição de um agendamento é feita pelo fluxo de _cancelar e refazer_. O cliente realiza o cancelamento soft do horário atual e é guiado de volta para agendar o novo horário desejado.

### Painel Administrativo

O painel administrativo é o centro de controle do estabelecimento, acessível apenas por usuários com nível de acesso `admin`:

- **Visão Geral (Overview):** Métricas operacionais em tempo real (totalizadores de agendamentos, concluídos, cancelados e faltas) e faturamento bruto (faturamento total e receita prevista para o dia de hoje), calculados diretamente com base no histórico do banco de dados.
- **Gestão de Serviços:** Interface para cadastrar, editar dados operacionais (nome, descrição, duração e preço) e desativar procedimentos (soft delete) com validações robustas.
- **Gestão de Funcionários:** Cadastro unificado de novos profissionais. O sistema realiza uma transação atômica que cria o perfil de agendamento (`Barber`) e o usuário de acesso (`User` com nível `barber`), garantindo consistência. Também permite editar horários operacionais (expediente e almoço) e realizar a desativação do profissional (deletar soft), o que bloqueia o login associado e cancela automaticamente todos os seus agendamentos futuros pendentes.
- **Controle de Agendamentos:** Listagem completa de horários, agrupados por abas temporais (`Hoje`, `Próximos` e `Anteriores`), com busca dinâmica instantânea e funcionalidade de cancelamento imediato de atendimentos.

### Painel do Barbeiro

Os profissionais da barbearia possuem contas criadas pelo administrador. Ao realizarem login no painel, o sistema identifica seu vínculo:

- Visualização estritamente limitada à própria agenda de trabalho (segurança e escopo de dados).
- Visualização rápida dos clientes do dia para preparação do atendimento.

### Funcionalidades Implementadas

O sistema possui as seguintes capacidades ativas no código-fonte e devidamente integradas:

- **Agendamento Público Sem Conta:** Clientes agendam horários sem necessidade de login ou cadastro de senhas.
- **Grade de Horários Inteligente:** Geração dinâmica de faixas de atendimento em intervalos mínimos de 15 minutos, respeitando a escala do barbeiro.
- **Filtros de Indisponibilidade Automáticos:**
  - Bloqueio automático de horários que conflitam com compromissos já marcados.
  - Exclusão matemática do intervalo de almoço do profissional da grade disponível.
  - Desativação automática de horários ocorridos no passado em relação à hora do navegador do cliente.
  - Bloqueio de slots cuja duração do serviço ultrapasse o horário de término do expediente do profissional.
- **Busca Automática de Próxima Agenda:** Caso uma data selecionada esteja totalmente cheia ou sem faixas válidas, o sistema analisa os próximos 30 dias à frente, encontra a primeira data disponível, redireciona o cliente automaticamente e apresenta um aviso informativo em tela.
- **Recibo e Resumo baseados em UUID:** O status do agendamento é consumido de forma assíncrona do backend utilizando a rota dinâmica `/appointment/summary/[appointment_id]` (derivada de SSR). Não são usados cookies ou query params na validação de exibição, blindando a privacidade do histórico.
- **Soft Deletion Generalizado:**
  - Agendamentos cancelados atualizam seu estado para `CANCELADO`, liberando o horário para rebook imediato, mantendo o histórico de auditoria intacto.
  - Serviços e Barbeiros desativados têm seu campo `isActive` definido como `false`, impedindo-os de aparecer na busca pública de novos clientes sem corromper relatórios financeiros passados.
- **Gerenciamento Administrativo via PATCH:** Atualização parcial de dados implementada de forma estrita no backend (PATCH de serviços e PATCH de perfis de barbeiros). O backend ignora campos de autenticação nas rotas operacionais de funcionários por motivos de segurança.
- **Overview Gerencial com Métricas Financeiras:** Painel administrativo com contagem de atividades e valores expressos e formatados em Real (BRL).
- **Segurança de Sessão:** Sistema baseado em banco de dados e entrega de credenciais de login e tokens unicamente via cookies seguros de propriedades `HttpOnly` e `SameSite`.
- **Suíte de Testes Integrados:** Testes automatizados robustos cobrindo fluxos cruciais do backend (mecanismo de cálculo de disponibilidade, validação de regras de horários aninhados de barbeiros e concorrência).

---

## Diferenciais

- **Atrito Zero para o Cliente:** Elimina a barreira de entrada da criação de contas para quem deseja apenas marcar um corte.
- **Segurança Robusta de Disponibilidade:** O cálculo de conflitos é processado e validado no backend no momento da gravação, protegendo a base de dados contra condições de corrida (_race conditions_).
- **Separação Conceitual de Perfis:** Um barbeiro com perfil de trabalho (`Barber`) não é obrigado a ter um usuário de acesso (`User`). A criação de contas de login é gerenciada pelo administrador de forma flexível e segura.
- **Design Rústico e Sofisticado ("Rustic Precision"):** Alinhado à identidade visual clássica de barbearias. A interface adota cantos retos estritos (0px de border radius), ausência de divisores finos em prol de blocos e profundidades terrosas, gradients dourados e tipografia editorial clássica (_Newsreader_ combinado com _Work Sans_).
- **Desenvolvimento Orientado a Testes:** A arquitetura possui testes de integração automatizados e orquestradores de ambiente dedicados, elevando a manutenibilidade para futuros desenvolvedores.

---

## Perspectivas Futuras

- **Evolução Multi-Tenant:** Arquitetar suporte a múltiplas barbearias parceiras na mesma base de dados.
- **Notificações Integradas:** Envio automático de confirmações e lembretes de horários via WhatsApp API e e-mail.
- **Painel Financeiro Avançado:** Emissão de gráficos de produtividade de profissionais e conciliação de pagamentos.
- **Controle de Horários de Exceção:** Ferramenta para o administrador criar bloqueios manuais de horários, folgas programadas, feriados e férias da equipe.
- **Módulo de Fidelidade:** Ferramentas de CRM para bonificação de clientes recorrentes.
- **Reagendamento Assistido:** Permitir a modificação direta de data e hora do agendamento pelo cliente, sem a necessidade de cancelar e recomeçar o processo do zero.

---

## Tecnologias Utilizadas

### Frontend

- **Next.js (Pages Router):** Framework base para renderização e rotas.
- **React 19:** Biblioteca para componentização e estado da interface.
- **TailwindCSS:** Estilização de utilitários de acordo com o Design System.

### Backend

- **Next.js API Routes:** Construção de endpoints assíncronos seguros.
- **next-connect:** Orquestrador e middleware de rotas HTTP no estilo Express.

### Banco de Dados

- **PostgreSQL:** Banco de dados relacional robusto.
- **Prisma ORM:** Mapeamento objeto-relacional e gerenciamento de migrations.

### Autenticação

- **Session-based Authentication:** Controle de sessões e tokens criptografados salvos no banco de dados e trafegados via cookies seguros `HttpOnly`.
- **bcryptjs:** Algoritmo seguro para hashing de senhas.

### Testes e Qualidade

- **Jest:** Suíte e rodador de testes integrados.
- **ESLint & Prettier:** Ferramentas para padronização estilística e sintaxe limpa de código.
- **Husky & Commitlint:** Automação de ganchos Git para consistência de commits convencionais.

### Deploy

- **Vercel / PostgreSQL Host:** TODO

---

## Arquitetura

O sistema é construído sobre o **Next.js Pages Router** e adota uma divisão nítida de responsabilidades em suas camadas de software:

- **Camada de Entrada (Rotas HTTP):** Localizada sob `src/pages/api/v1/`. Cada endpoint mapeia requisições utilizando instâncias do `next-connect` que centralizam a captura de erros em middlewares comuns (`controller.errorHandlers`).
- **Camada de Páginas (Frontend):** Localizada sob `src/pages/`. Organiza as views públicas de marcação (`/appointment`), o recibo dinâmico de sucesso (`/appointment/summary/[appointment_id]`) e as visões protegidas do painel (`/dashboard`).
- **Camada de Negócio e Componentes (Recursos):** Mapeada sob `src/features/` para helpers específicos de domínio e sob `src/components/` para elementos compartilhados.
- **Camada de Infraestrutura (Utilitários Globais):** Alojada sob `src/infra/`. Contém os utilitários de banco de dados (`prisma.js`), autenticação, tratamento genérico de exceções (`errors.js`), validações e hashing.
- **Banco de Dados:** O diretório `/prisma` armazena o arquivo de esquemas e o histórico de migrações estruturais do banco de dados.

**Observação:** Para mais detalhes sobre padrões de projeto e decisões de engenharia, consulte o [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Estrutura de Pastas

Abaixo está representada a estrutura essencial de diretórios do projeto:

```text
├── docs/                      # Documentação detalhada da arquitetura do projeto
├── prisma/                    # Modelos do banco de dados e arquivos de migração
├── public/                    # Imagens estáticas e recursos visuais globais
├── src/
│   ├── components/            # Componentes visuais reutilizáveis globais (Layouts, Modais)
│   ├── features/              # Componentes e helpers encapsulados por regras de domínio
│   ├── infra/                 # Serviços globais do backend (sessão, criptografia, erros)
│   ├── pages/
│   │   ├── api/v1/            # Endpoints da API REST do backend
│   │   ├── appointment/       # Rotas públicas de agendamento e de sumário de recibo
│   │   └── dashboard/         # Rotas das telas administrativas e gerenciais do painel
│   └── tests/                 # Orquestradores e cenários de testes automatizados de integração
├── prisma.config.js           # Configurações do Prisma ORM
└── package.json               # Configurações de dependências e scripts de execução
```

---

## Como Executar Localmente

### Pré-requisitos

- **Node.js:** Versão estável **v22** (recomendado gerenciar via [nvm](https://github.com/nvm-sh/nvm) respeitando o arquivo `.nvmrc` do repositório).
- **npm:** Gerenciador de pacotes padrão do Node.
- **Instâncias de PostgreSQL:** É necessário dispor de instâncias operacionais de banco de dados PostgreSQL locais ou em nuvem para configurar os ambientes de desenvolvimento e teste.

**Aviso:** Este projeto não inclui configurações pré-existentes de Docker PostgreSQL. É dever do desenvolvedor prover os bancos de dados apropriados e informá-los nas configurações de ambiente antes de tentar rodar a aplicação ou executar testes.

### Instalação

Clone o repositório em sua máquina local e instale todas as dependências:

```bash
npm install
```

### Variáveis de Ambiente

O projeto faz uso de arquivos de ambiente específicos para segregar dados e configurações de desenvolvimento, produção e testes.

- `.env.development` — Utilizado para o ambiente de desenvolvimento local.
- `.env.test` — Utilizado de forma exclusiva durante a execução das suítes de testes de integração.
- `.env.production` — Configurações aplicadas na compilação do build de produção.

Para configurar o projeto, crie arquivos de ambiente contendo a variável de conexão com o banco de dados PostgreSQL. Exemplo com placeholders seguros:

Em `.env.development`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/maximus_dev"
```

Em `.env.test`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/maximus_test"
```

**Importante:** É altamente recomendável apontar `.env.development` e `.env.test` para bancos de dados **diferentes**. O executor de testes pode realizar limpezas destrutivas automáticas no banco apontado nas variáveis de teste.

### Banco de Dados

Com as variáveis de ambiente devidamente preenchidas, execute os comandos do Prisma na raiz do projeto para gerar o cliente e aplicar as estruturas iniciais nos bancos de dados:

**Gerar o Cliente do Prisma:**

```bash
npm run db:generate
```

**Criar e Aplicar Migrações no Banco de Desenvolvimento:**

```bash
npm run db:migrate
```

**Visualizar Dados via Prisma Studio (Desenvolvimento):**

```bash
npm run db:studio
```

**Atenção:** Os scripts a seguir realizam a exclusão completa das tabelas e o reset das instâncias de banco correspondentes. Use-os com extrema cautela:

- Resetar banco de desenvolvimento: `npm run db:reset:development`
- Resetar banco de testes: `npm run db:reset:test`

### Rodando em Desenvolvimento

Para iniciar o servidor Next.js local apontando para as configurações de desenvolvimento definidas no arquivo `.env.development`:

```bash
npm run dev
```

O servidor estará acessível no endereço http://localhost:3000.

### Rodando em Ambiente de Teste

Caso queira inicializar o servidor de desenvolvimento apontado de forma exclusiva para o banco de dados de testes (`.env.test`), execute:

```bash
npm run dev:test
```

### Rodando Testes

As suítes de teste de integração do projeto necessitam que um banco de dados de testes esteja operacional e que o servidor Next.js de testes esteja respondendo para que as chamadas HTTP ocorram com sucesso. Há duas abordagens suportadas para rodar os testes:

#### Abordagem A (Dois Terminais)

1.  No **Terminal 1**, inicie o servidor Next.js apontando para o banco de testes:
    ```bash
    npm run dev:test
    ```
2.  No **Terminal 2**, dispare a execução da suíte de testes de integração:
    ```bash
    npm run test
    ```

#### Abordagem B (Terminal Único - Recomendado)

Execute o comando integrado que automatiza todo o processo:

```bash
npm run test:dev
```

Este script utiliza a biblioteca `concurrently` para subir o servidor Next.js de teste em segundo plano, invoca o validador `services:wait` para aguardar a inicialização completa das conexões e, por fim, dispara a suíte do Jest. Todo o fluxo é encerrado automaticamente ao término dos testes.

#### Comandos de Testes Adicionais

- **Testes em Modo de Observação:** `npm run test:watch` (observa alterações de arquivos e reexecuta testes afetados).
- **Testes em CI:** `npm run test:ci` (executa migrações completas do zero com `prisma migrate reset --force` de forma destrutiva contra o banco de testes e em seguida dispara o Jest).

---

## Scripts Disponíveis

Abaixo estão descritos os principais scripts automatizados configurados no arquivo `package.json`:

| Script                  | Comando Real                                                   | Descrição                                                                                                |
| :---------------------- | :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `dev`                   | `dotenv -e .env.development -- next dev -p 3000`               | Inicia o servidor local Next.js na porta 3000 usando as configurações de desenvolvimento.                |
| `dev:test`              | `dotenv -e .env.test -- next dev -p 3000`                      | Inicia o servidor local Next.js na porta 3000 usando o banco de testes.                                  |
| `test`                  | `dotenv -e .env.test -- jest --runInBand --verbose`            | Roda os testes de integração sequencialmente por meio do Jest usando o banco de testes.                  |
| `test:watch`            | `dotenv -e .env.test -- jest --watchAll --runInBand --verbose` | Executa o Jest em modo de observação contínua.                                                           |
| `test:dev`              | `concurrently -k -s first ...`                                 | Orquestra a inicialização em paralelo do servidor de teste Next.js e execução sequencial dos testes.     |
| `test:ci`               | `dotenv -e .env.test -- prisma migrate reset --force && ...`   | Executa resets destrutivos no banco de testes e executa a suíte de testes (ideal para pipelines).        |
| `services:wait`         | `dotenv -e .env.test -- cross-env NODE_ENV=test node ...`      | Script utilitário que aguarda as conexões locais do servidor estarem ativas antes de liberar os testes.  |
| `build`                 | `prisma generate && prisma migrate deploy && next build`       | Compila o projeto Next.js e prepara os esquemas Prisma para produção.                                    |
| `start`                 | `next start -p 3000`                                           | Inicializa o servidor Next.js compilado de produção na porta 3000.                                       |
| `db:generate`           | `dotenv -e .env.development -- prisma generate`                | Atualiza o cliente local do Prisma Client.                                                               |
| `db:migrate`            | `dotenv -e .env.development -- prisma migrate dev`             | Gera e aplica novas migrações na base de desenvolvimento local.                                          |
| `db:deploy`             | `prisma migrate deploy`                                        | Aplica migrações pendentes em ambientes de produção de forma segura.                                     |
| `db:studio`             | `dotenv -e .env.development -- prisma studio`                  | Abre o console visual do banco de dados de desenvolvimento no navegador.                                 |
| `db:seed:admin:dev`     | `dotenv -e .env.development -- npm run db:seed:admin`          | Cria o usuário administrador inicial no banco de desenvolvimento (`admin` / `admin@maximusbarbers.com`). |
| `db:seed:dashboard:dev` | `dotenv -e .env.development -- npm run db:seed:dashboard`      | Popula o banco de desenvolvimento com barbeiros, serviços e agendamentos fictícios de teste.             |
| `db:reset:development`  | `dotenv -e .env.development -- prisma migrate reset --force`   | Executa o reset completo e destrutivo do banco de dados de desenvolvimento.                              |
| `db:reset:test`         | `dotenv -e .env.test -- prisma migrate reset --force`          | Executa o reset completo e destrutivo do banco de dados de testes.                                       |
| `lint:prettier:check`   | `prettier --check .`                                           | Valida se todos os arquivos do repositório respeitam o padrão do Prettier.                               |
| `lint:eslint:check`     | `eslint . --max-warnings=0`                                    | Analisa a qualidade estática do código de acordo com as regras de desenvolvimento do projeto.            |

---

## Perfis de Usuário

- **Cliente (Não Autenticado):** Perfil de usuário comum. Acessa as telas públicas, visualiza horários de profissionais disponíveis calculados em tempo real e agenda serviços fornecendo dados básicos. Pode visualizar o recibo gerado e realizar o cancelamento autônomo do horário agendado.
- **Administrador (`admin`):** Usuário gestor. Possui acesso completo ao painel de controle (/dashboard). Gerencia o portfólio de serviços oferecidos, cria escalas e contas de profissionais de trabalho, altera configurações e visualiza faturamentos e volumes de atendimentos.
- **Barbeiro (`barber`):** Usuário profissional da barbearia. Realiza login e visualiza apenas os agendamentos nos quais seu perfil de trabalho está associado, garantindo restrição de acesso e organização interna.

---

## Status do Projeto

Projeto funcional em versão **MVP acadêmica**, com as funcionalidades de agendamento, validações, gerenciamentos operacionais básicos e suíte de testes integrados completamente implementados e documentados de acordo com os requisitos estabelecidos.

---

## Autor do Código

- Vitor Romano Boldrin
- LinkedIn: https://www.linkedin.com/in/vitor-romano-boldrin/
