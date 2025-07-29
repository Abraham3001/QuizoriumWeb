document.addEventListener("DOMContentLoaded", () => {
  const email = new URLSearchParams(window.location.search).get("email");
  const emailSpan = document.getElementById("verificationEmail");
  const verifyButton = document.getElementById("verifyButton");
  const resendButton = document.getElementById("resendButton");
  const codeInput = document.getElementById("verificationCodeInput");
  const errorDiv = document.getElementById("verifyError");

  emailSpan.textContent = email || "(no especificado)";

  verifyButton.addEventListener("click", async () => {
    errorDiv.textContent = "";
    const code = codeInput.value.trim();
    if (!code) {
      errorDiv.textContent = "Ingresa el código.";
      return;
    }

    try {
      const res = await fetch("/api/usuarios/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (res.ok) {
        if (res.ok) {
          // Redirige según el rol del usuario
            if (data.rol === "profesor") {
              window.location.href = "/admin";
              } else if (data.rol === "estudiante") {
                window.location.href = "/estudiante";
              } else {
                window.location.href = "/"; // por si acaso no tiene rol definido
              }
          }

      } else {
        errorDiv.textContent = data.error || "Código incorrecto.";
      }
    } catch (err) {
      errorDiv.textContent = "No se pudo verificar.";
    }
  });

  resendButton.addEventListener("click", async () => {
    errorDiv.textContent = "";
    try {
      const res = await fetch("/api/usuarios/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        errorDiv.style.color = "green";
        errorDiv.textContent = "Se envió un nuevo código.";
      } else {
        errorDiv.textContent = data.error || "Error al reenviar.";
      }
    } catch (err) {
      errorDiv.textContent = "No se pudo reenviar el código.";
    }
  });
});
