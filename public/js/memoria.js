// Configuración de niveles 
const niveles = {
  facil: { columnas: 4, filas: 3, tiempo: 180 },
  medio: { columnas: 4, filas: 4, tiempo: 240 },
  dificil: { columnas: 5, filas: 4, tiempo: 300 }
};

// Base de datos de leucemias 
const leucemias = [
  { nombre: "LGC_LMC", descripcion: "Leucemia Granulocítica Crónica/Leucemia Mieloide Crónica (LGC-LMC).", imagen: "../img/img_leucemia1/LGC_LMC_Imagenes_Filtradas/LGC_LMC_1.png" },
  { nombre: "LMA M0", descripcion: "Leucemia Mieloide Aguda sin diferenciación (M0).", imagen: "../img/img_leucemia1/LMA_M0_Imagenes_Filtradas/LMA_M0_1.png" },
  { nombre: "LMA M1", descripcion: "Leucemia Mieloide Aguda con poca diferenciación (LMA M1).", imagen: "../img/img_leucemia1/LMA_M1_Imagenes_Filtradas/LMA_M1_1.png" },
  { nombre: "LMA M2", descripcion: "Leucemia Mieloide Aguda con diferenciación (LMA M2).", imagen: "../img/img_leucemia1/LMA_M2_Imagenes_Pares/LMA_M2_1.png" },
  { nombre: "LMA M3", descripcion: "Leucemia Promielocítica (LMA M3).", imagen: "../img/img_leucemia1/LMA_M3_Imagenes_Filtradas/LMA_M3_1.png" },
  { nombre: "LMA M4", descripcion: "Leucemia mielomonocítica aguda M4.", imagen: "../img/img_leucemia1/LMA_M4_Imagenes_Filtradas/LMA_M4_1.png" },
  { nombre: "LMA M4eo", descripcion: "Leucemia Aguda Mielomonoblástica Eosinofílica (M4eo).", imagen: "../img/img_leucemia1/LMA_M4eo_Imagenes_Filtradas/LMA_M4eo_1.png" },
  { nombre: "LMA M5a", descripcion: "Leucemia Mieloide Monoblástica poco diferenciada (LMA M5a).", imagen: "../img/img_leucemia1/LMA_M5a_Imagenes_Filtradas/LMA_M5a_1.png" },
  { nombre: "LMA M5b", descripcion: "Leucemia Mieloide Aguda Monoblástica bien diferenciada (LMA M5b).", imagen: "../img/img_leucemia1/LMA_M5b_Imagenes_Filtradas/LMA_M5b_1.png" },
  { nombre: "LMA M6", descripcion: "Leucemia Eritroide Aguda/Eritroleucemia (LMA M6).", imagen: "../img/img_leucemia1/LMA_M6_Imagenes_Filtradas/LMA_M6_1.png" },
  { nombre: "LMA M7", descripcion: "Leucemia Mieloide Aguda Megacarioblástica (LMA M7).", imagen: "../img/img_leucemia1/LMA_M7_Imagenes_Filtradas/LMA_M7_1.png" },
  { nombre: "LMMC", descripcion: "Leucemia Mielomonocítica Crónica (LMMC).", imagen: "../img/img_leucemia1/LMMC_Imagenes_Filtradas/LMMC_1.png" },
  { nombre: "LLA L1", descripcion: "Leucemia Linfoblástica Aguda L1.", imagen: "../img/img_leucemia2/ImagenesL1/img1.png" },
  { nombre: "LLA L2", descripcion: "Leucemia Linfoblástica Aguda L2.", imagen: "../img/img_leucemia2/ImagenesL2/img16.png" },
  { nombre: "LLA L3", descripcion: "Leucemia Linfoblástica Aguda L3.", imagen: "../img/img_leucemia2/ImagenesL3/img31.png" },
  { nombre: "LLC", descripcion: "Leucemia Linfocítica Crónica.", imagen: "../img/img_leucemia2/ImagenesLLC/img47.png" },
  { nombre: "LNK", descripcion: "Leucemia de Células Natural Killer (NK).", imagen: "../img/img_leucemia2/ImagenesLNK/img62.png" },
  { nombre: "LP", descripcion: "Leucemia Prolinfocítica.", imagen: "../img/img_leucemia2/ImagenesLP/img77.png" },
  { nombre: "LCP", descripcion: "Leucemia de células peludas (tricoleucemia).", imagen: "../img/img_leucemia2/ImagenesCelulas_Peludas/img92.png" }
];

