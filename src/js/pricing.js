'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gateway selection
    const gatewayCards = document.querySelectorAll('.gateway-card');
    
    gatewayCards.forEach(card => {
        card.addEventListener('click', () => {
            gatewayCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            
            // Si hay un input radio oculto, seleccionarlo
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // 2. Plan card hover effects (gold pulse on click)
    const subscribeBtns = document.querySelectorAll('[data-href]');
    
    subscribeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Añadir clase de pulso
            this.classList.add('pulse-gold');
            
            // Crear elemento ripple/pulso
            const pulse = document.createElement('span');
            pulse.classList.add('click-pulse');
            
            // Calcular posición del click relativa al botón
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            pulse.style.left = `${x}px`;
            pulse.style.top = `${y}px`;
            
            this.appendChild(pulse);
            
            // Redirect based on data-href or default to checkout
            const href = this.getAttribute('data-href');
            
            // Remover después de la animación
            setTimeout(() => {
                this.classList.remove('pulse-gold');
                if (pulse.parentNode === this) {
                    this.removeChild(pulse);
                }
                if (href) {
                    window.location.href = href;
                }
            }, 600);
        });
    });
});
