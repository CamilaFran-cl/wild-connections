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
});
