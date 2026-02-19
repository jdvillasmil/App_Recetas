// Script de utilidad para sincronizar los modelos con la base de datos.
// Uso: node sync.js
// ADVERTENCIA: force:true BORRA y recrea todas las tablas (solo para desarrollo).

require('dotenv').config();
const { sequelize } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    await sequelize.sync({ force: true });
    console.log('Tablas creadas exitosamente:');

    // Listar las tablas reales creadas en la base de datos
    const [results] = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    results.forEach((row) => console.log(`  - ${row.tablename}`));

    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar:', error);
    process.exit(1);
  }
})();
