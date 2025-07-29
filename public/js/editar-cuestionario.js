document.addEventListener("DOMContentLoaded", () => {
  const cuestionarioId = window.location.pathname.split("/").pop();

  // Cargar cuestionario existente
  fetch(`/api/cuestionarios/${cuestionarioId}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("titulo").value = data.titulo;
      document.getElementById("descripcion").value = data.descripcion;
      // Aquí podrías también cargar preguntas si las tuvieras
    })
    .catch(err => console.error("Error al cargar cuestionario:", err));

  // Al enviar, actualizar
  const form = document.getElementById("cuestionarioForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    fetch(`/api/cuestionarios/${cuestionarioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titulo, descripcion }),
    })
      .then(res => {
        if (res.ok) {
          alert("Cuestionario actualizado correctamente");
          window.location.href = "/lista-cuestionarios";
        } else {
          alert("Error al actualizar");
        }
      })
      .catch(err => {
        console.error("Error:", err);
        alert("Error al actualizar el cuestionario");
      });
  });
});
