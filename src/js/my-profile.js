import { supabase, checkAuthSession } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( async () => {
    // 1. Verify Authentication Securely
    let session = null;
    if (supabase) {
        try {
            const authPromise = supabase.auth.getSession().then(res => res.data?.session);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
            session = await Promise.race([authPromise, timeoutPromise]);
        } catch (err) {
            console.error("Error al obtener sesión:", err);
        }
    }

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // 2. DOM Elements
    const form = document.getElementById('profile-form');
    const profileView = document.getElementById('profile-view');
    
    // Edit Elements
    const nameInput = document.getElementById('profile-name');
    const phraseInput = document.getElementById('profile-phrase');
    const needsInput = document.getElementById('profile-needs');
    const avatarPreview = document.getElementById('profile-avatar-preview');
    const btnChangePhoto = document.getElementById('btn-change-photo');
    const photoUploadInput = document.getElementById('photo-upload');
    
    // View Elements
    const viewName = document.getElementById('view-name');
    const viewPhrase = document.getElementById('view-phrase');
    const viewNeeds = document.getElementById('view-needs');
    const viewAvatar = document.getElementById('view-avatar');
    
    // Buttons
    const btnEditMode = document.getElementById('btn-edit-mode');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    const btnLogout = document.getElementById('btn-logout');
    const btnLogoutView = document.querySelector('#profile-view #btn-logout');

    // 3. Load Saved Data
    let savedName = localStorage.getItem('wc_profile_name') || '';
    let savedPhrase = localStorage.getItem('wc_profile_phrase') || '';
    let savedNeeds = localStorage.getItem('wc_profile_needs') || '';
    let currentAvatar = localStorage.getItem('wc_profile_image') || 'assets/mentor-isabella.jpg';

    async function loadData() {
        if (supabase && session) {
            try {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (data) {
                    savedName = data.full_name || data.fullName || savedName;
                    savedPhrase = data.expertise || data.business_stage || data.businessStage || savedPhrase;
                    savedNeeds = data.bio || (data.pain_points ? data.pain_points.join(', ') : (data.painPoints ? data.painPoints.join(', ') : savedNeeds));
                    currentAvatar = data.profile_photo_url || data.profilePhoto || currentAvatar;
                }
            } catch(e) {
                console.warn("Could not load from registrations table:", e);
            }
        }

        // Populate fields
        nameInput.value = savedName;
        phraseInput.value = savedPhrase;
        needsInput.value = savedNeeds;
        avatarPreview.src = currentAvatar;
        
        viewName.textContent = savedName;
        viewPhrase.textContent = savedPhrase || '-';
        viewNeeds.textContent = savedNeeds || '-';
        viewAvatar.src = currentAvatar;
    }
    
    await loadData();

    // Toggle Modes
    btnEditMode.addEventListener('click', () => {
        profileView.style.display = 'none';
        form.style.display = 'block';
    });

    btnCancelEdit.addEventListener('click', () => {
        form.style.display = 'none';
        profileView.style.display = 'block';
        // reset form to saved state
        nameInput.value = savedName;
        phraseInput.value = savedPhrase;
        needsInput.value = savedNeeds;
        avatarPreview.src = currentAvatar;
    });

    let avatarChanged = false;

    // 4. Handle Form Submit (Save)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newName = nameInput.value;
        const newPhrase = phraseInput.value;
        const newNeeds = needsInput.value;

        // Try Supabase first
        if (supabase && session) {
            try {
                let finalAvatarUrl = currentAvatar;

                // If avatar changed and is a data URL (base64)
                if (avatarChanged && currentAvatar.startsWith('data:image')) {
                    try {
                        const blob = await fetch(currentAvatar).then(res => res.blob());
                        const fileName = `avatar-${session.user.id}-${Date.now()}.jpg`;
                        
                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('avatars')
                            .upload(`${session.user.id}/${fileName}`, blob, { upsert: true, contentType: 'image/jpeg' });
                            
                        if (uploadError) {
                            console.error('Error uploading avatar:', uploadError);
                        } else if (uploadData) {
                            const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
                            finalAvatarUrl = pubData.publicUrl;
                            currentAvatar = finalAvatarUrl;
                        }
                    } catch(uploadEx) {
                        console.error('Exception uploading avatar:', uploadEx);
                    }
                }

                const { error } = await supabase
                    .from('registrations')
                    .update({
                        full_name: newName,
                        expertise: newPhrase,
                        pain_points: newNeeds ? newNeeds.split(',').map(s => s.trim()) : [],
                        profile_photo_url: finalAvatarUrl
                    })
                    .eq('id', session.user.id);
                    
                if (error) console.error("Error saving profile to DB:", error);
            } catch(err) {
                console.warn("Could not save to registrations table:", err);
            }
        }

        // Always save to localStorage as fallback
        localStorage.setItem('wc_profile_name', newName);
        localStorage.setItem('wc_profile_phrase', newPhrase);
        localStorage.setItem('wc_profile_needs', newNeeds);
        localStorage.setItem('wc_profile_image', currentAvatar);
        
        // Update variables
        savedName = newName;
        savedPhrase = newPhrase;
        savedNeeds = newNeeds;
        avatarChanged = false;
        
        // Update View
        viewName.textContent = savedName;
        viewPhrase.textContent = savedPhrase;
        viewNeeds.textContent = savedNeeds;
        viewAvatar.src = currentAvatar;

        showToast('¡Perfil actualizado con éxito!');
        
        // Update nav avatars immediately
        document.querySelectorAll('.nav-profile-avatar img').forEach(img => {
            img.src = currentAvatar;
        });
        
        // Return to view mode
        form.style.display = 'none';
        profileView.style.display = 'block';
    });

    // 5. Handle Change Photo
    btnChangePhoto.addEventListener('click', () => {
        if (photoUploadInput) {
            photoUploadInput.click();
        }
    });

    if (photoUploadInput) {
        photoUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                showToast('La imagen debe ser menor a 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.8 quality
                    currentAvatar = canvas.toDataURL('image/jpeg', 0.8);
                    avatarPreview.src = currentAvatar;
                    avatarChanged = true;
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // 6. Handle Logout
    const handleLogout = async () => {
        if(confirm('¿Estás segura de que quieres cerrar sesión?')) {
            if (supabase) {
                try {
                    const logoutPromise = supabase.auth.signOut();
                    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2000));
                    await Promise.race([logoutPromise, timeoutPromise]);
                } catch (e) {
                    console.error("Logout error", e);
                }
            }
            localStorage.clear();
            window.location.href = 'index.html';
        }
    };
    
    if(btnLogout) btnLogout.addEventListener('click', handleLogout);
    if(btnLogoutView) btnLogoutView.addEventListener('click', handleLogout);
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
