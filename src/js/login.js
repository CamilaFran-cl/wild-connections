document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('login-email');
            const passInput = document.getElementById('login-password');

            if (!emailInput || !passInput) return;

            loginBtn.classList.add('btn-loading');
            loginBtn.disabled = true;

            try {
                if (window.supabase) {
                    const { data, error } = await window.supabase.auth.signInWithPassword({
                        email: emailInput.value,
                        password: passInput.value
                    });

                    if (error) {
                        alert("Credenciales incorrectas: " + error.message);
                        loginBtn.classList.remove('btn-loading');
                        loginBtn.disabled = false;
                        return;
                    }

                    // Successful login
                    if (!localStorage.getItem('wc_user_plan')) {
                        localStorage.setItem('wc_user_plan', 'free');
                    }
                    window.location.href = 'my-profile.html';
                } else {
                    alert("Error: Supabase no está configurado.");
                    loginBtn.classList.remove('btn-loading');
                    loginBtn.disabled = false;
                }
            } catch (err) {
                console.error("Login error", err);
                alert("Ocurrió un error inesperado.");
                loginBtn.classList.remove('btn-loading');
                loginBtn.disabled = false;
            }
        });
    }
});