// Variables del juego 
let juegoState = {
  cartas: [],
  seleccionadas: [],
  bloqueado: false,
  timer: null,
  segundos: 0,
  movimientos: 0,
  aciertos: 0,
  juegoIniciado: false,
  nivelActual: 'facil'
};

// Sistema de efectos de sonido 
const sonidos = {
  voltear: () => {
    // Efecto de sonido al voltear carta
    if (window.audioContext) {
      const oscillator = window.audioContext.createOscillator();
      const gainNode = window.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(window.audioContext.destination);
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(window.audioContext.currentTime + 0.1);
    }
  },
  acierto: () => {
    // Efecto de sonido para acierto
    if (window.audioContext) {
      const oscillator = window.audioContext.createOscillator();
      const gainNode = window.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(window.audioContext.destination);
      oscillator.frequency.value = 1200;
      gainNode.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(window.audioContext.currentTime + 0.2);
    }
  },
  victoria: () => {
    // Efecto de sonido para victoria
    if (window.audioContext) {
      [800, 1000, 1200, 1500].forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = window.audioContext.createOscillator();
          const gainNode = window.audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(window.audioContext.destination);
          oscillator.frequency.value = freq;
          gainNode.gain.value = 0.1;
          oscillator.start();
          oscillator.stop(window.audioContext.currentTime + 0.2);
        }, index * 100);
      });
    }
  }
};

