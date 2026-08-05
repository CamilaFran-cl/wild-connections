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

    // 2. DOM Elements
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

    // 3. State
    let currentPartnerId = null;
    let conversations = {}; // { partnerId: { profile: {...}, messages: [] } }
    let realtimeChannel = null;

    // 4. Load conversations from DB
    async function loadConversations() {
        if (!supabase || !myUserId) return;

        try {
            // Get all messages where I'm sender or receiver
            const { data: msgs, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${myUserId},receiver_id.eq.${myUserId}`)
                .order('created_at', { ascending: true });

            if (error) {
                console.error("Error loading messages:", error);
                return;
            }

            // Group by partner
            const partnerIds = new Set();
            (msgs || []).forEach(msg => {
                const partnerId = msg.sender_id === myUserId ? msg.receiver_id : msg.sender_id;
                partnerIds.add(partnerId);
                if (!conversations[partnerId]) {
                    conversations[partnerId] = { profile: null, messages: [] };
                }
                conversations[partnerId].messages.push(msg);
            });

            // Also check URL param for a new conversation
            const urlParams = new URLSearchParams(window.location.search);
            const partnerParam = urlParams.get('partner');
            if (partnerParam) {
                partnerIds.add(partnerParam);
                if (!conversations[partnerParam]) {
                    conversations[partnerParam] = { profile: null, messages: [] };
                }
                currentPartnerId = partnerParam;
            }

            // Load partner profiles
            if (partnerIds.size > 0) {
                const { data: profiles, error: profErr } = await supabase
                    .from('registrations')
                    .select('id, fullName, expertise, profilePhoto')
                    .in('id', [...partnerIds]);

                if (!profErr && profiles) {
                    profiles.forEach(p => {
                        if (conversations[p.id]) {
                            conversations[p.id].profile = p;
                        }
                    });
                }
            }

            // Default to first conversation if no partner set
            if (!currentPartnerId) {
                const keys = Object.keys(conversations);
                if (keys.length > 0) currentPartnerId = keys[0];
            }

        } catch(e) {
            console.error("Error in loadConversations:", e);
        }
    }

    await loadConversations();

    // 5. Subscribe to Realtime
    function subscribeToRealtime() {
        if (!supabase || !myUserId) return;

        realtimeChannel = supabase
            .channel('messages-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${myUserId}`
                },
                (payload) => {
                    const newMsg = payload.new;
                    const partnerId = newMsg.sender_id;

                    // Add to conversations
                    if (!conversations[partnerId]) {
                        conversations[partnerId] = { profile: null, messages: [] };
                        // Load profile for new sender
                        loadPartnerProfile(partnerId);
                    }
                    conversations[partnerId].messages.push(newMsg);

                    // If currently viewing this conversation, render the new message
                    if (partnerId === currentPartnerId) {
                        appendMessage(newMsg);
                    }

                    renderSidebar();
                }
            )
            .subscribe();
    }

    async function loadPartnerProfile(partnerId) {
        if (!supabase) return;
        const { data } = await supabase
            .from('registrations')
            .select('id, fullName, expertise, profilePhoto')
            .eq('id', partnerId)
            .single();
        if (data && conversations[partnerId]) {
            conversations[partnerId].profile = data;
            renderSidebar();
        }
    }

    subscribeToRealtime();

    // 6. Render Sidebar
    function renderSidebar() {
        conversationList.innerHTML = '';

        const partnerIds = Object.keys(conversations);

        if (partnerIds.length === 0) {
            conversationList.innerHTML = `
                <div style="padding: var(--space-6); text-align: center; color: var(--text-secondary);">
                    <p style="font-style: italic;">No tienes conversaciones aún.</p>
                    <a href="matches.html" class="btn btn-gold btn-sm" style="margin-top: var(--space-4);">Explorar Directorio</a>
                </div>
            `;
            return;
        }

        partnerIds.forEach(partnerId => {
            const conv = conversations[partnerId];
            const profile = conv.profile || {};
            const msgs = conv.messages || [];
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

            const lastText = lastMsg ? lastMsg.text : 'Haz clic para chatear';
            const lastTime = lastMsg ? formatTime(lastMsg.created_at) : '';

            const name = profile.fullName || 'Usuario';
            const avatar = profile.profilePhoto || 'assets/mentor-isabella.jpg';

            const item = document.createElement('div');
            item.className = `conversation-item ${partnerId === currentPartnerId ? 'active' : ''}`;
            item.onclick = () => switchConversation(partnerId);

            item.innerHTML = `
                <img src="${avatar}" class="avatar avatar-sm ${partnerId === currentPartnerId ? 'avatar-gold' : ''}" alt="${name}" style="object-fit: cover;">
                <div class="conversation-info">
                    <div class="conversation-name">${name}</div>
                    <div class="conversation-preview">${lastText.substring(0, 40)}${lastText.length > 40 ? '...' : ''}</div>
                </div>
                <div class="conversation-time">${lastTime}</div>
            `;

            conversationList.appendChild(item);
        });
    }

    // 7. Switch Conversation
    function switchConversation(partnerId) {
        currentPartnerId = partnerId;
        const url = new URL(window.location);
        url.searchParams.set('partner', partnerId);
        window.history.pushState({}, '', url);

        renderSidebar();
        loadChatArea(partnerId);

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
    }

    // 8. Load Chat Area
    function loadChatArea(partnerId) {
        const conv = conversations[partnerId];
        if (!conv) return;

        const profile = conv.profile || {};
        chatMentorAvatar.src = profile.profilePhoto || 'assets/mentor-isabella.jpg';
        chatMentorName.innerHTML = `${profile.fullName || 'Usuario'} <span class="online-dot"></span>`;
        chatMentorSpecialty.textContent = profile.expertise || '';

        renderMessages(partnerId);
        messageInput.focus();
    }

    // 9. Render Messages
    function renderMessages(partnerId) {
        // Clear all except typing indicator
        const existing = Array.from(chatMessagesArea.children).filter(el => el.id !== 'typingIndicator');
        existing.forEach(el => el.remove());

        const msgs = conversations[partnerId]?.messages || [];

        msgs.forEach(msg => {
            const sender = msg.sender_id === myUserId ? 'user' : 'mentor';
            const time = formatTime(msg.created_at);
            const msgEl = createMessageElement(sender, msg.text, time);
            chatMessagesArea.insertBefore(msgEl, typingIndicator);
        });

        scrollToBottom();
    }

    function appendMessage(msg) {
        const sender = msg.sender_id === myUserId ? 'user' : 'mentor';
        const time = formatTime(msg.created_at);
        const msgEl = createMessageElement(sender, msg.text, time);
        chatMessagesArea.insertBefore(msgEl, typingIndicator);
        scrollToBottom();
    }

    function createMessageElement(sender, text, time) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerHTML = `
            <div class="message-content">${escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        `;
        return div;
    }

    // 10. Send Message
    async function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentPartnerId || !myUserId) return;

        messageInput.value = '';
        messageInput.disabled = true;
        btnSendMessage.disabled = true;

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: myUserId,
                    receiver_id: currentPartnerId,
                    text: text
                })
                .select()
                .single();

            if (error) {
                console.error("Error sending message:", error);
                showToast('Error al enviar mensaje. Inténtalo de nuevo.');
                messageInput.value = text; // restore
            } else if (data) {
                // Add to local state
                if (!conversations[currentPartnerId]) {
                    conversations[currentPartnerId] = { profile: null, messages: [] };
                }
                conversations[currentPartnerId].messages.push(data);
                appendMessage(data);
                renderSidebar();
            }
        } catch(err) {
            console.error("Send error:", err);
            showToast('Error de conexión.');
            messageInput.value = text;
        }

        messageInput.disabled = false;
        btnSendMessage.disabled = false;
        messageInput.focus();
    }

    // 11. Event Listeners
    btnSendMessage.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    btnBackToConexiones.addEventListener('click', () => {
        window.location.href = 'conexiones.html';
    });

    // 12. Utilities
    function formatTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return date.toLocaleDateString('es', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function scrollToBottom() {
        chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    }

    function showToast(message) {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="margin-right: 8px;">✓</span> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 13. Initial Render
    renderSidebar();
    if (currentPartnerId) {
        loadChatArea(currentPartnerId);
    }
});
