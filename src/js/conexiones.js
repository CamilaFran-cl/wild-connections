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

    if (!session && !myUserId) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Load bookings
    let allBookings = [];
    if (supabase && myUserId) {
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .or(`requester_id.eq.${myUserId},target_id.eq.${myUserId}`)
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Load partner profiles
                const partnerIds = new Set();
                data.forEach(b => {
                    const pid = b.requester_id === myUserId ? b.target_id : b.requester_id;
                    partnerIds.add(pid);
                });

                let profileMap = {};
                if (partnerIds.size > 0) {
                    const { data: profiles } = await supabase
                        .from('registrations')
                        .select('id, fullName, expertise, profilePhoto')
                        .in('id', [...partnerIds]);
                    if (profiles) {
                        profiles.forEach(p => profileMap[p.id] = p);
                    }
                }

                allBookings = data.map(b => {
                    const pid = b.requester_id === myUserId ? b.target_id : b.requester_id;
                    return { ...b, partner: profileMap[pid] || null };
                });
            }
        } catch(e) {
            console.error("Error loading bookings:", e);
        }
    }

    // 3. Classify
    const activas = allBookings.filter(b => b.status === 'accepted');
    const pendientes = allBookings.filter(b => b.status === 'pending');
    const historial = allBookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status));

    // Update counts
    const countActivas = document.getElementById('count-activas');
    const countPendientes = document.getElementById('count-pendientes');
    if (countActivas) countActivas.textContent = activas.length;
    if (countPendientes) countPendientes.textContent = pendientes.length;

    // 4. Render functions
    function renderCard(booking) {
        const partner = booking.partner || {};
        const name = partner.fullName || 'Usuario';
        const avatar = partner.profilePhoto || 'assets/mentor-isabella.jpg';
        const expertise = partner.expertise || '';
        const isSentByMe = booking.requester_id === myUserId;

        let statusBadge = '';
        if (booking.status === 'pending') {
            statusBadge = isSentByMe
                ? '<span class="badge badge-tag" style="font-size: 0.75rem;">⏳ Esperando</span>'
                : '<span class="badge badge-success" style="font-size: 0.75rem;">📩 Te invitaron</span>';
        } else if (booking.status === 'accepted') {
            statusBadge = '<span class="badge badge-success" style="font-size: 0.75rem;">☕ Confirmado</span>';
        } else if (booking.status === 'completed') {
            statusBadge = '<span class="badge badge-tag" style="font-size: 0.75rem;">✓ Completado</span>';
        } else if (booking.status === 'rejected') {
            statusBadge = '<span class="badge badge-tag" style="font-size: 0.75rem;">✗ Rechazado</span>';
        } else if (booking.status === 'cancelled') {
            statusBadge = '<span class="badge badge-tag" style="font-size: 0.75rem;">🚫 Cancelado</span>';
        }

        const actionsHtml = booking.status === 'accepted'
            ? `<a href="chat.html?partner=${partner.id || booking.requester_id}" class="btn btn-gold btn-sm" style="flex: 1;">💬 Mensaje</a>
               <a href="profile.html?id=${partner.id || booking.requester_id}" class="btn btn-outline btn-sm" style="flex: 1;">Ver Perfil</a>`
            : booking.status === 'pending' && !isSentByMe
                ? `<button class="btn btn-gold btn-sm cx-action" data-id="${booking.id}" data-action="accepted" style="flex: 1;">Aceptar ☕</button>
                   <button class="btn btn-outline btn-sm cx-action" data-id="${booking.id}" data-action="rejected" style="flex: 1; border-color: rgba(255,100,100,0.4); color: #ff8888;">Rechazar</button>`
                : `<a href="chat.html?partner=${partner.id || booking.requester_id}" class="btn btn-outline btn-sm" style="flex: 1;">💬 Mensaje</a>`;

        return `
            <div class="card card-interactive hover-lift-glow" style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <img src="${avatar}" class="avatar avatar-lg" alt="${name}" style="object-fit: cover;">
                    ${statusBadge}
                </div>
                <div>
                    <h3 style="font-size: var(--text-lg); font-weight: 600; margin-bottom: 4px;">${name}</h3>
                    <p class="text-secondary text-sm">${expertise}</p>
                    <p class="text-secondary text-sm" style="margin-top: 4px;">📅 ${booking.booking_date} · ${booking.booking_time}</p>
                </div>
                <div style="border-top: 1px solid var(--border); padding-top: var(--space-4); margin-top: auto; display: flex; gap: var(--space-2);">
                    ${actionsHtml}
                </div>
            </div>
        `;
    }

    function renderEmpty(message) {
        return `<div class="card card-glass" style="grid-column: 1 / -1; text-align: center; padding: var(--space-8) var(--space-4);">
            <p class="text-secondary" style="font-style: italic;">${message}</p>
            <a href="matches.html" class="btn btn-gold btn-sm" style="margin-top: var(--space-4);">Explorar Directorio</a>
        </div>`;
    }

    // 5. Populate tabs
    const containerActivas = document.getElementById('conexiones-activas');
    const containerPendientes = document.getElementById('conexiones-pendientes');
    const containerHistorial = document.getElementById('conexiones-historial');

    if (containerActivas) {
        containerActivas.innerHTML = activas.length > 0
            ? activas.map(renderCard).join('')
            : renderEmpty('Aún no tienes conexiones activas. ¡Invita a alguien a un café!');
    }
    if (containerPendientes) {
        containerPendientes.innerHTML = pendientes.length > 0
            ? pendientes.map(renderCard).join('')
            : renderEmpty('No tienes invitaciones pendientes.');
    }
    if (containerHistorial) {
        containerHistorial.innerHTML = historial.length > 0
            ? historial.map(renderCard).join('')
            : renderEmpty('Tu historial aparecerá aquí.');
    }

    // 6. Accept/Reject actions
    document.querySelectorAll('.cx-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const bookingId = e.target.getAttribute('data-id');
            const newStatus = e.target.getAttribute('data-action');
            e.target.disabled = true;
            e.target.textContent = '...';

            if (supabase) {
                const { error } = await supabase
                    .from('bookings')
                    .update({ status: newStatus })
                    .eq('id', bookingId);
                if (!error) window.location.reload();
                else e.target.disabled = false;
            }
        });
    });

    // 7. Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn-cx');
    const tabContents = document.querySelectorAll('.tab-cx-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.style.color = 'var(--text-secondary)';
                b.style.borderBottom = 'none';
                b.style.fontWeight = 'normal';
            });
            tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            btn.style.color = 'var(--gold-primary)';
            btn.style.borderBottom = '2px solid var(--gold-primary)';
            btn.style.fontWeight = '600';

            const target = document.getElementById('tab-' + btn.getAttribute('data-tab'));
            if (target) target.style.display = 'block';
        });
    });
});
