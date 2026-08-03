/* ============================================================
   WILD CONNECTIONS — Admin Dashboard Logic
   ============================================================ */

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( () => {
    
    // --- 1. Security Lock ---
    const ADMIN_PIN = 'Nanurri123#';
    const lockScreen = document.getElementById('lock-screen');
    const pinInput = document.getElementById('admin-pin');
    const btnUnlock = document.getElementById('btn-unlock');
    const pinError = document.getElementById('pin-error');
    
    // Check if previously unlocked in this session
    if (sessionStorage.getItem('wc_admin_unlocked') === 'true') {
        unlockDashboard();
    }

    btnUnlock.addEventListener('click', attemptUnlock);
    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptUnlock();
    });

    function attemptUnlock() {
        if (pinInput.value === ADMIN_PIN) {
            sessionStorage.setItem('wc_admin_unlocked', 'true');
            unlockDashboard();
        } else {
            pinError.classList.add('show');
            pinInput.value = '';
            setTimeout(() => pinError.classList.remove('show'), 3000);
        }
    }

    function unlockDashboard() {
        lockScreen.classList.add('unlocked');
        loadData();
    }

    // --- 2. Data Loading & Rendering ---
    let allUsers = [];

    async function loadData() {
        try {
            allUsers = await window.WCDatabase.getAllUsers();
            updateMetrics(allUsers);
            renderTable(allUsers);
        } catch (error) {
            console.error("Error loading users:", error);
            document.getElementById('admin-table-body').innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">
                        Error al cargar la base de datos. Por favor recarga la página.
                    </td>
                </tr>
            `;
        }
    }

    // --- 3. Metrics Calculation ---
    function updateMetrics(users) {
        // Total
        document.getElementById('metric-total').textContent = users.length;
        
        // High Revenue (> 6000)
        const highRevenueRanges = ['6000_15000', '15000_plus'];
        const highRevenueCount = users.filter(u => highRevenueRanges.includes(u.monthlyRevenue)).length;
        document.getElementById('metric-revenue').textContent = highRevenueCount;

        // Stage: Scaling
        const scalingCount = users.filter(u => u.businessStage === 'scaling').length;
        document.getElementById('metric-scaling').textContent = scalingCount;
    }

    // --- 4. Table Rendering ---
    const tableBody = document.getElementById('admin-table-body');
    const searchInput = document.getElementById('admin-search');

    function renderTable(users) {
        if (users.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        Aún no hay usuarias registradas en la plataforma.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = users.map(user => {
            
            // Format Stage Badge
            const stageLabels = {
                'idea': { text: 'Idea', class: 'badge-blue' },
                'selling_irregular': { text: 'Vendiendo', class: 'badge-purple' },
                'stable_income': { text: 'Estable', class: 'badge-green' },
                'scaling': { text: 'Escalando', class: 'badge-gold' }
            };
            const stage = stageLabels[user.businessStage] || { text: 'N/A', class: 'badge-blue' };

            // Format Revenue
            const revLabels = {
                'none': '$0',
                '0_1000': '< $1k',
                '1000_3000': '$1k - $3k',
                '3000_6000': '$3k - $6k',
                '6000_15000': '$6k - $15k',
                '15000_plus': '> $15k'
            };
            const revenue = revLabels[user.monthlyRevenue] || 'N/A';

            // Format Date
            const date = new Date(user.registeredAt || user.lastUpdated || Date.now());
            const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

            // Generate Initials for Avatar
            const initials = (user.fullName || 'U N').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            const instagramLink = user.instagram ? user.instagram.replace('@', '') : '';

            return `
                <tr>
                    <td>
                        <div class="td-user">
                            <div class="td-user-avatar">${initials}</div>
                            <div class="td-user-info">
                                <strong>${user.fullName || 'Desconocido'}</strong>
                                <span>${user.location || 'Sin ubicación'}</span>
                            </div>
                        </div>
                    </td>
                    <td class="td-instagram">
                        ${instagramLink ? `<a href="https://instagram.com/${instagramLink}" target="_blank">@${instagramLink}</a>` : '-'}
                    </td>
                    <td>
                        <div style="font-size: 0.85rem; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${user.niche || '-'}
                        </div>
                    </td>
                    <td><span class="badge ${stage.class}">${stage.text}</span></td>
                    <td>${revenue}</td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${dateStr}</td>
                </tr>
            `;
        }).join('');
    }

    // --- 5. Search Filtering ---
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsers.filter(u => {
            const name = (u.fullName || '').toLowerCase();
            const ig = (u.instagram || '').toLowerCase();
            const niche = (u.niche || '').toLowerCase();
            return name.includes(term) || ig.includes(term) || niche.includes(term);
        });
        renderTable(filtered);
    });

    // --- 6. Export ---
    document.getElementById('btn-export').addEventListener('click', () => {
        if (allUsers.length === 0) {
            alert('No hay datos para exportar.');
            return;
        }
        // Force the download via WCDatabase abstraction
        window.WCDatabase.downloadExport('csv');
    });

});
