const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Conectar a la base de datos MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Servidor corriendo en el puerto: ${PORT}`);
    console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(` URL Local: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}).catch((err) => {
  console.error('Error crítico al iniciar la base de datos:', err);
});

