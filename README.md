# API de Login de Usuário

Esta é uma API REST simples para registro e login de usuários, desenvolvida em Node.js com Express. O objetivo é servir de base para estudos de testes e automação de APIs.

## Funcionalidades
- Registro de usuário (não permite usuários duplicados)
- Login de usuário (login e senha obrigatórios)
- Documentação interativa com Swagger

## Estrutura do Projeto
- `controller/` — Controllers das rotas
- `service/` — Lógica de negócio
- `model/` — Modelos de dados (em memória)
- `app.js` — Configuração do Express e rotas
- `server.js` — Inicialização do servidor
- `swagger.json` — Documentação da API

## Instalação
1. Clone o repositório ou copie os arquivos para seu ambiente.
2. Instale as dependências:
   ```bash
   npm install express swagger-ui-express
   ```

## Como rodar
- Para iniciar o servidor:
  ```bash
  node server.js
  ```
- Para importar o app em testes:
  ```js
  const app = require('./app');
  ```

## Documentação Swagger
Acesse [http://localhost:3000/api-docs](http://localhost:3000/api-docs) após iniciar o servidor para visualizar e testar os endpoints.

## Endpoints
- `POST /api/users/register` — Registra um novo usuário
- `POST /api/users/login` — Realiza login

## Observações
- Os dados dos usuários são mantidos apenas em memória (array), sem persistência.
- Não utilize em produção.
# PGATS-02-API-LOGIN
