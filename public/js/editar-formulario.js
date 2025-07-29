(function() {
  const params = new URLSearchParams(window.location.search);
  const cuestionarioId = params.get('id');
  const preguntasContainer = document.getElementById('preguntas-container');
  const form = document.getElementById('form-editar-cuestionario');
  const btnAdd = document.getElementById('btn-agregar-pregunta');

  if (!cuestionarioId) {
    alert('ID de cuestionario no proporcionado');
    return;
  }

  // Agrega una pregunta al DOM, mostrando imagen y control para eliminarla
  function agregarPreguntaDOM(data = {}) {
    const div = document.createElement('div');
    div.className = 'pregunta mb-4 p-3 bg-white rounded shadow-sm';
    const id = data.id || `new-${Date.now()}`;
    div.dataset.id = id;

    const tipoOriginal = data.tipo || 'abierta';
    const opcionesOriginal = Array.isArray(data.opciones) ? data.opciones : [];
    const respuestaOriginal = data.respuesta;
    const imagenActual = data.imagen || '';

    div.innerHTML = `
      <div class="d-flex justify-content-between mb-2">
        <h5>Pregunta</h5>
        <button type="button" class="btn btn-sm btn-danger btn-eliminar">✖</button>
      </div>
      <div class="mb-2">
        <label class="form-label">Texto</label>
        <input type="text" class="form-control campo-texto" value="${data.texto||''}" required>
      </div>
      <div class="mb-2">
        <label class="form-label">Tipo</label>
        <select class="form-select campo-tipo">
          <option value="abierta">Abierta</option>
          <option value="opcion_multiple">Opción múltiple</option>
          <option value="si_no">Sí/No</option>
          <option value="check">Selección múltiple</option>
        </select>
      </div>
      <div class="opciones-container mb-2 d-none"></div>
      <div class="mb-2 respuesta-texto-container d-none">
        <label class="form-label">Respuesta</label>
        <input type="text" class="form-control campo-respuesta">
      </div>
      <div class="mb-2">
        <label class="form-label">Imagen (opcional)</label>
        <input type="file" class="form-control campo-imagen" accept="image/*">
        <div class="mt-2">
          ${imagenActual
            ? `<img src="${imagenActual}" class="img-preview" style="max-width:120px; border-radius:10px;">
               <div class="form-check form-switch d-inline-block ms-2">
                 <input class="form-check-input quitar-imagen-switch" type="checkbox" id="quitar-img-${id}">
                 <label class="form-check-label" for="quitar-img-${id}" style="font-size:13px;">Quitar imagen</label>
               </div>`
            : '<small>Sin imagen</small>'}
        </div>
      </div>
    `;
    preguntasContainer.append(div);

    const select = div.querySelector('.campo-tipo');
    select.value = tipoOriginal;

    select.addEventListener('change', () => {
      const nuevo = select.value;
      if (nuevo === tipoOriginal) {
        renderOpciones(div, nuevo, opcionesOriginal, respuestaOriginal);
      } else {
        renderOpciones(div, nuevo, [], null);
      }
    });

    div.querySelector('.btn-eliminar').addEventListener('click', () => div.remove());

    // Imagen preview dinámica
    div.querySelector('.campo-imagen').addEventListener('change', function(e) {
      const file = e.target.files[0];
      const previewContainer = div.querySelector('.mt-2');

      // BORRA el preview anterior si existe (para que no se acumulen)
      let preview = div.querySelector('.img-preview');
      if (preview) {
        preview.remove();
      }

      if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          // CREA solo un preview nuevo (después de borrar el anterior)
          const newPreview = document.createElement('img');
          newPreview.className = 'img-preview';
          newPreview.style.maxWidth = '120px';
          newPreview.style.borderRadius = '10px';
          newPreview.style.marginTop = '4px';
          newPreview.src = ev.target.result;
          previewContainer.prepend(newPreview);
        };
        reader.readAsDataURL(file);
      }
    });

    // Render inicial con datos originales
    renderOpciones(div, tipoOriginal, opcionesOriginal, respuestaOriginal);
  }

  // Renderiza la sección de opciones o respuesta según el tipo (igual que antes)
  function renderOpciones(div, tipo, opciones = [], respuesta) {
    const cont = div.querySelector('.opciones-container');
    const respDiv = div.querySelector('.respuesta-texto-container');
    const inpResp = div.querySelector('.campo-respuesta');

    // Reset
    cont.innerHTML = '';
    cont.classList.add('d-none');
    respDiv.classList.add('d-none');
    inpResp.removeAttribute('name');
    inpResp.required = false;
    inpResp.value = '';

    if (tipo === 'abierta') {
      respDiv.classList.remove('d-none');
      inpResp.name = `respuesta-${div.dataset.id}`;
      inpResp.required = true;
      if (typeof respuesta === 'string') inpResp.value = respuesta;

    } else if (tipo === 'si_no') {
      cont.classList.remove('d-none');
      ['Sí','No'].forEach(op => {
        const wr = document.createElement('div'); wr.className = 'form-check';
        const name = `respuesta-${div.dataset.id}`;
        const checked = respuesta === op ? 'checked' : '';
        wr.innerHTML = `
          <input class="form-check-input" type="radio" name="${name}" value="${op}" ${checked}>
          <label class="form-check-label">${op}</label>
        `;
        cont.append(wr);
      });

    } else if (tipo === 'opcion_multiple' || tipo === 'check') {
      cont.classList.remove('d-none');
      const btn = document.createElement('button'); btn.type='button'; btn.className='btn btn-sm btn-secondary mb-2'; btn.textContent='➕ Agregar Opción';
      cont.append(btn);
      const lista = document.createElement('div'); lista.className='lista-opciones'; cont.append(lista);
      if (opciones.length > 0) {
        opciones.forEach((opt, idx) => crearOpcion(lista, idx, tipo, opt, respuesta));
      } else {
        crearOpcion(lista, 0, tipo, '', respuesta);
      }
      btn.addEventListener('click', () => crearOpcion(lista, lista.children.length, tipo, '', respuesta));
    }
  }

  function crearOpcion(lista, idx, tipo, valor='', respuesta) {
    const isCheck = tipo === 'check';
    // Busca el id único de la pregunta
    const preguntaDiv = lista.closest('.pregunta');
    const preguntaId = preguntaDiv ? preguntaDiv.dataset.id : Date.now();

    const name = isCheck
      ? `respuesta-${preguntaId}[]`
      : `respuesta-${preguntaId}`;
    const div = document.createElement('div'); div.className = 'mb-2 d-flex align-items-center gap-2';
    let checked = false;
    if (respuesta != null) {
      if (Array.isArray(respuesta)) checked = respuesta.includes(String(idx));
      else checked = String(respuesta) === String(idx);
    }
    div.innerHTML = `
      <input type="${isCheck ? 'checkbox' : 'radio'}"
            name="${name}"
            class="form-check-input campo-respuesta"
            value="${idx}" ${checked ? 'checked' : ''}>
      <input type="text"
            class="form-control campo-opcion"
            value="${valor}"
            placeholder="Opción"
            required>
      <button type="button" class="btn btn-danger btn-sm">✖</button>
    `;
    div.querySelector('button').addEventListener('click', () => div.remove());
    lista.append(div);
  }

  // Carga inicial del cuestionario
  async function cargar() {
    try {
      const res = await fetch(`/api/cuestionarios/${cuestionarioId}`);
      const data = await res.json();
      document.getElementById('titulo').value = data.titulo;
      document.getElementById('descripcion').value = data.descripcion || '';
      data.preguntas.forEach(p => agregarPreguntaDOM(p));
    } catch (err) {
      console.error('Error al cargar:', err);
      alert('No se pudo cargar el cuestionario');
    }
  }

  // Guardado de cambios (cuestionario y preguntas, incluyendo imágenes)
  form.addEventListener('submit', async e => {
    e.preventDefault();

  // 1. Evita doble envío y muestra feedback visual
  const btnSubmit = form.querySelector('button[type="submit"]');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Guardando...`;

  preguntasContainer.querySelectorAll('.opciones-container').forEach(c => c.classList.remove('border','border-danger','rounded','p-2'));
  let valido = true;
  preguntasContainer.querySelectorAll('[data-id]').forEach(div => {
    const tipo = div.querySelector('.campo-tipo').value;
    if (['si_no','opcion_multiple','check'].includes(tipo)) {
      const cont = div.querySelector('.opciones-container');
      const anyChecked = cont.querySelector('input.form-check-input:checked') !== null;
      if (!anyChecked) {
        cont.classList.add('border','border-danger','rounded','p-2');
        valido = false;
      }
    }
  });
  if (!valido) {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = "Guardar Cambios";
    return;
  }

    // Guardar cuestionario (título/desc)
    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    await fetch(`/api/cuestionarios/${cuestionarioId}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({titulo,descripcion})
    });

    // Guardar cada pregunta
    for (const div of preguntasContainer.querySelectorAll('[data-id]')) {
    const id = div.dataset.id;
    const texto = div.querySelector('.campo-texto').value.trim();
    const tipo = div.querySelector('.campo-tipo').value;

    const opciones = Array.from(div.querySelectorAll('.campo-opcion')).map(i => i.value.trim());
    let respuesta;
    if (tipo === 'abierta') {
      respuesta = div.querySelector('.campo-respuesta').value.trim();
    } else if (tipo === 'si_no' || tipo === 'opcion_multiple') {
      const checked = div.querySelector('input.form-check-input:checked');
      respuesta = checked ? checked.value : '';
    } else if (tipo === 'check') {
      respuesta = Array.from(div.querySelectorAll('input.form-check-input:checked')).map(i => i.value);
    }

    const formData = new FormData();
    formData.append('texto', texto);
    formData.append('tipo', tipo);
    formData.append('opciones', JSON.stringify(opciones));
    formData.append('respuesta', JSON.stringify(respuesta));

    // Imagen y quitar imagen
    const fileInput = div.querySelector('.campo-imagen');
    if (fileInput && fileInput.files.length > 0) {
      formData.append('imagen', fileInput.files[0]);
    }
    const quitarSwitch = div.querySelector('.quitar-imagen-switch');
    if (quitarSwitch && quitarSwitch.checked) {
      formData.append('quitarImagen', 'true');
    }

    const url = id.startsWith('new-')
      ? `/api/cuestionarios/${cuestionarioId}/preguntas`
      : `/api/preguntas/${id}`;
    const method = id.startsWith('new-') ? 'POST' : 'PUT';

    await fetch(url, {
      method,
      body: formData
    });
  }
    window.location.href = '../html/lista-cuestionarios.html';
  });

  cargar();
  btnAdd.addEventListener('click', () => agregarPreguntaDOM());
})();
