const express = require('express');
const router = express.Router();
// ====================
// Importación de modelos
// ====================
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt'); // Si todavía no lo tienes aquí
const TipoLeucemia = require('../models/tipoLeucemia');
const SubtipoLeucemia = require('../models/subtipoLeucemia');
const Contenido = require('../models/contenido');
const Cuestionario = require('../models/cuestionario');
const Pregunta = require('../models/pregunta');
// routes/api.js
const Attempt = require('../models/attempt');
const Answer  = require('../models/answer');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// routes/api.js (justo tras el GET /cuestionarios)
router.get(
  '/cuestionarios/:id/attempts',
  requiereLogin,    // o quítalo si no quieres forzar login
  async (req, res) => {
    try {
      // 1. Obtén el cuestionario y el total de preguntas
      const cuestionario = await Cuestionario.findByPk(req.params.id, {
        include: [{ model: Pregunta, as: 'preguntas' }]
      });
      if (!cuestionario) return res.status(404).json({ error: 'Cuestionario no encontrado' });
      const total = cuestionario.preguntas.length;

      // 2. Obtén los intentos
      const attempts = await Attempt.findAll({
        where: { cuestionarioId: req.params.id },
        include: [
          { model: Usuario, as: 'usuario', attributes: ['id','nombre','email'] },
          { model: Answer,  as: 'respuestas', include: { model: Pregunta, as: 'pregunta' } }
        ],
        order: [['createdAt','DESC']]
      });

      // 3. Adjunta el total a cada intento
      const attemptsWithTotal = attempts.map(attempt => ({
        ...attempt.toJSON(),  // Asegura un objeto plano
        totalPreguntas: total
      }));

      return res.json(attemptsWithTotal);
    } catch (err) {
      console.error('Error en GET /cuestionarios/:id/attempts:', err);
      return res.status(500).json({ error: 'No se pudieron cargar los intentos' });
    }
  }
);


// ==============================
// RUTAS DE LEUCEMIAS
// ==============================
router.get('/tipos', async (req, res) => {
  try {
    const tipos = await TipoLeucemia.findAll();
    res.json(tipos);
  } catch (err) {
    console.error('Error al obtener tipos:', err);
    res.status(500).send('Error al obtener tipos');
  }
});

// Crear un nuevo tipo de leucemia
router.post('/tipos', async (req, res) => {
  const { nombre } = req.body;
  try {
    const nuevo = await TipoLeucemia.create({ nombre });
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al guardar tipo:', err);
    res.status(500).send('Error al guardar tipo');
  }
});
// Obtener subtipos por ID de tipo
router.get('/subtipos/:tipoId', async (req, res) => {
  try {
    const subtipos = await SubtipoLeucemia.findAll({
      where: { tipoLeucemiaId: req.params.tipoId }
    });
    res.json(subtipos);
  } catch (err) {
    console.error('Error al obtener subtipos:', err);
    res.status(500).send('Error al obtener subtipos');
  }
});
// Crear un nuevo subtipo
router.post('/subtipos', async (req, res) => {
  const { nombre, tipoLeucemiaId } = req.body;
  try {
    const subtipo = await SubtipoLeucemia.create({ nombre, tipoLeucemiaId });
    res.status(201).json(subtipo);
  } catch (err) {
    console.error('Error al guardar subtipo:', err);
    res.status(500).send('Error al guardar subtipo');
  }
});
// ==============================
// RUTAS DE CONTENIDO
// ==============================
router.get('/usuario-actual', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json(req.session.usuario);
});

router.get('/contenido', async (req, res) => {
  try {
    const contenido = await Contenido.findAll({ order: [['id', 'ASC']] });
    res.json(contenido);
  } catch (err) {
    console.error('Error al obtener contenido:', err);
    res.status(500).send('Error al obtener contenido');
  }
});

