const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');

// Mock del modelo User de Mongoose para pruebas unitarias aisladas
jest.mock('../src/models/User');

describe('Módulo de Autenticación - Pruebas Unitarias y de Rutas', () => {
  const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_fullstack_2026';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario exitosamente y retornar un token JWT (201)', async () => {
      const mockCreatedUser = {
        _id: '60d0fe4f5311236168a109ca',
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        password: 'hashedPassword123',
      };

      User.findOne.mockResolvedValue(null); // Usuario no existe previamente
      User.create.mockResolvedValue(mockCreatedUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos Ruiz',
          email: 'carlos@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Usuario registrado exitosamente');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('carlos@example.com');
      expect(res.body.data.name).toBe('Carlos Ruiz');
    });

    it('debe retornar 400 si faltan campos obligatorios en el registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos Ruiz',
          // falta email y password
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Por favor complete todos los campos');
    });

    it('debe retornar 400 si la contraseña tiene menos de 6 caracteres', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Carlos Ruiz',
          email: 'carlos@example.com',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('al menos 6 caracteres');
    });

    it('debe retornar 400 si el correo electrónico ya está registrado', async () => {
      User.findOne.mockResolvedValue({
        _id: '60d0fe4f5311236168a109cb',
        email: 'existente@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Duplicado',
          email: 'existente@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('El correo electrónico ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión exitosamente con credenciales válidas y retornar JWT (200)', async () => {
      const mockUser = {
        _id: '60d0fe4f5311236168a109ca',
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Inicio de sesión exitoso');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe('carlos@example.com');
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
    });

    it('debe retornar 400 si faltan correo o contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@example.com',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Por favor proporcione correo electrónico y contraseña');
    });

    it('debe retornar 401 si el usuario no existe', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Credenciales inválidas');
    });

    it('debe retornar 401 si la contraseña es incorrecta', async () => {
      const mockUser = {
        _id: '60d0fe4f5311236168a109ca',
        email: 'carlos@example.com',
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@example.com',
          password: 'contraseñaIncorrecta',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/profile (Ruta Protegida)', () => {
    it('debe retornar el perfil del usuario autenticado si el token JWT es válido (200)', async () => {
      const userId = '60d0fe4f5311236168a109ca';
      const token = jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });

      const mockUserProfile = {
        _id: userId,
        name: 'Carlos Ruiz',
        email: 'carlos@example.com',
      };

      // Mock para middleware protect y para el controlador
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUserProfile),
      });

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('carlos@example.com');
    });

    it('debe retornar 401 si no se envía el token en los encabezados', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('falta token en el encabezado');
    });

    it('debe retornar 401 si el token enviado es inválido', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer tokenInvalido12345');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('token no válido o expirado');
    });
  });
});

