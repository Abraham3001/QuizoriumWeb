document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const cuestionarioId = params.get("id");
  if (!cuestionarioId) {
    return alert("No se recibió un ID de cuestionario");
  }

  try {
    const res  = await fetch(`/api/cuestionarios/${cuestionarioId}`);
    const data = await res.json();

    if (!data || !Array.isArray(data.preguntas)) {
      throw new Error("Respuesta de API inválida");
    }

    const container = document.getElementById("cuestionario");
    // Cabecera del cuestionario
    container.innerHTML = `
      <h3>${data.titulo}</h3>
      <p class="text-muted">${data.descripcion || ""}</p>
    `;

    // Recorrer y renderizar cada pregunta
    data.preguntas.forEach((p, i) => {
      const qDiv = document.createElement("div");
      qDiv.className = "pregunta mb-4 p-3 bg-white rounded shadow-sm";

      // Título y texto
      qDiv.innerHTML = `
        <h5 class="mb-3">Pregunta ${i + 1}</h5>
        <p>${p.texto}</p>
      `;

      // Imagen (si existe)
      if (p.imagen) {
        const wrapper = document.createElement("div"); // block
        wrapper.className = "img-zoomable-container mb-3";

        const img = document.createElement("img");
        img.src = p.imagen.startsWith("/uploads/")
          ? p.imagen
          : `/uploads/${p.imagen}`;
        img.alt = "Imagen pregunta";
        img.className = "imagen-pregunta img-zoomable"; // no w-50 ni d-block
        wrapper.appendChild(img);

        // Lupa SVG sobrepuesta
        const lupa = document.createElement("span");
        lupa.className = "img-zoomable-lupa";
        lupa.innerHTML = `
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="#444" stroke-width="2" fill="none"/>
            <line x1="17" y1="17" x2="21" y2="21" stroke="#444" stroke-width="2" stroke-linecap="round"/>
          </svg>
        `;
        wrapper.appendChild(lupa);

        qDiv.append(wrapper);
      }

      // Opciones / respuesta según tipo
      let opciones = Array.isArray(p.opciones) ? p.opciones : [];

      if (p.tipo === "abierta") {
        const pResp = document.createElement("p");
        pResp.innerHTML = `<strong>Respuesta:</strong> ${p.respuesta}`;
        qDiv.append(pResp);
      }
      else if (p.tipo === "si_no") {
        ["Sí", "No"].forEach(op => {
          const chk = document.createElement("div");
          chk.className = "form-check";
          chk.innerHTML = `
            <input class="form-check-input" type="radio" disabled 
                   ${p.respuesta === op ? "checked" : ""}>
            <label class="form-check-label">${op}</label>
          `;
          qDiv.append(chk);
        });
      }
      else if (p.tipo === "opcion_multiple") {
        opciones.forEach((opt, idx) => {
          const chk = document.createElement("div");
          chk.className = "form-check";
          chk.innerHTML = `
            <input class="form-check-input" type="radio" disabled 
                   ${String(p.respuesta) === String(idx) ? "checked" : ""}>
            <label class="form-check-label">${opt}</label>
          `;
          qDiv.append(chk);
        });
      }
      else if (p.tipo === "check") {
        const respArr = Array.isArray(p.respuesta)
          ? p.respuesta.map(r => String(r))
          : [];
        opciones.forEach((opt, idx) => {
          const chk = document.createElement("div");
          chk.className = "form-check";
          chk.innerHTML = `
            <input class="form-check-input" type="checkbox" disabled 
                   ${respArr.includes(String(idx)) ? "checked" : ""}>
            <label class="form-check-label">${opt}</label>
          `;
          qDiv.append(chk);
        });
      }

      container.append(qDiv);
    });
    enableImageModal(".pregunta img, .imagen-pregunta");
  }
  catch (err) {
    console.error("Error al cargar cuestionario:", err);
    alert("No se pudo cargar el cuestionario, comprueba la consola.");
  }
});
