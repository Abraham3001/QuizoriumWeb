// Cargar tipos al inicio
async function cargarTipos() {
  const res = await fetch('/api/tipos');
  const tipos = await res.json();
  const tipoSelect = document.getElementById('tipoLeucemia');
  tipoSelect.innerHTML = '';
  tipos.forEach(tipo => {
    const opt = document.createElement('option');
    opt.value = tipo.id;
    opt.textContent = tipo.nombre;
    tipoSelect.appendChild(opt);
  });
  cargarSubtipos();
}

async function cargarSubtipos() {
  const tipoId = document.getElementById('tipoLeucemia').value;
  if (!tipoId) return;
  const res = await fetch(`/api/subtipos/${tipoId}`);
  const subtipos = await res.json();
  const subtipoSelect = document.getElementById('subtipoLeucemia');
  subtipoSelect.innerHTML = '';
  subtipos.forEach(subtipo => {
    const opt = document.createElement('option');
    opt.value = subtipo.id;
    opt.textContent = subtipo.nombre;
    subtipoSelect.appendChild(opt);
  });
}

// Mostrar/ocultar modal tipo
function abrirModalTipo() {
  document.getElementById('modalTipo').style.display = 'flex';
}
function cerrarModalTipo() {
  document.getElementById('modalTipo').style.display = 'none';
  document.getElementById('nuevoTipo').value = '';
}

// Mostrar/ocultar modal subtipo
function abrirModalSubtipo() {
  document.getElementById('modalSubtipo').style.display = 'flex';
}
function cerrarModalSubtipo() {
  document.getElementById('modalSubtipo').style.display = 'none';
  document.getElementById('nuevoSubtipo').value = '';
}

// Confirmación de guardado
function mostrarConfirmacion() {
  const popup = document.getElementById('guardadoExito');
  popup.style.display = 'block';
  setTimeout(() => {
    popup.style.display = 'none';
  }, 2000);
}

// Guardar nuevo tipo
async function guardarNuevoTipo() {
  const nombre = document.getElementById('nuevoTipo').value.trim();
  if (!nombre) return alert('Escribe un nombre válido');

  try {
    const res = await fetch('/api/tipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });

    if (!res.ok) throw new Error('Error al guardar tipo');

    const nuevo = await res.json();
    cerrarModalTipo();
    mostrarConfirmacion();
    await cargarTipos();

    // Selecciona automáticamente el nuevo tipo
    const tipoSelect = document.getElementById('tipoLeucemia');
    tipoSelect.value = nuevo.id;
    cargarSubtipos();
  } catch (err) {
    console.error('Error al guardar tipo:', err);
    alert('Error al guardar tipo de leucemia');
  }
}

// Guardar nuevo subtipo
async function guardarNuevoSubtipo() {
  const nombre = document.getElementById('nuevoSubtipo').value.trim();
  const tipoId = document.getElementById('tipoLeucemia').value;

  console.log('Enviando subtipo con:', { nombre, tipoLeucemiaId: tipoId }); // Debug 👀

  if (!nombre || !tipoId) return alert('Faltan datos.');

  try {
    const res = await fetch('/api/subtipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, tipoLeucemiaId: tipoId })
    });

    if (!res.ok) throw new Error('Error al guardar subtipo');

    cerrarModalSubtipo();
    mostrarConfirmacion();
    await cargarSubtipos();
  } catch (err) {
    console.error('Error al guardar subtipo:', err);
    alert('Error al guardar subtipo');
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  cargarTipos();
  document.getElementById('tipoLeucemia').addEventListener('change', cargarSubtipos);
});
