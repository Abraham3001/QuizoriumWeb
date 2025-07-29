const form = document.getElementById('login-form');
const nombre = document.getElementById('nombre');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('strengthBar');
const passwordHelp = document.getElementById('passwordHelp');
const passwordMatch = document.getElementById('passwordMatch');
const terms = document.getElementById('terms');
const toggles = document.querySelectorAll('.password-toggle');

function limpiarErrores() {
  [nombre, email, password, confirmPassword].forEach(input => {
    input.classList.remove('is-invalid');
    if (input.parentNode.querySelector('.invalid-feedback'))
      input.parentNode.querySelector('.invalid-feedback').textContent = '';
  });
  document.getElementById('registroError').textContent = '';
  const termsError = document.querySelector('.auth-terms .invalid-feedback');
  if (termsError) termsError.remove();
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  limpiarErrores();
  let valid = true;

  // Nombre
  if (nombre.value.trim() === '') {
    nombre.classList.add('is-invalid');
    nombre.parentNode.querySelector('.invalid-feedback').textContent = 'El nombre es obligatorio.';
    valid = false;
  }

  // Email
  if (email.value.trim() === '') {
    email.classList.add('is-invalid');
    email.parentNode.querySelector('.invalid-feedback').textContent = 'El correo es obligatorio.';
    valid = false;
  } else if (!validarEmail(email.value.trim())) {
    email.classList.add('is-invalid');
    email.parentNode.querySelector('.invalid-feedback').textContent = 'El formato del correo es inválido.';
    valid = false;
  }

  // Password
  if (password.value.length < 8) {
    password.classList.add('is-invalid');
    password.parentNode.querySelector('.invalid-feedback').textContent = 'La contraseña debe tener al menos 8 caracteres.';
    valid = false;
  }

  // Confirmación de contraseña
  if (confirmPassword.value !== password.value || confirmPassword.value === '') {
    confirmPassword.classList.add('is-invalid');
    confirmPassword.parentNode.querySelector('.invalid-feedback').textContent = 'Las contraseñas no coinciden.';
    valid = false;
  }

  // Términos y condiciones
  if (!terms.checked) {
    if (!document.querySelector('.auth-terms .invalid-feedback')) {
      const error = document.createElement('div');
      error.className = 'invalid-feedback';
      error.style.display = 'block';
      error.textContent = 'Debes aceptar los términos y condiciones.';
      document.querySelector('.auth-terms').appendChild(error);
    }
    valid = false;
  }

  if (!valid) {
    document.getElementById('registroError').textContent = 'Por favor corrige los campos marcados.';
    return;
  }

  // Si todo es válido, intenta registrar (AJAX)
  try {
    const response = await fetch('/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        password: password.value,
        confirmPassword: confirmPassword.value
      })
    });

    const data = await response.json();

    if (data.error) {
      document.getElementById('registroError').textContent = data.error;
    } else if (data.success && data.email) {
      window.location.href = `/verificar?email=${encodeURIComponent(data.email)}`;
    }
  } catch (err) {
    document.getElementById('registroError').textContent = 'Ocurrió un error al registrar. Intenta de nuevo.';
  }
});

// Fuerza de contraseña y coincidencia (sin cambios)
function updateStrength(value) {
  let fuerza = 0;
  if (value.length >= 8) fuerza++;
  if (/[A-Z]/.test(value)) fuerza++;
  if (/[0-9]/.test(value)) fuerza++;
  if (/[^A-Za-z0-9]/.test(value)) fuerza++;

  passwordStrength.className = 'barra';
  if (fuerza === 0) {
    passwordHelp.textContent = '';
  } else if (fuerza === 1) {
    passwordStrength.classList.add('fuerza-1');
    passwordHelp.textContent = 'Contraseña débil.';
  } else if (fuerza === 2) {
    passwordStrength.classList.add('fuerza-2');
    passwordHelp.textContent = 'Contraseña media.';
  } else if (fuerza === 3) {
    passwordStrength.classList.add('fuerza-3');
    passwordHelp.textContent = 'Contraseña buena.';
  } else {
    passwordStrength.classList.add('fuerza-4');
    passwordHelp.textContent = 'Contraseña fuerte.';
  }
}

function checkMatch() {
  if (confirmPassword.value === '') {
    passwordMatch.textContent = '';
  } else if (password.value === confirmPassword.value) {
    passwordMatch.textContent = 'Las contraseñas coinciden.';
    passwordMatch.style.color = 'limegreen';
  } else {
    passwordMatch.textContent = 'Las contraseñas no coinciden.';
    passwordMatch.style.color = 'red';
  }
}

password.addEventListener('input', () => {
  updateStrength(password.value);
  checkMatch();
});
confirmPassword.addEventListener('input', checkMatch);

// Mostrar/ocultar contraseña
toggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const target = document.querySelector(toggle.dataset.target);
    if (target.type === 'password') {
      target.type = 'text';
      toggle.classList.remove('bi-eye-fill');
      toggle.classList.add('bi-eye-slash-fill');
    } else {
      target.type = 'password';
      toggle.classList.remove('bi-eye-slash-fill');
      toggle.classList.add('bi-eye-fill');
    }
  });
});
