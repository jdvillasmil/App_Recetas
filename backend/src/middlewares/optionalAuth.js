const jwt = require('jsonwebtoken');

// Middleware opcional: decodifica el JWT si existe, pero no bloquea si no hay token
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Token inválido — se ignora, req.user queda undefined
    }
  }
  next();
};

module.exports = optionalAuth;
