const express = require('express');
const router = express.Router();


const controlModel = require('../model/controllerModel');

// Rota de controle para verificar se a API está online e obter info extra
router.get('/health', (req, res) => {
  res.status(200).json(controlModel.getStatus());
});

// Rota de controle para resetar os usuários (útil para testes)
const User = require('../model/userModel');
router.post('/reset', (req, res) => {
  if (typeof User.reset === 'function') {
    User.reset();
    controlModel.setLastReset(new Date().toISOString());
    res.status(200).json({ message: 'Usuários resetados com sucesso.' });
  } else {
    res.status(501).json({ message: 'Função de reset não implementada.' });
  }
});

module.exports = router;
