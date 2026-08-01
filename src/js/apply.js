document.addEventListener('DOMContentLoaded', () => {
    const applyForm = document.getElementById('applyForm');
    const heroCta = document.getElementById('heroCta');

    // Smooth scroll for CTA button
    if (heroCta) {
        heroCta.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = heroCta.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Form submission
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic validation check (html required attributes handle most of it, but just in case)
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const specialty = document.getElementById('specialty').value;
            const experience = document.getElementById('experience').value.trim();

            if (!fullName || !email || !specialty || !experience) {
                showToast('Por favor, completa todos los campos requeridos.', 'error');
                return;
            }

            // Simulate form submission
            showToast('¡Postulación enviada! Te contactaremos en 48 horas.', 'success');
            
            // Reset form
            applyForm.reset();
        });
    }

    // Simple Toast implementation if not provided by main.js
    function showToast(message, type = 'success') {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Basic styles for the toast
        toast.style.cssText = `
            background: var(--surface);
            border: 1px solid ${type === 'success' ? '#10B981' : '#EF4444'};
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease forwards;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const iconColor = type === 'success' ? '#10B981' : '#EF4444';
        const iconPath = type === 'success' 
            ? 'M20 6L9 17l-5-5' 
            : 'M18 6L6 18M6 6l12 12';

        toast.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="${iconPath}"></path>
            </svg>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    // Add keyframes for toast animations if not exist
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
});
