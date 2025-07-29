document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("form-login");
  const registroForm = document.getElementById("form-registro");
  const adminLoginForm = document.getElementById("form-admin-login");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      const email = this.email.value.trim();
      const password = this.password.value.trim();

      if (!email || !password) {
        e.preventDefault();
        mostrarError("Por favor, completa todos los campos.", this);
        return;
      }

      if (!email.includes("@")) {
        e.preventDefault();
        mostrarError("El correo electrónico no es válido.", this);
        return;
      }
    });
  }

  if (registroForm) {
    registroForm.addEventListener("submit", function (e) {
      const email = this.email.value.trim();
      const password = this.password.value.trim();
      const rol = this.rol.value;

      if (!email || !password || !rol) {
        e.preventDefault();
        mostrarError("Por favor, completa todos los campos del registro.", this);
        return;
      }

      if (!email.includes("@")) {
        e.preventDefault();
        mostrarError("El correo electrónico no es válido.", this);
        return;
      }

      if (password.length < 6) {
        e.preventDefault();
        mostrarError("La contraseña debe tener al menos 6 caracteres.", this);
        return;
      }
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (e) {
      const email = this.email.value.trim();
      const password = this.password.value.trim();

      if (!email || !password) {
        e.preventDefault();
        mostrarError("Por favor, completa todos los campos del ingreso docente.", this);
        return;
      }

      if (!email.includes("@")) {
        e.preventDefault();
        mostrarError("El correo institucional no es válido.", this);
        return;
      }
    });
  }

  function mostrarError(mensaje, formulario) {
    let alerta = formulario.querySelector(".alert");
    if (!alerta) {
      alerta = document.createElement("div");
      alerta.className = "alert alert-danger mt-3";
      formulario.appendChild(alerta);
    }
    alerta.textContent = mensaje;
  }
});
