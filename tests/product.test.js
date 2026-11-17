const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Product = require('../src/models/Product');
const User = require('../src/models/User');

// Mock de modelos de Mongoose
jest.mock('../src/models/Product');
jest.mock('../src/models/User');

describe('Módulo de Productos (CRUD) - Pruebas Unitarias y de Rutas', () => {
  const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_fullstack_2026';
  const mockUserId = '60d0fe4f5311236168a109ca';
  let validToken;

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = jwt.sign({ id: mockUserId }, secretKey, { expiresIn: '1h' });

    // Mock por defecto para el middleware protect
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: mockUserId,
        name: 'Administrador',
        email: 'admin@example.com',
      }),
    });
  });

  describe('Control de Acceso y Autorización (JWT)', () => {
    it('debe rechazar con 401 cualquier solicitud a /api/products sin token', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('falta token');
    });

    it('debe rechazar con 401 cualquier solicitud a /api/products con token manipulado', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer tokenInvalidoFalso');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('token no válido');
    });
  });

  describe('GET /api/products (Listar Productos)', () => {
    it('debe listar todos los productos registrados (200)', async () => {
      const mockProducts = [
        {
          _id: '60d0fe4f5311236168a10901',
          name: 'Teclado Mecánico',
          category: 'Tecnología',
          price: 75.5,
          stock: 15,
          user: { name: 'Admin', email: 'admin@example.com' },
        },
        {
          _id: '60d0fe4f5311236168a10902',
          name: 'Mouse Ergonómico',
          category: 'Tecnología',
          price: 35.0,
          stock: 25,
          user: { name: 'Admin', email: 'admin@example.com' },
        },
      ];

      Product.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockProducts),
        }),
      });

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toBe('Teclado Mecánico');
    });
  });

  describe('POST /api/products (Crear Producto)', () => {
    it('debe crear un nuevo producto exitosamente con datos válidos (201)', async () => {
      const newProductData = {
        name: 'Monitor Gamer 27"',
        description: 'Panel IPS 144Hz 1ms',
        price: 299.99,
        category: 'Monitores',
        stock: 8,
      };

      const mockSavedProduct = {
        _id: '60d0fe4f5311236168a10999',
        ...newProductData,
        user: mockUserId,
      };

      Product.create.mockResolvedValue(mockSavedProduct);

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send(newProductData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Producto creado exitosamente');
      expect(res.body.data.name).toBe('Monitor Gamer 27"');
      expect(res.body.data.price).toBe(299.99);
      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Monitor Gamer 27"',
          price: 299.99,
          stock: 8,
          user: mockUserId,
        })
      );
    });

    it('debe retornar 400 si faltan campos obligatorios al crear producto', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Producto Incompleto',
          // falta precio, categoría y stock
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Por favor proporcione todos los campos obligatorios');
    });

    it('debe retornar 400 si el precio o stock son negativos', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Producto Precio Inválido',
          category: 'Tecnología',
          price: -50,
          stock: 10,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('no pueden ser valores negativos');
    });
  });

  describe('GET /api/products/:id (Detalle de Producto)', () => {
    it('debe retornar los datos del producto si el ID existe (200)', async () => {
      const productId = '60d0fe4f5311236168a10901';
      const mockProduct = {
        _id: productId,
        name: 'Silla Ergonómica',
        category: 'Oficina',
        price: 180,
        stock: 5,
        user: { name: 'Admin', email: 'admin@example.com' },
      };

      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockProduct),
      });

      const res = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Silla Ergonómica');
    });

    it('debe retornar 404 si el producto no existe', async () => {
      Product.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app)
        .get('/api/products/60d0fe4f5311236168a10000')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Producto no encontrado');
    });
  });

  describe('PUT /api/products/:id (Actualizar Producto)', () => {
    it('debe actualizar los datos del producto existente correctamente (200)', async () => {
      const productId = '60d0fe4f5311236168a10901';
      const existingProduct = {
        _id: productId,
        name: 'Producto Antiguo',
        price: 50,
      };

      const updatedProduct = {
        _id: productId,
        name: 'Producto Modificado',
        price: 75,
        stock: 20,
      };

      Product.findById.mockResolvedValue(existingProduct);
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          name: 'Producto Modificado',
          price: 75,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Producto actualizado exitosamente');
      expect(res.body.data.name).toBe('Producto Modificado');
    });

    it('debe retornar 404 al intentar actualizar un producto inexistente', async () => {
      Product.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/products/60d0fe4f5311236168a10000')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Nombre Nuevo' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Producto no encontrado');
    });

    it('debe retornar 400 si se intenta actualizar con precio negativo', async () => {
      Product.findById.mockResolvedValue({ _id: '60d0fe4f5311236168a10901' });

      const res = await request(app)
        .put('/api/products/60d0fe4f5311236168a10901')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ price: -10 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('El precio no puede ser negativo');
    });
  });

  describe('DELETE /api/products/:id (Eliminar Producto)', () => {
    it('debe eliminar el producto si existe (200)', async () => {
      const productId = '60d0fe4f5311236168a10901';
      Product.findById.mockResolvedValue({ _id: productId, name: 'A Eliminar' });
      Product.findByIdAndDelete.mockResolvedValue({ _id: productId });

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Producto eliminado exitosamente');
      expect(res.body.data.id).toBe(productId);
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
    });

    it('debe retornar 404 si el producto a eliminar no existe', async () => {
      Product.findById.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/products/60d0fe4f5311236168a10000')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Producto no encontrado');
    });
  });
});
