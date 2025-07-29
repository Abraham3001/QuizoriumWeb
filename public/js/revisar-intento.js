// revisar-intento.js
;(async function() {
  const params = new URLSearchParams(window.location.search);
  const intentoId = params.get('id');
  const cont = document.getElementById('revisar-contenido');

  if (!intentoId) {
    cont.innerHTML = '<p class="text-danger">Falta el ID del intento.</p>';
    return;
  }

  let intento;
  try {
    const res = await fetch(`/api/attempts/${intentoId}`);
    if (!res.ok) throw new Error();
    intento = await res.json();
  } catch {
    cont.innerHTML = '<p class="text-danger">No se pudo cargar el intento.</p>';
    return;
  }

  // Cabecera
  const alumno = intento.usuario?.nombre || 'Estudiante';
  let html = `
    <div class="revision-intento-header">
      <div class="revision-titulo">${intento.cuestionario?.titulo || 'Cuestionario'}</div>
      <div class="revision-meta">Alumno: <b>${alumno}</b></div>
      <div class="revision-meta">Fecha: ${new Date(intento.createdAt).toLocaleString()}</div>
      <div class="nota-final">Nota: ${intento.score} / ${intento.respuestas.length}</div>
    </div>
  `;

  // Cada pregunta
  intento.respuestas.forEach((r, idx) => {
    const esOk = Boolean(r.correct);
    const claseCont = esOk ? 'pregunta-revision correcta' : 'pregunta-revision incorrecta';
    html += `<div class="${claseCont}">`;
    html += `<div class="pregunta-txt"><b>Pregunta ${idx+1}:</b> ${r.preguntaTexto || '(Sin texto)'}</div>`;

    // Imagen opcional
    if (r.preguntaImagen) {
      html += `
        <div class="pregunta-img-wrapper">
          <img src="${r.preguntaImagen}"
               class="pregunta-img"
               alt="Imagen pregunta">
        </div>`;
    }

    // Multiple choice
    const ops = Array.isArray(r.preguntaOpciones) ? r.preguntaOpciones : [];
    if (ops.length) {
      html += `<div class="opciones-revision">`;
      ops.forEach((opTxt, i) => {
        const sel = Array.isArray(r.response)
          ? r.response.includes(String(i)) || r.response.includes(i)
          : String(r.response) === String(i);
        const corr = Array.isArray(r.preguntaRespuestaCorrecta)
          ? r.preguntaRespuestaCorrecta.includes(i) || r.preguntaRespuestaCorrecta.includes(String(i))
          : String(r.preguntaRespuestaCorrecta) === String(i);

        let clases = ['opcion'];
        if (corr) clases.push('correcta');
        if (sel) clases.push('seleccionada');

        html += `<div class="${clases.join(' ')}">`;
        html += `<span>${i+1}. ${opTxt}</span>`;
        if (corr && sel) {
          html += `<span class="respuesta-indicador correcta">✔ Correcta</span>`;
        } else if (corr) {
          html += `<span class="respuesta-indicador correcta">✓</span>`;
        } else if (sel) {
          html += `<span class="respuesta-indicador incorrecta">✗ Seleccionada</span>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    }
    // Abierta
    else {
      html += `<div class="opcion abierta seleccionada">`;
      const resp = r.response;
      html += resp
        ? (Array.isArray(resp) ? resp.join(', ') : resp)
        : '<i>(Sin respuesta)</i>';
      html += `</div>`;

      if (r.preguntaRespuestaCorrecta != null) {
        html += `
        <div class="opcion abierta-correcta">
          <b>Respuesta correcta:</b> 
          ${Array.isArray(r.preguntaRespuestaCorrecta)
            ? r.preguntaRespuestaCorrecta.join(', ')
            : r.preguntaRespuestaCorrecta}
        </div>`;
      }

      html += esOk
        ? `<div class="respuesta-indicador correcta">✔ Correcta</div>`
        : `<div class="respuesta-indicador incorrecta">✗ Incorrecta</div>`;
    }

    html += `</div>`; // cierre .pregunta-revision
  });

  cont.innerHTML = `<div class="revisar-wrapper">${html}</div>`;
})();
