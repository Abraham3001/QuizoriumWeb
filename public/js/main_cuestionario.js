let questions = [];
let userAnswers = [];
let currentQuestion = 0;

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("seleccionCuestionarioModal");
  const select = document.getElementById("cuestionarioSelect");
  const loadBtn = document.getElementById("cargarCuestionarioBtn");

  const form = document.getElementById("quizForm");
  const navBtnsContainer = document.getElementById("navBtns");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const resultado = document.getElementById("resultado");
  const feedbackDiv = document.getElementById("feedback");

  const modalConfirm = document.getElementById("confirmModal");
  const confirmYes = document.getElementById("confirmYes");
  const confirmNo = document.getElementById("confirmNo");

  loadBtn.addEventListener("click", () => {
    const selectedFile = select.value;
    if (!selectedFile) {
      alert("Selecciona un cuestionario.");
      return;
    }

    const script = document.createElement("script");
    script.src = `../js/${selectedFile}`;
    script.onload = () => {
      if (window.questions) {
        questions = window.questions;
        userAnswers = new Array(questions.length).fill(null);
        currentQuestion = 0;
        modal.style.display = "none";
        resultado.style.display = "none";
        feedbackDiv.style.display = "none";
        renderQuestions();
        renderNavButtons();
        updateNavigationButtons();
      } else {
        alert("No se pudieron cargar las preguntas.");
      }
    };
    document.body.appendChild(script);
  });

  prevBtn.addEventListener("click", () => {
    if (currentQuestion > 0) {
      currentQuestion--;
      renderQuestions();
      updateNavigationButtons();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
      renderQuestions();
      updateNavigationButtons();
    }
  });

  submitBtn.addEventListener("click", () => {
    modalConfirm.style.display = "flex";
  });

  confirmYes.addEventListener("click", () => {
    modalConfirm.style.display = "none";
    checkAnswers();
    resultado.style.display = "block";
    feedbackDiv.style.display = "block";
    document.getElementById("quizForm").scrollIntoView({ behavior: "smooth" });
  });

  confirmNo.addEventListener("click", () => {
    modalConfirm.style.display = "none";
  });

  window.onclick = function (event) {
    if (event.target === modalConfirm) {
      modalConfirm.style.display = "none";
    }
  };
});

function renderQuestions() {
  const form = document.getElementById("quizForm");
  form.innerHTML = "";

  const q = questions[currentQuestion];
  const div = document.createElement("div");
  div.className = "question";

  const questionText = document.createElement("p");
  questionText.innerHTML = `<strong>${currentQuestion + 1}.</strong> ${q.texto}`;
  div.appendChild(questionText);

  q.opciones.forEach((op, i) => {
    const label = document.createElement("label");
    label.style.display = "block";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `q${currentQuestion}`;
    input.value = i;
    if (userAnswers[currentQuestion] === i) {
      input.checked = true;
    }

    input.addEventListener("change", () => {
      userAnswers[currentQuestion] = i;
    });

    label.appendChild(input);
    label.append(" " + op);
    div.appendChild(label);
  });

  form.appendChild(div);
}

function renderNavButtons() {
  const container = document.getElementById("navBtns");
  container.innerHTML = "";

  questions.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.textContent = i + 1;
    btn.className = "nav-btn";
    if (i === currentQuestion) btn.classList.add("active");

    btn.addEventListener("click", () => {
      currentQuestion = i;
      renderQuestions();
      updateNavigationButtons();
    });

    container.appendChild(btn);
  });
}

function updateNavigationButtons() {
  document.querySelectorAll(".nav-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i === currentQuestion);
  });

  document.getElementById("prevBtn").disabled = currentQuestion === 0;
  document.getElementById("nextBtn").disabled = currentQuestion === questions.length - 1;
}

function checkAnswers() {
  let correctas = 0;
  let feedback = "";

  questions.forEach((q, i) => {
    const correcta = q.correcta;
    const respuesta = userAnswers[i];
    const esCorrecta = respuesta === correcta;
    if (esCorrecta) correctas++;

    feedback += `<p><strong>${i + 1}. ${q.texto}</strong><br>
      Tu respuesta: ${respuesta !== null ? q.opciones[respuesta] : "Sin responder"}<br>
      ${esCorrecta ? '<span style="color:green;">✔ Correcto</span>' : `<span style="color:red;">✘ Incorrecto. Respuesta correcta: ${q.opciones[correcta]}</span>`}
    </p>`;
  });

  document.getElementById("resultado").innerHTML = `<h3>Resultado: ${correctas} de ${questions.length} correctas</h3>`;
  document.getElementById("feedback").innerHTML = feedback;
}
