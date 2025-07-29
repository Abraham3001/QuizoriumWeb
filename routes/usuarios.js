const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const { enviarCorreoDeVerificacion } = require('../utils/email');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'rol', 'nombre']  // <-- asegúrate que 'nombre' esté incluido
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Eliminar usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar rol
router.put('/:id/rol', async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['profesor', 'estudiante'].includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.rol = rol;
    await usuario.save();

    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
});

// Verificar código
router.post('/verificar', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Faltan datos.' });

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado.' });
    if (usuario.verificationCode !== code) return res.status(400).json({ error: 'Código incorrecto.' });

    await usuario.update({ verified: true, verificationCode: null });
    return res.json({ success: true });
  } catch (err) {
    console.error('Error al verificar código:', err);
    res.status(500).json({ error: 'Error al verificar.' });
  }
});

// Reenviar código
router.post('/reenviar-codigo', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido.' });

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado.' });
    if (usuario.verified) return res.status(400).json({ error: 'La cuenta ya está verificada.' });

    const nuevoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
    await usuario.update({ verificationCode: nuevoCodigo });
    await enviarCorreoDeVerificacion(email, nuevoCodigo);

    return res.json({ success: true });
  } catch (err) {
    console.error('Error al reenviar código:', err);
    res.status(500).json({ error: 'Error al reenviar.' });
  }
});

//--------------------
// Ruta: Importar usuarios desde CSV
//--------------------
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/importar', upload.single('archivo'), async (req, res) => {
  try {
    const csv = fs.readFileSync(req.file.path, 'utf8');
    const lines = csv.split('\n').slice(1); // omitir cabecera

    const usuarios = lines
      .map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')))
      .filter(cells => cells.length >= 3) // nombre,email,rol
      .map(([nombre, email, rol]) => ({
        nombre,
        email: email.toLowerCase(),
        rol,
        password: bcrypt.hashSync('Default123!', 10), // contraseña genérica (puedes cambiarla)
        verified: true
      }));

    for (const u of usuarios) {
      const existente = await Usuario.findOne({ where: { email: u.email } });
      if (!existente) {
        await Usuario.create(u);
      }
    }

    fs.unlinkSync(req.file.path); // limpiar el archivo subido
    res.json({ success: true, message: 'Usuarios importados correctamente' });
  } catch (err) {
    console.error('Error al importar usuarios:', err);
    res.status(500).json({ success: false, message: 'Error en importación' });
  }
});

// Crear usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, rol, password, bloquear } = req.body;

    if (!email || !rol) {
      return res.status(400).json({ error: 'Email y rol son obligatorios' });
    }

    const existente = await Usuario.findOne({ where: { email } });

    if (existente) {
      // Opcional: Resetear contraseña si se manda
      if (password) {
        const hash = await bcrypt.hash(password, 10);
        existente.password = hash;
      }
      if (bloquear) {
        existente.verified = false;
      }
      await existente.save();
      return res.status(200).json({ mensaje: 'Usuario actualizado' });
    }

    const nuevo = await Usuario.create({
      nombre: nombre || 'Usuario',
      email,
      rol,
      password: await bcrypt.hash(password || 'Default123!', 10),
      verified: !bloquear
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ error: 'Error interno al crear usuario' });
  }
});



// 👇 ESTA es la única exportación válida
module.exports = router;
