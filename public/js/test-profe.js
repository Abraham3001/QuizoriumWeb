// public/js/test-profe.js
;(async function(){
  console.log('✅ test-profe.js cargado');

  // Bandera para detectar envío
  let quizEnviado = false;

  // Inserta overlay de envío
  const overlay = document.createElement('div');
  overlay.id = 'submit-overlay';
  overlay.style = `
    display: none;
    position: fixed; top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.6);
    justify-content: center; align-items: center;
    z-index: 2000;
  `;
  overlay.innerHTML = `
    <div class="text-center">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Enviando...</span>
      </div>
      <p class="mt-2 text-light">Enviando respuestas...</p>
    </div>
  `;
  document.body.appendChild(overlay);

  function toggleSubmitOverlay(show) {
    overlay.style.display = show ? 'flex' : 'none';
    // Deshabilita botón volver flotante
    const btn = document.querySelector('.btn-volver-flotante');
    if (btn) btn.style.pointerEvents = show ? 'none' : '';
  }

  const main = document.getElementById('quiz-main');
  if (!main) return console.warn('No existe #quiz-main en esta página');

  // Aviso si intenta cerrar sin enviar
  window.addEventListener('beforeunload', (e) => {
    if (!quizEnviado) {
      e.preventDefault();
      e.returnValue = 'Tienes respuestas sin enviar. ¿Seguro que deseas salir?';
    }
  });

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    // ─── LISTA DE CUESTIONARIOS ───
    main.innerHTML = '<h2 class="mb-4">📋 Cuestionarios Disponibles</h2>';
    try {
      const res = await fetch('/api/cuestionarios', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Falló /api/cuestionarios');
      const list = await res.json();
      if (list.length === 0) {
        main.innerHTML += '<p>No hay cuestionarios disponibles.</p>';
      } else {
        list.forEach(c => {
          const card = document.createElement('div');
          card.className = 'card mb-3';
          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">${c.titulo}</h5>
              <p class="card-text">${c.descripcion||''}</p>
              <a href="?id=${c.id}" class="btn btn-primary">✏️ Responder</a>
            </div>`;
          main.appendChild(card);
        });
      }
    } catch(e){
      console.error(e);
      main.innerHTML += '<p class="text-danger">Error al cargar cuestionarios.</p>';
    }

  } else {
    // ─── FORMULARIO DE RESPUESTA ───
    let attemptId;
    try {
      // 1) Iniciar intento
      const init = await fetch('/api/attempts', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ cuestionarioId: id })
      });
      if (init.status === 401) return window.location.href = '/iniciar-sesion';
      if (!init.ok) throw new Error('No se pudo iniciar intento');
      ({ attemptId } = await init.json());

      // 2) Cargar cuestionario
      const res = await fetch(`/api/cuestionarios/${id}`, { credentials:'same-origin' });
      if (!res.ok) throw new Error('Error al cargar cuestionario');
      const quiz = await res.json();

      // 3) Renderizar formulario
      main.innerHTML = `
        <div class="quiz-head text-center mb-4">
          <h2 class="quiz-title mb-1">${quiz.titulo}</h2>
          <div class="quiz-desc text-muted mb-2">${quiz.descripcion || ''}</div>
        </div>
        <form id="quiz-form">
          <div id="form-error" class="text-danger mb-3"></div>
          <div id="preguntas"></div>
          <button type="submit" class="btn btn-success">Enviar respuestas</button>
        </form>`;
      const errorBox = document.getElementById('form-error');
      const cont = document.getElementById('preguntas');

      // 4) Generar cada pregunta
      quiz.preguntas.forEach((p,i) => {
        const div = document.createElement('div');
        div.className = 'question-card mb-4';
        let html = `<p><strong>Pregunta ${i+1}:</strong> ${p.texto}</p>`;
        if (p.imagen) {
          const src = encodeURI(p.imagen.startsWith('/') ? p.imagen : `/uploads/${p.imagen}`);
          html += `
            <div class="quiz-img-container">
              <img src="${src}" alt="Imagen Pregunta ${i+1}"
                class="quiz-img-zoomable img-fluid rounded shadow-sm">
              <span class="quiz-img-lupa">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 16 16">
                  <circle cx="7" cy="7" r="6"/>
                  <path d="M11 11l4 4"/>
                  <path d="M7 4v6"/>
                  <path d="M4 7h6"/>
                </svg>
              </span>
            </div>
          `;
        } 
        if (p.tipo === 'si_no') {
          html += `
            <div>
              <div class="form-check">
                <input class="form-check-input" type="radio"
                       name="resp_${p.id}" id="p${p.id}_si" value="Sí">
                <label class="form-check-label" for="p${p.id}_si">Sí</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio"
                       name="resp_${p.id}" id="p${p.id}_no" value="No">
                <label class="form-check-label" for="p${p.id}_no">No</label>
              </div>
            </div>`;
        } else if (Array.isArray(p.opciones) && p.opciones.length) {
          html += '<div>';
          p.opciones.forEach((op,j) => {
            const type = p.tipo === 'check' ? 'checkbox' : 'radio';
            html += `
              <div class="form-check">
                <input class="form-check-input" type="${type}"
                       name="resp_${p.id}" value="${j}"
                       id="p${p.id}_o${j}">
                <label class="form-check-label" for="p${p.id}_o${j}">${op}</label>
              </div>`;
          });
          html += '</div>';
        } else {
          html += `<input type="text" name="resp_${p.id}" class="form-control">`;
        }
        div.innerHTML = html;
        cont.appendChild(div);
      });

      // 5) Manejar submit
      document.getElementById('quiz-form').addEventListener('submit', async e => {
        e.preventDefault();
        errorBox.textContent = '';

        // Recoger respuestas
        const answers = quiz.preguntas.map(p => {
          const els = Array.from(document.getElementsByName(`resp_${p.id}`));
          let response;
          if (p.tipo === 'check') {
            response = els.filter(x => x.checked).map(x => x.value);
          } else if (p.tipo === 'opcion_multiple' || p.tipo === 'si_no') {
            const sel = els.find(x => x.checked);
            response = sel ? sel.value : null;
          } else {
            response = els[0].value.trim();
          }
          return { preguntaId: p.id, response };
        });

        // Validar
        const invalid = answers.find(a =>
          a.response == null ||
          (Array.isArray(a.response) && a.response.length === 0) ||
          (!Array.isArray(a.response) && a.response === '')
        );
        if (invalid) {
          errorBox.textContent = 'Por favor completa todas las preguntas antes de enviar.';
          errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        // Mostrar overlay y bloquear
        toggleSubmitOverlay(true);

        // Enviar al servidor
        const save = await fetch('/api/attempts/answers', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId, answers })
        });

        toggleSubmitOverlay(false);
        if (!save.ok) {
          errorBox.textContent = 'Hubo un error guardando tus respuestas.';
          return;
        }

        // Marca enviado y redirige
        quizEnviado = true;
        window.location.href = '../html/responder-cuestionario-profe.html';
      });

    } catch(err) {
      console.error(err);
      main.innerHTML = '<p class="text-danger">Error al cargar el cuestionario.</p>';
    }
  }
})();

(function(){
  // Modal base
  let zoomModal = document.getElementById('zoom-modal-quiz');
  if (!zoomModal) {
    zoomModal = document.createElement('div');
    zoomModal.id = 'zoom-modal-quiz';
    zoomModal.innerHTML = `
      <span class="zoom-close" title="Cerrar">&times;</span>
      <img src="" alt="Zoom imagen" />
    `;
    document.body.appendChild(zoomModal);
  }

  // Mostrar modal zoom
  function showZoom(src) {
    const img = zoomModal.querySelector('img');
    img.src = src;
    zoomModal.classList.add('active');
  }
  // Cerrar modal zoom
  function closeZoom() {
    zoomModal.classList.remove('active');
    zoomModal.querySelector('img').src = '';
  }
  zoomModal.addEventListener('click', closeZoom);
  zoomModal.querySelector('.zoom-close').addEventListener('click', closeZoom);

  // Delegación: click en cualquier .quiz-img-zoomable
  document.addEventListener('click', e => {
    if (e.target.classList.contains('quiz-img-zoomable')) {
      showZoom(e.target.src);
    }
  });
})();