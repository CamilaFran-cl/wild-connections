import{t as e}from"./base-O9JB4yno.js";/* empty css                   */import{t}from"./main-DCaF-Q2e.js";/* empty css              */import{n}from"./supabase-client-Dy-joStn.js";var r=e((()=>{document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`applyForm`),t=document.getElementById(`heroCta`);t&&t.addEventListener(`click`,e=>{e.preventDefault();let n=t.getAttribute(`href`).substring(1),r=document.getElementById(n);r&&r.scrollIntoView({behavior:`smooth`,block:`start`})}),e&&e.addEventListener(`submit`,t=>{t.preventDefault();let r=document.getElementById(`fullName`).value.trim(),i=document.getElementById(`email`).value.trim(),a=document.getElementById(`specialty`).value,o=document.getElementById(`experience`).value.trim();if(!r||!i||!a||!o){n(`Por favor, completa todos los campos requeridos.`,`error`);return}n(`¡Postulación enviada! Te contactaremos en 48 horas.`,`success`),e.reset()});function n(e,t=`success`){let n=document.querySelector(`.toast-container`);n||(n=document.createElement(`div`),n.className=`toast-container`,n.style.cssText=`
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 9999;
            `,document.body.appendChild(n));let r=document.createElement(`div`);r.className=`toast toast-${t}`,r.style.cssText=`
            background: var(--surface);
            border: 1px solid ${t===`success`?`#10B981`:`#EF4444`};
            color: var(--text-primary);
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.9rem;
            animation: slideInRight 0.3s ease forwards;
            display: flex;
            align-items: center;
            gap: 10px;
        `,r.innerHTML=`
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${t===`success`?`#10B981`:`#EF4444`}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="${t===`success`?`M20 6L9 17l-5-5`:`M18 6L6 18M6 6l12 12`}"></path>
            </svg>
            <span>${e}</span>
        `,n.appendChild(r),setTimeout(()=>{r.style.animation=`fadeOutRight 0.3s ease forwards`,setTimeout(()=>{r.parentNode&&r.parentNode.removeChild(r)},300)},4e3)}if(!document.getElementById(`toast-styles`)){let e=document.createElement(`style`);e.id=`toast-styles`,e.innerHTML=`
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `,document.head.appendChild(e)}})}));n(),t(),r();