// Importar el middleware que verifica sesión (o define uno igual en este archivo)
function requiereLogin(req, res, next) {
  if (!req.session.usuarioId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  next();
}

// GET /api/cuestionarios — ahora incluye los intentos del usuario
router.get(
  '/cuestionarios',
  requiereLogin,
  async (req, res) => {
    try {
      const usuarioId = req.session.usuarioId;
      const cuestionarios = await Cuestionario.findAll({
        include: [
          // siempre traer las preguntas
          { model: Pregunta, as: 'preguntas' },
          // y traemos los intentos de ESTE usuario, si los hay
          {
            model: Attempt,
            as: 'intentos',           // coincide con tu alias en app.js
            where: { usuarioId },
            required: false,          // para incluir también los sin intento
            attributes: ['id','score']
          }
        ]
      });
      res.json(cuestionarios);
    } catch (err) {
      console.error('Error al obtener cuestionarios:', err);
      res.status(500).json({ error: 'Error al obtener cuestionarios' });
    }
  }
);
//-------------------- Responder Cuestionarios --------------------//
// Inicia un intento
router.post(
  '/attempts',
  requiereLogin,
  async (req, res) => {
    try {
      const { cuestionarioId } = req.body;
      const usuarioId = req.session.usuarioId;

      // 1) Verificar si ya existe un intento para este usuario y cuestionario
      let attempt = await Attempt.findOne({
        where: { cuestionarioId, usuarioId }
      });

      if (attempt) {
        // Si ya existe, devolvemos el ID existente sin crear uno nuevo
        return res.status(200).json({ attemptId: attempt.id, duplicate: true });
      }

      // 2) Si no existe, creamos nuevo intento
      attempt = await Attempt.create({ cuestionarioId, usuarioId });
      return res.status(201).json({ attemptId: attempt.id, duplicate: false });

    } catch (err) {
      console.error('Error al iniciar intento:', err);
      return res.status(500).json({ error: 'No se pudo iniciar el intento' });
    }
  }
);

// Guarda las respuestas de un intento
// Guarda las respuestas de un intento
router.post('/attempts/answers', async (req, res) => {
  const { attemptId, answers } = req.body;

  try {
    // 1) Carga todas las preguntas para comparación
    const preguntaIds = answers.map(a => a.preguntaId);
    const preguntas = await Pregunta.findAll({
      where: { id: preguntaIds }
    });
    const preguntasMap = {};
    preguntas.forEach(p => {
      preguntasMap[p.id] = p;
    });

    // 2) Crea cada Answer marcando correct y agregando snapshot
    let correctCount = 0;
    const created = await Promise.all(answers.map(a => {
      const p = preguntasMap[a.preguntaId];
      let isCorrect = false;

      if (!p) {
        isCorrect = false;
      } else {
        // Normaliza ambos lados para comparar
        const expected = p.respuesta;
        const got = a.response;

        if (Array.isArray(expected)) {
          isCorrect = Array.isArray(got) &&
                      expected.length === got.length &&
                      expected.every(v => got.includes(v));
        } else {
          isCorrect = String(expected).trim().toLowerCase() ===
                      String(got).trim().toLowerCase();
        }
      }

      if (isCorrect) correctCount++;

      return Answer.create({
        attemptId,
        preguntaId: a.preguntaId,
        response:   a.response,
        correct:    isCorrect,
        // --- SNAPSHOT ---
        preguntaTexto: p ? p.texto : null,
        preguntaOpciones: p ? p.opciones : null,
        preguntaRespuestaCorrecta: p ? p.respuesta : null,
        preguntaImagen: p ? p.imagen : null
      });
    }));

    // Resto de tu endpoint igual...
    await Attempt.update(
      { score: correctCount },
      { where: { id: attemptId } }
    );

    return res.status(201).json({
      success: true,
      correctCount,
      total: answers.length
    });

  } catch (err) {
    console.error('Error al guardar respuestas:', err);
    return res.status(500).json({ error: 'No se pudieron guardar las respuestas' });
  }
});

// Obtener detalle de un intento por ID
router.get('/attempts/:id', requiereLogin, async (req, res) => {
  try {
    const intento = await Attempt.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id','nombre','email'] },
        {
          model: Answer,
          as: 'respuestas',
          // Aquí no solo traemos la relación a Pregunta, sino la snapshot
          attributes: [
            'id', 'response', 'correct',
            'preguntaTexto',
            'preguntaOpciones',
            'preguntaRespuestaCorrecta',
            'preguntaImagen',  // <-- si agregas este campo a snapshot
            'createdAt'
          ]
        }
      ]
    });

    if (!intento) return res.status(404).json({ error: 'Intento no encontrado' });

    // (Opcional: trae también info básica del cuestionario)
    const cuestionario = await Cuestionario.findByPk(intento.cuestionarioId, {
      attributes: ['id','titulo','descripcion']
    });

    const plain = intento.toJSON();
    plain.cuestionario = cuestionario; // Adjunto la info del cuestionario

    res.json(plain);
  } catch (err) {
    console.error('Error en GET /attempts/:id:', err);
    res.status(500).json({ error: 'No se pudo cargar el intento' });
  }
});

