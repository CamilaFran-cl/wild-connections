'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    const MIN_PARTICLES = 25;
    const MAX_PARTICLES = 35;
    let isActive = true;
    
    // Pausa la animación si la pestaña no es visible
    document.addEventListener('visibilitychange', () => {
        isActive = !document.hidden;
    });

    function createParticle() {
        if (!isActive) return;

        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Tamaño aleatorio, algunos más grandes
        if (Math.random() > 0.8) {
            particle.classList.add('particle--lg');
        }

        // Posición inicial aleatoria
        const leftPos = Math.random() * 100;
        particle.style.left = `${leftPos}%`;
        
        // Empezar desde abajo
        particle.style.bottom = '-20px';

        // Duración y retraso aleatorios
        const duration = 8 + Math.random() * 12; // 8s a 20s
        const delay = Math.random() * 10; // 0s a 10s
        
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        container.appendChild(particle);

        // Limpiar la partícula cuando termine la animación
        // Usamos setTimeout en lugar de event listener para asegurarnos de que se limpie incluso si la animación se detiene
        setTimeout(() => {
            if (particle.parentNode === container) {
                container.removeChild(particle);
                createParticle(); // Reemplazar con una nueva
            }
        }, (duration + delay) * 1000);
    }

    // Inicializar cantidad aleatoria de partículas
    const numParticles = Math.floor(Math.random() * (MAX_PARTICLES - MIN_PARTICLES + 1)) + MIN_PARTICLES;
    for (let i = 0; i < numParticles; i++) {
        createParticle();
    }
});
