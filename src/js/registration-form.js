import { supabase, checkAuthSession } from './supabase-client.js';

/* ============================================================
   WILD CONNECTIONS — Registration Form Engine
   27 questions / 9 sections with auto-save, skip logic,
   selection limits, photo upload, and Supabase persistence
   ============================================================ */

// ── Form Configuration (all 27 questions) ─────────────────
const FORM_SECTIONS = [
  // ─── COVER (intro screen, no questions) ───
  { id: 'cover', type: 'cover', title: 'Tu lugar en el espacio de Networking' },

  // ─── SECCIÓN 1: Quién eres ───
  {
    id: 'quien_eres',
    number: 1,
    title: '¿Quién eres?',
    subtitle: 'Empecemos por lo básico',
    questions: [
      {
        id: 'fullName',
        label: 'Nombre y apellido',
        type: 'text',
        required: true,
        placeholder: 'Tu nombre completo'
      },
      {
        id: 'location',
        label: '¿Desde qué país y ciudad nos acompañas?',
        type: 'text',
        required: true,
        placeholder: 'Ej: Bogotá, Colombia'
      },
      {
        id: 'email',
        label: 'Tu correo electrónico',
        type: 'email',
        required: true,
        placeholder: 'Ej: hola@tumarca.com',
        help: 'Lo usarás para iniciar sesión.'
      },
      {
        id: 'password',
        label: 'Crea una contraseña',
        type: 'password',
        required: true,
        placeholder: 'Mínimo 6 caracteres',
        help: 'Para acceder a tu perfil y conexiones.'
      },
      {
        id: 'instagram',
        label: 'Tu Instagram profesional (el que quieres que otras mujeres visiten)',
        type: 'text',
        required: true,
        placeholder: '@tucuenta',
        help: 'Escríbelo con @. Es la cuenta que van a visitar las mujeres que te conozcan en el espacio de Networking, así que asegúrate de que sea la correcta.'
      }
    ]
  },

  // ─── SECCIÓN 2: El momento actual de tu negocio ───
  {
    id: 'momento_negocio',
    number: 2,
    title: 'El momento actual de tu negocio',
    subtitle: 'Dónde está tu negocio hoy',
    questions: [
      {
        id: 'businessStage',
        label: '¿En qué etapa está tu emprendimiento o negocio ahora mismo?',
        type: 'radio',
        required: true,
        options: [
          { value: 'idea', label: 'Todavía estoy en la etapa de la idea' },
          { value: 'selling_irregular', label: 'Ya estoy vendiendo, pero de forma irregular' },
          { value: 'stable_income', label: 'Tengo ingresos estables pero quiero escalar' },
          { value: 'scaling', label: 'Estoy escalando y facturando fuerte' }
        ]
      },
      {
        id: 'monthlyRevenue',
        label: '¿Cuánto facturas mensualmente (aproximado)?',
        type: 'radio',
        required: true,
        help: 'No importa si fluctúa. Elige el rango que más se acerque a tu promedio actual.',
        options: [
          { value: 'none', label: 'Aún no facturo' },
          { value: '0_1000', label: 'Menos de $1,000 USD' },
          { value: '1000_3000', label: 'Entre $1,000 y $3,000 USD' },
          { value: '3000_6000', label: 'Entre $3,000 y $6,000 USD' },
          { value: '6000_15000', label: 'Entre $6,000 y $15,000 USD' },
          { value: '15000_plus', label: 'Más de $15,000 USD' }
        ]
      },
      {
        id: 'businessYears',
        label: '¿Cuántos años llevas con tu negocio?',
        type: 'radio',
        required: true,
        options: [
          { value: 'less_1', label: 'Menos de 1 año' },
          { value: '1_3', label: 'Entre 1 y 3 años' },
          { value: '3_5', label: 'Entre 3 y 5 años' },
          { value: '5_plus', label: 'Más de 5 años' }
        ]
      },
      {
        id: 'deliveryModel',
        label: '¿Cómo entregas tu producto o servicio?',
        type: 'checkbox',
        required: true,
        help: 'Puedes seleccionar varias opciones.',
        options: [
          { value: 'service_1on1', label: 'Servicio 1 a 1 (consultoría, coaching, freelance)' },
          { value: 'group_programs', label: 'Programas grupales o cursos' },
          { value: 'physical_product', label: 'Producto físico' },
          { value: 'digital_product', label: 'Producto digital (ebooks, plantillas, membresías)' },
          { value: 'content_creation', label: 'Creación de contenido / influencer' },
          { value: 'other', label: 'Otro' }
        ]
      },
      {
        id: 'teamSize',
        label: '¿Trabajas sola o tienes equipo?',
        type: 'radio',
        required: true,
        options: [
          { value: 'solo', label: 'Sola, soy un equipo de una' },
          { value: 'freelancers', label: 'Trabajo con freelancers puntuales' },
          { value: 'small_2_4', label: 'Tengo un equipo pequeño (2-4 personas)' },
          { value: 'large_5_plus', label: 'Tengo un equipo grande (+5 personas)' }
        ]
      }
    ]
  },

  // ─── SECCIÓN 3: Tu desafío real ───
  {
    id: 'desafio_real',
    number: 3,
    title: 'Tu desafío real',
    subtitle: 'Una sola pregunta, pero la más importante',
    questions: [
      {
        id: 'challenge90Days',
        label: '¿Cuál es tu mayor desafío en los próximos 90 días?',
        type: 'textarea',
        required: true,
        placeholder: 'Sé honesta. Esta respuesta nos ayuda a conectarte con la persona indicada.',
        help: 'Ejemplo: "Necesito sistematizar mis ventas porque dependo de redes sociales y es agotador."'
      }
    ]
  },

  // ─── SECCIÓN 4: ¿Con cuál te identificas? ───
  {
    id: 'identificacion',
    number: 4,
    title: '¿Con cuál te identificas?',
    subtitle: 'Selecciona máximo 2 opciones — las que más resuenen contigo',
    questions: [
      {
        id: 'painPoints',
        label: '¿Cuál de estos dolores te suena familiar?',
        type: 'checkbox',
        required: true,
        maxSelect: 2,
        options: [
          { value: 'cant_delegate', label: 'Hago todo yo — y ya no puedo más' },
          { value: 'no_visibility', label: 'Tengo buen producto pero nadie me ve' },
          { value: 'revenue_ceiling', label: 'Mis ingresos se estancaron y no sé cómo romper el techo' },
          { value: 'impostor', label: 'Me comparo mucho y siento que no soy suficiente' },
          { value: 'no_strategy', label: 'Vendo por intuición pero no tengo una estrategia clara' },
          { value: 'no_connections', label: 'Me falta red — no conozco mujeres en mi nivel o más arriba' }
        ]
      }
    ]
  },

  // ─── SECCIÓN 5: Tu nicho y a quién le sirves ───
  {
    id: 'nicho',
    number: 5,
    title: 'Tu nicho y a quién le sirves',
    subtitle: 'Esto es clave para cruzar tu expertise con quienes lo necesitan',
    questions: [
      {
        id: 'niche',
        label: '¿Cuál es tu nicho o industria?',
        type: 'text',
        required: true,
        placeholder: 'Ej: Marcas de belleza limpia, bienes raíces, coaching financiero...',
        help: 'Usa tus propias palabras. Si tienes varios, pon el principal.'
      },
      {
        id: 'expertise',
        label: '¿En qué eres experta o qué servicio/producto ofreces?',
        type: 'text',
        required: true,
        placeholder: 'Ej: Branding y estrategia digital, coaching de vida, diseño web...'
      },
      {
        id: 'targetAudience',
        label: '¿A quién le vendes o quién es tu audiencia principal?',
        type: 'checkbox',
        required: true,
        help: 'Puedes seleccionar varias.',
        options: [
          { value: 'women_starting', label: 'Mujeres emprendedoras que están empezando' },
          { value: 'established_brands', label: 'Marcas o negocios establecidos' },
          { value: 'independent_pros', label: 'Profesionales independientes' },
          { value: 'companies', label: 'Empresas o corporaciones' },
          { value: 'general_public', label: 'Público general / consumidoras finales' },
          { value: 'other', label: 'Otra' }
        ]
      },
      {
        id: 'idealClient',
        label: '¿Cómo describirías a tu clienta ideal en una frase?',
        type: 'text',
        required: false,
        placeholder: 'Ej: Emprendedora de 30-45 años que quiere lanzar su marca personal...',
        help: 'Opcional, pero muy útil para nuestro algoritmo de matches.'
      },
      {
        id: 'mainOfferPrice',
        label: '¿Cuál es el precio promedio de tu oferta principal?',
        type: 'radio',
        required: true,
        options: [
          { value: 'free', label: 'Gratis o contenido orgánico' },
          { value: 'under_100', label: 'Menos de $100 USD' },
          { value: '100_500', label: 'Entre $100 y $500 USD' },
          { value: '500_1500', label: 'Entre $500 y $1,500 USD' },
          { value: '1500_3000', label: 'Entre $1,500 y $3,000 USD' },
          { value: '3000_plus', label: 'Más de $3,000 USD' }
        ]
      }
    ]
  },

  // ─── SECCIÓN 6: ¿Qué necesitas? ───
  {
    id: 'que_necesitas',
    number: 6,
    title: '¿Qué necesitas?',
    subtitle: 'Lo que necesitas contratar o delegar — esto es oro para el matchmaking comercial',
    questions: [
      {
        id: 'needsToHire',
        label: '¿Qué servicios estás buscando contratar o te gustaría tener acceso?',
        type: 'checkbox',
        required: true,
        help: 'Si no buscas nada ahora, selecciona la última opción.',
        skipTrigger: { value: 'none', skipToSection: 'mujer_detras' },
        options: [
          { value: 'web_design', label: 'Diseño web o landing pages' },
          { value: 'social_media', label: 'Gestión de redes sociales' },
          { value: 'copywriting', label: 'Copywriting o redacción persuasiva' },
          { value: 'photography', label: 'Fotografía o producción visual' },
          { value: 'ads', label: 'Publicidad digital (Meta Ads, Google Ads)' },
          { value: 'accounting', label: 'Contabilidad o finanzas' },
          { value: 'legal', label: 'Asesoría legal o contratos' },
          { value: 'branding', label: 'Branding o identidad de marca' },
          { value: 'coaching', label: 'Coaching o mentoría de negocios' },
          { value: 'other', label: 'Otro' },
          { value: 'none', label: 'Por ahora no estoy buscando contratar' }
        ]
      },
      {
        id: 'microphonePitch',
        label: 'Si tuvieras un micrófono por 30 segundos frente a las asistentes, ¿qué dirías que buscas?',
        type: 'textarea',
        required: false,
        placeholder: 'Ej: "Busco una fotógrafa que entienda marcas de bienestar y una contadora bilingüe para mi LLC en USA."',
        help: 'Esta respuesta podría compartirse en la dinámica del evento. Sé directa y específica.',
        conditionalSkipIf: 'needsToHire_none'
      }
    ]
  },

  // ─── SECCIÓN 7: La mujer detrás del negocio ───
  {
    id: 'mujer_detras',
    number: 7,
    title: 'Quién eres cuando no estás trabajando',
    subtitle: 'Porque las mejores conexiones no siempre empiezan hablando de negocios',
    questions: [
      {
        id: 'hobbies',
        label: '¿Qué te gusta hacer fuera del trabajo?',
        type: 'checkbox',
        required: true,
        help: 'Selecciona todas las que apliquen.',
        options: [
          { value: 'exercise', label: 'Hacer ejercicio / deporte' },
          { value: 'travel', label: 'Viajar' },
          { value: 'read', label: 'Leer' },
          { value: 'cook', label: 'Cocinar' },
          { value: 'art', label: 'Arte / manualidades' },
          { value: 'meditation', label: 'Meditación / yoga / bienestar' },
          { value: 'music', label: 'Música / podcasts' },
          { value: 'nature', label: 'Naturaleza / senderismo' },
          { value: 'social', label: 'Salir con amigas / socializar' },
          { value: 'other', label: 'Otro' }
        ]
      },
      {
        id: 'socialEnergy',
        label: '¿Cómo es tu energía en un evento de networking?',
        type: 'radio',
        required: true,
        help: 'No hay respuesta correcta — solo queremos ubicarte con gente que te haga sentir cómoda.',
        options: [
          { value: 'super_social', label: 'Soy la primera que se presenta y habla con todos' },
          { value: 'observe_first', label: 'Prefiero observar primero y conectar de a poco' },
          { value: 'small_groups', label: 'Me gusta conectar en grupos pequeños y profundos' },
          { value: 'one_on_one', label: 'Prefiero conversaciones 1 a 1' }
        ]
      },
      {
        id: 'humanDesign',
        label: '¿Sabes tu Diseño Humano o algún dato de personalidad que quieras compartir?',
        type: 'text',
        required: false,
        placeholder: 'Ej: Generadora 4/6, ENTP, Acuario ascendente Leo...',
        help: 'Totalmente opcional. Pero si lo sabes, puede ayudar a hacer matches más afinados.'
      },
      {
        id: 'myPersonCriteria',
        label: '"Mi persona" en este espacio sería alguien que...',
        type: 'textarea',
        required: true,
        placeholder: 'Ej: Que hable directo, que ya haya pasado por lo que yo estoy viviendo, y que le guste reírse tanto como trabajar.',
        help: 'Describe a esa persona con la que sentirías que "hiciste clic" en el evento.'
      }
    ]
  },

  // ─── SECCIÓN 8: Hacia dónde vas ───
  {
    id: 'hacia_donde',
    number: 8,
    title: 'Hacia dónde vas',
    subtitle: 'Tu visión de futuro nos ayuda a conectarte con quienes van en la misma dirección',
    questions: [
      {
        id: 'nextObjective',
        label: '¿Cuál es tu próximo gran objetivo profesional?',
        type: 'text',
        required: true,
        placeholder: 'Ej: Facturar $10k/mes, lanzar mi curso, abrir mi tienda...'
      },
      {
        id: 'threeYearVision',
        label: '¿Cómo te ves en 3 años?',
        type: 'textarea',
        required: true,
        placeholder: 'Sé libre de soñar en grande.',
        help: 'No importa si suena "mucho". Aquí todas van en serio.'
      },
      {
        id: 'eventExpectation',
        label: '¿Qué esperas llevarte del evento del 7 de agosto?',
        type: 'textarea',
        required: true,
        placeholder: 'Contactos, clientes, inspiración, alianzas...'
      },
      {
        id: 'purchaseReason',
        label: '¿Por qué compraste tu entrada?',
        type: 'checkbox',
        required: true,
        help: 'Selecciona todas las que apliquen.',
        options: [
          { value: 'speakers', label: 'Me interesaron las speakers' },
          { value: 'networking', label: 'Quiero hacer networking de calidad' },
          { value: 'money_talk', label: 'Quiero aprender a hablar de dinero sin miedo' },
          { value: 'community', label: 'Busco comunidad de mujeres con ambición' },
          { value: 'visibility', label: 'Quiero darme visibilidad como marca' },
          { value: 'other', label: 'Otro' }
        ]
      }
    ]
  },

  // ─── SECCIÓN 9: Autorización + foto ───
  {
    id: 'autorizacion',
    number: 9,
    title: 'Último paso',
    subtitle: 'Tu autorización y una foto para completar tu perfil',
    questions: [
      {
        id: 'authDirectory',
        label: 'Autorizo que mi nombre, Instagram y especialidad aparezcan en el directorio privado del evento para facilitar las conexiones entre asistentes.',
        type: 'consent',
        required: true
      },
      {
        id: 'authMatchmaking',
        label: 'Acepto participar en la dinámica de matchmaking de Wild Connections, entendiendo que mis respuestas serán usadas exclusivamente para conectarme con otras asistentes afines.',
        type: 'consent',
        required: true
      },
      {
        id: 'additionalNotes',
        label: '¿Algo más que quieras contarnos?',
        type: 'textarea',
        required: false,
        placeholder: 'Cualquier comentario, pregunta o nota adicional...'
      },
      {
        id: 'profilePhoto',
        label: 'Sube una foto de perfil',
        type: 'photo',
        required: false,
        help: 'Será tu foto en el directorio del evento. Formato JPG/PNG, máximo 2MB.'
      }
    ]
  }
];

