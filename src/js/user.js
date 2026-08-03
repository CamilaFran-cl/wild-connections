// user.js — Script compartido que lee datos del usuario de localStorage
// y actualiza avatares/nombres en todas las páginas internas.

(function() {
    'use strict';

    const DEFAULT_AVATAR = 'assets/mentor-isabella.jpg';
    const DEFAULT_NAME = 'Camila';

    function getUserData() {
        return {
            name: localStorage.getItem('wc_user_name') || localStorage.getItem('wc_profile_name') || DEFAULT_NAME,
            avatar: localStorage.getItem('wc_user_avatar') || localStorage.getItem('wc_profile_image') || DEFAULT_AVATAR
        };
    }

    function applyUserData() {
        const user = getUserData();

        // Update all user avatar images
        const avatarEls = document.querySelectorAll('.user-avatar');
        avatarEls.forEach(el => {
            el.src = user.avatar;
            el.alt = user.name;
        });

        // Update all user name displays
        const nameEls = document.querySelectorAll('.user-name');
        nameEls.forEach(el => {
            el.textContent = `Hola, ${user.name}`;
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        (function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( applyUserData);
    } else {
        applyUserData();
    }

    // Expose globally for other scripts
    window.WCUser = {
        getData: getUserData,
        refresh: applyUserData
    };
})();
