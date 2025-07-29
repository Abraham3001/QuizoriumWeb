document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');

  // Ocultar loader si existe
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 400);
  }

  // Añadir transición a clicks en enlaces
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');

    if (
      link &&
      link.href &&
      !link.href.startsWith('javascript:') &&
      !link.href.includes('#') &&
      link.target !== '_blank' &&
      link.hostname === window.location.hostname
    ) {
      e.preventDefault();

      if (loader) {
        loader.classList.remove('hidden');
      }

      setTimeout(() => {
        window.location.href = link.href;
      }, 300);
    }
  });
});
