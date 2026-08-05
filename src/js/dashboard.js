(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    // Add event listeners to all .btn-coffee buttons in the dashboard
    const coffeeButtons = document.querySelectorAll('.btn-coffee');
    
    coffeeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const mentorName = card ? card.querySelector('h4').textContent.split(' ')[0] : 'la mentora';
            
            const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
            toastContainer.className = 'toast-container';
            if(!toastContainer.parentElement) document.body.appendChild(toastContainer);

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<svg width="20" height="20" stroke="var(--gold-primary)" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ¡Invitación a café enviada a ${mentorName}!`;
            toastContainer.appendChild(toast);
            
            // Disable button
            btn.disabled = true;
            btn.textContent = 'Enviado ✓';
            
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    });

    // Tab Logic for Mis Cafes Virtuales
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--text-secondary)';
                b.style.borderBottom = 'none';
                b.style.fontWeight = 'normal';
            });
            tabContents.forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });

            // Add active class to clicked
            btn.classList.add('active');
            btn.style.color = 'var(--gold-primary)';
            btn.style.borderBottom = '2px solid var(--gold-primary)';
            btn.style.fontWeight = '600';
            
            const target = document.getElementById('tab-' + btn.getAttribute('data-tab'));
            if (target) {
                target.style.display = 'block';
                // Trigger reflow for transition
                void target.offsetWidth;
                target.classList.add('active');
            }
        });
    });
});
