/* ============================================================
   WILD CONNECTIONS — Matching Engine
   BFF matching (personal affinity) + Commercial matching
   (offer ↔ demand) based on registration form data
   ============================================================ */
import { supabase } from './supabase-client.js';

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

// ── Global State ───────────────────────
let allMentors = [];
let currentUserId = null;

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
  
  const hasUserData = Object.keys(userData).length > 0;
  const isVip = !!localStorage.getItem('wc_user_plan'); // Temporarily keep localStorage for VIP check

  // Calculate matches
  const enrichedMentors = allMentors.map(mentor => {
    let bffScore = 70;
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
      mentor.fullName || '',
      mentor.expertise || '',
      mentor.niche || '',
      mentor.location || '',
      ...(Array.isArray(mentor.painPoints) ? mentor.painPoints : [])
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
    const commercialBadge = mentor.commercialScore > 20
      ? `<span style="font-size: 0.7rem; color: var(--gold-primary); margin-left: 8px;">💼 Match Comercial</span>`
      : '';

    const profileHref = isVip ? `profile.html?id=${mentor.id}` : '#';
    const profileClass = isVip ? 'btn btn-gold btn-sm' : 'btn btn-gold btn-sm btn-protected';
    const coffeeClass = isVip ? 'btn btn-outline btn-sm btn-coffee' : 'btn btn-outline btn-sm btn-coffee btn-protected';
    
    const avatarImg = mentor.profilePhoto || 'assets/mentor-isabella.jpg';
    const mentorName = mentor.fullName || 'Mentora';
    const mentorSpecialty = mentor.expertise || mentor.businessStage || 'Emprendedora';
    const initials = mentorName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

    const cardHtml = `
<div class="card hover-lift-glow" style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5); border-radius: var(--radius-lg); transition: all 0.2s ease;">
    <div style="position: relative; flex-shrink: 0;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05)); border: 2px solid rgba(212,175,55,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${avatarImg}" alt="${mentorName}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        </div>
    </div>

    <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
            <h3 style="font-size: 1rem; font-weight: 600; color: var(--text-primary); margin: 0;">${mentorName}</h3>
            <span style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 500;">${mentor.bffScore}%</span>
            ${commercialBadge}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 2px 0 0 0;">${mentorSpecialty}${mentor.location ? ' · ' + mentor.location : ''}</p>
    </div>

    <div style="display: flex; gap: var(--space-2); flex-shrink: 0;">
        <a href="${profileHref}" class="${profileClass}" style="font-size: 0.8rem; padding: 6px 14px;">Ver Perfil</a>
        <button class="${coffeeClass}" data-mentor="${mentorName}" style="font-size: 0.8rem; padding: 6px 14px;">Café ☕</button>
    </div>
</div>
    `;

    container.insertAdjacentHTML('beforeend', cardHtml);
  });

  // VIP Coffee button listeners
  if (isVip) {
      container.querySelectorAll('.btn-coffee').forEach((btn, idx) => {
        btn.addEventListener('click', (e) => {
          const mentor = enrichedMentors[idx];
          if (mentor && mentor.id) {
            window.location.href = `chat.html?partner=${mentor.id}`;
          } else {
            const mName = e.target.getAttribute('data-mentor');
            showToast(`¡Invitación a café enviada a ${mName}!`);
            e.target.textContent = 'Enviado ✓';
            e.target.disabled = true;
          }
        });
      });
  }

  // Protected action listeners (Free users)
  container.querySelectorAll('.btn-protected').forEach((btn) => {
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          showUpgradeToast();
      });
  });
}

function showUpgradeToast() {
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.flexDirection = 'column';
  toast.style.alignItems = 'flex-start';
  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap: 8px; margin-bottom: 8px;">
        <svg width="20" height="20" stroke="var(--gold-primary)" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> 
        <strong style="color:var(--gold-primary);">Acceso VIP Requerido</strong>
    </div>
    <p style="font-size: 0.85rem; margin-bottom: 12px; line-height: 1.4;">Sube al Plan VIP Anual para ver el perfil completo, reservar sesiones y contactar a esta mentora.</p>
    <button class="btn btn-gold btn-sm shimmer-effect" style="width:100%" onclick="window.location.href='pricing.html'">Ver Planes VIP</button>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 6000);
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
async function initMatches() {
  const container = document.getElementById('mentors-container');
  if (container) {
      container.innerHTML = '<p class="text-secondary text-center" style="padding: 2rem;">Cargando perfiles...</p>';
  }

  if (supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData && sessionData.session) {
          currentUserId = sessionData.session.user.id;
      }
      
      const { data: profiles, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('authDirectory', true);
        
      if (error) {
        console.error("Error fetching mentors:", error);
      } else if (profiles) {
        allMentors = profiles.filter(p => p.id !== currentUserId);
      }
    } catch(e) {
      console.error("Failed to load real mentors", e);
    }
  }

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