// ── State ──────────────────────────────────
let currentSectionIndex = 0;
let formData = {};
let autoSaveTimer = null;
let photoDataURL = null;

// ── DOM References ─────────────────────────
const formContainer = document.getElementById('form-container');
const progressSteps = document.getElementById('progress-steps');
const progressLabel = document.getElementById('progress-label');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const autosaveIndicator = document.getElementById('autosave-indicator');
const confirmationScreen = document.getElementById('confirmation-screen');

// ── Initialize ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadDraft();
  renderProgressBar();
  renderSection(currentSectionIndex);
  updateNavButtons();
  startAutoSave();

  btnBack.addEventListener('click', goBack);
  btnNext.addEventListener('click', goNext);
});

// ── Progress Bar ───────────────────────────
function renderProgressBar() {
  if (!progressSteps) return;
  progressSteps.innerHTML = '';
  // 9 sections (skip cover)
  const totalSections = FORM_SECTIONS.filter(s => s.type !== 'cover').length;
  for (let i = 0; i < totalSections; i++) {
    const step = document.createElement('div');
    step.className = 'progress-step';
    if (i < currentSectionIndex) step.classList.add('completed');
    if (i === currentSectionIndex - 1) step.classList.add('active');
    progressSteps.appendChild(step);
  }
  if (progressLabel) {
    if (currentSectionIndex === 0) {
      progressLabel.textContent = '';
    } else {
      progressLabel.textContent = `Sección ${currentSectionIndex} de ${totalSections}`;
    }
  }
}

