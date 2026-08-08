import { supabase } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( async () => {

    // 1. Auth
    let session = null;
    let myUserId = null;
    if (supabase) {
        try {
            const { data } = await supabase.auth.getSession();
            session = data?.session;
            myUserId = session?.user?.id;
        } catch(e) {}
    }

    // 2. Load user name for greeting
    if (supabase && myUserId) {
        try {
            const { data } = await supabase
                .from('registrations')
                .select('full_name')
                .eq('id', myUserId)
                .single();
            if (data && data.full_name) {
                const nameEl = document.querySelector('.user-name');
                if (nameEl) nameEl.textContent = 'Hola, ' + data.full_name.split(' ')[0];
            }
        } catch(e) {}
    }

    // 3. Load bookings from Supabase
    let allBookings = [];
    if (supabase && myUserId) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .or(`requester_id.eq.${myUserId},target_id.eq.${myUserId}`)
                .order('created_at', { ascending: false });

            if (!error && data) {
                allBookings = data;

                // Load partner profiles
                const partnerIds = new Set();
                data.forEach(b => {
                    const pid = b.requester_id === myUserId ? b.target_id : b.requester_id;
                    partnerIds.add(pid);
                });

                if (partnerIds.size > 0) {
                    const { data: profiles } = await supabase
                        .from('registrations')
                        .select('id, fullName, expertise, profilePhoto')
                        .in('id', [...partnerIds]);

                    if (profiles) {
                        const profileMap = {};
                        profiles.forEach(p => profileMap[p.id] = p);
                        allBookings = allBookings.map(b => {
                            const pid = b.requester_id === myUserId ? b.target_id : b.requester_id;
                            return { ...b, partner: profileMap[pid] || null };
                        });
                    }
                }
            }
        } catch(e) {
            console.error("Error loading bookings:", e);
        }
    }

    // 4. Update Stats
    const pending = allBookings.filter(b => b.status === 'pending');
    const scheduled = allBookings.filter(b => b.status === 'accepted');
    const history = allBookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));

    // Update stat cards
    const statCards = document.querySelectorAll('.card.card-gold.hover-lift h3');
    if (statCards.length >= 3) {
        statCards[0].textContent = scheduled.length; // Sesiones
        statCards[2].textContent = pending.length; // Cafés Pendientes
    }

    // 5. Render Tab Contents
    function renderBookingCard(booking, showActions = false) {
        const partner = booking.partner || {};
        const name = partner.fullName || 'Usuario';
        const avatar = partner.profilePhoto || 'assets/mentor-isabella.jpg';
        const expertise = partner.expertise || '';
        const isSentByMe = booking.requester_id === myUserId;

        let statusBadge = '';
        if (booking.status === 'pending') {
            statusBadge = isSentByMe
                ? '<span style="color: var(--gold-primary); font-size: 0.8rem;">⏳ Esperando respuesta</span>'
                : '<span style="color: var(--gold-primary); font-size: 0.8rem;">📩 Te invitaron</span>';
        } else if (booking.status === 'accepted') {
            statusBadge = '<span style="color: #22c55e; font-size: 0.8rem;">✅ Confirmado</span>';
        } else if (booking.status === 'rejected') {
            statusBadge = '<span style="color: #ef4444; font-size: 0.8rem;">❌ Rechazado</span>';
        } else if (booking.status === 'completed') {
            statusBadge = '<span style="color: var(--text-secondary); font-size: 0.8rem;">✓ Completado</span>';
        } else if (booking.status === 'cancelled') {
            statusBadge = '<span style="color: var(--text-secondary); font-size: 0.8rem;">🚫 Cancelado</span>';
        }

        const actionsHtml = (showActions && !isSentByMe && booking.status === 'pending') ? `
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button class="btn btn-gold btn-sm booking-action" data-id="${booking.id}" data-action="accepted" style="flex: 1;">Aceptar ☕</button>
                <button class="btn btn-outline btn-sm booking-action" data-id="${booking.id}" data-action="rejected" style="flex: 1; border-color: rgba(255,100,100,0.5); color: #ff8888;">Rechazar</button>
            </div>
        ` : '';

        return `
            <div class="card hover-lift-glow" style="display: flex; gap: var(--space-4); align-items: center; margin-bottom: var(--space-3);">
                <img src="${avatar}" class="avatar avatar-lg" alt="${name}" style="object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="font-size: var(--text-base); font-weight: 600; margin-bottom: 2px;">${name}</h4>
                    <p class="text-secondary text-sm" style="margin-bottom: 4px;">${expertise}</p>
                    <p class="text-secondary text-sm">📅 ${booking.booking_date} · ${booking.booking_time}</p>
                    ${booking.topic ? `<p class="text-secondary text-sm" style="font-style: italic;">💬 ${booking.topic}</p>` : ''}
                    ${statusBadge}
                    ${actionsHtml}
                </div>
            </div>
        `;
    }

    // Pending tab
    const tabPending = document.getElementById('tab-pending');
    if (tabPending) {
        if (pending.length === 0) {
            tabPending.innerHTML = `<div class="card card-glass mb-4" style="text-align: center; padding: var(--space-8) var(--space-4);"><p class="text-secondary" style="font-style: italic;">No tienes invitaciones a café pendientes por responder.</p></div>`;
        } else {
            tabPending.innerHTML = pending.map(b => renderBookingCard(b, true)).join('');
        }
    }

    // Scheduled tab
    const tabScheduled = document.getElementById('tab-scheduled');
    if (tabScheduled) {
        if (scheduled.length === 0) {
            tabScheduled.innerHTML = `<div class="card card-glass mb-4" style="text-align: center; padding: var(--space-8) var(--space-4);"><p class="text-secondary" style="font-style: italic;">Aún no tienes cafés programados.</p><a href="matches.html" class="btn btn-gold btn-sm" style="margin-top: var(--space-4);">Explorar Directorio</a></div>`;
        } else {
            tabScheduled.innerHTML = scheduled.map(b => renderBookingCard(b)).join('');
        }
    }

    // History tab
    const tabHistory = document.getElementById('tab-history');
    if (tabHistory) {
        if (history.length === 0) {
            tabHistory.innerHTML = `<div class="card card-glass mb-4" style="text-align: center; padding: var(--space-8) var(--space-4);"><p class="text-secondary" style="font-style: italic;">Tu historial de conexiones aparecerá aquí.</p></div>`;
        } else {
            tabHistory.innerHTML = history.map(b => renderBookingCard(b)).join('');
        }
    }

    // 6. Handle Accept/Reject actions
    document.querySelectorAll('.booking-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookingId = e.target.getAttribute('data-id');
            const newStatus = e.target.getAttribute('data-action');

            e.target.disabled = true;
            e.target.textContent = 'Procesando...';

            if (supabase) {
                try {
                    const { error } = await supabase
                        .from('bookings')
                        .update({ status: newStatus })
                        .eq('id', bookingId);

                    if (!error) {
                        // Refresh the page to see updated state
                        window.location.reload();
                    } else {
                        console.error("Error updating booking:", error);
                        alert('Error al actualizar la reserva.');
                        e.target.disabled = false;
                    }
                } catch(err) {
                    console.error("Update error:", err);
                    e.target.disabled = false;
                }
            }
        });
    });

    // 7. Coffee button listeners (for the static match cards if they still exist)
    const coffeeButtons = document.querySelectorAll('.btn-coffee');
    coffeeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const mentorName = card ? card.querySelector('h4').textContent.split(' ')[0] : 'la mentora';
            
            const toastContainer = document.querySelector('.toast-container') || document.createElement('div');
            toastContainer.className = 'toast-container';
            if(!toastContainer.parentElement) document.body.appendChild(toastContainer);

            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.innerHTML = `<svg width="20" height="20" stroke="var(--gold-primary)" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> ¡Invitación a café enviada a ${mentorName}!`;
            toastContainer.appendChild(toast);
            
            btn.disabled = true;
            btn.textContent = 'Enviado ✓';
            
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        });
    });

    // 8. Tab Logic for Mis Cafes Virtuales
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--text-secondary)';
                b.style.borderBottom = 'none';
                b.style.fontWeight = 'normal';
            });
            tabContents.forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });

            btn.classList.add('active');
            btn.style.color = 'var(--gold-primary)';
            btn.style.borderBottom = '2px solid var(--gold-primary)';
            btn.style.fontWeight = '600';
            
            const target = document.getElementById('tab-' + btn.getAttribute('data-tab'));
            if (target) {
                target.style.display = 'block';
                void target.offsetWidth;
                target.classList.add('active');
            }
        });
    });
});
