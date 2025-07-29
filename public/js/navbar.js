window.inicializarNavbar = async function() {
  try {
    const res = await fetch("/api/sesion");
    const sesion = await res.json();

    const authButtons = document.getElementById("auth-buttons");
    const profileDropdown = document.getElementById("profileDropdown");
    const nombreUsuario = document.getElementById("nombreUsuario");
    const dropdownMenu = profileDropdown.querySelector(".dropdown-menu");

    if (!authButtons || !profileDropdown || !nombreUsuario || !dropdownMenu) {
      console.warn("No se encontraron elementos del navbar. Revisa el HTML.");
      return;
    }

    if (sesion.autenticado) {
      authButtons.style.display = "none";
      profileDropdown.style.display = "block";
      nombreUsuario.textContent = sesion.nombre || sesion.email;

      if (sesion.rol === "profesor") {
        dropdownMenu.innerHTML = `
          <li><a href="/admin">Panel Admin</a></li>
          <li><a href="/docente">Panel Profesor</a></li>
          <li><a href="/memoria">Juego</a></li>
          <li><a href="/ajustes">Configuración</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a href="/logout">Cerrar sesión</a></li>
        `;
      } else {
        dropdownMenu.innerHTML = `
          <li><a href="/estudiante">Panel Estudiante</a></li>
          <li><a href="/memoria">Juego</a></li>
          <li><a href="/ajustes">Configuración</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a href="/logout">Cerrar sesión</a></li>
        `;
      }
    } else {
      authButtons.style.display = "flex";
      profileDropdown.style.display = "none";
    }

    // Dropdown toggle
    const profileButton = document.getElementById("profileButton");
    if (profileButton && dropdownMenu) {
      profileButton.addEventListener("click", (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle("show");
      });

      window.addEventListener("click", (e) => {
        if (
          !profileButton.contains(e.target) &&
          !dropdownMenu.contains(e.target)
        ) {
          profileDropdown.classList.remove("show");
        }
      });
    }
  } catch (error) {
    console.error("Error consultando sesión:", error);
  }
};
