let idCuestionarioAEliminar = null;

  function cargarCuestionarios() {
    fetch('/api/cuestionarios') // ✅ Ruta corregida
      .then(res => res.json())
      .then(data => {
        const contenedor = document.getElementById('lista-cuestionarios');
        if (!data || data.length === 0) {
          contenedor.innerHTML = '<p class="text-center text-muted">No hay cuestionarios disponibles.</p>';
        } else {
          let html = '';
          data.forEach(c => {
            html += `
              <div class="col">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">${c.titulo}</h5>
                    <p class="card-text text-muted">${c.descripcion || '(Sin descripción)'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                      <div class="d-flex gap-2">
                        <a href="../html/read-cuestionario.html?id=${c.id}" class="btn btn-outline-primary btn-slim">Ver</a>
                        <a href="../html/editar-formulario.html?id=${c.id}" class="btn btn-outline-success btn-slim">Editar</a>
                      </div>
                      <button class="btn btn-outline-danger btn-slim" onclick="confirmarEliminar(${c.id})">Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          });
          contenedor.innerHTML = html;
        }
      })
      .catch(err => {
        console.error(err);
        document.getElementById('lista-cuestionarios').innerHTML = '<p class="text-danger">Error al cargar los cuestionarios.</p>';
      });
  }

  function confirmarEliminar(id) {
    idCuestionarioAEliminar = id;
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmarEliminar'));
    modal.show();
  }

  document.getElementById('btnConfirmarEliminar').addEventListener('click', () => {
    if (idCuestionarioAEliminar) {
      fetch(`/api/cuestionarios/${idCuestionarioAEliminar}`, {
        method: 'DELETE'
      }).then(res => {
        if (res.ok) {
          cargarCuestionarios();
          bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminar')).hide();
        } else {
          alert('Error al eliminar el cuestionario.');
        }
      }).catch(err => {
        console.error(err);
        alert('Error de conexión al eliminar.');
      });
    }
  });

  // Al cargar la página
  cargarCuestionarios();