const { enviarCodigoCambioPassword, enviarConfirmacionCambioPassword } = require('../utils/email');

// Enviar código para cambio de contraseña
router.post('/enviar-codigo-cambio', async (req, res) => {
  const { email, codigo } = req.body;
  console.log("Datos recibidos:", email, codigo);

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    console.log("Usuario encontrado:", usuario);

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    usuario.verificationCode = codigo;
    await usuario.save();
    console.log("Código guardado en BD");

    await enviarCodigoCambioPassword(email, codigo);
    console.log("Correo enviado");

    res.json({ success: true });
  } catch (err) {
    console.error("Error al enviar código:", err);
    res.status(500).json({ error: "Error interno al enviar código" });
  }
});


// Cambiar la contraseña
router.post('/actualizar-password', async (req, res) => {
  const { email, nuevaPassword } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const hash = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hash;
    usuario.verificationCode = null; // limpiar código
    await usuario.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
});

// Confirmación por correo después del cambio
router.post('/confirmar-cambio-password', async (req, res) => {
  const { email, nombre } = req.body;
  try {
    await enviarConfirmacionCambioPassword(email, nombre);
    res.json({ success: true });
  } catch (err) {
    console.error("Error al enviar confirmación:", err);
    res.status(500).json({ error: "No se pudo enviar confirmación" });
  }
});

// Obtener un cuestionario por ID
router.get('/cuestionarios/:id', async (req, res) => {
  try {
    const cuestionario = await Cuestionario.findByPk(req.params.id, {
      include: { model: Pregunta, as: 'preguntas' }
    });
    if (!cuestionario) return res.status(404).json({ error: 'No encontrado' });
    res.json(cuestionario);
  } catch (err) {
    console.error('Error al obtener cuestionario:', err);
    res.status(500).json({ error: 'Error al obtener cuestionario' });
  }
});
// Crear un nuevo cuestionario
router.post('/cuestionarios', async (req, res) => {
  const { titulo, descripcion, preguntas } = req.body;
  try {
    const nuevoCuestionario = await Cuestionario.create({ titulo, descripcion });

    if (Array.isArray(preguntas)) {
      for (const pregunta of preguntas) {
        await Pregunta.create({
          texto: pregunta.texto,
          respuesta: pregunta.respuesta,
          cuestionarioId: nuevoCuestionario.id
        });
      }
    }
    res.status(201).json({ mensaje: 'Cuestionario creado', cuestionario: nuevoCuestionario });
  } catch (err) {
    console.error('Error al crear cuestionario:', err);
    res.status(500).json({ error: 'Error al crear cuestionario' });
  }
});
// Editar cuestionario
router.put('/cuestionarios/:id', async (req, res) => {
  const { titulo, descripcion } = req.body;
  try {
    const cuestionario = await Cuestionario.findByPk(req.params.id);
    if (!cuestionario) return res.status(404).json({ error: 'No encontrado' });

    await cuestionario.update({ titulo, descripcion });
    res.json(cuestionario);
  } catch (err) {
    console.error('Error al actualizar cuestionario:', err);
    res.status(500).json({ error: 'Error al actualizar cuestionario' });
  }
});
// Eliminar cuestionario y sus preguntas
router.delete('/cuestionarios/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Verificar si existe
    const cuestionario = await Cuestionario.findByPk(id);
    if (!cuestionario) {
      return res.status(404).json({ error: 'Cuestionario no encontrado' });
    }
    // Eliminar preguntas relacionadas
    await Pregunta.destroy({ where: { cuestionarioId: id } });
    // Eliminar el cuestionario
    await Cuestionario.destroy({ where: { id } });
    res.json({ mensaje: 'Cuestionario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cuestionario:', err);
    res.status(500).json({ error: 'Error al eliminar cuestionario' });
  }
});

