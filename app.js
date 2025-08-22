const express = require('express');
const userController = require('./controller/userController');
const controlController = require('./controller/controlController');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
app.use(express.json());

app.use('/api/users', userController);
app.use('/api/control', controlController);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
