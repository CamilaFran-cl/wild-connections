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

    if (nameEl) nameEl.textContent = mentor.fullName || 'Mentora';

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
        bioEl.textContent = mentor.bio || mentor.microphonePitch || `Especialista en ${mentor.expertise || 'emprendimiento'}. Lista para ayudarte a escalar tu negocio.`;
    }

    if (avatarEl) {
        avatarEl.src = mentor.profilePhoto || 'assets/mentor-isabella.jpg';
        avatarEl.alt = mentor.fullName || 'Mentora';
    }

    if (tagsEl) {
        const tags = Array.isArray(mentor.painPoints) ? mentor.painPoints : [];
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

        if (mentor.microphonePitch) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🎙️ Pitch en el Micrófono</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem; font-style: italic; background: rgba(212, 197, 160, 0.05); padding: var(--space-3); border-radius: var(--radius-sm); border-left: 2px solid var(--gold-primary);">"${mentor.microphonePitch}"</p>
            </div>`;
        }

        if (mentor.challenge90Days) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🎯 Desafío 90 Días</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${mentor.challenge90Days}</p>
            </div>`;
        }

        if (mentor.myPersonCriteria) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">✨ "Mi Persona" en el evento</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${mentor.myPersonCriteria}</p>
            </div>`;
        }

        if (mentor.humanDesign) {
            detailsHtml += `<div>
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🔮 Diseño Humano / Personalidad</h4>
                <p style="color: var(--text-primary); font-size: 0.9rem;">${mentor.humanDesign}</p>
            </div>`;
        }

        detailsHtml += `</div>`;
        detailsEl.innerHTML = detailsHtml;
    }

    document.title = `${mentor.fullName || 'Perfil'} — Wild Connections`;

    // Update booking buttons to link to the real booking page
    const bookBtns = document.querySelectorAll('.btn-book');
    bookBtns.forEach(btn => {
        btn.href = `booking.html?id=${mentor.id}`;
        btn.style.cursor = 'pointer';
    });
});
