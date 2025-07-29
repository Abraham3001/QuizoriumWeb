document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('contenido-lista');
  try {
    const res = await fetch('/api/contenido');
    const data = await res.json();

    const grupos = {};

    data.forEach(item => {
      const tipo = item.tipo || 'Sin categoría';
      if (!grupos[tipo]) grupos[tipo] = [];
      grupos[tipo].push(item);
    });

    for (const [tipo, tarjetas] of Object.entries(grupos)) {
      const bloque = document.createElement('div');
      bloque.classList.add('bloque-tipo');
      bloque.innerHTML = `<h2>${tipo}</h2>`;

      const innerGrid = document.createElement('div');
      innerGrid.classList.add('contenido-container');

      tarjetas.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('tarjeta');

        card.innerHTML = `
          <button class="btn-editar" onclick="editarTarjeta(${item.id})">Editar</button>
          <h3>${item.titulo}</h3>
          <h5>${item.subtitulo || ''}</h5>
          <p>${item.descripcion}</p>
          <img src="${item.imagen}" alt="${item.alt || 'Imagen'}">
        `;

        innerGrid.appendChild(card);
      });

      bloque.appendChild(innerGrid);
      container.appendChild(bloque);
    }
  } catch (error) {
    console.error('Error al cargar contenido:', error);
  }
});

function editarTarjeta(id) {
  alert('Aquí iría la lógica para editar el contenido con ID: ' + id);
  // En el futuro puedes abrir un modal editable con campos para el título, subtítulo, etc.
}
let contenidoActual = null;

function editarTarjeta(id) {
  fetch(`/api/contenido/${id}`)
    .then(res => res.json())
    .then(data => {
      contenidoActual = data;

      document.getElementById('editTitulo').value = data.titulo;
      document.getElementById('editSubtitulo').value = data.subtitulo || '';
      document.getElementById('editDescripcion').value = data.descripcion;
      document.getElementById('editAlt').value = data.alt || '';

      document.getElementById('modalEditar').style.display = 'flex';
    })
    .catch(err => {
      console.error('Error al cargar contenido:', err);
      alert('No se pudo cargar el contenido para editar.');
    });
}

function cerrarModalEditar() {
  document.getElementById('modalEditar').style.display = 'none';
  contenidoActual = null;
}

function guardarCambios() {
  if (!contenidoActual) return;

  const nuevo = {
    titulo: document.getElementById('editTitulo').value.trim(),
    subtitulo: document.getElementById('editSubtitulo').value.trim(),
    descripcion: document.getElementById('editDescripcion').value.trim(),
    alt: document.getElementById('editAlt').value.trim()
  };

  fetch(`/api/contenido/${contenidoActual.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevo)
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al guardar');
      cerrarModalEditar();
      location.reload();
    })
    .catch(err => {
      console.error('Error al guardar cambios:', err);
      alert('No se pudo guardar los cambios.');
    });
}
