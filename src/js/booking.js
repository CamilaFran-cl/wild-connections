document.addEventListener('DOMContentLoaded', () => {
    // 1. Get mentor ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mentorId = parseInt(urlParams.get('id'));

    // Check if we have a valid mentor ID and data exists
    if (!mentorId || typeof mentors === 'undefined') {
        window.location.href = 'matches.html'; // Redirect if no valid ID
        return;
    }

    // Find the specific mentor
    const mentor = mentors.find(m => m.id === mentorId);
    if (!mentor) {
        window.location.href = 'matches.html'; // Redirect if mentor not found
        return;
    }

    // 2. Populate Mentor Info Header
    document.getElementById('mentorAvatar').src = mentor.image;
    document.getElementById('mentorName').textContent = mentor.name;
    document.getElementById('mentorSpecialty').textContent = mentor.specialty;

    // 3. Variables for booking state
    let selectedDateStr = null;
    let selectedTimeStr = null;

    // 4. Generate next 7 days for Date Selection
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
            // Remove selected class from all dates
            document.querySelectorAll('#datesContainer .option-card').forEach(el => el.classList.remove('selected'));
            // Add to clicked
            this.classList.add('selected');
            selectedDateStr = this.dataset.date;
            
            // Show step 2
            document.getElementById('step2').classList.add('active');
            
            // Scroll to step 2 smoothly
            setTimeout(() => {
                document.getElementById('step2').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
        
        datesContainer.appendChild(dateCard);
    }

    // 5. Time Selection Logic
    const timeCards = document.querySelectorAll('.time-card');
    timeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all times
            timeCards.forEach(el => el.classList.remove('selected'));
            // Add to clicked
            this.classList.add('selected');
            selectedTimeStr = this.dataset.time;
            
            // Show step 3
            document.getElementById('step3').classList.add('active');
            
            // Scroll to step 3 smoothly
            setTimeout(() => {
                document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    });

    // 6. Confirmation Form Logic
    const btnConfirm = document.getElementById('btnConfirm');
    const bookingTopic = document.getElementById('bookingTopic');
    
    btnConfirm.addEventListener('click', () => {
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
        
        // Disable button while processing
        btnConfirm.disabled = true;
        btnConfirm.innerHTML = '<span class="spinner"></span> Confirmando...';
        
        // Simulate network delay
        setTimeout(() => {
            // Save to localStorage
            const newBooking = {
                id: 'WC-' + Date.now().toString().slice(-6),
                mentorId: mentor.id,
                mentorName: mentor.name,
                date: selectedDateStr,
                time: selectedTimeStr,
                topic: topic,
                createdAt: new Date().toISOString()
            };
            
            let bookings = JSON.parse(localStorage.getItem('wc_bookings') || '[]');
            bookings.push(newBooking);
            localStorage.setItem('wc_bookings', JSON.stringify(bookings));
            
            // Update Summary UI
            document.getElementById('summaryMentor').textContent = mentor.name;
            document.getElementById('summaryDate').textContent = selectedDateStr;
            document.getElementById('summaryTime').textContent = selectedTimeStr;
            document.getElementById('summaryTopic').textContent = topic.length > 30 ? topic.substring(0, 30) + '...' : topic;
            
            // Hide steps and show success
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'none';
            document.getElementById('step3').style.display = 'none';
            document.querySelector('.mentor-header').style.display = 'none';
            
            document.getElementById('successState').classList.add('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1200);
    });
});
