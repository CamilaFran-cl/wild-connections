'use strict';

const planesInfo = {
    anual: {
        nombre: 'Suscripción VIP Anual',
        precioBase: '$297',
        periodo: '/año',
        total: '$297.00',
        beneficios: [
            'Suscripción a la revista WGM',
            'Acceso a perfiles completos',
            'Matches proactivos con IA',
            'Contacto directo con mentoras',
            'Acceso a servicios exclusivos'
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Read plan from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let planId = urlParams.get('plan') || 'anual';
    
    if (!planesInfo[planId]) {
        planId = 'anual'; // Fallback to anual
    }
    
    const plan = planesInfo[planId];
    
    // 2. Populate UI with plan details
    const planNameEl = document.getElementById('plan-name');
    if (planNameEl) {
        planNameEl.innerHTML = `${plan.nombre} <span class="badge badge-vip">ACTIVO</span>`;
    }
    
    const planPriceEl = document.getElementById('plan-price');
    if (planPriceEl) planPriceEl.textContent = plan.precioBase;
    
    const planPeriodEl = document.getElementById('plan-period');
    if (planPeriodEl) planPeriodEl.textContent = plan.periodo;
    
    const planTotalEl = document.getElementById('plan-total');
    if (planTotalEl) planTotalEl.textContent = plan.total;
    
    const benefitsList = document.getElementById('plan-benefits');
    if (benefitsList) {
        benefitsList.innerHTML = '';
        plan.beneficios.forEach(ben => {
            const li = document.createElement('li');
            li.innerHTML = `
                <svg class="icon-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg> 
                ${ben}
            `;
            benefitsList.appendChild(li);
        });
    }
    
    // 3. Form input formatting
    const cardNumber = document.getElementById('card-number');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 16);
            let formattedValue = '';
            for(let i = 0; i < value.length; i++) {
                if(i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
        });
    }
    
    const expiryDate = document.getElementById('expiry-date');
    if (expiryDate) {
        expiryDate.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.substring(0, 4);
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }
    
    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.substring(0, 3);
        });
    }
    
    // 4. Handle Form Submission
    const form = document.getElementById('checkout-form');
    const overlay = document.getElementById('success-overlay');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Otorgar status VIP al usuario en el almacenamiento local
            localStorage.setItem('wc_user_plan', 'vip');
            
            // Activate success overlay
            if (overlay) {
                overlay.classList.add('active');
            }
            
            // Redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 3000);
        });
    }
});
