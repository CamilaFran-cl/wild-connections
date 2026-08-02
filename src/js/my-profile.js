document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify Authentication
    const userPlan = localStorage.getItem('wc_user_plan');
    if (!userPlan) {
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
    const savedName = localStorage.getItem('wc_profile_name') || '';
    const savedPhrase = localStorage.getItem('wc_profile_phrase') || '';
    const savedNeeds = localStorage.getItem('wc_profile_needs') || '';
    let currentAvatar = localStorage.getItem('wc_profile_image') || 'assets/mentor-isabella.jpg';

    // Populate fields
    if (savedName) nameInput.value = savedName;
    if (savedPhrase) phraseInput.value = savedPhrase;
    if (savedNeeds) needsInput.value = savedNeeds;
    avatarPreview.src = currentAvatar;

    // 4. Handle Form Submit (Save)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        localStorage.setItem('wc_profile_name', nameInput.value);
        localStorage.setItem('wc_profile_phrase', phraseInput.value);
        localStorage.setItem('wc_profile_needs', needsInput.value);
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
    btnLogout.addEventListener('click', () => {
        if(confirm('¿Estás segura de que quieres cerrar sesión?')) {
            localStorage.removeItem('wc_user_plan');
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
