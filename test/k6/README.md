## Testes de Performance usando o K6
Testes de performance são realizados com o k6, uma ferramenta moderna para testes de carga.

### Pré-requisito:
- O arquivo `K6` deve ser instalado na maquina onde os testes serao executados.
- Para instalacao, use o documento: `https://grafana.com/docs/k6/latest/set-up/install-k6/`

### Como executar o teste de performance
- Certifique-se de que a API REST está rodando: 
  ```sh
  node server.js
  ```.
- Execute o teste de performance:
  ```sh
  k6 run test/k6/login.test.js
  ```

### Como executar o teste de performance e gerar um relatorio
 - Para exportar um resumo dos resultados em um relatorio HTML:
  ```sh
  K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=html-report.html k6 run test/k6/login.test.js
  ```

### Conceitos empregados nos Testes de Performance:

### Thresholds:
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito de Thresholds. Mostra os valores maximos e minimos aceitaveis para metricas de desempenho. Definem critérios de aceitação de performance, determinando se um teste passou ou falhou com base em métricas específicas.
  - Nesse codigo esta definido que 95% das requisicoes devem responder em menos de 3 segundos.
  ```sh
      export const options = {
      thresholds: {
        http_req_duration: ['p(95)<3000'],
      },
  ```

### Checks:
 - Esse conceito é usado para fazer assercoes (validacoes) aplicadas a resposta de uma requisicao. Validam se as respostas atendem aos critérios esperados, sem interromper a execução do teste quando falham.
 Nesse caso, o conceito foi usado em dois arquivos.
 - Os códigos abaixo estao armazenados no arquivo test/k6/login.test.js.
 - O primeiro trecho de codigo verifica se o status code de resposta da requisicao é igual a 201.
 - O segundo trecho de codigo verifica o token é retornado após o login do usuario.
 ```sh
     check(res, { 'register status is 201': (r) => r.status === 201 });
     check(res, { 'token is present': (r) => !!r.json('token') });
 ```
 - O código abaixo está armazenado no arquivo test/k6/helpers/login.js. O trecho de codigo verifica se o status code de resposta da requisicao é igual a 200.  
 ```sh
     check(res, { 'login status is 200': (r) => r.status === 200 });
 ```

### Helpers:
 - A importancia de usar esse conceito é modularizar, criar funções utilitárias que ajudam a escrever scripts mais limpos, reutilizáveis e fáceis de manter. São criadas para encapsular tarefas repetitivas.
 - Foram criadas as pastas:
    - test/k6/helpers/getBaseUrl.js, onde contem a funcao que chama a pagina (URL) do projeto.
    ```sh
        export function getBaseUrl() {
          return __ENV.BASE_URL || 'http://localhost:3001';
        }
    ```
    - test/k6/helpers/login.js, onde contem a funcao que faz o login do usuario atraves de username e password.
    ```sh
        import http from 'k6/http';
        import { check } from 'k6';
        import { Trend } from 'k6/metrics';
        import { getBaseUrl } from './getBaseUrl.js';

        export const loginTrend = new Trend('login_duration');

        export function loginUser(username, password) {
        const url = `${getBaseUrl()}/users/login`;
        const payload = JSON.stringify({ username, password });
        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        loginTrend.add(res.timings.duration);
        check(res, { 'login status is 200': (r) => r.status === 200 });
        const token = res.json('token');
        return { token, res };
        }
    ```
    - test/k6/helpers/random.js, onde contem a funcao que gera aleatoriamente, com o uso do Faker, nomes de usuarios e emails aleatorios a cada execucao.
    ```sh
        import faker from 'k6/x/faker';

        export function generateRandomEmail() {
          return faker.person.email();
        }

        export function generateRandomUsername() {
          return faker.internet.username();
        }
    ```
    - Os Helpers sao importados para o arquivo de teste test/k6/login.test.js e usados dentros das funcoes deste arquivo:
    ```sh
    import { generateRandomEmail, generateRandomUsername } from './helpers/random.js';
    import { getBaseUrl } from './helpers/getBaseUrl.js';
    import { loginUser } from './helpers/login.js';
    ```

### Trends:
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra esse conceito que é usado para geracao de métrica e estatísticas como: média (avg), mínimo (min), máximo (max) e percentis.
  ```sh
      export const options = {
        thresholds: {
          http_req_duration: ['p(95)<3000'],
        },
      };

      const checkoutTrend = new Trend('checkout_duration');
  ```
 - O código abaixo está armazenado no arquivo test/k6/helpers/login.js
  ```sh
      export const loginTrend = new Trend('login_duration');
  ```

### Faker:
 - O código abaixo está armazenado no arquivo test/k6/helpers/random.js e demonstra o uso do conceito de Faker que é uma bibliotecas de geração de dados falsos, onde cria dados de teste realistas durante os testes de performance.
  ```sh
      export function generateRandomEmail() {
        return faker.person.email();
      }
    - export function generateRandomUsername() {
        return faker.internet.username();
      }
  ```
 - Posteriormente, essas funcoes sao chamadas dentro do arquivo test/k6/login.test.js, onde dentro dele faço uso de um Helper, usando variaveis.
  ```sh
      import { generateRandomEmail, generateRandomUsername } from './helpers/random.js';
      
      export default function () {
      let username, password, email;
      group('register user', () => {
        username = generateRandomUsername();
        password = 'Test@1234';
        email = generateRandomEmail();
        .
        .
        .
      });
  ```

