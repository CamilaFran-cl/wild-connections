document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular estado de carga
            loginBtn.classList.add('btn-loading');
            loginBtn.disabled = true;

            // Simular petición a la base de datos
            setTimeout(() => {
                // Verificar si hay datos de registro previos en localStorage (opcional)
                const hasAnswers = localStorage.getItem('vip_onboarding_answers');
                
                // Si el usuario no tiene plan, asignarle 'free' como predeterminado
                if (!localStorage.getItem('wc_user_plan')) {
                    localStorage.setItem('wc_user_plan', 'free');
                }

                // Quitar el estado de carga y redirigir
                loginBtn.classList.remove('btn-loading');
                window.location.href = 'matches.html';
            }, 1200); // 1.2 segundos de espera simulada
        });
    }
});
