// onboarding.js

// 1. Define the questions dynamically so it's easy to add more in the future.
const questions = [
    {
        id: 'stage',
        title: '¿En qué etapa se encuentra tu negocio o carrera profesional?',
        options: [
            { label: 'Recién empezando (Idea)', value: 'idea' },
            { label: 'Crecimiento Inicial', value: 'crecimiento' },
            { label: 'Estabilización', value: 'estabilizacion' },
            { label: 'Buscando escalar a nivel global', value: 'escalamiento' }
        ]
    },
    {
        id: 'goal',
        title: '¿Cuál es tu principal objetivo para buscar una mentora hoy?',
        options: [
            { label: 'Escalamiento Financiero', value: 'Finanzas' },
            { label: 'Marketing y Ventas', value: 'Marketing' },
            { label: 'Desarrollo Personal y Liderazgo', value: 'Liderazgo' },
            { label: 'Tecnología e Innovación', value: 'Tecnología' }
        ]
    },
    {
        id: 'style',
        title: '¿Cómo prefieres que sea el estilo de la mentoría?',
        options: [
            { label: 'Muy estructurado y orientado a métricas', value: 'estructurado' },
            { label: 'Holístico, enfocado en el bienestar y balance', value: 'Yoga' },
            { label: 'Práctico y "hands-on" (manos a la obra)', value: 'practico' }
        ]
    },
    {
        id: 'industry',
        title: '¿A qué sector pertenece tu emprendimiento?',
        options: [
            { label: 'E-commerce', value: 'E-commerce' },
            { label: 'Servicios Digitales', value: 'Servicios' },
            { label: 'Bienestar y Salud', value: 'Salud' },
            { label: 'Otro', value: 'Otro' }
        ]
    }
];

let currentStep = 0;
let answers = {};

document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for previous progress
    const savedStep = localStorage.getItem('vip_onboarding_step');
    const savedAnswers = localStorage.getItem('vip_onboarding_answers');

    if (savedStep !== null) {
        currentStep = parseInt(savedStep, 10);
    }
    if (savedAnswers !== null) {
        answers = JSON.parse(savedAnswers);
    }

    // If they already finished, don't let them stuck at the end, just start over or go to matches
    if (currentStep >= questions.length) {
        currentStep = 0;
        answers = {};
        saveProgress();
    }

    renderQuestion();
});

function renderQuestion() {
    const wrapper = document.getElementById('questions-wrapper');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (currentStep >= questions.length) {
        finishOnboarding();
        return;
    }

    const q = questions[currentStep];
    const savedAnswer = answers[q.id];

    // Update Progress
    const progressPercent = ((currentStep) / questions.length) * 100;
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `${currentStep + 1}/${questions.length}`;

    // Build options HTML
    const optionsHtml = q.options.map((opt, index) => {
        const isSelected = savedAnswer === opt.value ? 'selected' : '';
        return `<div class="option-card ${isSelected}" data-value="${opt.value}">
                    <span style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid currentColor; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 12px;">
                        ${String.fromCharCode(65 + index)}
                    </span>
                    ${opt.label}
                </div>`;
    }).join('');

    // Build Block HTML
    const blockHtml = `
        <div class="question-block active">
            <h2 class="question-title animate-fadeInUp">${q.title}</h2>
            <div class="options-grid animate-fadeInUp" style="animation-delay: 0.1s;">
                ${optionsHtml}
            </div>
            <div class="onboarding-footer animate-fadeInUp" style="animation-delay: 0.2s;">
                ${currentStep > 0 ? '<button class="btn btn-ghost" id="btn-back">← Atrás</button>' : '<div></div>'}
                <button class="btn btn-gold btn-lg shimmer-effect" id="btn-next" ${!savedAnswer ? 'disabled style="opacity: 0.5;"' : ''}>Siguiente →</button>
            </div>
        </div>
    `;

    wrapper.innerHTML = blockHtml;

    // Attach Events
    const optionCards = wrapper.querySelectorAll('.option-card');
    const btnNext = wrapper.querySelector('#btn-next');
    const btnBack = wrapper.querySelector('#btn-back');

    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected from all
            optionCards.forEach(c => c.classList.remove('selected'));
            // Add to clicked
            card.classList.add('selected');
            // Save answer
            answers[q.id] = card.getAttribute('data-value');
            saveProgress();
            
            // Enable next button
            btnNext.removeAttribute('disabled');
            btnNext.style.opacity = '1';

            // Auto advance after short delay for better UX
            setTimeout(() => {
                goToNext();
            }, 400);
        });
    });

    if (btnNext) {
        btnNext.addEventListener('click', goToNext);
    }

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            currentStep--;
            saveProgress();
            transitionToNext();
        });
    }
}

function goToNext() {
    if (!answers[questions[currentStep].id]) return; // Safety check
    currentStep++;
    saveProgress();
    transitionToNext();
}

function transitionToNext() {
    const activeBlock = document.querySelector('.question-block.active');
    if (activeBlock) {
        activeBlock.classList.remove('active');
        activeBlock.classList.add('fade-out');
        setTimeout(() => {
            renderQuestion();
        }, 300); // Wait for fade out
    } else {
        renderQuestion();
    }
}

function saveProgress() {
    localStorage.setItem('vip_onboarding_step', currentStep);
    localStorage.setItem('vip_onboarding_answers', JSON.stringify(answers));
}

function finishOnboarding() {
    // Hide header and questions
    document.getElementById('progress-header').style.display = 'none';
    document.getElementById('questions-wrapper').style.display = 'none';
    
    // Show analyzing screen
    const analyzingScreen = document.getElementById('analyzing-screen');
    analyzingScreen.classList.add('active');
    analyzingScreen.classList.add('animate-fadeInUp');

    // Simulate API delay for calculating matches
    setTimeout(() => {
        window.location.href = 'matches.html';
    }, 3000);
}
