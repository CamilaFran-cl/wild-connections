/* ============================================================
   WILD CONNECTIONS — Matching Engine
   BFF matching (personal affinity) + Commercial matching
   (offer ↔ demand) based on registration form data
   ============================================================ */

// ── BFF Matching Algorithm ─────────────────
// Calculates personal compatibility for networking/friendship
function calculateBFFMatch(user, candidate) {
  let score = 0;
  let maxScore = 0;

  // 1. Business Stage match (40% weight)
  // Same stage = high match
  maxScore += 40;
  if (user.businessStage && candidate.businessStage) {
    if (user.businessStage === candidate.businessStage) {
      score += 40;
    } else {
      // Adjacent stages get partial credit
      const stages = ['idea', 'selling_irregular', 'stable_income', 'scaling'];
      const userIdx = stages.indexOf(user.businessStage);
      const candIdx = stages.indexOf(candidate.businessStage);
      if (Math.abs(userIdx - candIdx) === 1) score += 25;
    }
  }

  // 2. Revenue Range match (25% weight)
  maxScore += 25;
  if (user.monthlyRevenue && candidate.monthlyRevenue) {
    if (user.monthlyRevenue === candidate.monthlyRevenue) {
      score += 25;
    } else {
      const revenues = ['none', '0_1000', '1000_3000', '3000_6000', '6000_15000', '15000_plus'];
      const userIdx = revenues.indexOf(user.monthlyRevenue);
      const candIdx = revenues.indexOf(candidate.monthlyRevenue);
      if (Math.abs(userIdx - candIdx) === 1) score += 15;
      else if (Math.abs(userIdx - candIdx) === 2) score += 5;
    }
  }

  // 3. Hobbies intersection (20% weight)
  maxScore += 20;
  if (user.hobbies && candidate.hobbies) {
    const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];
    const candHobbies = Array.isArray(candidate.hobbies) ? candidate.hobbies : [];
    const intersection = userHobbies.filter(h => candHobbies.includes(h));
    const hobbyScore = Math.min(intersection.length / 3, 1) * 20;
    score += hobbyScore;
  }

  // 4. Social Energy compatibility (15% weight)
  // Complementary (not identical) energies match better for balance
  maxScore += 15;
  if (user.socialEnergy && candidate.socialEnergy) {
    const energyCompat = {
      'super_social': { 'observe_first': 15, 'small_groups': 12, 'one_on_one': 8, 'super_social': 10 },
      'observe_first': { 'super_social': 10, 'small_groups': 15, 'one_on_one': 12, 'observe_first': 8 },
      'small_groups': { 'observe_first': 12, 'super_social': 8, 'one_on_one': 15, 'small_groups': 10 },
      'one_on_one': { 'super_social': 5, 'small_groups': 12, 'observe_first': 15, 'one_on_one': 10 }
    };
    score += (energyCompat[user.socialEnergy]?.[candidate.socialEnergy] || 8);
  }

  // Normalize to 0-100 and clamp
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
  return Math.max(35, Math.min(99, percentage));
}

// ── Commercial Matching Algorithm ──────────
// Calculates business complementarity (what one offers ↔ what another needs)
function calculateCommercialMatch(user, candidate) {
  let score = 0;

  // 1. Does candidate's expertise match what user needs to hire?
  if (user.needsToHire && candidate.expertise) {
    const needs = Array.isArray(user.needsToHire) ? user.needsToHire : [];
    const expertise = candidate.expertise.toLowerCase();
    const niche = (candidate.niche || '').toLowerCase();

    const expertiseMap = {
      'web_design': ['diseño web', 'landing', 'ux', 'ui', 'producto digital'],
      'social_media': ['redes sociales', 'community', 'contenido', 'social media'],
      'copywriting': ['copywriting', 'redacción', 'copy', 'email marketing'],
      'photography': ['fotografía', 'producción visual', 'foto', 'editorial'],
      'ads': ['publicidad', 'meta ads', 'google ads', 'paid', 'ads'],
      'accounting': ['contabilidad', 'finanzas', 'contadora'],
      'legal': ['legal', 'contratos', 'abogad'],
      'branding': ['branding', 'identidad', 'marca'],
      'coaching': ['coaching', 'mentoría', 'coach', 'desarrollo personal']
    };

    needs.forEach(need => {
      const keywords = expertiseMap[need] || [];
      if (keywords.some(kw => expertise.includes(kw) || niche.includes(kw))) {
        score += 30;
      }
    });
  }

  // 2. Reverse: does user's expertise match what candidate needs?
  if (candidate.needsToHire && user.expertise) {
    const needs = Array.isArray(candidate.needsToHire) ? candidate.needsToHire : [];
    const expertise = user.expertise.toLowerCase();
    const niche = (user.niche || '').toLowerCase();

    const expertiseMap = {
      'web_design': ['diseño web', 'landing', 'ux', 'ui', 'producto digital'],
      'social_media': ['redes sociales', 'community', 'contenido', 'social media'],
      'copywriting': ['copywriting', 'redacción', 'copy', 'email marketing'],
      'photography': ['fotografía', 'producción visual', 'foto', 'editorial'],
      'ads': ['publicidad', 'meta ads', 'google ads', 'paid', 'ads'],
      'accounting': ['contabilidad', 'finanzas', 'contadora'],
      'legal': ['legal', 'contratos', 'abogad'],
      'branding': ['branding', 'identidad', 'marca'],
      'coaching': ['coaching', 'mentoría', 'coach', 'desarrollo personal']
    };

    needs.forEach(need => {
      const keywords = expertiseMap[need] || [];
      if (keywords.some(kw => expertise.includes(kw) || niche.includes(kw))) {
        score += 30;
      }
    });
  }

  // 3. Target audience overlap
  if (user.targetAudience && candidate.targetAudience) {
    const userAud = Array.isArray(user.targetAudience) ? user.targetAudience : [];
    const candAud = Array.isArray(candidate.targetAudience) ? candidate.targetAudience : [];
    const overlap = userAud.filter(a => candAud.includes(a));
    score += overlap.length * 5;
  }

  return Math.min(score, 100);
}

