// ============================================
// AI Chatbot Widget
// ============================================

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.history = []; // Stores {role: 'user'|'assistant', content: string}
        this.init();
    }

    init() {
        // Inject HTML shell
        const shell = `
            <div id="chatbot-container" class="chatbot-container">
                <button id="chatbot-toggle" class="chatbot-toggle">
                    <span class="chat-icon">💬</span>
                </button>
                <div id="chatbot-window" class="chatbot-window">
                    <div class="chatbot-header">
                        <h4>RealEstate AI ✨</h4>
                        <button id="chatbot-close">✕</button>
                    </div>
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chat-message assistant">
                            Hello! I can help you find properties or answer questions about real estate. Try asking "What are the latest homes for sale in New York?"
                        </div>
                    </div>
                    <form id="chatbot-form" class="chatbot-input">
                        <input type="text" id="chatbot-input" placeholder="Ask me anything..." autocomplete="off">
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', shell);

        // Bind events
        document.getElementById('chatbot-toggle').addEventListener('click', () => this.toggle());
        document.getElementById('chatbot-close').addEventListener('click', () => this.toggle());
        document.getElementById('chatbot-form').addEventListener('submit', (e) => this.handleSubmit(e));
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const cl = document.getElementById('chatbot-window').classList;
        if (this.isOpen) {
            cl.add('open');
            document.getElementById('chatbot-input').focus();
        } else {
            cl.remove('open');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        // Add user message to UI immediately
        this.addMessage('user', message);
        input.value = '';

        // Add loading indicator
        const msgContainer = document.getElementById('chatbot-messages');
        const loadingId = 'loading-' + Date.now();
        msgContainer.insertAdjacentHTML('beforeend', `<div id="${loadingId}" class="chat-message assistant typing">...</div>`);
        this.scrollToBottom();

        try {
            // Send to AI endpoint
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + Auth.getToken() },
                body: JSON.stringify({ message, history: this.history })
            });

            const data = await response.json();
            document.getElementById(loadingId).remove();

            if (data.success) {
                this.addMessage('assistant', data.reply);
                // Save context history
                this.history.push({ role: 'user', content: message });
                this.history.push({ role: 'assistant', content: data.reply });
            } else {
                throw new Error(data.message || 'API Error');
            }
        } catch (err) {
            document.getElementById(loadingId).remove();
            this.addMessage('system', 'Sorry, I am having trouble connecting right now.');
            console.error(err);
        }
    }

    addMessage(role, text) {
        const msgContainer = document.getElementById('chatbot-messages');

        // Convert simple linebreaks to <br> for better formatting of lists
        const formattedText = text.replace(/\\n/g, '<br>');

        const el = `<div class="chat-message ${role}">${formattedText}</div>`;
        msgContainer.insertAdjacentHTML('beforeend', el);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const msgContainer = document.getElementById('chatbot-messages');
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are in the main app (not taking screenshots of an empty page)
    if (document.getElementById('app')) {
        window.aiChatbot = new Chatbot();
    }
});
