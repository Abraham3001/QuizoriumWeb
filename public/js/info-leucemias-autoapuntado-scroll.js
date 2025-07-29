document.addEventListener("DOMContentLoaded", () => {
        const toggles = document.querySelectorAll('.accordion-toggle');
        const contents = document.querySelectorAll('.accordion-content');

        toggles.forEach((toggle, i) => {
        toggle.addEventListener('click', () => {
            contents.forEach((content, j) => {
            if (i === j) {
                const isOpen = content.style.display === 'block';
                content.style.display = isOpen ? 'none' : 'block';

                if (!isOpen) {
                content.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                content.style.display = 'none';
            }
            });
        });
        });

        // Botón "⬆" funcionalidad extra (si quieres más suave aún)
        const irArribaBtn = document.querySelector('.btn-ir-arriba');
        if (irArribaBtn) {
        irArribaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        }
    });
     // Mostrar/ocultar el botón "ir arriba" según el scroll
    const irArribaBtn = document.querySelector('.btn-ir-arriba');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 200) {
        irArribaBtn.style.display = 'flex';
      } else {
        irArribaBtn.style.display = 'none';
      }
    });

    // Acción al hacer clic en el botón
    if (irArribaBtn) {
      irArribaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
}