// Inicializar contexto de audio
function inicializarAudio() {
  if (!window.audioContext && (window.AudioContext || window.webkitAudioContext)) {
    window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Función  para renderizar tablero previo
function renderizarTableroPrevia() {
  const nivel = document.getElementById("nivel").value;
  juegoState.nivelActual = nivel;
  const { columnas, filas } = niveles[nivel];
  const cantidadCartas = columnas * filas;

  const tablero = document.getElementById("tablero");
  tablero.className = "tablero-memoria-enhanced";
  tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`; 
  tablero.innerHTML = "";

  // Crear cartas de vista previa con animación
  for (let i = 0; i < cantidadCartas; i++) {
    const card = document.createElement("div");
    card.className = "carta bloqueada loading-pulse";
    card.style.animationDelay = `${i * 50}ms`;
    card.innerHTML = `
      <div class="frente"></div>
      <div class="atras">
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-size: 2rem;">
          ?
        </div>
      </div>
    `;
    tablero.appendChild(card);
  }

  detenerTimer();
  resetearContadores();
  ocultarMensajes();
  ocultarEstadisticas();
}

// Función  para iniciar juego
function iniciarJuego() {
  inicializarAudio();

  const btnIniciar = document.getElementById("btnIniciar");
  btnIniciar.disabled = true;
  btnIniciar.innerHTML = '<span class="btn-icon">⏳</span> Preparando...';

  const nivel = document.getElementById("nivel").value;
  juegoState.nivelActual = nivel;
  const { columnas, filas } = niveles[nivel];
  const cantidadCartas = (columnas * filas) / 2;

  // Selección aleatoria sin categorías
  let seleccion = leucemias
    .sort(() => Math.random() - 0.5)
    .slice(0, cantidadCartas);

  juegoState.cartas = [...seleccion, ...seleccion].sort(() => Math.random() - 0.5);

  const tablero = document.getElementById("tablero");
  tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
  tablero.innerHTML = "";

  // Crear cartas con animación secuencial
  juegoState.cartas.forEach((leucemia, idx) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.className = "carta";
      card.dataset.nombre = leucemia.nombre;
      card.dataset.index = idx;
      card.style.animationDelay = `${idx * 50}ms`;

      card.innerHTML = `
        <div class="frente"></div>
        <div class="atras">
          <img src="${leucemia.imagen}" alt="${leucemia.nombre}" loading="lazy" />
        </div>
      `;

      card.addEventListener("click", () => voltearCarta(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          voltearCarta(card);
        }
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Carta ${idx + 1}, ${leucemia.nombre}`);

      tablero.appendChild(card);
    }, idx * 30);
  });
  setTimeout(() => {
    tablero.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 1000);

  // Resetear estado del juego
  juegoState.seleccionadas = [];
  juegoState.bloqueado = true;
  juegoState.movimientos = 0;
  juegoState.aciertos = 0;
  juegoState.juegoIniciado = false;

  ocultarMensajes();
  mostrarEstadisticas();

  // Mostrar todas las cartas brevemente
  setTimeout(() => {
    document.querySelectorAll(".carta").forEach(c => {
      c.classList.add("volteada");
      c.style.pointerEvents = 'none';
    });

    btnIniciar.innerHTML = '<span class="btn-icon">👀</span> Memoriza...';

    setTimeout(() => {
      document.querySelectorAll(".carta").forEach(c => {
        c.classList.remove("volteada");
        c.style.pointerEvents = 'auto';
      });
      juegoState.bloqueado = false;
      juegoState.juegoIniciado = true;
      iniciarTimer();

      btnIniciar.innerHTML = '<span class="btn-icon">🎮</span> ¡Jugando!';
      btnIniciar.disabled = false;
    }, 3000);
  }, 1000);

  resetearContadores();
  actualizarEstadisticas();
}
// Función  para voltear carta
function voltearCarta(carta) {
  if (juegoState.bloqueado || 
      carta.classList.contains("volteada") || 
      carta.classList.contains("descubierta") ||
      !juegoState.juegoIniciado) {
    return;
  }

  // Efectos visuales y sonoros
  carta.classList.add("volteada");
  carta.style.transform = "scale(1.05)";
  setTimeout(() => carta.style.transform = "", 300);
  
  sonidos.voltear();

  juegoState.seleccionadas.push(carta);

  // Incrementar movimientos solo en el primer volteo de cada par
  if (juegoState.seleccionadas.length === 1) {
    juegoState.movimientos++;
    actualizarEstadisticas();
  }

  if (juegoState.seleccionadas.length === 2) {
    juegoState.bloqueado = true;
    const [c1, c2] = juegoState.seleccionadas;

    if (c1.dataset.nombre === c2.dataset.nombre && c1.dataset.index !== c2.dataset.index) {
      // ¡Acierto!
      setTimeout(() => {
        c1.classList.add("descubierta");
        c2.classList.add("descubierta");
        
        // Efectos de acierto
        sonidos.acierto();
        crearEfectoParticulas(c1);
        crearEfectoParticulas(c2);
        
        mostrarInfo(c1.dataset.nombre);
        juegoState.seleccionadas = [];
        juegoState.bloqueado = false;
        juegoState.aciertos++;
        actualizarEstadisticas();
        verificarGanador();
      }, 600);
    } else {
      // Error
      setTimeout(() => {
        c1.classList.remove("volteada");
        c2.classList.remove("volteada");
        
        // Efecto de error
        [c1, c2].forEach(card => {
          card.style.animation = "shake 0.5s ease-in-out";
          setTimeout(() => card.style.animation = "", 500);
        });
        
        juegoState.seleccionadas = [];
        juegoState.bloqueado = false;
        actualizarEstadisticas();
      }, 1200);
    }
  }
}

// Crear efecto de partículas para aciertos
function crearEfectoParticulas(carta) {
  const particulas = ['✨', '⭐', '🎉', '💫'];
  
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const particula = document.createElement('div');
      particula.textContent = particulas[Math.floor(Math.random() * particulas.length)];
      particula.style.position = 'absolute';
      particula.style.fontSize = '1.5rem';
      particula.style.pointerEvents = 'none';
      particula.style.zIndex = '1000';
      particula.style.animation = 'particleFloat 2s ease-out forwards';
      
      const rect = carta.getBoundingClientRect();
      particula.style.left = (rect.left + Math.random() * rect.width) + 'px';
      particula.style.top = (rect.top + Math.random() * rect.height) + 'px';
      
      document.body.appendChild(particula);
      
      setTimeout(() => particula.remove(), 2000);
    }, i * 100);
  }
}

// Agregar keyframes para animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  @keyframes particleFloat {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0.5) rotate(360deg);
    }
  }
