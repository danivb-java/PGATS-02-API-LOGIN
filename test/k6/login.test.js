import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { generateRandomEmail, generateRandomUsername } from './helpers/random.js';
import { getBaseUrl } from './helpers/getBaseUrl.js';
import { loginUser } from './helpers/login.js';
import { SharedArray } from 'k6/data';

const data = new SharedArray('user', function () {
  return JSON.parse(open('./data/login.test.data.json'));
});


export const options = {
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% das requests devem ser < 3s
  },
    stages: [
        { duration: '3s', target: 5 },     // Ramp up
        { duration: '15s', target: 10 },    // Average
        { duration: '2s', target: 30 },    // Spike
        { duration: '3s', target: 20 },    // Spike
        { duration: '5s', target: 10 },     // Average
        { duration: '5s', target: 0 },      // Ramp up
    ],
};

const checkoutTrend = new Trend('checkout_duration');

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