### Variável de Ambiente:
 - O código abaixo está armazenado no arquivo test/k6/helpers/getBaseUrl.js e demonstra o uso do conceito de uma variavel de ambiente utilizada para executar o mesmo teste em ambientes diferentes.
  ```sh
      export function getBaseUrl() {
        return __ENV.BASE_URL || 'http://localhost:3001';
      }
  ```
  - Neste exemplo, a função verifica se existe uma variável de ambiente BASE_URL definida através de __ENV.BASE_URL. Se não existir, utiliza o valor padrão 'http://localhost:3001'.
  - Outra forma de utilizar essa variavel é definindo o ambiente onde o teste sera executado atraves da linha de comando, na chamada da execucao. EX: `k6 run -e BASE_URL=http://localhost:3001  test/k6/login.test.js`

### Stages:
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demonstra o uso do conceito Stages, usado para definir como a carga (usuários virtuais) varia ao longo do tempo durante um teste de performance. Descreve o ritmo do teste: subir carga, manter, e depois reduzir.
  ```sh
      export const options = {
        stages: [
            { duration: '3s', target: 5 }, // Ramp up
            { duration: '15s', target: 10 }, // Average
            { duration: '2s', target: 30 }, // Spike
            { duration: '10s', target: 20 }, // Spike
            { duration: '8s', target: 10 }, // Average
            { duration: '5s', target: 0 }, // Ramp up
        ],
      };
  ```

### Reaproveitamento de Resposta:
 - Esse conceito usa dados retornados por uma requisição para alimentar requisições seguintes, simulando um fluxo real de usuário.
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso desse conceito, reutilizando dados de uma lista JSON (arquivo test/k6/data/login.test.data.json).
  ```sh
      const user = data[(__VU - 1) % data.length];`
  ```
 - Outro local do conceito empregado é no token JWT retornado pela função loginUser, que é reutilizado para validações e é verificado para garantir que está presente na resposta.
  ```sh
      group('login user', () => {
        const { token, res } = loginUser(username, password);
        check(res, { 'token is present': (r) => !!r.json('token') });
      });
  ```
 - O código abaixo está armazenado no arquivo test/k6/login.js. A função loginUser realiza uma requisição HTTP POST para o endpoint de login e retorna o token obtido na resposta. Esse token JWT foi reutilizado em outros contextos, como autenticação em chamadas subsequentes.
  ```sh
        const token = res.json('token');
        return { token, res };
      }

  ```

### Uso de Token de Autenticação:
 - O código abaixo está armazenado no arquivo test/k6/helpers/login.js, onde na resposta da requisição o token JWT retornado é extraído e reutilizado. Demonstra o uso do conceito de Token de Autenticação. Token de autenticação JWT é usado para testar endpoints protegidos.
 Nesse codigo, a função realiza uma requisição POST para o endpoint de login enviando credenciais, e extrai o token JWT da resposta através de res.json('token').
  ```sh
      export function loginUser(username, password) {
        const url = `${getBaseUrl()}/users/login`;
        const payload = JSON.stringify({ username, password });
        const params = { headers: { 'Content-Type': 'application/json' } };
        const res = http.post(url, payload, params);
        loginTrend.add(res.timings.duration);
        check(res, { 'login status is 200': (r) => r.status === 200 });
        const token = res.json('token');
        return { token, res };
      }
  ```
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso de Token Jwt de Autenticação e tambem a validacao para verificar se esta sendo gerado corretamente.
  ```sh
      group('login user', () => {
        const { token, res } = loginUser(username, password);
        check(res, { 'token is present': (r) => !!r.json('token') });
      });
  ``` 

### Data-Driven Testing:
- O código abaixo está armazenado no arquivo test/k6/data/login.test.data.json e demontra o uso do conceitoque permite executar testes com diferentes conjuntos de dados carregados de arquivos externos. Este arquivo externo contém um array de objetos com credenciais de diferentes usuários e ermite adicionar ou modificar usuários de teste sem alterar o código.
  ```sh 
      [
        {
            "email": "john@example.com",
            "password": "password123"
        },
        {
            "email": "jane@example.com",
            "password": "password456"
        },
        {
            "email": "bob@example.com",
            "password": "password789"
        }
      ]
  ```
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito executando o mesmo script.JSON de teste (test/k6/data/login.test.data.json) usando diferentes conjuntos de dados, simulando usuários distintos e cenários reais, sem alterar a lógica do teste.
  ```sh
      import { SharedArray } from 'k6/data';

      const data = new SharedArray('user', function () {
        return JSON.parse(open('./data/login.test.data.json'));
      });

      export default function () {
        const user = data[(__VU - 1) % data.length]; // Reaproveitamento de dados
      }
  ```

### Groups:
 - O código abaixo está armazenado no arquivo test/k6/login.test.js e demontra o uso do conceito de Groups e dentro dele faço uso de um Helper, uma função de registro e outra funcao de login, que foi importada de um outro script javascript.
 - Cada group() encapsula um conjunto de operações relacionadas, permitindo que o K6 agrupe as métricas por funcionalidade. Dentro do grupo `login user`, utilizo o Helper loginUser() importado de outro arquivo, demonstrando a modularização do código. Os grupos aparecem separadamente nos relatórios, permitindo analisar a performance de cada funcionalidade individualmente.
  ```sh
      export default function () {
        const user = data[(__VU - 1) % data.length]; // Reaproveitamento de dados

        let username, password, email;
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
      }
  ```