`;
document.head.appendChild(style);

// Función  para mostrar información
function mostrarInfo(nombre) {
  const info = leucemias.find(l => l.nombre === nombre);
  const mensaje = document.getElementById("mensaje-leucemia");
  const infoContent = mensaje.querySelector('.info-content') || mensaje;
  
  if (mensaje.querySelector('.info-content')) {
    infoContent.innerHTML = `
      <strong>${info.nombre}</strong><br>
      ${info.descripcion}
    `;

  } else {
    mensaje.textContent = `${info.nombre}: ${info.descripcion}`;
  }
  
  mensaje.classList.remove("d-none");
  //mensaje.scrollIntoView({ behavior: "smooth", block: "center" });
  
  // Auto-ocultar después de 10 segundos
  setTimeout(() => {
    if (!mensaje.classList.contains("d-none")) {
      mensaje.style.opacity = '0.7';
    }
  }, 10000);
}

// Función  para verificar ganador
function verificarGanador() {
  const descubiertas = document.querySelectorAll(".carta.descubierta");
  if (descubiertas.length === juegoState.cartas.length) {
    detenerTimer();
    sonidos.victoria();
    
    // Calcular estadísticas finales
    const precision = Math.round((juegoState.aciertos / juegoState.movimientos) * 100);
    const tiempoFinal = formatearTiempo(juegoState.segundos);
    
    // Efecto de confetti
    crearConfetti();
    
    setTimeout(() => {
      document.getElementById("tiempo-final").innerHTML = `
        <strong>⏱️ Tiempo:</strong> ${tiempoFinal}<br>
        <strong>🎯 Movimientos:</strong> ${juegoState.movimientos}<br>
        <strong>📊 Precisión:</strong> ${precision}%
      `;
      document.getElementById("modal-ganador").classList.remove("d-none");
    }, 1000);
  }
}

// Crear efecto confetti
function crearConfetti() {
  const colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ddd6fe'];
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.zIndex = '10000';
      confetti.style.borderRadius = '50%';
      confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }, i * 50);
  }
}

// Agregar animación de confetti
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
  @keyframes confettiFall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(confettiStyle);

// Función para cerrar modal ganador
function cerrarModalGanador() {
  document.getElementById("modal-ganador").classList.add("d-none");
  
  // Reinicializar automáticamente para otra partida
  setTimeout(() => {
    renderizarTableroPrevia();
    document.getElementById("btnIniciar").disabled = false;
    document.getElementById("btnIniciar").innerHTML = '<span class="btn-icon">🚀</span> Iniciar Juego';
  }, 500);
}

// Funciones de timer mejoradas
function iniciarTimer() {
  detenerTimer();
  juegoState.segundos = 0;
  actualizarTimer();
  juegoState.timer = setInterval(() => {
    juegoState.segundos++;
    actualizarTimer();
    const tiempoLimite = niveles[juegoState.nivelActual].tiempo;
    if (tiempoLimite && juegoState.segundos > tiempoLimite * 0.8) {
      document.getElementById("cronometro").style.color = '#dc2626';
      document.getElementById("cronometro").style.animation = 'pulse 1s infinite';
    }
  }, 1000);
}

function detenerTimer() {
  if (juegoState.timer) {
    clearInterval(juegoState.timer);
    juegoState.timer = null;
  }
  // Resetear estilos de advertencia
  document.getElementById("cronometro").style.color = '';
  document.getElementById("cronometro").style.animation = '';
}

function resetearContadores() {
  juegoState.segundos = 0;
  juegoState.movimientos = 0;
  juegoState.aciertos = 0;
  actualizarTimer();
  actualizarEstadisticas();
}

function actualizarTimer() {
  const timerElement = document.getElementById("cronometro");
  const timerSpan = timerElement.querySelector('span') || timerElement;
  timerSpan.textContent = formatearTiempo(juegoState.segundos);
}

function formatearTiempo(seg) {
  const min = Math.floor(seg / 60).toString().padStart(2, "0");
  const sec = (seg % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

// Funciones de estadísticas
function mostrarEstadisticas() {
  const statsElement = document.getElementById("gameStats");
  if (statsElement) {
    statsElement.classList.remove("d-none");
  }
}

function ocultarEstadisticas() {
  const statsElement = document.getElementById("gameStats");
  if (statsElement) {
    statsElement.classList.add("d-none");
  }
}

function actualizarEstadisticas() {
  const movimientosEl = document.getElementById("movimientos");
  const aciertosEl = document.getElementById("aciertos");
  const precisionEl = document.getElementById("precision");
  
  if (movimientosEl) movimientosEl.textContent = juegoState.movimientos;
  if (aciertosEl) aciertosEl.textContent = juegoState.aciertos;
  
  if (precisionEl) {
    const precision = juegoState.movimientos > 0 
      ? Math.round((juegoState.aciertos / juegoState.movimientos) * 100) 
      : 100;
    precisionEl.textContent = `${precision}%`;
    
    // Cambiar color según precisión
    if (precision >= 80) {
      precisionEl.style.color = '#16a34a';
    } else if (precision >= 60) {
      precisionEl.style.color = '#f59e0b';
    } else {
      precisionEl.style.color = '#dc2626';
    }
  }
}

// Función para ocultar mensajes
function ocultarMensajes() {
  document.getElementById("mensaje-leucemia").classList.add("d-none");
  document.getElementById("mensaje-leucemia").style.opacity = '1';
}

// Función de reinicio 
function reiniciarJuego() {
  detenerTimer();
  juegoState.bloqueado = false;
  juegoState.juegoIniciado = false;
  juegoState.seleccionadas = [];
  
  // Animación de salida para las cartas
  const cartas = document.querySelectorAll('.carta');
  cartas.forEach((carta, index) => {
    setTimeout(() => {
      carta.style.animation = 'cardSlideOut 0.3s ease-in forwards';
    }, index * 20);
  });
  
  setTimeout(() => {
    renderizarTableroPrevia();
    document.getElementById("btnIniciar").disabled = false;
    document.getElementById("btnIniciar").innerHTML = '<span class="btn-icon">🚀</span> Iniciar Juego';
  }, 500);
}

// Agregar animación de salida
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
  @keyframes cardSlideOut {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(20px) scale(0.8);
    }
  }
`;
document.head.appendChild(slideOutStyle);

