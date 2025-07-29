// public/js/sessionNav.js
async function configurarBotonVolver(selector) {
  try {
    const res = await fetch('/api/sesion');
    const session = await res.json();
    const btn = document.querySelector(selector);
    if (!btn) return;
    if (session.autenticado) {
      btn.href = session.rol === 'profesor' ? '/docente' : '/estudiante';
    }
  } catch (err) {
    console.error('Error al configurar volver:', err);
  }
}

// Autoejecutable: configura todos los botones con clase .btn-volver
document.addEventListener('DOMContentLoaded', () => {
  configurarBotonVolver('.btn-volver');
});
