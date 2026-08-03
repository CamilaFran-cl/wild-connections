document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verify Authentication Securely
    let session = null;
    if (window.supabaseClient) {
        try {
            const authPromise = window.supabaseClient.auth.getSession().then(res => res.data?.session);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
            session = await Promise.race([authPromise, timeoutPromise]);
        } catch (err) {
            console.error("Error al obtener sesión:", err);
        }
    }

    if (!session && !localStorage.getItem('wc_user_plan')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. DOM Elements
    const form = document.getElementById('profile-form');
    const nameInput = document.getElementById('profile-name');
    const phraseInput = document.getElementById('profile-phrase');
    const needsInput = document.getElementById('profile-needs');
    const avatarPreview = document.getElementById('profile-avatar-preview');
    const btnChangePhoto = document.getElementById('btn-change-photo');
    const btnLogout = document.getElementById('btn-logout');

    // 3. Load Saved Data
    let savedName = localStorage.getItem('wc_profile_name') || '';
    let savedPhrase = localStorage.getItem('wc_profile_phrase') || '';
    let savedNeeds = localStorage.getItem('wc_profile_needs') || '';
    let currentAvatar = localStorage.getItem('wc_profile_image') || 'assets/mentor-isabella.jpg';

    if (window.supabaseClient && session) {
        try {
            const { data, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (data) {
                savedName = data.name || savedName;
                savedPhrase = data.phrase || savedPhrase;
                savedNeeds = data.needs || savedNeeds;
                currentAvatar = data.avatar_url || currentAvatar;
            }
        } catch(e) {
            console.warn("Could not load from profiles table:", e);
        }
    }

    // Populate fields
    if (savedName) nameInput.value = savedName;
    if (savedPhrase) phraseInput.value = savedPhrase;
    if (savedNeeds) needsInput.value = savedNeeds;
    avatarPreview.src = currentAvatar;

    // 4. Handle Form Submit (Save)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = nameInput.value;
        const newPhrase = phraseInput.value;
        const newNeeds = needsInput.value;

        // Try Supabase first
        if (window.supabaseClient && session) {
            try {
                const { error } = await window.supabaseClient
                    .from('profiles')
                    .upsert({
                        id: session.user.id,
                        name: newName,
                        phrase: newPhrase,
                        needs: newNeeds,
                        avatar_url: currentAvatar,
                        updated_at: new Date().toISOString()
                    });
                if (error) console.error("Error saving profile to DB:", error);
            } catch(err) {
                console.warn("Could not save to profiles table:", err);
            }
        }

        // Always save to localStorage as fallback
        localStorage.setItem('wc_profile_name', newName);
        localStorage.setItem('wc_profile_phrase', newPhrase);
        localStorage.setItem('wc_profile_needs', newNeeds);
        localStorage.setItem('wc_profile_image', currentAvatar);

        showToast('¡Perfil actualizado con éxito!');
        
        // Update nav avatars immediately
        document.querySelectorAll('.nav-profile-avatar img').forEach(img => {
            img.src = currentAvatar;
        });
    });

    // 5. Handle Change Photo (Cycle through mock avatars)
    const mockAvatars = [
        'assets/mentor-isabella.jpg',
        'assets/mentor-valentina.jpg',
        'assets/mentor-sofia.jpg',
        'assets/mentor-carolina.jpg'
    ];
    
    btnChangePhoto.addEventListener('click', () => {
        let currentIndex = mockAvatars.indexOf(currentAvatar);
        currentIndex = (currentIndex + 1) % mockAvatars.length;
        currentAvatar = mockAvatars[currentIndex];
        avatarPreview.src = currentAvatar;
    });

    // 6. Handle Logout
    btnLogout.addEventListener('click', async () => {
        if(confirm('¿Estás segura de que quieres cerrar sesión?')) {
            if (window.supabaseClient) {
                try {
                    const logoutPromise = window.supabaseClient.auth.signOut();
                    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
                    await Promise.race([logoutPromise, timeoutPromise]);
                } catch (e) {
                    console.error("Logout error", e);
                }
            }
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
});

// Toast function (copied from matches.js logic)
function showToast(message) {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
  
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="margin-right: 8px;">✓</span> ${message}`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
