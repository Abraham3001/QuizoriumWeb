document.addEventListener('DOMContentLoaded', async () => {
  const avatar = document.getElementById("user-avatar");
  const avatarHover = document.querySelector(".avatar-hover");
  const inputFoto = document.getElementById("foto");
  const nombreUsuario = document.getElementById("user-nombre");
  const inputNombre = document.getElementById("nombre");
  const inputEmail = document.getElementById("email");

  const usuario = await obtenerUsuario();

  nombreUsuario.textContent = `Bienvenido, ${usuario.nombre}`;
  inputNombre.value = usuario.nombre;
  inputEmail.value = usuario.email;
  avatar.src = usuario.foto || "/img/default-avatar.png";

  avatarHover.addEventListener("click", () => inputFoto.click());

  inputFoto.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      avatar.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll('.config-menu li').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelector('.config-menu li.active')?.classList.remove('active');
      item.classList.add('active');

      const target = item.dataset.section;
      document.querySelectorAll('.config-section').forEach(sec => {
        sec.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
    });
  });
});

async function obtenerUsuario() {
  const res = await fetch('/api/usuario-actual');
  return await res.json();
}


// === Seguridad ===

const formSeguridad = document.getElementById('form-seguridad');
const modal = document.getElementById('modal-codigo');
const verificarBtn = document.getElementById('btn-verificar-codigo');
const cancelarBtn = document.getElementById('btn-cancelar-codigo');
const reenviarBtn = document.getElementById('btn-reenviar-codigo');
const errorCodigo = document.getElementById('error-codigo');
const timerTexto = document.getElementById('timer-codigo');
const codigoInputs = document.querySelectorAll('.codigo-inputs input');

let codigoGenerado = "";
let emailUsuario = "";
let nuevaPassword = "";
let intervaloTimer;
let tiempoRestante = 90;

formSeguridad.addEventListener('submit', async (e) => {
  e.preventDefault();

  const pass1 = document.getElementById('nueva-pass').value.trim();
  const pass2 = document.getElementById('confirmar-pass').value.trim();

  if (pass1.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");
  if (pass1 !== pass2) return alert("Las contraseñas no coinciden.");

  emailUsuario = document.getElementById('email').value;
  nuevaPassword = pass1;
  codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();

  await fetch('/api/enviar-codigo-cambio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: emailUsuario, codigo: codigoGenerado })
  });


  modal.style.display = 'flex';
  codigoInputs.forEach(input => {
    input.value = "";
    input.classList.remove('error');
  });
  errorCodigo.style.display = 'none';
  codigoInputs[0].focus();
  reenviarBtn.disabled = true;
  tiempoRestante = 90;
  iniciarContador();
});

// Timer para reenviar
function iniciarContador() {
  clearInterval(intervaloTimer);
  intervaloTimer = setInterval(() => {
    if (tiempoRestante <= 0) {
      reenviarBtn.disabled = false;
      timerTexto.textContent = 'Ahora puedes reenviar el código.';
      clearInterval(intervaloTimer);
    } else {
      const min = Math.floor(tiempoRestante / 60);
      const sec = tiempoRestante % 60;
      timerTexto.textContent = `Podrás reenviar en ${min}:${sec < 10 ? '0' : ''}${sec}`;
      tiempoRestante--;
    }
  }, 1000);
}

reenviarBtn.addEventListener('click', async () => {
  codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
  await fetch('/api/enviar-codigo-cambio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: emailUsuario, codigo: codigoGenerado })
  });


  reenviarBtn.disabled = true;
  tiempoRestante = 90;
  iniciarContador();
});

cancelarBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  clearInterval(intervaloTimer);
  reenviarBtn.disabled = true;
  tiempoRestante = 90;
  timerTexto.textContent = `Podrás reenviar en 1:30`;
});

// Auto avance y validación del código
codigoInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.classList.remove('error');
    if (input.value.length === 1 && index < codigoInputs.length - 1) {
      codigoInputs[index + 1].focus();
    }

    const codigoIngresado = Array.from(codigoInputs).map(i => i.value).join('');
    if (codigoIngresado.length === 6) validarCodigo(codigoIngresado);
  });
});

async function validarCodigo(codigoIngresado) {
  if (codigoIngresado === codigoGenerado) {
    modal.style.display = 'none';
    clearInterval(intervaloTimer);

    await fetch('/api/actualizar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailUsuario, nuevaPassword })
    });

    await fetch('/api/confirmar-cambio-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailUsuario, nombre: document.getElementById('nombre').value })
    });

    alert('Contraseña actualizada correctamente');
  } else {
    errorCodigo.style.display = 'block';
    codigoInputs.forEach(input => {
      input.classList.add('error');
      input.value = "";
    });
    codigoInputs[0].focus();
  }
}

// === MODO OSCURO ===
const themeSelect = document.getElementById('theme');
const formPreferencias = document.getElementById('form-preferencias');

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('tema') || 'light';
  document.body.classList.toggle('dark', savedTheme === 'dark');
  themeSelect.value = savedTheme;
});

formPreferencias.addEventListener('submit', (e) => {
  e.preventDefault();
  const selectedTheme = themeSelect.value;
  document.body.classList.toggle('dark', selectedTheme === 'dark');
  localStorage.setItem('tema', selectedTheme);
});
