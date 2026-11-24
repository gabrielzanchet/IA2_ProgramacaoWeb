# IA2_PW – Loja (CRUD de produtos, carrinho e vendas)

Projeto full stack feito em sala e ampliado como atividade: API REST em Node.js + Express + Sequelize (MariaDB) e front-end em React.

## Funcionalidades

- CRUD de produtos integrado entre API e front
- Upload de imagem do produto (somente `.jpeg`/`.jpg` e `.png`, máximo 2 MB)
- Validação do preço (não aceita números negativos), no front, no controller e no model
- Painel de vendas na rota `/home`, no padrão e-commerce: vitrine com busca, carrinho e finalização da venda
- Endpoints de carrinho e de venda na API (o preço e o total são sempre calculados no servidor)

## Tecnologias

- **API:** Node.js, Express 5, Sequelize, MariaDB, Multer, CORS
- **Front:** React, React Router, Axios, Bootstrap 5

## Estrutura

```
IA2_PW/
├── api/
│   ├── controller/   # regras de cada recurso
│   ├── db/           # conexão com o banco
│   ├── middleware/   # upload de imagens (multer)
│   ├── model/        # models do Sequelize
│   ├── router/       # rotas
│   ├── uploads/      # imagens enviadas
│   └── index.js
└── frontend/
    └── src/
        ├── components/
        ├── hooks/    # chamadas à API (useProduto, useCarrinho, useVenda)
        ├── pages/    # home (loja) e produtos (CRUD)
        └── utils/    # configuração do axios
```

## Como rodar

### Pré-requisitos

- Node.js
- MariaDB em execução, com um banco chamado `loja` criado:

```sql
CREATE DATABASE loja;
```

### API

```bash
cd api
npm install
npm start
```

A API sobe em `http://localhost:5000`. As tabelas são criadas automaticamente na primeira execução.

Variáveis de ambiente opcionais (valores padrão entre parênteses):

| Variável | Padrão |
|---|---|
| `PORT` | `5000` |
| `DB_NAME` | `loja` |
| `DB_USER` | `root` |
| `DB_PASS` | `root` |
| `DB_HOST` | `localhost` |

### Front-end

```bash
cd frontend
npm install
npm start
```

O front abre em `http://localhost:3000`. Para apontar para outra API, defina `REACT_APP_API_URL`.

## Primeiro uso

O banco começa vazio, então a loja aparece sem produtos. Para testar:

1. Abra `http://localhost:3000/produtos`
2. Cadastre alguns produtos (nome, preço e imagem `.jpeg` ou `.png`)
3. Vá para `http://localhost:3000/home`
4. Adicione produtos ao carrinho e clique em **Finalizar venda**
5. Para ver as vendas registradas, acesse `http://localhost:5000/venda/getAll`

## Rotas do front

| Rota | Descrição |
|---|---|
| `/home` | Loja com vitrine, carrinho e finalização da venda |
| `/produtos` | Cadastro, edição e exclusão de produtos |

## Endpoints da API

### Produtos (`/produto`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/produto/create` | Cria produto (`form-data`: `nome`, `preco`, `imagem` opcional) |
| GET | `/produto/getAll` | Lista os produtos |
| GET | `/produto/getById/:id` | Busca um produto |
| PATCH | `/produto/update/:id` | Atualiza nome, preço e/ou imagem |
| DELETE | `/produto/delete/:id` | Exclui um produto |

### Carrinho (`/carrinho`)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/carrinho/get` | Lista os itens e o total |
| POST | `/carrinho/add` | Adiciona item (JSON: `produtoId`, `quantidade` opcional) |
| PATCH | `/carrinho/update/:produtoId` | Altera a quantidade (JSON: `quantidade`) |
| DELETE | `/carrinho/remove/:produtoId` | Remove um item |
| DELETE | `/carrinho/clear` | Esvazia o carrinho |

### Vendas (`/venda`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/venda/create` | Finaliza a venda com os itens do carrinho e esvazia o carrinho |
| GET | `/venda/getAll` | Lista as vendas com seus itens |
| GET | `/venda/getById/:id` | Mostra uma venda |

## Regras de validação

- Preço deve ser um número maior ou igual a zero
- Imagem: apenas `.jpeg`/`.jpg` e `.png`, até 2 MB
- Quantidade no carrinho: inteiro de 1 a 99
- Não é possível finalizar uma venda com o carrinho vazio
- Cada item da venda guarda o nome e o preço do produto no momento da compra