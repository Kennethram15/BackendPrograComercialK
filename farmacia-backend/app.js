const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const { verificarToken } = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Sistema de Farmacia funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api', verificarToken, routes);

app.use(errorHandler);

module.exports = app;