// ── Render Section ─────────────────────────
function renderSection(index) {
  if (!formContainer) return;

  const section = FORM_SECTIONS[index];

  // Cover screen
  if (section.type === 'cover') {
    formContainer.innerHTML = renderCover();
    updateProgressVisibility(false);
    return;
  }

  updateProgressVisibility(true);

  let html = `<div class="reg-section active" data-section="${section.id}">`;
  html += `<div class="section-header">`;
  html += `<span class="section-number">Sección ${section.number} de 9</span>`;
  html += `<h2 class="section-title">${section.title}</h2>`;
  if (section.subtitle) {
    html += `<p class="section-subtitle">${section.subtitle}</p>`;
  }
  html += `</div>`;

  section.questions.forEach(q => {
    // Check if this question should be conditionally skipped
    if (q.conditionalSkipIf) {
      const [fieldId, skipValue] = q.conditionalSkipIf.split('_');
      if (formData[fieldId] && Array.isArray(formData[fieldId]) && formData[fieldId].includes(skipValue)) {
        return; // skip rendering
      }
    }
    html += renderQuestion(q);
  });

  html += `</div>`;
  formContainer.innerHTML = html;

  // Bind option card listeners
  bindOptionCards();
  bindConsentBlocks();
  bindPhotoUpload();
  bindInputTracking();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCover() {
  return `
    <div class="reg-cover">
      <img src="assets/logos/logo-principal-blanco.png" alt="Wild Goddess Magazine" class="cover-logo">
      <h1 class="cover-title">Tu lugar en el espacio de Networking</h1>
      <p class="cover-subtitle">
        Responde estas preguntas para que podamos conectarte con las mujeres ideales para ti — 
        tanto a nivel personal como de negocio. Toma unos 8 minutos.
      </p>
      <button class="btn-start" onclick="startForm()">Comenzar →</button>
    </div>
  `;
}

function renderQuestion(q) {
  let html = `<div class="question-block" data-question="${q.id}">`;
  
  // Label
  if (q.type !== 'consent' && q.type !== 'photo') {
    html += `<label class="question-label">${q.label}`;
    if (q.required) html += ` <span class="required">*</span>`;
    html += `</label>`;
  }

  // Help text
  if (q.help && q.type !== 'consent') {
    html += `<p class="question-help">${q.help}</p>`;
  }

  // Selection limit info
  if (q.maxSelect) {
    const selected = formData[q.id] ? formData[q.id].length : 0;
    html += `<p class="selection-limit-info">Máximo <span class="limit-count">${q.maxSelect}</span> opciones — <span class="limit-current">${selected}/${q.maxSelect}</span> seleccionadas</p>`;
  }

  // Render by type
  switch (q.type) {
    case 'text':
      html += `<input class="reg-input" type="text" id="field-${q.id}" placeholder="${q.placeholder || ''}" value="${escapeHTML(formData[q.id] || '')}" autocomplete="off">`;
      break;

    case 'email':
      html += `<input class="reg-input" type="email" id="field-${q.id}" placeholder="${q.placeholder || ''}" value="${escapeHTML(formData[q.id] || '')}" autocomplete="email">`;
      break;

    case 'password':
      html += `<input class="reg-input" type="password" id="field-${q.id}" placeholder="${q.placeholder || ''}" value="${escapeHTML(formData[q.id] || '')}" autocomplete="new-password">`;
      break;

    case 'textarea':
      html += `<textarea class="reg-textarea" id="field-${q.id}" placeholder="${q.placeholder || ''}">${escapeHTML(formData[q.id] || '')}</textarea>`;
      break;

    case 'radio':
      html += `<div class="options-grid">`;
      q.options.forEach(opt => {
        const isSelected = formData[q.id] === opt.value;
        html += `
          <div class="option-card ${isSelected ? 'selected' : ''}" data-field="${q.id}" data-value="${opt.value}" data-type="radio">
            <input type="radio" name="${q.id}" value="${opt.value}" ${isSelected ? 'checked' : ''}>
            <span class="option-indicator"></span>
            <span class="option-text">${opt.label}</span>
          </div>`;
      });
      html += `</div>`;
      break;

    case 'checkbox':
      html += `<div class="options-grid">`;
      q.options.forEach(opt => {
        const vals = formData[q.id] || [];
        const isSelected = vals.includes(opt.value);
        const atLimit = q.maxSelect && vals.length >= q.maxSelect && !isSelected;
        html += `
          <div class="option-card ${isSelected ? 'selected' : ''} ${atLimit ? 'disabled' : ''}" data-field="${q.id}" data-value="${opt.value}" data-type="checkbox" data-max="${q.maxSelect || ''}">
            <input type="checkbox" name="${q.id}" value="${opt.value}" ${isSelected ? 'checked' : ''}>
            <span class="option-indicator"></span>
            <span class="option-text">${opt.label}</span>
          </div>`;
      });
      html += `</div>`;
      break;

    case 'consent':
      const isChecked = formData[q.id] === true;
      html += `
        <div class="consent-block ${isChecked ? 'checked' : ''}" data-field="${q.id}">
          <span class="consent-checkbox"></span>
          <span class="consent-text">${q.label} ${q.required ? '<span class="required">*</span>' : ''}</span>
        </div>`;
      break;

    case 'photo':
      html += `
        <div class="photo-upload-section">
          <div class="photo-upload-circle ${photoDataURL ? 'has-photo' : ''}" id="photo-circle">
            ${photoDataURL 
              ? `<img src="${photoDataURL}" alt="Foto de perfil">` 
              : `<span class="upload-icon">📷</span><span class="upload-text">Toca para subir</span>`
            }
          </div>
          <input type="file" id="photo-input" accept="image/jpeg,image/png" style="display:none">
          <p class="photo-upload-hint">${q.help || 'JPG o PNG, máximo 2MB'}</p>
        </div>`;
      break;
  }

  // Error message placeholder
  html += `<div class="field-error" id="error-${q.id}"></div>`;

  html += `</div>`;
  return html;
}

// ── Option Card Interaction ────────────────
function bindOptionCards() {
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const field = card.dataset.field;
      const value = card.dataset.value;
      const type = card.dataset.type;
      const maxSelect = parseInt(card.dataset.max) || 0;

      if (type === 'radio') {
        // Deselect siblings
        card.closest('.options-grid').querySelectorAll('.option-card').forEach(c => {
          c.classList.remove('selected');
          c.querySelector('input').checked = false;
        });
        card.classList.add('selected');
        card.querySelector('input').checked = true;
        formData[field] = value;
      } else if (type === 'checkbox') {
        if (!formData[field]) formData[field] = [];

        if (card.classList.contains('selected')) {
          // Deselect
          card.classList.remove('selected');
          card.querySelector('input').checked = false;
          formData[field] = formData[field].filter(v => v !== value);

          // Handle "none" deselect — re-enable skip logic
          const section = FORM_SECTIONS.find(s => s.questions && s.questions.find(q => q.id === field));
          if (section) {
            const question = section.questions.find(q => q.id === field);
            if (question && question.skipTrigger && question.skipTrigger.value === value) {
              // "none" was deselected — no skip
            }
          }
        } else {
          // Check limit
          if (maxSelect && formData[field].length >= maxSelect) {
            // At limit — shake animation
            card.style.animation = 'none';
            card.offsetHeight;
            card.style.animation = 'shake 0.3s ease';
            return;
          }

          // If selecting "none", deselect all others
          const section = FORM_SECTIONS.find(s => s.questions && s.questions.find(q => q.id === field));
          if (section) {
            const question = section.questions.find(q => q.id === field);
            if (question && question.skipTrigger && question.skipTrigger.value === value) {
              // Selecting "none" option — deselect all others
              card.closest('.options-grid').querySelectorAll('.option-card').forEach(c => {
                c.classList.remove('selected');
                c.querySelector('input').checked = false;
              });
              formData[field] = [];
            } else if (formData[field].includes('none')) {
              // Selecting a real option — deselect "none"
              const noneCard = card.closest('.options-grid').querySelector('[data-value="none"]');
              if (noneCard) {
                noneCard.classList.remove('selected');
                noneCard.querySelector('input').checked = false;
                formData[field] = formData[field].filter(v => v !== 'none');
              }
            }
          }

          card.classList.add('selected');
          card.querySelector('input').checked = true;
          formData[field].push(value);
        }

        // Update limit counter
        if (maxSelect) {
          const limitInfo = card.closest('.question-block').querySelector('.limit-current');
          if (limitInfo) {
            limitInfo.textContent = `${formData[field].length}/${maxSelect}`;
          }
        }

        // Update disabled state for all cards in this group
        if (maxSelect) {
          const grid = card.closest('.options-grid');
          grid.querySelectorAll('.option-card').forEach(c => {
            if (!c.classList.contains('selected') && formData[field].length >= maxSelect) {
              c.classList.add('disabled');
            } else {
              c.classList.remove('disabled');
            }
          });
        }
      }

      clearError(field);
    });
  });
}

