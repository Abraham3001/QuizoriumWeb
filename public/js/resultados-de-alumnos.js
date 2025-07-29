// public/js/resultados-de-alumnos.js
;(async function() {
  const params = new URLSearchParams(location.search);
  const quizId = params.get('id');
  if (!quizId) {
    document.body.innerHTML = '<p class="text-danger">Falta el ID del cuestionario.</p>';
    return;
  }

  // 2) Cargar título del cuestionario
  try {
    const quizRes = await fetch(
      `/api/cuestionarios/${quizId}`,
        { credentials: 'same-origin' }
      );
    if (!quizRes.ok) throw new Error('Error al cargar cuestionario');
    const quiz = await quizRes.json();
    document.getElementById('quiz-title').textContent = quiz.titulo;
  } catch (err) {
    console.error(err);
    document.body.innerHTML = '<p class="text-danger">No se pudo cargar el cuestionario.</p>';
    return;
  }

  // 3) Cargar los intentos (con usuario y respuestas)
  let attempts;
  try {
    const atRes = await fetch(
      `/api/cuestionarios/${quizId}/attempts`,
      { credentials: 'same-origin' }
    );
    if (!atRes.ok) throw new Error('Error al cargar intentos');
    attempts = await atRes.json();
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById('results-body');
    tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Error al cargar los resultados.</td></tr>';
    return;
  }

  // 4) Renderizar la tabla
  const tbody = document.getElementById('results-body');
  if (attempts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Aún no hay intentos.</td></tr>';
    return;
  }

  attempts.forEach(at => {
    const total = at.totalPreguntas || at.respuestas.length;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${at.usuario.nombre} (${at.usuario.email})</td>
      <td>${new Date(at.createdAt).toLocaleString()}</td>
      <td>
        <span class="badge bg-success">${at.score} / ${total}</span>
      </td>
      <td>
        <a class="btn btn-outline-primary btn-sm" 
           href="../html/revisar-intento2.html?id=${at.id}">
           Ver respuestas
        </a>
      </td>
    `;
    tbody.appendChild(row);
  });
})();
