// Script de utilidad para sincronizar los modelos con la base de datos.
// Uso: node sync.js
// ADVERTENCIA: alter:true modifica tablas existentes sin borrar datos,
//              pero puede fallar si hay conflictos de constraints.

require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');

    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar:', error);
    process.exit(1);
  }
})();