function bindConsentBlocks() {
  document.querySelectorAll('.consent-block').forEach(block => {
    block.addEventListener('click', () => {
      const field = block.dataset.field;
      block.classList.toggle('checked');
      formData[field] = block.classList.contains('checked');
      clearError(field);
    });
  });
}

function bindPhotoUpload() {
  const circle = document.getElementById('photo-circle');
  const input = document.getElementById('photo-input');
  if (!circle || !input) return;

  circle.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('profilePhoto', 'La imagen debe ser menor a 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      photoDataURL = ev.target.result;
      circle.innerHTML = `<img src="${photoDataURL}" alt="Foto de perfil">`;
      circle.classList.add('has-photo');
      formData.profilePhoto = photoDataURL;
      clearError('profilePhoto');
    };
    reader.readAsDataURL(file);
  });
}

function bindInputTracking() {
  document.querySelectorAll('.reg-input, .reg-textarea').forEach(input => {
    const fieldId = input.id.replace('field-', '');
    input.addEventListener('input', () => {
      formData[fieldId] = input.value;
      clearError(fieldId);
    });
    input.addEventListener('blur', () => {
      formData[fieldId] = input.value;
      saveDraft();
    });
  });
}

// ── Navigation ─────────────────────────────
function startForm() {
  currentSectionIndex = 1;
  renderProgressBar();
  renderSection(currentSectionIndex);
  updateNavButtons();
}

