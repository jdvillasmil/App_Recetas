const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');

// Genera un JWT con expiración de 7 días
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

// Formatea el objeto usuario para las respuestas (nunca expone password_hash)
const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
});

// ── POST /api/auth/register ──
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'El username debe tener al menos 3 caracteres.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'El email no es válido.' });
    }

    // Verificar duplicados
    const existing = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });
    if (existing) {
      const field = existing.email === email ? 'email' : 'username';
      return res.status(409).json({ error: `El ${field} ya está registrado.` });
    }

    // Crear usuario con password hasheado
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password_hash });

    const token = generateToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── POST /api/auth/login ──
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = generateToken(user);
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── GET /api/auth/profile ──
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en getProfile:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── PUT /api/auth/profile ──
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Validar que el nuevo username/email no estén en uso por OTRO usuario
    if (username || email) {
      const conditions = [];
      if (username) conditions.push({ username });
      if (email) conditions.push({ email });

      const conflict = await User.findOne({
        where: {
          [Op.or]: conditions,
          id: { [Op.ne]: req.user.id },
        },
      });
      if (conflict) {
        const field = conflict.username === username ? 'username' : 'email';
        return res.status(409).json({ error: `El ${field} ya está en uso por otro usuario.` });
      }
    }

    // Validaciones de formato
    if (username && username.length < 3) {
      return res.status(400).json({ error: 'El username debe tener al menos 3 caracteres.' });
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'El email no es válido.' });
      }
    }

    // Actualizar solo campos enviados
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// ── DELETE /api/auth/account ──
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // CASCADE eliminará automáticamente grupos, recetas, ingredientes, pasos y relaciones
    await user.destroy();

    return res.json({ message: 'Cuenta eliminada exitosamente.' });
  } catch (error) {
    console.error('Error en deleteAccount:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

module.exports = { register, login, getProfile, updateProfile, deleteAccount };
