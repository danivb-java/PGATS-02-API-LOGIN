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
