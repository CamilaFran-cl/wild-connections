import { supabase } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( async () => {
    // Get the UUID from the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const mentorId = urlParams.get('id');

    if (!mentorId) {
        window.location.href = 'matches.html';
        return;
    }

    // Load mentor profile from Supabase
    let mentor = null;
    if (supabase) {
        try {
            // Bypass RLS blocks that prevent authenticated users from reading other profiles
            const readRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?id=eq.${mentorId}&select=*`, {
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
                    mentor = rows[0];
                }
            }
        } catch(e) {
            console.warn("Could not load profile:", e);
        }
    }

    if (!mentor) {
        window.location.href = 'matches.html';
        return;
    }

    // Target elements
    const nameEl = document.getElementById('dynamic-name');
    const metaEl = document.getElementById('dynamic-meta');
    const bioEl = document.getElementById('dynamic-bio');
    const avatarEl = document.getElementById('dynamic-avatar');
    const tagsEl = document.getElementById('dynamic-tags');
    const detailsEl = document.getElementById('dynamic-details');

    if (nameEl) nameEl.textContent = mentor.full_name || mentor.fullName || 'Mentora';

    if (metaEl) {
        let metaHtml = '';
        if (mentor.location) metaHtml += `<span>📍 ${mentor.location}</span>`;
        if (mentor.instagram) {
            const handle = mentor.instagram.replace('@', '');
            metaHtml += `<a href="https://instagram.com/${handle}" target="_blank" rel="noopener" style="color: var(--gold-primary); text-decoration: underline;">📸 ${mentor.instagram}</a>`;
        }
        metaEl.innerHTML = metaHtml;
    }

    if (bioEl) {
        bioEl.textContent = mentor.bio || mentor.microphone_pitch || mentor.microphonePitch || `Especialista en ${mentor.expertise || 'emprendimiento'}. Lista para ayudarte a escalar tu negocio.`;
    }

    if (avatarEl) {
        avatarEl.src = mentor.profile_photo_url || mentor.profilePhoto || 'assets/mentor-isabella.jpg';
        avatarEl.alt = mentor.full_name || mentor.fullName || 'Mentora';
    }

    if (tagsEl) {
        const tags = Array.isArray(mentor.pain_points) ? mentor.pain_points : (Array.isArray(mentor.painPoints) ? mentor.painPoints : []);
        tagsEl.innerHTML = tags.map(tag => `<span class="badge-tag">${tag}</span>`).join('');
    }

    if (detailsEl) {
        let detailsHtml = `<div class="glass-panel" style="padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4);">`;

        if (mentor.niche || mentor.expertise) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">Nicho & Expertise</h4>
                <p style="color: var(--text-primary); font-size: 0.95rem;">${mentor.niche ? `<strong>${mentor.niche}</strong> — ` : ''}${mentor.expertise || ''}</p>
            </div>`;
        }

        const pitch = mentor.microphone_pitch || mentor.microphonePitch;
        if (pitch) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🎙️ Pitch en el Micrófono</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic; background: rgba(212, 197, 160, 0.05); padding: var(--space-3); border-radius: var(--radius-sm); border-left: 2px solid var(--gold-primary);">"${pitch}"</p>
            </div>`;
        }

        const goals = mentor.goals_90_days || mentor.challenge90Days;
        if (goals) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🎯 Desafío 90 Días</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${goals}</p>
            </div>`;
        }

        const criteria = mentor.my_person_criteria || mentor.myPersonCriteria;
        if (criteria) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">✨ "Mi Persona" en el evento</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${criteria}</p>
            </div>`;
        }

        const hd = mentor.human_design || mentor.humanDesign;
        if (hd) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🔮 Diseño Humano / Personalidad</h4>
                <p style="color: var(--text-primary); font-size: 0.9rem;">${hd}</p>
            </div>`;
        }

        detailsHtml += `</div>`;
        detailsEl.innerHTML = detailsHtml;
    }

    // Set page title
    document.title = `${mentor.full_name || mentor.fullName || 'Perfil'} - Wild Goddess`;

    // Update CTA text with mentor's first name
    const ctaName = document.getElementById('cta-mentor-name');
    if (ctaName) {
        const firstName = (mentor.full_name || mentor.fullName || 'la mentora').split(' ')[0];
        ctaName.textContent = firstName;
    }

    // Hide CTA if viewer is already VIP
    const isViewerVip = localStorage.getItem('wc_user_plan') === 'vip';
    if (isViewerVip) {
        const ctaBlock = document.querySelector('.profile-cta');
        if (ctaBlock) {
            ctaBlock.style.display = 'none';
        }
    }

    // Render Services
    const servicesSection = document.getElementById('services-section');
    const servicesContainer = document.getElementById('dynamic-services');
    
    let services = [];
    if (mentor.services) {
        try {
            services = Array.isArray(mentor.services) ? mentor.services : JSON.parse(mentor.services);
        } catch(e) {
            console.warn("Could not parse services:", e);
        }
    }
    
    if (services.length > 0 && servicesSection && servicesContainer) {
        servicesSection.style.display = 'block';
        
        const icons = {
            '1-on-1': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
            'taller': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
            'finanzas': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
            'custom': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"></path></svg>'
        };
        
        const labels = {
            '1-on-1': 'Sesiones 1-on-1',
            'taller': 'Taller de Escalado',
            'finanzas': 'Sesiones de Finanzas'
        };
        
        servicesContainer.innerHTML = services.map(svc => {
            const icon = icons[svc.type] || icons['custom'];
            const title = svc.type === 'custom' ? svc.name : labels[svc.type];
            const encodedTitle = encodeURIComponent(title || '');
            const priceHtml = svc.price ? `<p style="color: var(--gold-primary); font-size: 0.85rem; margin-top: var(--space-2); margin-bottom: 0;">${svc.price}</p>` : '';
            return `
                <div class="service-card">
                    <div class="service-icon icon-box">
                        ${icon}
                    </div>
                    <h4 class="service-name">${title}</h4>
                    ${priceHtml}
                    <a href="booking.html?mentor=${mentor.id}&service=${encodedTitle}" class="btn btn-outline btn-sm" style="margin-top: var(--space-3);">Reservar</a>
                </div>
            `;
        }).join('');
    }
});
