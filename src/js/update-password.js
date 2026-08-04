import { supabase } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    const form = document.getElementById('update-password-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset messages
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            
            const newPassword = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            if (newPassword.length < 6) {
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                return;
            }

            // Show loading
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            try {
                // The user is automatically logged in via the token in the URL hash by Supabase client
                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                });

                if (error) throw error;

                // Success
                successMsg.style.display = 'block';
                form.reset();

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);

            } catch (error) {
                console.error('Update Password Error:', error);
                errorMsg.style.display = 'block';
                if (error.message) {
                    errorMsg.textContent = error.message;
                }
            } finally {
                // Remove loading
                submitBtn.classList.remove('btn-loading');
                submitBtn.disabled = false;
            }
        });
    }
});