function goBack() {
  if (currentSectionIndex <= 0) return;

  // Find previous non-skipped section
  let prevIndex = currentSectionIndex - 1;
  while (prevIndex > 0 && shouldSkipSection(prevIndex)) {
    prevIndex--;
  }

  currentSectionIndex = prevIndex;
  renderProgressBar();
  renderSection(currentSectionIndex);
  updateNavButtons();
}

function goNext() {
  const section = FORM_SECTIONS[currentSectionIndex];

  // Cover — just start
  if (section.type === 'cover') {
    startForm();
    return;
  }

  // Validate current section
  if (!validateSection(currentSectionIndex)) return;

  // Save progress
  saveDraft();

  // Find next non-skipped section
  let nextIndex = currentSectionIndex + 1;

  // Check for skip trigger in current section
  if (section.questions) {
    section.questions.forEach(q => {
      if (q.skipTrigger) {
        const vals = formData[q.id] || [];
        if (Array.isArray(vals) && vals.includes(q.skipTrigger.value)) {
          // Skip to the specified section
          const skipTarget = FORM_SECTIONS.findIndex(s => s.id === q.skipTrigger.skipToSection);
          if (skipTarget > nextIndex) {
            nextIndex = skipTarget;
          }
        }
      }
    });
  }

  while (nextIndex < FORM_SECTIONS.length && shouldSkipSection(nextIndex)) {
    nextIndex++;
  }

  if (nextIndex >= FORM_SECTIONS.length) {
    // Submit form
    submitForm();
    return;
  }

  currentSectionIndex = nextIndex;
  renderProgressBar();
  renderSection(currentSectionIndex);
  updateNavButtons();
}

