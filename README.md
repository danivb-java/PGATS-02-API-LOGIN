# API de Transferências e Usuários

Esta API permite o registro, login, consulta de usuários e transferências de valores entre usuários. O objetivo é servir de base para estudos de testes e automação de APIs.

## Tecnologias
- Node.js
- Express
- Swagger (documentação)
- Banco de dados em memória (variáveis)

## Instalação

1. Clone o repositório:
   ```sh
   git clone <repo-url>
   cd pgats-02-api
   ```
2. Instale as dependências:
   ```sh
   npm install express swagger-ui-express bcryptjs
   ```

## Configuração

Antes de seguir, crie um arquivo .env na pasta raiz contendo as propriedades BASE_URL_REST E BASE_URL_GRAPHQL, com a URL desses serviços.

## Como rodar

- Para iniciar o servidor:
  ```sh
  node server.js
  ```
- A API estará disponível em `http://localhost:3001`
- A documentação Swagger estará em `http://localhost:3001/api-docs`

## Endpoints principais

### Registro de usuário
- `POST /users/register`
  - Body: `{ "username": "string", "password": "string", "favorecidos": ["string"] }`

### Login
- `POST /users/login`
  - Body: `{ "username": "string", "password": "string" }`

### Listar usuários
- `GET /users`

### Transferências
- `POST /transfers`
  - Body: `{ "from": "string", "to": "string", "value": number }`
- `GET /transfers`

### GraphQL Types, Queries e Mutations

Rode `npm run start-graphql` para executar a API do GraphQL e acesse a URL http://localhost:4000/graphql para acessá-la.

- **Types:**
  - `User`: username, favorecidos, saldo
  - `Transfer`: from, to, value, date
- **Queries:**
  - `users`: lista todos os usuários
  - `transfers`: lista todas as transferências (requer autenticação JWT)
- **Mutations:**
  - `registerUser(username, password, favorecidos)`: retorna User
  - `loginUser(username, password)`: retorna token + User
  - `createTransfer(from, to, value)`: retorna Transfer (requer autenticação JWT)

## Regras de negócio
- Não é permitido registrar usuários duplicados.
- Login exige usuário e senha.
- Transferências acima de R$ 5.000,00 só podem ser feitas para favorecidos.
- O saldo inicial de cada usuário é de R$ 10.000,00.

## Testes de API
- O arquivo `app.js` pode ser importado em ferramentas de teste como Supertest.
- Para testar a API GraphQL, importe `graphql/app.js` nos testes.

---

Para dúvidas, consulte a documentação Swagger, GraphQL Playground ou o código-fonte.

## Testes de Performance usando o K6
Conceitos empregados:

- Thresholds:
O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito de Thresholds. Mostra os valores maximos e minimos aceitaveis para metricas de desempenho. No trecho de codigo abaixo, ele define que, 95% das requisicoes devem responder em menos de 3 segundos.
thresholds: {
    http_req_duration: ['p(95)<2000'],
  },

- Checks:
Esse conceito é usado para fazer assercoes (validacoes) aplicadas a resposta de uma requisicao.
Nesse projeto, esse conceito foi usado em dois arquivos.
1) O código abaixo está armazenado no arquivo test/k6/login.test.js
No primeiro trecho de codigo verifica se o status code de resposta da requisicao é igual a 201.
No segundo trecho de codigo verifica o token é retornado após o login do usuario.
check(res, { 'register status is 201': (r) => r.status === 201 });
check(res, { 'token is present': (r) => !!r.json('token') });
2) O código abaixo está armazenado no arquivo test/k6/helpers/login.js
O trecho de codigo verifica se o status code de resposta da requisicao é igual a 200. E é retornado dentro do 
check(res, { 'login status is 200': (r) => r.status === 200 });

- Helpers:
A importancia de usar esse conceito é modularizar, criar funções utilitárias que ajudam a escrever scripts mais limpos, reutilizáveis e fáceis de manter. São criadas para encapsular tarefas repetitivas.
Foram criadas as pastas:
 -- test/k6/helpers/getBaseUrl.js, onde contem a funcao que chama a pagina (URL) do projeto.
 -- test/k6/helpers/login.js, onde contem a funcao que faz p login do usuario informando username e password.
 -- test/k6/helpers/random.js, onde contem a funcao que gera aleatoriamente com o uso do Faker, nomes de usuarios e emails aleatorios a cada execucao.
Os Helpers sao importados para o arquivo de teste test/k6/login.test.js e usados dentros das funcoes deste arquivo:
import { generateRandomEmail, generateRandomUsername } from './helpers/random.js';
import { getBaseUrl } from './helpers/getBaseUrl.js';
import { loginUser } from './helpers/login.js';
  username = generateRandomUsername();
  email = generateRandomEmail();
  const url = `${getBaseUrl()}/users/register`;
  const { token, res } = loginUser(username, password);

