const { Sequelize } = require('sequelize');
require('dotenv').config();

// Conexión a PostgreSQL usando DATABASE_URL del entorno
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,

  // SSL condicional: activo en producción (Railway, Render, etc.)
  dialectOptions: process.env.NODE_ENV === 'production'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

module.exports = sequelize;