// Agregar pregunta
router.post('/cuestionarios/:id/preguntas', upload.single('imagen'), async (req, res) => {
  const { texto, tipo } = req.body;
  let opciones = req.body.opciones;
  let respuesta = req.body.respuesta;

  // Corrige: si llegan como JSON string, parsea
  try { if (typeof opciones === 'string') opciones = JSON.parse(opciones); } catch { }
  try { if (typeof respuesta === 'string') respuesta = JSON.parse(respuesta); } catch { }

  try {
    const cuestionario = await Cuestionario.findByPk(req.params.id);
    if (!cuestionario) return res.status(404).json({ error: 'No encontrado' });

    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    const nueva = await Pregunta.create({
      texto,
      tipo,
      opciones: Array.isArray(opciones) ? opciones : null,
      respuesta,
      imagen,
      cuestionarioId: cuestionario.id
    });

    res.status(201).json(nueva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar pregunta' });
  }
});

// Editar pregunta
router.put('/preguntas/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { texto, tipo, opciones, respuesta } = req.body;
    const pregunta = await Pregunta.findByPk(req.params.id);
    if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });

    // Opciones y respuesta deben ser objetos/arrays si vienen como JSON
    let opcionesObj = opciones;
    let respuestaObj = respuesta;
    try {
      if (typeof opciones === 'string') opcionesObj = JSON.parse(opciones);
      if (typeof respuesta === 'string') respuestaObj = JSON.parse(respuesta);
    } catch (e) {}

    let updateData = {
      texto,
      tipo,
      opciones: opcionesObj,
      respuesta: respuestaObj
    };

    // 1. Si marcaron quitar imagen: anula la imagen (aún si suben una nueva, prioriza el “quitar”)
    if (req.body.quitarImagen === 'true') {
      updateData.imagen = null;
    }
    // 2. Si suben una nueva imagen y NO quieren quitar: actualiza la imagen
    else if (req.file) {
      updateData.imagen = '/uploads/' + req.file.filename;
    }
    // 3. Si no hay ni quitar ni file, deja la imagen igual (sin cambios)

    await pregunta.update(updateData);

    res.json(pregunta);
  } catch (err) {
    console.error('Error al editar pregunta:', err);
    res.status(500).json({ error: 'Error al editar pregunta' });
  }
});


// Eliminar pregunta
router.delete('/preguntas/:id', async (req, res) => {
  try {
    const pregunta = await Pregunta.findByPk(req.params.id);
    if (!pregunta) return res.status(404).json({ error: 'Pregunta no encontrada' });

    await pregunta.destroy();
    res.json({ mensaje: 'Pregunta eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar pregunta:', err);
    res.status(500).json({ error: 'Error al eliminar pregunta' });
  }
});
// ==============================
// RUTA: Actualizar perfil usuario
// ==============================
router.put('/usuarios/actualizar-perfil', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ success: false, message: "No autenticado" });
  }
  try {
    const usuario = await Usuario.findByPk(req.session.usuarioId);
    if (!usuario) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if (req.body.password && req.body.password.trim().length >= 8) {
      usuario.password = await bcrypt.hash(req.body.password, 10);
    }

    await usuario.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ success: false, message: "Error al actualizar perfil" });
  }
});
// ==============================
// RUTA: Verificar código de email
// ==============================
router.post("/usuarios/verificar", async (req, res) => {
  const { email, code } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (usuario.verified) {
      return res.status(400).json({ error: "El usuario ya está verificado." });
    }

    if (usuario.verificationCode === code) {
      usuario.verified = true;
      await usuario.save();

      // ✅ Creamos sesión automáticamente
      req.session.usuario = {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      };

      return res.json({ success: true, rol: usuario.rol });
    } else {
      return res.status(400).json({ error: "Código incorrecto." });
    }

  } catch (err) {
    console.error("Error al verificar usuario:", err);
    return res.status(500).json({ error: "Error al verificar." });
  }
});

module.exports = router;
