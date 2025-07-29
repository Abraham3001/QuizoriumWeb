document.addEventListener('DOMContentLoaded', async () => {
  
  document.getElementById('modal-preview').classList.add('hidden');
  const tabla = document.getElementById('tabla-usuarios');
  const paginaSpan = document.getElementById('pagina-actual');
  const btnPrev = document.getElementById('prev-page');
  const btnNext = document.getElementById('next-page');
  const btnEliminar = document.getElementById('btn-eliminar');
  const selectAllCheckbox = document.getElementById('select-all');
  const inputBusqueda = document.getElementById('busqueda');
  const selectRolMasivo = document.getElementById('rol-masivo');
  const filtroRol = document.getElementById('filtro-rol');
  const modal = document.getElementById('confirmModal');
  const btnConfirmar = document.getElementById('btnConfirmarEliminar');
  const btnCancelar = document.getElementById('btnCancelarEliminar');
  const btnImportar = document.getElementById('btn-importar');
  const inputCSV = document.getElementById('importarCSV');

  const porPagina = 10;
  let paginaActual = 1;
  let usuarios = [];

  function mostrarPopup(texto, tipo = 'success') {
    const popup = document.createElement('div');
    popup.className = `guardado-popup ${tipo}`;
    popup.innerHTML = `
      <div class="checkmark-circle">
        <div class="background"></div>
        <div class="${tipo === 'success' ? 'checkmark' : 'crossmark'}"></div>
      </div>
      ${texto}
    `;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
  }

  async function fetchUsuarios() {
    try {
      const res = await fetch('/api/usuarios');
      usuarios = await res.json();
      console.log("Usuarios cargados:", usuarios);
      aplicarFiltros();
      renderPagina(paginaActual);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  }

  let usuariosFiltrados = [];

  function aplicarFiltros() {
    const texto = inputBusqueda.value.toLowerCase();
    const rolSeleccionado = filtroRol.value;

    usuariosFiltrados = usuarios.filter(usuario => {
      const coincideTexto = usuario.email.toLowerCase().includes(texto) ||
        (usuario.nombre && usuario.nombre.toLowerCase().includes(texto));
      const coincideRol = rolSeleccionado === 'todos' || usuario.rol === rolSeleccionado;
      return coincideTexto && coincideRol;
    });
  }

  function renderPagina(pagina) {
    aplicarFiltros();
    tabla.innerHTML = '';
    const inicio = (pagina - 1) * porPagina;
    const fin = pagina * porPagina;

    usuariosFiltrados.slice(inicio, fin).forEach(usuario => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td><input type="checkbox" class="usuario-checkbox" data-id="${usuario.id}"></td>
        <td>${usuario.nombre || 'Sin nombre'}</td>
        <td class="text-warning">${usuario.email}</td>
        <td class="text-warning">${usuario.rol}</td>
      `;
      tabla.appendChild(fila);
    });

    paginaSpan.textContent = `Página ${paginaActual}`;
    selectAllCheckbox.checked = false;
  }

  // Navegación entre páginas
  btnPrev.addEventListener('click', () => {
    if (paginaActual > 1) {
      paginaActual--;
      renderPagina(paginaActual);
    }
  });

  btnNext.addEventListener('click', () => {
    const totalPaginas = Math.ceil(usuariosFiltrados.length / porPagina);
    if (paginaActual < totalPaginas) {
      paginaActual++;
      renderPagina(paginaActual);
    }
  });

  // Seleccionar todo
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = tabla.querySelectorAll('.usuario-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
  });

  // Eliminar usuarios
  btnEliminar.addEventListener('click', () => {
    const checkboxes = tabla.querySelectorAll('.usuario-checkbox:checked');
    if (checkboxes.length === 0) return mostrarPopup('Nada seleccionado', 'error');

    modal.classList.remove('hidden');

    btnConfirmar.onclick = async () => {
      modal.classList.add('hidden');
      let eliminados = [];

      for (let checkbox of checkboxes) {
        const userId = checkbox.dataset.id;
        try {
          const res = await fetch(`/api/usuarios/${userId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error();
          eliminados.push(userId);
        } catch {
          mostrarPopup(`No se pudo eliminar ${userId}`, 'error');
        }
      }

      if (eliminados.length > 0) {
        usuarios = usuarios.filter(u => !eliminados.includes(String(u.id)));
        mostrarPopup('Usuarios eliminados correctamente');
        renderPagina(paginaActual);
      }
    };

    btnCancelar.onclick = () => {
      modal.classList.add('hidden');
    };
  });

  document.getElementById('btnCancelarModal').onclick = () => {
    modalPreview.classList.add('hidden');
    document.body.classList.remove('modal-open');
  };


  // Cambiar roles
  selectRolMasivo.addEventListener('change', async () => {
    const nuevoRol = selectRolMasivo.value;
    const seleccionados = tabla.querySelectorAll('.usuario-checkbox:checked');

    if (seleccionados.length === 0) {
      return mostrarPopup('Selecciona al menos un usuario', 'error');
    }

    for (let checkbox of seleccionados) {
      const userId = checkbox.dataset.id;
      try {
        const res = await fetch(`/api/usuarios/${userId}/rol`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rol: nuevoRol }),
        });

        if (!res.ok) throw new Error();
      } catch {
        mostrarPopup(`Error al cambiar a ${userId}`, 'error');
        continue;
      }
    }

    mostrarPopup('Roles actualizados correctamente');
    await fetchUsuarios();
  });

  // Buscar y filtrar
  inputBusqueda.addEventListener('input', () => {
    paginaActual = 1;
    renderPagina(paginaActual);
  });

  filtroRol.addEventListener('change', () => {
    paginaActual = 1;
    renderPagina(paginaActual);
  });

  // Importar CSV
  btnImportar.addEventListener('click', () => {
   inputCSV.click();
  });

  inputCSV.addEventListener('change', async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  console.log('CSV detectado');

  const texto = await archivo.text();
  const lineas = texto.split('\n').filter(linea => linea.trim().length > 0);

  const nuevosUsuarios = [];
  for (let i = 1; i < lineas.length; i++) {
    const [nombre, email, rol] = lineas[i].split(',').map(cell => cell?.trim()?.replace(/"/g, ''));
    if (nombre && email && rol) {
      nuevosUsuarios.push({ nombre, email, rol });
    }
  }

  const tablaPreview = document.querySelector('#tabla-preview tbody');
  const modalPreview = document.getElementById('modal-preview');
  tablaPreview.innerHTML = '';

  for (const u of nuevosUsuarios) {
    const yaExiste = usuarios.some(existente => existente.email === u.email);
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${u.nombre}</td>
      <td>${u.email}</td>
      <td>${u.rol}</td>
      <td>${yaExiste ? 'Sí' : 'No'}</td>
      <td><input type="text" value="Default123!" class="input-password" /></td>
      <td><input type="checkbox" class="input-bloquear" ${yaExiste ? '' : 'disabled'} /></td>
    `;
    tablaPreview.appendChild(fila);
  }

  // Mostrar modal
  modalPreview.classList.remove('hidden');
  document.body.classList.add('modal-open');
  console.log('Mostrando modal de preview...');

  // Confirmar importación
  document.getElementById('confirmar-importacion').onclick = async () => {
    const filasDOM = Array.from(tablaPreview.querySelectorAll('tr'));
    for (let i = 0; i < nuevosUsuarios.length; i++) {
      const fila = filasDOM[i];
      const nuevaPass = fila.querySelector('input[type="text"]').value;
      const bloquear = fila.querySelector('input[type="checkbox"]').checked;
      const usuario = nuevosUsuarios[i];

      const payload = {
        ...usuario,
        password: nuevaPass || 'Default123!',
        bloquear
      };

      try {
        const res = await fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error();
      } catch (err) {
        console.error('Error al importar usuario:', err);
        mostrarPopup(`Error al importar ${usuario.email}`, 'error');
      }
    }

    modalPreview.classList.add('hidden');
    document.body.classList.remove('modal-open');
    mostrarPopup('Importación completa');
    await fetchUsuarios();
  };

  // Cancelar importación
  document.getElementById('cancelar-importacion').onclick = () => {
    modalPreview.classList.add('hidden');
    document.body.classList.remove('modal-open');
  };
  });
  document.getElementById('btn-exportar').addEventListener('click', () => {
  if (!usuariosFiltrados.length) {
    return mostrarPopup('No hay datos para exportar', 'error');
  }

  const encabezados = ['Nombre', 'Email', 'Rol'];
  const filas = usuariosFiltrados.map(u => [u.nombre || 'Sin nombre', u.email, u.rol]);

  let csv = encabezados.join(',') + '\n';
  filas.forEach(fila => {
    csv += fila.map(valor => `"${valor}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'usuarios_exportados.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

    await fetchUsuarios();  
});
