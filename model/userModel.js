const users = [];

function findByLogin(login) {
  return users.find(user => user.login === login);
}

function create(login, password) {
  const user = { login, password };
  users.push(user);
  return { login: user.login };
}

function reset() {
  users.length = 0;
}

module.exports = { findByLogin, create, reset };
