const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Middlewares y Modelos - Pruebas Unitarias de Errores y Validaciones', () => {
  describe('Middleware de Rutas No Encontradas (404)', () => {
    it('debe responder con 404 al solicitar una ruta inexistente', async () => {
      const res = await request(app).get('/api/ruta-totalmente-inexistente');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Ruta no encontrada');
    });
  });

  describe('Health Check Endpoint', () => {
    it('debe responder con estado OK en /api/health (200)', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.message).toContain('Servidor operativo y saludable');
    });
  });

  describe('Modelo User - Métodos de Instancia y Encriptación', () => {
    it('debe comparar contraseñas correctamente usando matchPassword', async () => {
      const plainPassword = 'password123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(plainPassword, salt);

      const user = new User({
        name: 'Prueba Model',
        email: 'modeltest@example.com',
        password: hashedPassword,
      });

      const isMatch = await user.matchPassword('password123');
      const isNotMatch = await user.matchPassword('passwordIncorrecta');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });
});