- Trends:
O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra desse conceito, que é usado para geracao de métrica e estatísticas como: média (avg), mínimo (min), máximo (max), percentis (p(90), p(95), p(99)).
thresholds: {
    http_req_duration: ['p(95)<3000'],
  },
const checkoutTrend = new Trend('checkout_duration');

O código abaixo está armazenado no arquivo test/k6/helpers/login.js
export const loginTrend = new Trend('login_duration');

- Faker: 
O código abaixo está armazenado no arquivo test/k6/helpers/random.js e demonstra o uso do conceito de Faker que é uma bibliotecas de geração de dados falsos cria dados de teste realistas durante os testes de performance.
export function generateRandomEmail() {
  return faker.person.email();
}
export function generateRandomUsername() {
  return faker.internet.username();
}
Posteriormente, essas funcoes sao chamadas dentro do arquivo test/k6/login.test.js, onde dentro dele faço uso de um Helper, usando variaveis.
import { generateRandomEmail, generateRandomUsername } from './helpers/random.js';
username = generateRandomUsername();
email = generateRandomEmail(); 

- Variável de Ambiente:
O código abaixo está armazenado no arquivo test/k6/helpers/getBaseUrl.js e demonstra o uso do conceito de uma variavel de ambiente utilizada para executar o mesmo teste em varios ambiente.
return __ENV.BASE_URL;
Com essa variaveis, o ambiente pode ser defivido na linha de comando, na chamada da execucao. EX: k6 run -e BASE_URL=http://localhost:3001 test/k6/login.test.js

- Stages:
O código abaixo está armazenado no arquivo test/k6/login.test.js e demonstra o uso do conceito Stages, usado para definir como a carga (usuários virtuais) varia ao longo do tempo durante um teste de performance. Descreve ritmo do teste: subir carga, manter, e depois reduzir.
stages: [
        { duration: '3s', target: 5 },     // Ramp up
        { duration: '15s', target: 10 },    // Average
        { duration: '2s', target: 30 },    // Spike
        { duration: '3s', target: 20 },    // Spike
        { duration: '5s', target: 10 },     // Average
        { duration: '5s', target: 0 },      // Ramp up
    ],

- Reaproveitamento de Resposta:
Esse conceito usa dados retornados por uma requisição para alimentar requisições seguintes, simulando um fluxo real de usuário.
1) O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso desse conceito, reutilizando dados de uma lista.
const user = data[(__VU - 1) % data.length];
Alem disso, o token retornado pela função loginUser é reutilizado para validações e é verificado para garantir que está presente na resposta.
group('login user', () => {
  const { token, res } = loginUser(username, password);
  check(res, { 'token is present': (r) => !!r.json('token') });
});
2) O código abaixo está armazenado no arquivo test/k6/login.test.js. A função loginUser realiza uma requisição HTTP POST para o endpoint de login e retorna o token obtido na resposta. Esse token pode ser reutilizado em outros contextos, como autenticação em chamadas subsequentes.
const token = res.json('token');
return { token, res };

 - Uso de Token de Autenticação:
1) O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso de Token de Autenticação e tambem a validacao para verificar se esta sendo gerado corretamente.
const { token, res } = loginUser(username, password);
check(res, { 'token is present': (r) => !!r.json('token') });
2) O código abaixo está armazenado no arquivo test/k6/helperslogin.js, onde na resposta da requisição o token retornado é extraído e reutilizado.
const token = res.json('token');
return { token, res };

 - Data-Driven Testing:
O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito executando o mesmo script.JSON de teste (test/k6/data/login.test.data.json) usando diferentes conjuntos de dados, simulando usuários distintos e cenários reais, sem alterar a lógica do teste.
import { SharedArray } from 'k6/data';
const data = new SharedArray('user', function () {
  return JSON.parse(open('./data/login.test.data.json'));
});

 - Groups:
 O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito de Groups e dentro dele faço uso de um Helper, uma função de registro e outra funcao de login, que foi importada de um outro script javascript.
group('register user', () => {
    username = generateRandomUsername();
    password = 'Test@1234';
    email = generateRandomEmail();
    const url = `${getBaseUrl()}/users/register`;
    const payload = JSON.stringify({ username, password, favorecidos: [] });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    check(res, { 'register status is 201': (r) => r.status === 201 });
  });

  group('login user', () => {
    const { token, res } = loginUser(username, password);
    check(res, { 'token is present': (r) => !!r.json('token') });
  });
  sleep(1);