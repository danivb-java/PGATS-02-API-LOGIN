const express = require('express');
const router = express.Router();
const userService = require('../service/userService');

router.post('/register', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
  }
  try {
    const user = await userService.registerUser(login, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
  }
  try {
    const user = await userService.loginUser(login, password);
    res.status(200).json({ message: 'Login realizado com sucesso', user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

module.exports = router;
