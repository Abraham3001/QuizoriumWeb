// Zoom y lupa automático para todas las imágenes .imagen-leucemia
document.addEventListener('DOMContentLoaded', function() {
  // 1. Envolver todas las imágenes con el contenedor de lupa, si no lo tienen
  document.querySelectorAll('.imagen-leucemia').forEach(img => {
    if (!img.parentElement.classList.contains('img-lupa-container')) {
      // Crear wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'img-lupa-container';
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      // Añadir icono lupa
      const lupa = document.createElement('span');
      lupa.className = 'img-lupa-icon';
      lupa.title = 'Ver imagen grande';
      lupa.innerHTML = '&#128269;';
      wrapper.appendChild(lupa);
    }
  });

  // 2. Modal (una sola vez en el body)
  if (!document.getElementById('modal-img')) {
    const modal = document.createElement('div');
    modal.id = 'modal-img';
    modal.className = 'modal-img-leucemia';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-img-bg"></div>
      <img id="modal-img-src" src="" alt="Imagen ampliada">
      <button id="modal-img-close" aria-label="Cerrar" title="Cerrar">&times;</button>
    `;
    document.body.appendChild(modal);
  }

  const modal = document.getElementById('modal-img');
  const modalImg = document.getElementById('modal-img-src');
  const closeBtn = document.getElementById('modal-img-close');
  const bg = modal.querySelector('.modal-img-bg');

  // 3. Abrir modal al hacer click en lupa o en la imagen
  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('imagen-leucemia') || e.target.classList.contains('img-lupa-icon')) {
      const img = e.target.classList.contains('imagen-leucemia')
        ? e.target
        : e.target.parentElement.querySelector('.imagen-leucemia');
      modalImg.src = img.src;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    // Cerrar
    if (e.target === closeBtn || e.target === bg) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modalImg.src = '';
    }
  });
});
