/**
 * Script de Verificación de Conectividad con MongoDB Atlas
 * Permite validar de forma segura que las credenciales y la URI de conexión
 * configuradas en las variables de entorno (.env) funcionan correctamente.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../.env') });

const maskMongoUri = (uri) => {
  if (!uri) return 'NO DEFINIDA';
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, '$1*****$3');
  } catch {
    return '***URI_OCULTA***';
  }
};

const testConnection = async () => {
  console.log('====================================================');
  console.log('   PRUEBA DE CONEXIÓN A MONGODB ATLAS / LOCAL       ');
  console.log('====================================================');

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ ERROR: La variable MONGODB_URI no está definida en el archivo .env');
    console.log('💡 Ejemplo esperado:');
    console.log('   MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster0.abcde.mongodb.net/gestion_productos?retryWrites=true&w=majority');
    process.exit(1);
  }

  console.log(`📡 Cadena de conexión (Segura): ${maskMongoUri(uri)}`);
  console.log('⏳ Estableciendo conexión con el clúster...');

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    const elapsed = Date.now() - startTime;

    console.log(`✅ Conexión establecida con éxito en ${elapsed} ms!`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📁 Base de datos activa: ${conn.connection.name}`);
    console.log(`📊 Estado de conexión: ${conn.connection.readyState === 1 ? 'Conectado (Ready)' : conn.connection.readyState}`);

    // Ping al servidor de MongoDB
    const pingResult = await conn.connection.db.admin().ping();
    console.log(`🏓 Ping al servidor Atlas: ${JSON.stringify(pingResult)}`);

    // Listar colecciones disponibles
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📦 Colecciones encontradas (${collections.length}):`, collections.map(c => c.name).join(', ') || '(Ninguna aún)');

    console.log('====================================================');
    console.log('🎉 RESULTADO: El servidor tiene acceso completo y seguro a MongoDB Atlas.');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR al conectar con MongoDB:');
    console.error(`   Mensaje: ${error.message}`);
    console.log('\n🔍 Diagnóstico común para MongoDB Atlas:');
    console.log('   1. ¿Configuraste Network Access en Atlas a 0.0.0.0/0 (Permitir desde cualquier lugar)?');
    console.log('   2. ¿El usuario y contraseña en la URI coinciden con los creados en Database Access de Atlas?');
    console.log('   3. ¿Si tu contraseña tiene caracteres especiales (@, :, /), están codificados con encodeURIComponent?');
    console.log('   4. ¿El nombre de la base de datos está especificado en la URI?');
    console.log('====================================================');
    process.exit(1);
  }
};

testConnection();
