document.querySelectorAll(".accordion-toggle").forEach(button => {
    button.addEventListener("click", () => {
    button.classList.toggle("active");
    const content = button.nextElementSibling;
    content.classList.toggle("show");
    });
  });

window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('navbar-scrolled');
    } else {
      header.classList.remove('navbar-scrolled');
    }
});

