// public/js/crear-prguntas.js

let contadorPreguntas = 0;

// Agrega una nueva pregunta predeterminada como "abierta"
function agregarPregunta() {
  const container = document.getElementById("preguntas-container");
  const idx = contadorPreguntas++;
  const div = document.createElement("div");
  div.className = "pregunta mb-4";
  div.dataset.index = idx;
  div.style.opacity = 0;
  div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <strong class="numero-pregunta">Pregunta ${idx + 1}</strong>
      <button type="button" class="btn btn-sm btn-danger" onclick="eliminarPregunta(this)">Eliminar</button>
    </div>
    <div class="mb-2">
      <label>Texto de la pregunta:</label>
      <input type="text" name="texto[]" class="form-control texto-pregunta">
      <div class="invalid-feedback">El texto es obligatorio.</div>
    </div>
    <div class="mb-2">
      <label>Tipo:</label>
      <select name="tipo[]" class="form-control tipo-select" onchange="actualizarOpciones(this)">
        <option value="abierta">Abierta</option>
        <option value="opcion_multiple">Opción múltiple</option>
        <option value="si_no">Sí / No</option>
        <option value="check">Selección múltiple</option>
      </select>
      <div class="invalid-feedback">Debe seleccionar un tipo.</div>
    </div>
    <div class="opciones-container mb-2 d-none"></div>
    <div class="mb-2 respuesta-texto-container">
      <label>Respuesta (abierta):</label>
      <input type="text" name="respuesta[${idx}]" class="form-control respuesta-pregunta">
      <div class="invalid-feedback">Respuesta obligatoria.</div>
    </div>
    <div class="mb-2">
      <label>Imagen (opcional):</label>
      <input type="file" name="imagen[${idx}]" accept="image/*" class="form-control">
    </div>
  `;
  container.appendChild(div);
  setTimeout(() => div.style.opacity = 1, 30); // Fade-in
  // Forzar "abierta" y mostrar su campo
  const select = div.querySelector(".tipo-select");
  select.value = "abierta";
  actualizarOpciones(select);
}

// Elimina una pregunta y reindexa
function eliminarPregunta(btn) {
  const div = btn.closest(".pregunta");
  div.style.opacity = 0;
  setTimeout(() => {
    div.remove();
    actualizarNumeros();
  }, 180);
}

// Reindexa todas las preguntas y sus campos
function actualizarNumeros() {
  const preguntas = document.querySelectorAll(".pregunta");
  preguntas.forEach((p, i) => {
    p.dataset.index = i;
    p.querySelector(".numero-pregunta").textContent = `Pregunta ${i + 1}`;
    p.querySelector(".texto-pregunta").name = "texto[]";
    p.querySelector(".tipo-select").name = "tipo[]";
    p.querySelector(".respuesta-pregunta").name = `respuesta[${i}]`;
    p.querySelector('input[type="file"]').name = `imagen[${i}]`;

    // Reindexar literales si existen
    p.querySelectorAll(".lista-opciones > div").forEach((lit, j) => {
      const choice = lit.querySelector('input[type="checkbox"], input[type="radio"]');
      choice.name = choice.type === "checkbox"
        ? `respuesta[${i}][]`
        : `respuesta[${i}]`;
      choice.value = j;
      lit.querySelector('input[type="text"]').name = `opciones[${i}][]`;
      lit.querySelector("button").onclick = () => {
        lit.remove();
        actualizarNumeros();
      };
    });
  });
  contadorPreguntas = preguntas.length;
}

// Ajusta el campo de respuesta abierta según tipo
function ajustarNombreRespuesta(div, idx, tipo) {
  const inp = div.querySelector(".respuesta-pregunta");
  if (tipo === "abierta") {
    inp.name = `respuesta[${idx}]`;
    inp.required = true;
    div.querySelector(".respuesta-texto-container").style.display = "block";
  } else {
    inp.removeAttribute("name");
    inp.required = false;
    div.querySelector(".respuesta-texto-container").style.display = "none";
  }
}

// Muestra las opciones pertinentes según el tipo seleccionado
function actualizarOpciones(sel) {
  const div = sel.closest(".pregunta");
  const idx = +div.dataset.index;
  const cont = div.querySelector(".opciones-container");
  const tipo = sel.value;

  cont.innerHTML = "";

  // Ajusta el input de respuesta abierta
  ajustarNombreRespuesta(div, idx, tipo);

  if (tipo === "si_no") {
    cont.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="radio" name="respuesta[${idx}]" value="Sí">
        <label class="form-check-label">Sí</label>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="respuesta[${idx}]" value="No">
        <label class="form-check-label">No</label>
      </div>
    `;
  }
  else if (tipo === "opcion_multiple" || tipo === "check") {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-secondary mb-2";
    btn.textContent = "➕ Agregar Opción";
    btn.onclick = () => agregarLiteral(cont);
    cont.appendChild(btn);

    const lista = document.createElement("div");
    lista.className = "lista-opciones";
    cont.appendChild(lista);

    agregarLiteral(cont);
  }

  cont.classList.toggle("d-none", !["si_no","opcion_multiple","check"].includes(tipo));
}

