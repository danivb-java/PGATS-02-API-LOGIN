const User = require('../model/userModel');

async function registerUser(login, password) {
  const existingUser = User.findByLogin(login);
  if (existingUser) {
    throw new Error('Usuário já registrado.');
  }
  return User.create(login, password);
}

async function loginUser(login, password) {
  const user = User.findByLogin(login);
  if (!user || user.password !== password) {
    throw new Error('Login ou senha inválidos.');
  }
  return { login: user.login };
}

module.exports = { registerUser, loginUser };
