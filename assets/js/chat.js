// Chat functionality for ZAMA platform

class ChatManager {
    constructor() {
        this.messages = [];
        this.isStreaming = false;
        this.chatStarted = false;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadChatHistory();
    }

    setupElements() {
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.messagesContainer = document.getElementById('chat-messages');
        this.chatIntro = document.getElementById('chat-intro');
        this.examplePrompts = document.getElementById('example-prompts');
        this.enhanceBtn = document.getElementById('enhance-btn');
        this.chatPanel = document.getElementById('chat-panel');
    }

    setupEventListeners() {
        if (this.chatInput) {
            this.chatInput.addEventListener('input', () => {
                this.handleInputChange();
            });

            this.chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                if (this.isStreaming) {
                    this.stopStreaming();
                } else {
                    this.sendMessage();
                }
            });
        }

        if (this.enhanceBtn) {
            this.enhanceBtn.addEventListener('click', () => {
                this.enhancePrompt();
            });
        }

        // Example prompts
        const exampleButtons = document.querySelectorAll('.example-prompt');
        exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.chatInput.value = button.textContent;
                this.sendMessage();
            });
        });

        // Auto-resize textarea
        if (this.chatInput) {
            this.chatInput.addEventListener('input', () => {
                this.autoResizeTextarea();
            });
        }
    }

    handleInputChange() {
        const hasContent = this.chatInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasContent && !this.isStreaming;
        
        // Update send button icon
        const icon = this.sendBtn.querySelector('i');
        if (this.isStreaming) {
            icon.className = 'icon-stop';
        } else {
            icon.className = 'icon-send';
        }
    }

    autoResizeTextarea() {
        const maxHeight = this.chatStarted ? 400 : 200;
        this.chatInput.style.height = 'auto';
        const newHeight = Math.min(this.chatInput.scrollHeight, maxHeight);
        this.chatInput.style.height = newHeight + 'px';
        this.chatInput.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    }

    async sendMessage(messageText = null) {
        const content = messageText || this.chatInput.value.trim();
        
        if (!content || this.isStreaming) {
            return;
        }

        // Start chat if not started
        if (!this.chatStarted) {
            this.startChat();
        }

        // Add user message
        this.addMessage('user', content);
        
        // Clear input
        this.chatInput.value = '';
        this.handleInputChange();
        this.autoResizeTextarea();

        // Start streaming response
        await this.streamResponse(content);
    }

    async streamResponse(userMessage) {
        this.isStreaming = true;
        this.handleInputChange();

        // Add assistant message placeholder
        const messageId = this.addMessage('assistant', '');
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const contentElement = messageElement.querySelector('.message-content');

        try {
            const response = await fetch('/api/chat.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...this.messages,
                        { role: 'user', content: userMessage }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Request failed');
            }

            const data = await response.json();
            
            // Simulate streaming by typing out the response
            await this.typeMessage(contentElement, data.message.content);
            
            // Update messages array
            this.messages.push({ role: 'user', content: userMessage });
            this.messages.push({ role: 'assistant', content: data.message.content });

        } catch (error) {
            console.error('Chat error:', error);
            contentElement.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            window.zamaApp?.showNotification(error.message, 'error');
        } finally {
            this.isStreaming = false;
            this.handleInputChange();
        }
    }

    async typeMessage(element, text) {
        element.innerHTML = '';
        const words = text.split(' ');
        
        for (let i = 0; i < words.length; i++) {
            if (!this.isStreaming) break; // Stop if streaming was cancelled
            
            element.innerHTML += (i > 0 ? ' ' : '') + words[i];
            this.scrollToBottom();
            
            // Add a small delay to simulate typing
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    stopStreaming() {
        this.isStreaming = false;
        this.handleInputChange();
    }

    addMessage(role, content) {
        const messageId = Date.now() + Math.random();
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        messageElement.setAttribute('data-message-id', messageId);

        if (role === 'user') {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <div class="user-avatar">U</div>
                </div>
                <div class="message-content">${this.escapeHtml(content)}</div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <div class="assistant-avatar">Z</div>
                </div>
                <div class="message-content">${content}</div>
            `;
        }

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        return messageId;
    }

    startChat() {
        this.chatStarted = true;
        
        // Hide intro and examples
        if (this.chatIntro) {
            this.chatIntro.style.display = 'none';
        }
        if (this.examplePrompts) {
            this.examplePrompts.style.display = 'none';
        }

        // Show messages container
        this.messagesContainer.style.display = 'block';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    async enhancePrompt() {
        const content = this.chatInput.value.trim();
        
        if (!content) {
            window.zamaApp?.showNotification('Please enter a prompt to enhance', 'warning');
            return;
        }

        this.enhanceBtn.disabled = true;
        this.enhanceBtn.innerHTML = '<i class="icon-loading"></i> Enhancing...';

        try {
            // Mock enhancement - in real implementation, call AI service
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const enhancedPrompt = `Create a comprehensive ${content} with modern design, responsive layout, and best practices. Include proper error handling, loading states, and accessibility features.`;
            
            this.chatInput.value = enhancedPrompt;
            this.autoResizeTextarea();
            this.handleInputChange();

        } catch (error) {
            console.error('Enhancement error:', error);
            window.zamaApp?.showNotification('Failed to enhance prompt', 'error');
        } finally {
            this.enhanceBtn.disabled = false;
            this.enhanceBtn.innerHTML = '<i class="icon-stars"></i> Enhance prompt';
        }
    }

    loadChatHistory() {
        // Mock chat history loading
        const savedMessages = localStorage.getItem('zama_chat_history');
        if (savedMessages) {
            try {
                this.messages = JSON.parse(savedMessages);
                this.renderMessages();
            } catch (error) {
                console.error('Failed to load chat history:', error);
            }
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('zama_chat_history', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    renderMessages() {
        if (this.messages.length > 0) {
            this.startChat();
            
            this.messages.forEach(message => {
                this.addMessage(message.role, message.content);
            });
        }
    }

    clearChat() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
        this.chatStarted = false;
        
        if (this.chatIntro) {
            this.chatIntro.style.display = 'block';
        }
        if (this.examplePrompts) {
            this.examplePrompts.style.display = 'block';
        }
        
        this.saveChatHistory();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize chat manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('chat-panel')) {
        window.chatManager = new ChatManager();
    }
});