// Agrega una literal (checkbox o radio + texto)
function agregarLiteral(contenedor) {
  const pDiv = contenedor.closest(".pregunta");
  const idx = +pDiv.dataset.index;
  const tipo = pDiv.querySelector(".tipo-select").value;
  const lista = contenedor.querySelector(".lista-opciones");
  const optIdx = lista.children.length;
  const isCheck = tipo === "check";

  const div = document.createElement("div");
  div.className = "mb-2 d-flex gap-2 align-items-center";
  div.innerHTML = `
    <input type="${isCheck ? "checkbox" : "radio"}"
           name="${isCheck ? `respuesta[${idx}][]` : `respuesta[${idx}]`}"
           value="${optIdx}" class="form-check-input">
    <input type="text"
           name="opciones[${idx}][]"
           class="form-control"
           placeholder="Texto de opción">
    <button type="button" class="btn btn-danger btn-sm">✖</button>
  `;
  div.querySelector("button").onclick = () => {
    div.remove();
    actualizarNumeros();
  };
  lista.appendChild(div);
}

// Validación completa al enviar el formulario
document.getElementById("cuestionarioForm").addEventListener("submit", function(e) {
  let valido = true;
  const errorBox = document.getElementById("form-error");
  errorBox.textContent = "";

  // 1) Título obligatorio
  const titulo = document.getElementById("titulo");
  if (!titulo.value.trim()) {
    valido = false;
    titulo.classList.add("is-invalid");
    errorBox.textContent = "El título del cuestionario es obligatorio.";
  } else {
    titulo.classList.remove("is-invalid");
  }

  // 2) Al menos una pregunta
  const preguntas = document.querySelectorAll(".pregunta");
  if (valido && preguntas.length === 0) {
    valido = false;
    errorBox.textContent = "Agrega al menos una pregunta.";
  }

  // 3) Validación por pregunta
  if (valido) {
    preguntas.forEach(p => {
      const idx   = +p.dataset.index;
      const txt   = p.querySelector(".texto-pregunta");
      const tipo  = p.querySelector(".tipo-select").value;

      // Texto
      if (!txt.value.trim()) {
        valido = false;
        txt.classList.add("is-invalid");
        if (!errorBox.textContent) {
          errorBox.textContent = `Pregunta ${idx+1}: falta texto.`;
        }
      } else {
        txt.classList.remove("is-invalid");
      }

      // Tipo no vacío
      if (!tipo) {
        valido = false;
        const sel = p.querySelector(".tipo-select");
        sel.classList.add("is-invalid");
        if (!errorBox.textContent) {
          errorBox.textContent = `Pregunta ${idx+1}: selecciona un tipo.`;
        }
      } else {
        p.querySelector(".tipo-select").classList.remove("is-invalid");
      }

      // Respuestas según tipo
      if (["si_no","opcion_multiple"].includes(tipo)) {
        const radios = p.querySelectorAll(`input[type="radio"][name="respuesta[${idx}]"]`);
        if (![...radios].some(r=>r.checked)) {
          valido = false;
          if (!p.querySelector(".respuesta-error")) {
            const err = document.createElement("div");
            err.className = "text-danger respuesta-error";
            err.textContent = "Marca una opción.";
            p.querySelector(".opciones-container").appendChild(err);
          }
          if (!errorBox.textContent) errorBox.textContent = `Pregunta ${idx+1}: marca una opción.`;
        } else {
          p.querySelector(".respuesta-error")?.remove();
        }
      }
      else if (tipo === "check") {
        const chks = p.querySelectorAll(`input[type="checkbox"][name="respuesta[${idx}][]"]`);
        if (![...chks].some(c=>c.checked)) {
          valido = false;
          if (!p.querySelector(".respuesta-error")) {
            const err = document.createElement("div");
            err.className = "text-danger respuesta-error";
            err.textContent = "Selecciona al menos una.";
            p.querySelector(".opciones-container").appendChild(err);
          }
          if (!errorBox.textContent) errorBox.textContent = `Pregunta ${idx+1}: selecciona al menos una.`;
        } else {
          p.querySelector(".respuesta-error")?.remove();
        }
      }
      else if (tipo === "abierta") {
        const resp = p.querySelector(`input[name="respuesta[${idx}]"]`);
        if (!resp.value.trim()) {
          valido = false;
          resp.classList.add("is-invalid");
          if (!errorBox.textContent) errorBox.textContent = `Pregunta ${idx+1}: respuesta obligatoria.`;
        } else {
          resp.classList.remove("is-invalid");
        }
      }
    });
  }

  // 4) Si pasa validación, prevenir doble envío
  if (!valido) {
    e.preventDefault();
    errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Creando…";
  }
});
