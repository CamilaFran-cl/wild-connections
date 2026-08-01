'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Toggle switch for Mensual/Anual
    const toggleSwitch = document.querySelector('.toggle-switch');
    const toggleLabels = document.querySelectorAll('.toggle-label');
    
    // Asumiendo elementos con estas clases para actualizar los precios
    const priceElements = document.querySelectorAll('.plan-price .amount');
    const periodElements = document.querySelectorAll('.plan-price .period');
    
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', () => {
            const isAnual = toggleSwitch.classList.toggle('active');
            
            // Actualizar labels
            toggleLabels.forEach(label => {
                label.classList.remove('active');
                if ((label.textContent.toLowerCase().includes('anual') && isAnual) ||
                    (label.textContent.toLowerCase().includes('mensual') && !isAnual)) {
                    label.classList.add('active');
                }
            });
            
            // Actualizar precios con transición suave
            priceElements.forEach((el, index) => {
                // Animación de desvanecimiento
                el.style.opacity = '0';
                
                setTimeout(() => {
                    // Si el elemento tiene data-anual y data-mensual los usamos, sino usamos hardcoded según prompt
                    // Anual=$150/año, Mensual=$250/mes
                    const anualPrice = el.dataset.anual || '150';
                    const mensualPrice = el.dataset.mensual || '250';
                    
                    el.textContent = isAnual ? anualPrice : mensualPrice;
                    el.style.opacity = '1';
                }, 200);
            });
            
            // Actualizar periodos
            periodElements.forEach(el => {
                el.style.opacity = '0';
                setTimeout(() => {
                    el.textContent = isAnual ? '/año' : '/mes';
                    el.style.opacity = '1';
                }, 200);
            });
        });
    }

    // 2. Gateway selection
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

    // 3. Plan card hover effects (gold pulse on click)
    const subscribeBtns = document.querySelectorAll('.plan-card .btn-subscribe, .btn-suscribirse, .plan-card button');
    
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
            
            // Asegurarse de que el botón tenga position relative y overflow hidden en CSS
            // o simplemente añadir el elemento y que el CSS lo maneje
            this.appendChild(pulse);
            
            // Remover después de la animación
            setTimeout(() => {
                this.classList.remove('pulse-gold');
                if (pulse.parentNode === this) {
                    this.removeChild(pulse);
                }
                // Redirect to checkout with plan type
                const planCard = this.closest('.plan-card');
                let planType = 'mensual';
                if (planCard) {
                    const planName = planCard.querySelector('.plan-name, h3');
                    if (planName) {
                        const name = planName.textContent.toLowerCase();
                        if (name.includes('trimestral')) planType = 'trimestral';
                        else if (name.includes('anual')) planType = 'anual';
                    }
                }
                window.location.href = `checkout.html?plan=${planType}`;
            }, 600);
        });
    });
});
