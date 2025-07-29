// Llama a esta función después de renderizar las imágenes
function enableImageModal(selector = "img") {
  const modal = document.getElementById('img-modal');
  const modalImg = document.getElementById('img-modal-img');
  const closeBtn = document.getElementById('img-modal-close');
  
  document.querySelectorAll(selector).forEach(el => {
    el.style.cursor = "zoom-in";
    el.onclick = function (e) {
      e.preventDefault();
      let img;
      if (el.tagName === 'IMG') img = el;
      else img = el.closest('.img-zoomable-container').querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
        modal.focus();
      }
    }
  });
  
  // Cerrar el modal
  function cerrarModal() {
    modal.classList.remove("show");
    modalImg.src = "";
    document.body.style.overflow = "";
  }
  closeBtn.onclick = cerrarModal;
  modal.onclick = function(e) {
    if (e.target === modal) cerrarModal();
  };
  // Escapar con tecla Escape
  modal.addEventListener("keydown", function(e) {
    if (e.key === "Escape") cerrarModal();
  });
}

// Actívalo así (solo para imágenes dentro de .pregunta, por ejemplo):
enableImageModal(".pregunta img, .imagen-pregunta");
