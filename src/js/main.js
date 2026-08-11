import { supabase, checkAuthSession } from './supabase-client.js';

'use strict';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    // 1. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    // 3. Scroll reveal
    const revealElements = document.querySelectorAll('.reveal, .reveal-scale');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 4. Active nav link
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
            link.classList.add('active');
        }
    });

    // 5. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu on link click
                    if (navToggle && navLinks && navToggle.classList.contains('open')) {
                        navToggle.classList.remove('open');
                        navLinks.classList.remove('open');
                    }
                }
            }
        });
    });

    // 6. Page entrance animation
    const mainContent = document.querySelector('main') || document.body;
    if (mainContent) {
        mainContent.classList.add('page-enter');
    }

    // 7. Check Authentication State (Update Navigation)
    async function updateNavState() {
        let isAuthenticated = false;
        
        try {
            const authPromise = new Promise(async (resolve) => {
                if (typeof checkAuthSession === 'function') {
                    const session = await checkAuthSession();
                    resolve(!!session);
                } else if (supabase) {
                    const { data } = await supabase.auth.getSession();
                    resolve(!!data?.session);
                } else {
                    resolve(!!localStorage.getItem('wc_user_plan'));
                }
            });

            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
            const result = await Promise.race([authPromise, timeoutPromise]);
            
            if (result !== null) {
                isAuthenticated = result;
            } else {
                isAuthenticated = !!localStorage.getItem('wc_user_plan');
            }

            if (!isAuthenticated) {
                localStorage.removeItem('wc_user_plan');
            } else if (!localStorage.getItem('wc_user_plan')) {
                localStorage.setItem('wc_user_plan', 'free');
            }
        } catch (e) {
            console.warn("Auth check failed:", e);
            isAuthenticated = !!localStorage.getItem('wc_user_plan');
        }

        if (isAuthenticated) {
            // User is logged in
            let avatarUrl = localStorage.getItem('wc_profile_image');
            if (!avatarUrl || avatarUrl === 'undefined' || avatarUrl.includes('assets/')) {
                avatarUrl = ''; // Avoid 404 on missing asset
            }
            
            // Desktop Navbar
            const loginLinkDesktop = document.querySelector('.nav-actions a[href="login.html"]');
            if (loginLinkDesktop) {
                const profileLink = document.createElement('a');
                profileLink.href = 'my-profile.html';
                profileLink.className = 'nav-profile-avatar';
                profileLink.style.cssText = 'margin-right: 15px; display: inline-block; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; border: 2px solid var(--gold-primary); vertical-align: middle; cursor: pointer; background: var(--bg-surface);';
                profileLink.innerHTML = `<img src="${avatarUrl}" alt="Mi Perfil" style="width: 100%; height: 100%; object-fit: cover; display: ${avatarUrl ? 'block' : 'none'};">`;
                loginLinkDesktop.replaceWith(profileLink);
            }

            // Mobile Navbar
            const loginLinkMobile = document.querySelector('.mobile-nav-inner a[href="login.html"]');
            if (loginLinkMobile) {
                loginLinkMobile.href = 'my-profile.html';
                loginLinkMobile.innerHTML = `
                    <img src="${avatarUrl}" alt="Perfil" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold-primary); display: ${avatarUrl ? 'inline-block' : 'none'};">
                    Mi Perfil
                `;
            }

            // Fetch real avatar asynchronously if we don't have it (or to ensure it's up to date)
            if (supabase) {
                supabase.auth.getSession().then(async ({data}) => {
                    const uid = data?.session?.user?.id;
                    if (uid) {
                        try {
                            const readRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?id=eq.${uid}&select=profile_photo_url,is_vip`, {
                                method: 'GET',
                                headers: {
                                    'apikey': import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
                                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=representation'
                                }
                            });
                            if (readRes.ok) {
                                const rows = await readRes.json();
                                if (rows && rows.length > 0) {
                                    const row = rows[0];
                                    if (row.profile_photo_url) {
                                        const realAvatar = row.profile_photo_url;
                                        localStorage.setItem('wc_profile_image', realAvatar);
                                        document.querySelectorAll('.nav-profile-avatar img, .mobile-nav-inner img').forEach(img => {
                                            img.src = realAvatar;
                                            img.style.display = 'inline-block';
                                            if (img.parentElement.classList.contains('nav-profile-avatar')) img.style.display = 'block';
                                        });
                                    }
                                    
                                    // Update VIP status locally
                                    if (row.is_vip) {
                                        localStorage.setItem('wc_user_plan', 'vip');
                                    } else {
                                        localStorage.setItem('wc_user_plan', 'free');
                                    }
                                }
                            }
                        } catch(e) {
                            console.warn('Main avatar fetch error:', e);
                        }
                    }
                });
            }
            
            // Show Dashboard Link
            document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
                // Only show if it's in the nav
                if (link.classList.contains('nav-link')) {
                    link.style.display = 'inline-block';
                }
            });
        } else {
            // User is logged out
            // Hide Dashboard Link
            document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
                if (link.classList.contains('nav-link')) {
                    link.style.display = 'none';
                }
            });
        }
    }
    
    updateNavState();

    // 8. Notification Dropdown System
    async function initNotifications() {
        const bellBtn = document.querySelector('.nav-notification');
        const bellDot = document.querySelector('.nav-notification-dot');
        if (!bellBtn) return;

        // Create dropdown
        let dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notifications-dropdown';
            dropdown.style.cssText = `
                display: none; position: absolute; top: 100%; right: 0; width: 360px; max-height: 420px;
                overflow-y: auto; background: var(--bg-surface); border: 1px solid var(--border);
                border-radius: var(--radius-lg); box-shadow: 0 12px 40px rgba(0,0,0,0.5);
                z-index: 1000; padding: 0; margin-top: 8px;
            `;
            bellBtn.style.position = 'relative';
            bellBtn.appendChild(dropdown);
        }

        let notifications = [];
        let myUserId = null;

        // Get auth
        if (supabase) {
            try {
                const { data } = await supabase.auth.getSession();
                myUserId = data?.session?.user?.id;
            } catch(e) {}
        }

        if (!myUserId) {
            if (bellDot) bellDot.style.display = 'none';
            return;
        }

        // Load pending bookings (invitations received)
        try {
            const { data: pendingBookings } = await supabase
                .from('bookings')
                .select('*')
                .eq('target_id', myUserId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false })
                .limit(5);

            if (pendingBookings && pendingBookings.length > 0) {
                const partnerIds = pendingBookings.map(b => b.requester_id);
                const { data: profiles } = await supabase
                    .from('registrations')
                    .select('id, fullName, profilePhoto')
                    .in('id', partnerIds);
                const profileMap = {};
                if (profiles) profiles.forEach(p => profileMap[p.id] = p);

                pendingBookings.forEach(b => {
                    const p = profileMap[b.requester_id] || {};
                    notifications.push({
                        type: 'booking',
                        icon: '☕',
                        text: `<strong>${p.fullName || 'Alguien'}</strong> te invitó a un café`,
                        sub: `${b.booking_date} · ${b.booking_time}`,
                        link: 'conexiones.html',
                        avatar: p.profilePhoto || 'assets/mentor-isabella.jpg'
                    });
                });
            }
        } catch(e) {}

        // Load unread messages
        try {
            const { data: unreadMsgs } = await supabase
                .from('messages')
                .select('*')
                .eq('receiver_id', myUserId)
                .eq('read', false)
                .order('created_at', { ascending: false })
                .limit(5);

            if (unreadMsgs && unreadMsgs.length > 0) {
                const senderIds = [...new Set(unreadMsgs.map(m => m.sender_id))];
                const { data: profiles } = await supabase
                    .from('registrations')
                    .select('id, fullName, profilePhoto')
                    .in('id', senderIds);
                const profileMap = {};
                if (profiles) profiles.forEach(p => profileMap[p.id] = p);

                // Group by sender
                const grouped = {};
                unreadMsgs.forEach(m => {
                    if (!grouped[m.sender_id]) grouped[m.sender_id] = { count: 0, last: m };
                    grouped[m.sender_id].count++;
                });

                Object.entries(grouped).forEach(([senderId, info]) => {
                    const p = profileMap[senderId] || {};
                    notifications.push({
                        type: 'message',
                        icon: '💬',
                        text: `<strong>${p.fullName || 'Alguien'}</strong> te envió ${info.count === 1 ? 'un mensaje' : info.count + ' mensajes'}`,
                        sub: info.last.text.substring(0, 50) + (info.last.text.length > 50 ? '...' : ''),
                        link: `chat.html?partner=${senderId}`,
                        avatar: p.profilePhoto || 'assets/mentor-isabella.jpg'
                    });
                });
            }
        } catch(e) {}

        // Update dot
        if (bellDot) {
            bellDot.style.display = notifications.length > 0 ? 'block' : 'none';
        }

        // Render dropdown content
        function renderDropdown() {
            if (notifications.length === 0) {
                dropdown.innerHTML = `
                    <div style="padding: 24px; text-align: center;">
                        <p style="color: var(--text-secondary); font-style: italic; margin: 0;">Sin notificaciones nuevas ✨</p>
                    </div>
                `;
            } else {
                dropdown.innerHTML = `
                    <div style="padding: 12px 16px; border-bottom: 1px solid var(--border);">
                        <h4 style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">Notificaciones <span style="font-size: 0.75rem; color: var(--gold-primary); margin-left: 4px;">${notifications.length}</span></h4>
                    </div>
                    ${notifications.map(n => `
                        <a href="${n.link}" style="display: flex; gap: 12px; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); text-decoration: none; transition: background 0.2s; cursor: pointer;" onmouseover="this.style.background='rgba(212,175,55,0.05)'" onmouseout="this.style.background='transparent'">
                            <img src="${n.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                            <div style="flex: 1; min-width: 0;">
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-primary); line-height: 1.4;">${n.icon} ${n.text}</p>
                                <p style="margin: 2px 0 0 0; font-size: 0.75rem; color: var(--text-secondary);">${n.sub}</p>
                            </div>
                        </a>
                    `).join('')}
                `;
            }
        }

        renderDropdown();

        // Toggle dropdown
        bellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.style.display === 'block';
            dropdown.style.display = isOpen ? 'none' : 'block';
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!bellBtn.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    initNotifications();
});
