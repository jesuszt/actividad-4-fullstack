const mongoose = require('mongoose');
const app = require('../src/app');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 5000,
      }
    );
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB conectado en entorno Serverless (Vercel)');
  } catch (error) {
    console.error('Error de conexión a MongoDB en Vercel:', error);
  }
};

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