function shouldSkipSection(index) {
  // Currently no sections to skip by default
  return false;
}

function updateNavButtons() {
  if (!btnBack || !btnNext) return;

  const section = FORM_SECTIONS[currentSectionIndex];
  const isCover = section.type === 'cover';
  const isLast = currentSectionIndex >= FORM_SECTIONS.length - 1;

  // Hide nav on cover
  const navBar = document.querySelector('.reg-nav');
  if (navBar) {
    navBar.style.display = isCover ? 'none' : 'flex';
  }

  btnBack.disabled = currentSectionIndex <= 1;
  btnNext.textContent = isLast ? 'Enviar ✨' : 'Siguiente →';
}

function updateProgressVisibility(show) {
  const progressEl = document.querySelector('.reg-progress');
  if (progressEl) {
    progressEl.style.display = show ? 'block' : 'none';
  }
}

// ── Validation ─────────────────────────────
function validateSection(index) {
  const section = FORM_SECTIONS[index];
  if (!section.questions) return true;

  let isValid = true;

  section.questions.forEach(q => {
    if (!q.required) return;

    // Skip validation for conditionally hidden questions
    if (q.conditionalSkipIf) {
      const [fieldId, skipValue] = q.conditionalSkipIf.split('_');
      if (formData[fieldId] && Array.isArray(formData[fieldId]) && formData[fieldId].includes(skipValue)) {
        return;
      }
    }

    const value = formData[q.id];

    switch (q.type) {
      case 'text':
      case 'textarea':
        if (!value || !value.trim()) {
          showError(q.id, 'Este campo es obligatorio');
          isValid = false;
        }
        break;
      case 'radio':
        if (!value) {
          showError(q.id, 'Selecciona una opción');
          isValid = false;
        }
        break;
      case 'checkbox':
        if (!value || !value.length) {
          showError(q.id, 'Selecciona al menos una opción');
          isValid = false;
        }
        break;
      case 'consent':
        if (value !== true) {
          showError(q.id, 'Debes aceptar para continuar');
          isValid = false;
        }
        break;
    }
  });

  if (!isValid) {
    // Scroll to first error
    const firstError = document.querySelector('.field-error.visible');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return isValid;
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
  const input = document.getElementById(`field-${fieldId}`);
  if (input) input.classList.add('error');
}

function clearError(fieldId) {
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
  const input = document.getElementById(`field-${fieldId}`);
  if (input) input.classList.remove('error');
}

// ── Auto-Save / Draft ──────────────────────
function startAutoSave() {
  autoSaveTimer = setInterval(() => {
    saveDraft();
    showSaveIndicator();
  }, 5000);
}

function saveDraft() {
  const draft = {
    currentSectionIndex,
    formData,
    photoDataURL,
    savedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem('wc_registration_draft', JSON.stringify(draft));
  } catch (e) {
    console.warn('Could not save draft:', e);
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem('wc_registration_draft');
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.formData) formData = draft.formData;
      if (draft.currentSectionIndex) currentSectionIndex = draft.currentSectionIndex;
      if (draft.photoDataURL) photoDataURL = draft.photoDataURL;
    }
  } catch (e) {
    console.warn('Could not load draft:', e);
  }
}

