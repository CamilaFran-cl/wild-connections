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

    // Update booking buttons to link to the real booking page
    const bookBtns = document.querySelectorAll('.btn-book');
    bookBtns.forEach(btn => {
        btn.href = `booking.html?mentor=${mentor.id}`;
        btn.style.cursor = 'pointer';
    });
});