// Funciones de accesibilidad 
function configurarAccesibilidad() {
  // Navegación por teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('modal-ganador');
      if (!modal.classList.contains('d-none')) {
        cerrarModalGanador();
      }
    }
  });
  
  // Mejoras para lectores de pantalla
  document.querySelectorAll('.carta').forEach((carta, index) => {
    carta.setAttribute('aria-label', `Carta ${index + 1}`);
    carta.setAttribute('role', 'button');
    carta.setAttribute('tabindex', '0');
  });
}
// Eventos iniciales mejorados
document.addEventListener("DOMContentLoaded", () => {
  renderizarTableroPrevia();
  configurarAccesibilidad();

  // Event listeners con mejoras
  document.getElementById("btnIniciar").addEventListener("click", iniciarJuego);
  
  document.getElementById("nivel").addEventListener("change", () => {
    reiniciarJuego();
  });
  
  document.getElementById("btnReiniciar").addEventListener("click", reiniciarJuego);
  
  document.getElementById("btnCerrarModalGanador").addEventListener("click", cerrarModalGanador);
  
  // Mejorar el modal para cerrar con click fuera
  document.getElementById("modal-ganador").addEventListener("click", (e) => {
    if (e.target.id === "modal-ganador") {
      cerrarModalGanador();
    }
  });
  
  // Prevenir zoom en mobile
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });
  
  // Optimización de rendimiento
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Reajustar tablero si es necesario
      if (juegoState.cartas.length > 0) {
        const nivel = document.getElementById("nivel").value;
        const { columnas } = niveles[nivel];
        document.getElementById("tablero").style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;
      }
    }, 100);
  });
});

// Función de depuración (solo para desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.juegoDebug = {
    revelarTodas: () => {
      document.querySelectorAll('.carta').forEach(c => c.classList.add('volteada'));
    },
    completarJuego: () => {
      document.querySelectorAll('.carta').forEach(c => c.classList.add('descubierta'));
      verificarGanador();
    },
    estado: () => console.log(juegoState)
  };
}

// Exportar funciones principales para uso externo
window.juegoMemoria = {
  iniciar: iniciarJuego,
  reiniciar: reiniciarJuego,
  estado: () => ({ ...juegoState })
};