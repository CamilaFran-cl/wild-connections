import{t as e}from"./base-O9JB4yno.js";/* empty css                   */import{t}from"./database-BVB8m-Qz.js";var n=e((()=>{document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`lock-screen`),t=document.getElementById(`admin-pin`),n=document.getElementById(`btn-unlock`),r=document.getElementById(`pin-error`);sessionStorage.getItem(`wc_admin_unlocked`)===`true`&&a(),n.addEventListener(`click`,i),t.addEventListener(`keypress`,e=>{e.key===`Enter`&&i()});function i(){t.value===`Nanurri123#`?(sessionStorage.setItem(`wc_admin_unlocked`,`true`),a()):(r.classList.add(`show`),t.value=``,setTimeout(()=>r.classList.remove(`show`),3e3))}function a(){e.classList.add(`unlocked`),s()}let o=[];async function s(){try{o=await window.WCDatabase.getAllUsers(),c(o),d(o)}catch(e){console.error(`Error loading users:`,e),document.getElementById(`admin-table-body`).innerHTML=`
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                        Error al cargar la base de datos. Por favor recarga la página.
                    </td>
                </tr>
            `}}function c(e){document.getElementById(`metric-total`).textContent=e.length;let t=[`6000_15000`,`15000_plus`],n=e.filter(e=>t.includes(e.monthlyRevenue)).length;document.getElementById(`metric-revenue`).textContent=n;let r=e.filter(e=>e.businessStage===`scaling`).length;document.getElementById(`metric-scaling`).textContent=r}let l=document.getElementById(`admin-table-body`),u=document.getElementById(`admin-search`);function d(e){if(e.length===0){l.innerHTML=`
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        Aún no hay usuarias registradas en la plataforma.
                    </td>
                </tr>
            `;return}l.innerHTML=e.map(e=>{let t={idea:{text:`Idea`,class:`badge-blue`},selling_irregular:{text:`Vendiendo`,class:`badge-purple`},stable_income:{text:`Estable`,class:`badge-green`},scaling:{text:`Escalando`,class:`badge-gold`}}[e.businessStage]||{text:`N/A`,class:`badge-blue`},n={none:`$0`,"0_1000":`< $1k`,"1000_3000":`$1k - $3k`,"3000_6000":`$3k - $6k`,"6000_15000":`$6k - $15k`,"15000_plus":`> $15k`}[e.monthlyRevenue]||`N/A`,r=new Date(e.registeredAt||e.lastUpdated||Date.now()).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`,year:`numeric`}),i=(e.fullName||`U N`).split(` `).map(e=>e[0]).join(``).substring(0,2).toUpperCase(),a=e.instagram?e.instagram.replace(`@`,``):``;return`
                <tr>
                    <td>
                        <div class="td-user">
                            <div class="td-user-avatar">${i}</div>
                            <div class="td-user-info">
                                <strong>${e.fullName||`Desconocido`}</strong>
                                <span>${e.location||`Sin ubicación`}</span>
                            </div>
                        </div>
                    </td>
                    <td class="td-instagram">
                        ${a?`<a href="https://instagram.com/${a}" target="_blank">@${a}</a>`:`-`}
                    </td>
                    <td>
                        <div style="font-size: 0.85rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${e.niche||`-`}
                        </div>
                    </td>
                    <td><span class="badge ${t.class}">${t.text}</span></td>
                    <td>${n}</td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${r}</td>
                </tr>
            `}).join(``)}u.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase();d(o.filter(e=>{let n=(e.fullName||``).toLowerCase(),r=(e.instagram||``).toLowerCase(),i=(e.niche||``).toLowerCase();return n.includes(t)||r.includes(t)||i.includes(t)}))}),document.getElementById(`btn-export`).addEventListener(`click`,()=>{if(o.length===0){alert(`No hay datos para exportar.`);return}window.WCDatabase.downloadExport(`csv`)})})}));t(),n();