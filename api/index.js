const mongoose = require('mongoose');
const app = require('../src/app');

let cachedConnection = null;

const connectDB = async () => {
  // Reutilizar conexión activa si ya está abierta
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('La variable de entorno MONGODB_URI no está configurada.');
  }

  try {
    cachedConnection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB Atlas conectado en entorno Serverless (Vercel)');
    return cachedConnection;
  } catch (error) {
    console.error('Error al conectar con MongoDB Atlas en Vercel:', error.message);
    throw error;
  }
};

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Error al conectar con la base de datos en la nube',
      error: err.message,
    });
  }
  return app(req, res);
};
