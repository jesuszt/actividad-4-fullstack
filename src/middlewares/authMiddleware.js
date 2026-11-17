const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_fullstack_2026'
      );

      // Adjuntar el usuario al objeto req (excluyendo la contraseña)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado, usuario no encontrado',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token no válido o expirado',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado, falta token en el encabezado de autorización',
    });
  }
};

module.exports = { protect };

