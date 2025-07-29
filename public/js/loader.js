document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
  }
});

// Seguridad: si por alguna razón no se oculta en 5 seg, forzar el ocultado
window.setTimeout(() => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
  }
}, 1000);

document.addEventListener("DOMContentLoaded", async () => {
  // Insertar HEADER
  try {
    const res = await fetch('/partials/header.html');
    const html = await res.text();
    if (html.trim()) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();
      document.body.insertAdjacentElement('afterbegin', tempDiv.firstElementChild);

      // Cargar navbar.js y ESPERAR a que cargue
      await new Promise((resolve, reject) => {
        // 1. Cargar navbar.js
const navbarScript = document.createElement('script');
navbarScript.src = '/js/navbar.js';

navbarScript.onload = () => {
  inicializarNavbar();
  const dropdownScript = document.createElement('script');
  dropdownScript.src = '/js/profileDropdown.js';
  dropdownScript.onload = () => {
    inicializarDropdownPerfil();
  };
  document.body.appendChild(dropdownScript);
};

document.body.appendChild(navbarScript);

      });
    } else {
      console.warn("El header.html está vacío.");
    }
  } catch (err) {
    console.error("Error cargando header:", err);
  }

  // Insertar FOOTER
  try {
    const res = await fetch('/partials/footer.html');
    const html = await res.text();
    if (html.trim()) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.trim();
      document.body.appendChild(tempDiv.firstElementChild);
    } else {
      console.warn("El footer.html está vacío.");
    }
  } catch (err) {
    console.error("Error cargando footer:", err);
  }

  // Una vez todo listo: lanzar scroll
  window.dispatchEvent(new Event('scroll'));
});
