;(async function(){
  const params     = new URLSearchParams(location.search);
  const attemptId  = params.get('attemptId');
  const container  = document.getElementById('detail-container');
  if (!attemptId) {
    container.innerHTML = '<p class="text-danger">Falta el parámetro <code>attemptId</code> en la URL.</p>';
    return;
  }

  try {
    // 1) Traer el intento completo
    const res = await fetch(`/api/attempts/${attemptId}`);
    if (!res.ok) throw new Error('Intento no encontrado');
    const intent = await res.json();

    // 2) Rellenar cabecera
    document.getElementById('student-name').textContent  = intent.usuario.nombre;
    document.getElementById('student-email').textContent = intent.usuario.email;
    const totalQuestions = intent.respuestas.length;
    const correctCount   = intent.respuestas.filter(a => a.correct).length;
    document.getElementById('score-display').textContent = `${correctCount} / ${totalQuestions}`;

    // 3) Listar cada pregunta
    const list = document.getElementById('questions-list');
    intent.respuestas.forEach((ans, i) => {
      const p     = ans.pregunta;
      const div   = document.createElement('div');
      div.className = 'card card-question p-3';
      div.innerHTML = `
        <h5>Pregunta ${i+1}</h5>
        <p>${p.texto}</p>
        <p>
          <strong>Respuesta alumno:</strong>
          ${Array.isArray(ans.response) ? ans.response.join(', ') : ans.response}
        </p>
        <p>
          <strong>Respuesta correcta:</strong>
          ${Array.isArray(p.respuesta) ? p.respuesta.join(', ') : p.respuesta}
        </p>
        <span class="badge ${ans.correct ? 'badge-correcto' : 'badge-incorrecto'}">
          ${ans.correct ? 'Correcto' : 'Incorrecto'}
        </span>
      `;
      list.appendChild(div);
    });

  } catch(err) {
    console.error(err);
    container.innerHTML = '<p class="text-danger">Error al cargar los datos del intento.</p>';
  }
})();
