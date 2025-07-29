document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-login");
  const errorDiv = document.getElementById("loginError");

  if (!form) {
    console.error("No se encontró el formulario con id=form-login");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    errorDiv.textContent = "";

    console.log("Enviando login con:", email);

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      console.log("Respuesta HTTP:", res.status, res.statusText);

      const data = await res.json();
      console.log("Datos recibidos:", data);

      if (res.ok && data.success) {
        console.log(`Login exitoso. Redirigiendo al panel de ${data.rol}`);
        if (data.rol === "profesor") {
          window.location.href = "/docente";
        } else {
          window.location.href = "/estudiante";
        }
        return;
      }

      // Si necesita verificación, redirige
// Si necesita verificación
if (data.verify) {
  console.log("Usuario no verificado. Redirigiendo a /verificar...");
  window.location.href = `/verificar?email=${encodeURIComponent(data.email)}`;
  return;
}


      // Si necesita reenviar verificación en la misma pantalla
      if (data.needVerification) {
        errorDiv.innerHTML = `
          Tu cuenta no está verificada.<br/>
          <button id="resendVerification" class="auth-button auth-button--secondary" style="margin-top:10px;">
            Reenviar correo de verificación
          </button>
        `;
        document.getElementById("resendVerification").addEventListener("click", async () => {
          errorDiv.textContent = "Enviando nuevo correo...";
          try {
            const resendRes = await fetch('/reenviar-verificacion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            const resendData = await resendRes.json();
            if (resendData.success) {
              errorDiv.textContent = "Nuevo correo de verificación enviado.";
            } else {
              errorDiv.textContent = resendData.error || "No se pudo reenviar el correo.";
            }
          } catch (err) {
            console.error('Error reenviando verificación:', err);
            errorDiv.textContent = "Error al reenviar el correo.";
          }
        });
        return;
      }

      // Otro error
      errorDiv.textContent = data.error || "Ocurrió un error al iniciar sesión.";
    } catch (err) {
      console.error("Error en fetch:", err);
      errorDiv.textContent = "No se pudo conectar al servidor.";
    }
  });
});