// ── Render Functions ───────────────────────

function renderMentors(filterText = '') {
  const container = document.getElementById('mentors-container');
  if (!container) return;

  container.innerHTML = '';

  const lowerFilter = filterText.toLowerCase().trim();

  // Load user's registration data
  let userData = {};
  const savedData = localStorage.getItem('wc_registration_data');
  if (savedData) {
    try { userData = JSON.parse(savedData); } catch(e) {}
  }
  // Fallback to old onboarding data
  if (Object.keys(userData).length === 0) {
    const oldData = localStorage.getItem('wc_onboarding_answers');
    if (oldData) {
      try { userData = JSON.parse(oldData); } catch(e) {}
    }
  }

  const hasUserData = Object.keys(userData).length > 0;

  // Calculate matches
  const enrichedMentors = mentors.map(mentor => {
    let bffScore = mentor.affinity || 70;
    let commercialScore = 0;

    if (hasUserData) {
      bffScore = calculateBFFMatch(userData, mentor);
      commercialScore = calculateCommercialMatch(userData, mentor);
    }

    return {
      ...mentor,
      bffScore,
      commercialScore,
      combinedScore: Math.round(bffScore * 0.6 + commercialScore * 0.4)
    };
  }).filter(mentor => {
    if (!lowerFilter) return true;
    const searchFields = [
      mentor.name,
      mentor.specialty,
      mentor.niche || '',
      mentor.expertise || '',
      mentor.location || '',
      ...(mentor.tags || [])
    ].map(s => s.toLowerCase());
    return searchFields.some(f => f.includes(lowerFilter));
  });

  // Sort by combined score
  enrichedMentors.sort((a, b) => b.combinedScore - a.combinedScore);

  if (enrichedMentors.length === 0) {
    container.innerHTML = `<p class="text-secondary text-center" style="padding: 2rem;">No se encontraron resultados para "${filterText}".</p>`;
    return;
  }

  enrichedMentors.forEach(mentor => {
    const tagsHtml = (mentor.tags || []).map(tag => `<span class="badge-tag">${tag}</span>`).join('');
    const commercialBadge = mentor.commercialScore > 20
      ? `<span class="badge-commercial" title="Match comercial: tu expertise y sus necesidades se cruzan">💼 Match Comercial</span>`
      : '';

    const locationHtml = mentor.location
      ? `<span class="mentor-location">📍 ${mentor.location}</span>`
      : '';

    const cardHtml = `
<div class="mentor-card hover-lift-glow animate-fadeInUp" style="align-items: flex-start; padding: var(--space-6);">
    <div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-3); min-width: 100px;">
        <img src="${mentor.image}" alt="${mentor.name}" class="avatar avatar-lg avatar-gold">
        <span class="badge badge-gold" style="font-size: 0.7rem;">${mentor.bffScore}% Afinidad</span>
    </div>
    
    <div class="mentor-info" style="flex: 1; min-width: 0; padding-left: var(--space-2);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-2); margin-bottom: var(--space-2);">
            <div>
                <h3 class="mentor-name" style="font-size: 1.25rem; margin-bottom: 2px;">${mentor.name}</h3>
                <p class="mentor-specialty" style="font-size: 0.95rem; margin-bottom: 4px;">${mentor.specialty}</p>
                ${mentor.location ? `<p style="font-size: 0.8rem; color: var(--text-tertiary);"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>${mentor.location}</p>` : ''}
            </div>
            ${commercialBadge}
        </div>
        
        <div class="mentor-tags" style="margin-bottom: var(--space-5);">
            ${tagsHtml}
        </div>
        
        <div class="mentor-actions" style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
            <a href="profile.html?id=${mentor.id}" class="btn btn-gold btn-sm">Ver Perfil</a>
            <button class="btn btn-outline btn-sm btn-coffee" data-mentor="${mentor.name}">Invitar un Café ☕</button>
        </div>
    </div>
</div>
    `;

    container.insertAdjacentHTML('beforeend', cardHtml);
  });

  // Coffee button listeners
  container.querySelectorAll('.btn-coffee').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const mentorName = e.target.getAttribute('data-mentor');
      showToast(`¡Invitación a café enviada a ${mentorName}!`);
      e.target.textContent = 'Enviado ✓';
      e.target.disabled = true;
    });
  });
}

function showToast(message) {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<svg width="20" height="20" stroke="var(--gold-primary)" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Init ───────────────────────────────────
function initMatches() {
  renderMentors();

  const searchInput = document.getElementById('mentor-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderMentors(e.target.value);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMatches);
} else {
  initMatches();
}
