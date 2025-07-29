window.inicializarDropdownPerfil = function() {
  console.log("Inicializando Dropdown...");

  const profileButton = document.getElementById("profileButton");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  console.log("profileButton:", profileButton);
  console.log("dropdownMenu:", dropdownMenu);

  profileButton.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log("CLICK en profileButton");
    const isShowing = dropdownMenu.classList.contains("show");
    console.log("Clase 'show' antes del toggle:", isShowing);
    dropdownMenu.classList.toggle("show");
    console.log("Clase 'show' después del toggle:", dropdownMenu.classList.contains("show"));
  });

  window.addEventListener("click", (e) => {
    if (
      !profileButton.contains(e.target) &&
      !dropdownMenu.contains(e.target)
    ) {
      console.log("CLICK fuera del dropdown, cerrando.");
      dropdownMenu.classList.remove("show");
    }
  });
};