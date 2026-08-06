import { supabase, checkAuthSession } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('email');
            const passInput = document.getElementById('password');

            if (!emailInput || !passInput) return;

            loginBtn.classList.add('btn-loading');
            loginBtn.disabled = true;

            try {
                if (supabase) {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: emailInput.value,
                        password: passInput.value
                    });

                    if (error) {
                        let errorMsg = "Correo electrónico o contraseña incorrectos. Por favor, verifica tus datos e intenta de nuevo.";
                        if (error.message.includes("Email not confirmed")) {
                            errorMsg = "Por favor, verifica tu correo electrónico haciendo clic en el enlace que te enviamos antes de iniciar sesión.";
                        }
                        alert(errorMsg);
                        loginBtn.classList.remove('btn-loading');
                        loginBtn.disabled = false;
                        return;
                    }

                    // Successful login
                    // Handle stale localStorage keys so profile fetches the actual plan
                    localStorage.removeItem('wc_user_plan');
                    
                    // Fetch registration data for matching
                    try {
                        const { data: regData } = await supabase
                            .from('registrations')
                            .select('*')
                            .eq('id', data.session.user.id)
                            .single();
                        if (regData) {
                            localStorage.setItem('wc_registration_data', JSON.stringify(regData));
                        }
                    } catch(e) { console.error("Error fetching registration data on login", e); }
                    
                    window.location.href = 'my-profile.html';
                } else {
                    alert("Error: Supabase no está configurado.");
                    loginBtn.classList.remove('btn-loading');
                    loginBtn.disabled = false;
                }
            } catch (err) {
                console.error("Login error", err);
                alert("Error técnico: " + (err.message || JSON.stringify(err)));
                loginBtn.classList.remove('btn-loading');
                loginBtn.disabled = false;
            }
        });
    }
});
