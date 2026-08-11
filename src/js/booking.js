import { supabase, checkAuthSession } from './supabase-client.js';

(function(cb){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',cb);}else{cb();}})( async () => {

    // 1. Auth Check
    let session = null;
    if (supabase) {
        try {
            const authPromise = supabase.auth.getSession().then(res => res.data?.session);
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 3000));
            session = await Promise.race([authPromise, timeoutPromise]);
        } catch (err) {
            console.error("Error al obtener sesión:", err);
        }
    }

    if (!session && !localStorage.getItem('wc_user_plan')) {
        window.location.href = 'login.html';
        return;
    }

    const myUserId = session?.user?.id;

    // 2. Get partner ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('id') || urlParams.get('mentor');
    const requestedService = urlParams.get('service');

    if (!partnerId) {
        window.location.href = 'matches.html';
        return;
    }

    // 3. Load partner profile from Supabase
    let partner = null;
    if (supabase) {
        try {
            const readRes = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/registrations?id=eq.${partnerId}&select=id,full_name,expertise,profile_photo_url`, {
                method: 'GET',
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            });
            if (readRes.ok) {
                const rows = await readRes.json();
                if (rows && rows.length > 0) {
                    const p = rows[0];
                    partner = {
                        id: p.id,
                        fullName: p.full_name,
                        expertise: p.expertise,
                        profilePhoto: p.profile_photo_url
                    };
                }
            }
        } catch(e) {
            console.warn("Could not load partner profile:", e);
        }
    }

    if (!partner) {
        window.location.href = 'matches.html';
        return;
    }

    // 4. Populate Mentor Info Header
    const mentorAvatar = document.getElementById('mentorAvatar');
    const mentorName = document.getElementById('mentorName');
    const mentorSpecialty = document.getElementById('mentorSpecialty');

    if (mentorAvatar) mentorAvatar.src = partner.profilePhoto || 'assets/mentor-isabella.jpg';
    if (mentorName) mentorName.textContent = partner.fullName || 'Mentora';
    if (mentorSpecialty) mentorSpecialty.textContent = partner.expertise || 'Emprendedora';

    if (requestedService) {
        document.title = `Reservar ${requestedService} | Wild Connections`;
        const headerTitle = document.querySelector('.mentor-header');
        if (headerTitle) {
            const serviceLabel = document.createElement('div');
            serviceLabel.className = 'badge-tag mt-3';
            serviceLabel.style.display = 'inline-block';
            serviceLabel.textContent = `Servicio: ${requestedService}`;
            headerTitle.appendChild(serviceLabel);
        }
    }

    // 5. Variables for booking state
    let selectedDateStr = null;
    let selectedTimeStr = null;

    // 6. Generate next 7 days for Date Selection
    const datesContainer = document.getElementById('datesContainer');
    const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    let today = new Date();
    
    for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        
        const dayName = daysOfWeek[currentDate.getDay()];
        const dayNum = currentDate.getDate();
        const monthName = months[currentDate.getMonth()];
        const fullDateStr = `${dayNum} de ${monthName}, ${currentDate.getFullYear()}`;
        
        const dateCard = document.createElement('div');
        dateCard.className = 'option-card';
        dateCard.dataset.date = fullDateStr;
        
        dateCard.innerHTML = `
            <div class="date-day-name">${dayName}</div>
            <div class="date-day-num">${dayNum}</div>
            <div class="date-month">${monthName}</div>
        `;
        
        dateCard.addEventListener('click', function() {
            document.querySelectorAll('#datesContainer .option-card').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            selectedDateStr = this.dataset.date;
            
            document.getElementById('step2').classList.add('active');
            setTimeout(() => {
                document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
        
        datesContainer.appendChild(dateCard);
    }

    // 7. Time Selection Logic
    const timeCards = document.querySelectorAll('.time-card');
    timeCards.forEach(card => {
        card.addEventListener('click', function() {
            timeCards.forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            selectedTimeStr = this.dataset.time;
            
            document.getElementById('step3').classList.add('active');
            setTimeout(() => {
                document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    });

    // 8. Confirmation — Save to Supabase
    const btnConfirm = document.getElementById('btnConfirm');
    const bookingTopic = document.getElementById('bookingTopic');
    
    btnConfirm.addEventListener('click', async () => {
        const topic = bookingTopic.value.trim();
        
        if (!selectedDateStr || !selectedTimeStr) {
            alert('Por favor selecciona una fecha y un horario.');
            return;
        }
        
        if (!topic) {
            alert('Por favor indícanos sobre qué te gustaría hablar.');
            bookingTopic.focus();
            return;
        }
        
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = '<span class="spinner"></span> Confirmando...';
        
        try {
            if (supabase && myUserId) {
                const { error } = await supabase
                    .from('bookings')
                    .insert({
                        requester_id: myUserId,
                        target_id: partnerId,
                        booking_date: selectedDateStr,
                        booking_time: selectedTimeStr,
                        topic: topic,
                        service: requestedService,
                        status: 'pending'
                    });

                if (error) {
                    console.error("Error creating booking:", error);
                    alert('Error al crear la reserva. Inténtalo de nuevo.');
                    btnConfirm.disabled = false;
                    btnConfirm.innerHTML = 'Confirmar Reserva ✨';
                    return;
                }
            }
            
            // Update Summary UI
            document.getElementById('summaryMentor').textContent = partner.fullName || 'Mentora';
            if (requestedService) {
                document.getElementById('summaryServiceContainer').style.display = 'flex';
                document.getElementById('summaryService').textContent = requestedService;
            }
            document.getElementById('summaryDate').textContent = selectedDateStr;
            document.getElementById('summaryTime').textContent = selectedTimeStr;
            document.getElementById('summaryTopic').textContent = topic.length > 30 ? topic.substring(0, 30) + '...' : topic;
            
            // Hide steps and show success
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'none';
            document.querySelector('.mentor-header').style.display = 'none';
            
            document.getElementById('successState').classList.add('active');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch(err) {
            console.error("Booking error:", err);
            alert('Error de conexión. Inténtalo de nuevo.');
            btnConfirm.disabled = false;
            btnConfirm.innerHTML = 'Confirmar Reserva ✨';
        }
    });
});
