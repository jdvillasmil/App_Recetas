const jwt = require('jsonwebtoken');

// Middleware de autenticación — verifica el JWT del header Authorization
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = authMiddleware;
