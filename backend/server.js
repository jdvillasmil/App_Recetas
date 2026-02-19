require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const recipeRoutes = require('./src/routes/recipeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rutas
app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Conectar BD y levantar servidor
sequelize.authenticate()
  .then(() => {
    console.log('Base de datos conectada.');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error al conectar la base de datos:', err);
    process.exit(1);
  });
