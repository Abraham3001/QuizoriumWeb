window.addEventListener('scroll', () => {
  const header = document.getElementById('navbar');
  if (!header) {
    console.warn('⚠️ No se encontró el header para aplicar scroll.');
    return;
  }
  if (window.scrollY > 20) {
    header.classList.add('navbar-scrolled');
    header.classList.remove('navbar-initial');
  } else {
    header.classList.remove('navbar-scrolled');
    header.classList.add('navbar-initial');
  }
});
