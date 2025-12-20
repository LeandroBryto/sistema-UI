# Requisitos de Backend - Sistema Financeiro

Este documento descreve as funcionalidades e endpoints necessários para evoluir o sistema financeiro atual, cobrindo lacunas críticas de funcionalidade identificadas na análise do produto.

## 1. Gestão de Categorias Personalizáveis (Prioridade Alta)
Atualmente as categorias são "hardcoded" no frontend. Precisamos tornar isso dinâmico por usuário.

### Requisitos de Dados
- Tabela `Category`:
  - `id`: Long
  - `user_id`: Long (Foreign Key)
  - `name`: String (ex: "Alimentação", "Lazer")
  - `type`: Enum ('INCOME', 'EXPENSE')
  - `icon`: String (opcional, para ícone de UI)
  - `color`: String (opcional, hex code)
  - `is_default`: Boolean (para categorias padrão do sistema que não podem ser deletadas)

### Endpoints Sugeridos
- `GET /api/v1/categories`: Listar categorias do usuário + categorias padrão.
- `POST /api/v1/categories`: Criar nova categoria.
- `PUT /api/v1/categories/{id}`: Editar categoria.
- `DELETE /api/v1/categories/{id}`: Remover categoria (validar se existem transações vinculadas).

---

## 2. Gestão de Orçamentos / Budgets (Prioridade Alta)
Funcionalidade para o usuário definir limites de gastos por categoria mensalmente.

### Requisitos de Dados
- Tabela `Budget`:
  - `id`: Long
  - `user_id`: Long
  - `category_id`: Long
  - `amount_limit`: BigDecimal (Valor limite, ex: 500.00)
  - `period_month`: Integer (ex: 12)
  - `period_year`: Integer (ex: 2025)
  - `alert_threshold`: Integer (ex: 80, para avisar quando atingir 80%)

### Endpoints Sugeridos
- `GET /api/v1/Orçamentos`: Listar orçamentos do mês atual com status (gasto atual vs limite).
- `POST /api/v1/Orçamentoss`: Definir orçamento para uma categoria.
- `PUT /api/v1/Orçamentos/{id}`: Atualizar limite.

---

## 3. Múltiplas Contas / Carteiras (Wallets) (Prioridade Média)
Suporte para separar o saldo em diferentes contas (Nubank, Itaú, Dinheiro, etc.).

### Requisitos de Dados
- Tabela `Wallet` (ou `Account`):
  - `id`: Long
  - `user_id`: Long
  - `name`: String (ex: "Nubank Principal")
  - `type`: Enum ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT')
  - `current_balance`: BigDecimal
  - `initial_balance`: BigDecimal

- **Impacto nas Transações:** As tabelas de `Receita` e `Despesa` precisam ganhar uma coluna `wallet_id` para vincular a movimentação a uma conta específica.

### Endpoints Sugeridos
- `GET /api/v1/contas`: Listar contas e saldos.
- `POST /api/v1/contas`: Criar nova conta.
- `POST /api/v1/contas/transfer`: Endpoint para transferir valores entre contas (gera uma despesa na origem e receita no destino).

---

## 4. Gestão de Cartão de Crédito (Prioridade Média/Alta)
Diferenciar compras no débito de compras no crédito (que possuem data de fechamento e vencimento).

### Requisitos de Dados
- Tabela `CreditCard`:
  - `id`: Long
  - `wallet_id`: Long (Conta bancária associada para pagamento da fatura)
  - `name`: String
  - `limit`: BigDecimal
  - `closing_day`: Integer (Dia de fechamento da fatura)
  - `due_day`: Integer (Dia de vencimento)

- **Impacto nas Despesas:** Adicionar flag `is_credit_purchase` e vínculo com `credit_card_id`. A data de "competência" (compra) difere da data de "caixa" (pagamento da fatura).

### Endpoints Sugeridos
- `GET /api/v1/credit-cards`: Listar cartões.
- `GET /api/v1/credit-cards/{id}/invoices`: Listar faturas (abertas e fechadas).
- `POST /api/v1/credit-cards/{id}/pay`: Pagar fatura (gera saída de caixa na conta vinculada).

---

## 5. Investimentos (Portfólio Real) (Prioridade Média)
Permitir cadastro de ativos reais em vez de apenas indicadores de mercado.

### Requisitos de Dados
- Tabela `Asset`:
  - `id`: Long
  - `user_id`: Long
  - `ticker`: String (ex: "PETR4", "Tesouro Selic")
  - `type`: Enum ('STOCK', 'FII', 'FIXED_INCOME', 'CRYPTO')
  - `quantity`: BigDecimal
  - `average_price`: BigDecimal (Preço médio de compra)
  - `current_price`: BigDecimal (Atualizado via job/integração externa)

### Endpoints Sugeridos
- `GET /api/v1/assets`: Listar portfólio.
- `POST /api/v1/assets/transaction`: Registrar compra/venda de ativo (atualiza quantidade e preço médio).
- `GET /api/v1/assets/performance`: Retornar rentabilidade da carteira.
