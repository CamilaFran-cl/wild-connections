import { supabase } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( async () => {
    
    const searchInput = document.getElementById('hero-search-input');
    const searchBtn = document.getElementById('hero-search-btn');
    const modal = document.getElementById('hero-hook-modal');
    const closeModal = document.getElementById('close-hook-modal');
    const countEl = document.getElementById('hook-mentor-count');
    const termEl = document.getElementById('hook-search-term');

    if (!searchInput || !searchBtn) return;

    // Check auth state
    let isLoggedIn = false;
    if (supabase) {
        try {
            const { data } = await supabase.auth.getSession();
            isLoggedIn = !!data?.session;
        } catch(e) {}
    }

    if (!isLoggedIn) {
        isLoggedIn = !!localStorage.getItem('wc_user_plan');
    }

    function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        if (isLoggedIn) {
            // Already logged in -> go straight to directory with filter
            window.location.href = `matches.html?q=${encodeURIComponent(query)}`;
        } else {
            // Not logged in -> Hook strategy
            // 1. Simulate searching...
            searchBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v4"></path></svg>`;
            const style = document.createElement('style');
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
            document.head.appendChild(style);

            setTimeout(() => {
                // Restore button
                searchBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>`;
                
                // Show modal
                const randomCount = Math.floor(Math.random() * (35 - 12 + 1) + 12); // Random between 12 and 35
                countEl.textContent = randomCount;
                termEl.textContent = `"${query}"`;
                
                modal.style.display = 'flex';
                
                // Save query in localStorage so register page could potentially use it
                localStorage.setItem('wc_last_search', query);
                
            }, 800); // 800ms fake delay
        }
    }

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
});
