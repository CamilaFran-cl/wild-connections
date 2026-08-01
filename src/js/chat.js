document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Data and Setup
    const allowedChatIds = [1, 3]; // Valentina and Isabella
    const storageKey = 'wc_chat_messages';
    
    // Mentor generic responses to cycle through
    const mentorResponses = [
        '¡Qué buena pregunta! Me encantaría profundizar en eso durante nuestra próxima sesión. 💡',
        'Totalmente de acuerdo. Trabajemos en una estrategia personalizada para ti.',
        '¡Excelente progreso! Sigue así y verás resultados increíbles. ✨',
        'Te recomiendo revisar el material que compartí en nuestro último taller. ¿Te lo reenvío?',
        'Perfecto, agendemos una sesión esta semana para avanzar en eso. ☕'
    ];
    let responseIndex = 0;

    // Default pre-loaded messages for realistic feel
    const defaultMessages = {
        1: [
            { sender: 'mentor', text: '¡Hola! Bienvenida a Wild Connections. Vi tu perfil y me encanta tu visión de negocio.', time: '10:00 AM' },
            { sender: 'user', text: '¡Hola Valentina! Muchas gracias. Estoy muy emocionada de empezar a trabajar contigo.', time: '10:05 AM' },
            { sender: 'mentor', text: 'Para nuestra primera sesión de escalamiento financiero, ¿podrías enviarme un resumen de tus ingresos del último trimestre?', time: '10:06 AM' }
        ],
        3: [
            { sender: 'mentor', text: '¡Hola! Qué gusto conectar contigo. El bienestar es clave para liderar.', time: 'Ayer' },
            { sender: 'user', text: '¡Hola Isabella! Totalmente. Últimamente he sentido mucho estrés y necesito volver a mi centro.', time: 'Ayer' },
            { sender: 'mentor', text: 'Lo entiendo perfecto. Te sugiero empezar con 10 minutos de yoga matutino. ¿Te parece si armamos una rutina personalizada?', time: 'Ayer' }
        ]
    };

    // DOM Elements
    const sidebar = document.getElementById('chatSidebar');
    const conversationList = document.getElementById('conversationList');
    const chatMentorAvatar = document.getElementById('chatMentorAvatar');
    const chatMentorName = document.getElementById('chatMentorName');
    const chatMentorSpecialty = document.getElementById('chatMentorSpecialty');
    const chatMessagesArea = document.getElementById('chatMessagesArea');
    const typingIndicator = document.getElementById('typingIndicator');
    const messageInput = document.getElementById('messageInput');
    const btnSendMessage = document.getElementById('btnSendMessage');
    const btnBackToConexiones = document.getElementById('btnBackToConexiones');

    // 2. State Management
    let currentMentorId = 1;
    let allMessages = JSON.parse(localStorage.getItem(storageKey)) || {};

    // Initialize default messages if local storage is empty for these users
    allowedChatIds.forEach(id => {
        if (!allMessages[id]) {
            allMessages[id] = [...defaultMessages[id]];
        }
    });
    saveMessages();

    function saveMessages() {
        localStorage.setItem(storageKey, JSON.stringify(allMessages));
    }

    // 3. Initialization
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const mentorParam = parseInt(urlParams.get('mentor'));
        
        if (mentorParam && allowedChatIds.includes(mentorParam)) {
            currentMentorId = mentorParam;
        }

        renderSidebar();
        loadChat(currentMentorId);

        // Event Listeners
        btnSendMessage.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });
        
        btnBackToConexiones.addEventListener('click', () => {
            window.location.href = 'conexiones.html';
        });
    }

    // 4. Render Sidebar
    function renderSidebar() {
        conversationList.innerHTML = '';
        
        allowedChatIds.forEach(id => {
            const mentor = mentors.find(m => m.id === id);
            if (!mentor) return;

            const messages = allMessages[id] || [];
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            const lastText = lastMessage ? lastMessage.text : 'Haz clic para chatear';
            const lastTime = lastMessage ? lastMessage.time : '';

            const item = document.createElement('div');
            item.className = `conversation-item ${id === currentMentorId ? 'active' : ''}`;
            item.onclick = () => switchConversation(id);
            
            item.innerHTML = `
                <img src="${mentor.image}" class="avatar avatar-sm ${id === currentMentorId ? 'avatar-gold' : ''}" alt="${mentor.name}">
                <div class="conversation-info">
                    <div class="conversation-name">${mentor.name}</div>
                    <div class="conversation-preview">${lastText}</div>
                </div>
                <div class="conversation-time">${lastTime}</div>
            `;
            
            conversationList.appendChild(item);
        });
    }

    // 5. Switch Conversation
    function switchConversation(mentorId) {
        currentMentorId = mentorId;
        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.set('mentor', mentorId);
        window.history.pushState({}, '', url);

        renderSidebar();
        loadChat(mentorId);
        
        // Hide sidebar on mobile if it was open
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // 6. Load Chat Area
    function loadChat(mentorId) {
        const mentor = mentors.find(m => m.id === mentorId);
        if (!mentor) return;

        chatMentorAvatar.src = mentor.image;
        chatMentorName.innerHTML = `${mentor.name} <span class="online-dot"></span>`;
        chatMentorSpecialty.textContent = mentor.specialty;

        renderMessages();
        messageInput.focus();
    }

    // 7. Render Messages
    function renderMessages() {
        // Clear all except typing indicator
        const messages = Array.from(chatMessagesArea.children).filter(el => el.id !== 'typingIndicator');
        messages.forEach(m => m.remove());

        const currentMsgs = allMessages[currentMentorId] || [];
        
        currentMsgs.forEach(msg => {
            const msgEl = createMessageElement(msg.sender, msg.text, msg.time);
            chatMessagesArea.insertBefore(msgEl, typingIndicator);
        });

        scrollToBottom();
    }

    function createMessageElement(sender, text, time) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${time}</div>
        `;
        return div;
    }

    // 8. Handle Sending Messages
    function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Add user message
        const newMsg = { sender: 'user', text, time };
        allMessages[currentMentorId].push(newMsg);
        saveMessages();
        
        const msgEl = createMessageElement('user', text, time);
        chatMessagesArea.insertBefore(msgEl, typingIndicator);
        
        messageInput.value = '';
        scrollToBottom();
        renderSidebar(); // Update preview

        // Simulate Mentor Typing & Response
        simulateMentorResponse();
    }

    function simulateMentorResponse() {
        // Disable input while 'mentor' is responding
        messageInput.disabled = true;
        btnSendMessage.disabled = true;
        
        const mentorIdResp = currentMentorId; // Capture ID in case user switches chat
        
        // 1s delay to show typing...
        setTimeout(() => {
            if (currentMentorId === mentorIdResp) {
                typingIndicator.classList.add('active');
                scrollToBottom();
            }

            // 2-3s delay to send response
            const responseDelay = Math.floor(Math.random() * 1000) + 2000;
            
            setTimeout(() => {
                if (currentMentorId === mentorIdResp) {
                    typingIndicator.classList.remove('active');
                }

                const responseText = mentorResponses[responseIndex];
                responseIndex = (responseIndex + 1) % mentorResponses.length;
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                const mentorMsg = { sender: 'mentor', text: responseText, time };
                allMessages[mentorIdResp].push(mentorMsg);
                saveMessages();

                if (currentMentorId === mentorIdResp) {
                    const msgEl = createMessageElement('mentor', responseText, time);
                    chatMessagesArea.insertBefore(msgEl, typingIndicator);
                    scrollToBottom();
                }
                
                renderSidebar(); // Update preview
                
                messageInput.disabled = false;
                btnSendMessage.disabled = false;
                if (currentMentorId === mentorIdResp) {
                    messageInput.focus();
                }

            }, responseDelay);
            
        }, 1000);
    }

    function scrollToBottom() {
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }

    // Run
    init();
});