function showSaveIndicator() {
  if (autosaveIndicator) {
    autosaveIndicator.classList.add('saved');
    autosaveIndicator.querySelector('.save-label').textContent = 'Guardado';
    setTimeout(() => {
      autosaveIndicator.classList.remove('saved');
      autosaveIndicator.querySelector('.save-label').textContent = 'Auto-guardado';
    }, 2000);
  }
}

// ── Submit ─────────────────────────────────
async function submitForm() {
  const btnText = btnNext.textContent;
  btnNext.textContent = 'Enviando...';
  btnNext.classList.add('submitting');

  let userId = null;

  // 1. Supabase Auth Sign Up
  if (supabase) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });
      if (authError) {
        console.error("Auth Error:", authError);
        alert("Hubo un error al registrar tu cuenta: " + authError.message);
        btnNext.textContent = btnText;
        btnNext.classList.remove('submitting');
        return;
      }

      if (authData && authData.user) {
        userId = authData.user.id;
      }
    } catch(e) {
      console.warn("Could not sign up via Supabase:", e);
    }
  }

  // Prepare final data
  const registration = {
    ...formData,
    registeredAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    formComplete: true
  };

  if (userId) {
    registration.id = userId;
  }

  // Remove password before saving to db/local storage
  delete registration.password;

  // IMMEDIATELY insert into DB if Supabase is available
  if (supabase) {
    try {
      const { error: dbError } = await supabase
        .from('registrations')
        .upsert(registration);
        
      if (dbError) {
        console.error("DB Error:", dbError);
        alert("Hubo un error al guardar tu perfil: " + dbError.message);
        btnNext.textContent = btnText;
        btnNext.classList.remove('submitting');
        return;
      }
    } catch(e) {
      console.warn("Error upserting registration:", e);
    }
  }

  // Store in localStorage
  try {
    localStorage.setItem('wc_user_name', formData.fullName || '');
    localStorage.setItem('wc_user_email', formData.email || '');
    localStorage.setItem('wc_user_avatar', photoDataURL || '');
    localStorage.setItem('wc_registration_data', JSON.stringify(registration));
    localStorage.removeItem('wc_registration_draft');
  } catch (e) {
    console.error('Error saving registration:', e);
  }

  // Show confirmation
  btnNext.textContent = btnText;
  btnNext.classList.remove('submitting');
  showConfirmation(registration);
}

