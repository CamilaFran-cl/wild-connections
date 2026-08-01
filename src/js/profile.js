document.addEventListener('DOMContentLoaded', () => {
    // Get the ID from the URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const mentorIdStr = urlParams.get('id');

    let mentorId = 1;
    if (mentorIdStr && !isNaN(parseInt(mentorIdStr))) {
        mentorId = parseInt(mentorIdStr);
    }

    let mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) {
        mentor = mentors[0];
    }

    // Target elements
    const nameEl = document.getElementById('dynamic-name');
    const metaEl = document.getElementById('dynamic-meta');
    const bioEl = document.getElementById('dynamic-bio');
    const avatarEl = document.getElementById('dynamic-avatar');
    const tagsEl = document.getElementById('dynamic-tags');
    const detailsEl = document.getElementById('dynamic-details');

    if (nameEl) nameEl.textContent = mentor.name;

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
        bioEl.textContent = mentor.bio || `Especialista en ${mentor.specialty}. Lista para ayudarte a escalar tu negocio y alcanzar tus objetivos.`;
    }

    if (avatarEl) {
        avatarEl.src = mentor.image;
        avatarEl.alt = mentor.name;
    }

    if (tagsEl) {
        tagsEl.innerHTML = (mentor.tags || []).map(tag => `<span class="badge-tag">${tag}</span>`).join('');
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
                <h4 style="color: var(--gold-primary); font-family: var(--font-display); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; margin-bottom: var(--space-1);">🎙️ Pitch en el Micrófono (Lo que busca)</h4>
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

    document.title = `${mentor.name} — Wild Connections`;

    const bookBtns = document.querySelectorAll('.btn-book');
    bookBtns.forEach(btn => {
        btn.href = `booking.html?id=${mentor.id}`;
        btn.style.cursor = 'pointer';
    });
});
