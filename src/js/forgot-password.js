import { supabase } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    const form = document.getElementById('forgot-password-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Reset messages
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';
            
            // Show loading
            submitBtn.classList.add('btn-loading');
            submitBtn.disabled = true;

            const email = document.getElementById('email').value;

            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/update-password.html',
                });

                if (error) throw error;

                // Success
                successMsg.style.display = 'block';
                form.reset();

            } catch (error) {
                console.error('Reset Password Error:', error);
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