function showConfirmation(data) {
  if (!formContainer || !confirmationScreen) return;

  // Hide form
  formContainer.style.display = 'none';
  document.querySelector('.reg-progress').style.display = 'none';
  document.querySelector('.reg-nav').style.display = 'none';

  // Build confirmation content
  confirmationScreen.innerHTML = `
    <div class="confirmation-icon">✨</div>
    <h2 class="confirmation-title">¡Registro completado!</h2>
    <p class="confirmation-message">
      Gracias, <strong>${escapeHTML(data.fullName)}</strong>. Tus respuestas ya están guardadas. 
      Las usaremos para conectarte con las mujeres ideales en el evento del 7 de agosto.
    </p>
    <div class="confirmation-details">
      <h3>Tu resumen</h3>
      <div class="detail-row">
        <span class="detail-label">Nombre</span>
        <span class="detail-value">${escapeHTML(data.fullName || '')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Ciudad</span>
        <span class="detail-value">${escapeHTML(data.location || '')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Instagram</span>
        <span class="detail-value">${escapeHTML(data.instagram || '')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Nicho</span>
        <span class="detail-value">${escapeHTML(data.niche || '')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Expertise</span>
        <span class="detail-value">${escapeHTML(data.expertise || '')}</span>
      </div>
    </div>
    <a href="dashboard.html" class="btn-go-dashboard">Ir al Dashboard →</a>
  `;
  confirmationScreen.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Utilities ──────────────────────────────
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Shake animation for limit reached
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }`;
document.head.appendChild(shakeStyle);
