// Chatbot functionality
class Chatbot {
  constructor() {
    this.chatbotWidget = document.getElementById('chatbot-widget');
    this.chatbotMessages = document.getElementById('chatbot-messages');
    this.chatbotInput = document.getElementById('chatbot-input');
    this.chatbotSend = document.getElementById('chatbot-send');
    this.toggleChat = document.getElementById('toggle-chat');
    this.chatbotClose = document.getElementById('chatbot-close');
    this.chatbotMinimize = document.getElementById('chatbot-minimize');
    this.suggestionButtons = document.querySelectorAll('.suggestion-btn');
    this.fileUploadBtn = document.getElementById('chatbot-upload-btn');
    this.fileInput = document.getElementById('chatbot-file-upload');
    this.uploadedReportIndicator = document.getElementById('uploaded-report-indicator');
    this.uploadedReportName = document.getElementById('uploaded-report-name');
    this.removeReportBtn = document.getElementById('remove-report-btn');
    
    this.isOpen = false;
    this.isMinimized = false;
    this.conversationHistory = [];
    this.uploadedReportId = null;
    this.uploadedReportFileName = null;
    
    // Common questions for quick suggestions
    this.commonQuestions = [
      "What are the symptoms of a brain tumor?",
      "What are the treatment options?",
      "How is a brain tumor diagnosed?",
      "What causes brain tumors?"
    ];
    
    this.initialize();
  }
  
  initialize() {
    // Toggle chat window
    if (this.toggleChat) {
      this.toggleChat.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      this.toggleChatWindow();
    });
      // Ensure button type is button
      this.toggleChat.setAttribute('type', 'button');
    } else {
      console.warn('Chatbot toggle button not found');
    }
    
    // Close chat
    if (this.chatbotClose) {
      this.chatbotClose.addEventListener('click', (e) => {
        e.preventDefault();
      e.stopPropagation();
      this.closeChat();
    });
      this.chatbotClose.setAttribute('type', 'button');
    }
    
    // Minimize chat
    this.chatbotMinimize?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMinimize();
    });
    
    // Send message on button click - use event delegation on the widget
    if (this.chatbotWidget) {
      // Use event delegation to catch clicks anywhere on the send button (including icon inside)
      this.chatbotWidget.addEventListener('click', (e) => {
        // Check if click is on the send button or inside it
        const sendBtn = e.target.closest('#chatbot-send') || 
                       (e.target.closest('.send-btn')) ||
                       (e.target.closest('button') && e.target.closest('button').id === 'chatbot-send') ||
                       (e.target.closest('.chatbot-input') && e.target.classList.contains('send-btn')) ||
                       (e.target.closest('.chatbot-input') && e.target.closest('button')?.id === 'chatbot-send');
        
        if (sendBtn) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Send button clicked via delegation');
          this.handleSendMessage();
          return false;
        }
      }, true);
    }
    
    // Also attach directly to the button
    if (this.chatbotSend) {
      this.chatbotSend.setAttribute('type', 'button');
      this.chatbotSend.style.cursor = 'pointer';
      this.chatbotSend.style.pointerEvents = 'auto';
      
      const self = this;
      
      // Remove all existing handlers by cloning
      const newBtn = this.chatbotSend.cloneNode(true);
      this.chatbotSend.parentNode.replaceChild(newBtn, this.chatbotSend);
      this.chatbotSend = document.getElementById('chatbot-send'); // Re-fetch after clone
      
      if (this.chatbotSend) {
        // Direct onclick handler (most reliable)
        this.chatbotSend.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Send button onclick - DIRECT');
          if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
            window.chatbot.handleSendMessage();
          } else if (self && typeof self.handleSendMessage === 'function') {
            self.handleSendMessage();
          }
          return false;
        };
        
        // AddEventListener with capture
        this.chatbotSend.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Send button addEventListener');
          if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
            window.chatbot.handleSendMessage();
          } else if (self && typeof self.handleSendMessage === 'function') {
            self.handleSendMessage();
          }
          return false;
        }, true);
        
        // Also add mousedown as backup
        this.chatbotSend.addEventListener('mousedown', function(e) {
          e.preventDefault();
        }, true);
      }
    } else {
      console.error('Chatbot send button not found');
    }
    
    // Send message on Enter key (use keydown for better compatibility)
    if (this.chatbotInput) {
      // Remove any existing listeners first
      const newInput = this.chatbotInput.cloneNode(true);
      this.chatbotInput.parentNode.replaceChild(newInput, this.chatbotInput);
      this.chatbotInput = newInput;
      
      // Add keydown handler - multiple approaches
      this.chatbotInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Enter key pressed - sending message');
          this.handleSendMessage();
          return false;
        }
      };
      
      // Also add addEventListener as backup
      this.chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          console.log('Enter key - addEventListener handler');
          this.handleSendMessage();
          return false;
        }
      }, true);
      
      // Also add keypress as another backup
      this.chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
        this.handleSendMessage();
          return false;
      }
      }, true);
    }
    
    // Add click handlers for suggestion buttons - multiple approaches
    this.suggestionButtons.forEach(button => {
      button.setAttribute('type', 'button');
      button.style.cursor = 'pointer';
      button.style.pointerEvents = 'auto';
      
      // Direct onclick handler (most reliable)
      button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        const message = button.textContent.trim();
        console.log('✅ SUGGESTION BUTTON CLICKED:', message);
        
        // Set message in input
        const input = document.getElementById('chatbot-input');
        if (input) {
          input.value = message;
        }
        
        // Send message immediately
        if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
          window.chatbot.handleSendMessage();
        } else {
          // Fallback: manually send
          console.log('Using fallback for suggestion button');
          if (input) input.value = '';
          
          // Manually add message and send
          const messagesDiv = document.getElementById('chatbot-messages');
          if (messagesDiv && message) {
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'chatbot-message user';
            userMsg.innerHTML = `
              <div class="message-avatar"><i class="fas fa-user"></i></div>
              <div class="message-content">
                <div class="message-sender">You</div>
                <div class="message-text">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `;
            messagesDiv.appendChild(userMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // Send to API
            fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message })
            })
            .then(res => res.json())
            .then(data => {
              const botMsg = document.createElement('div');
              botMsg.className = 'chatbot-message bot';
              botMsg.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                  <div class="message-sender">AI Assistant</div>
                  <div class="message-text">${data.response || data.message || 'I received your message.'}</div>
                  <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              `;
              messagesDiv.appendChild(botMsg);
              messagesDiv.scrollTop = messagesDiv.scrollHeight;
            })
            .catch(err => {
              console.error('Error sending message:', err);
            });
          }
        }
        return false;
      };
      
      // Also add addEventListener as backup
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const message = button.textContent.trim();
        console.log('Suggestion button clicked - addEventListener:', message);
        
        const input = document.getElementById('chatbot-input');
        if (input && window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
          input.value = message;
          window.chatbot.handleSendMessage();
        }
        return false;
      }, true);
    });
    
    // File upload button handler - multiple approaches for reliability
    if (this.fileUploadBtn) {
      this.fileUploadBtn.setAttribute('type', 'button');
      this.fileUploadBtn.style.cursor = 'pointer';
      this.fileUploadBtn.style.pointerEvents = 'auto';
      
      // Direct onclick handler
      this.fileUploadBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('Upload button clicked - onclick handler');
        
        if (this.fileInput) {
          this.fileInput.click();
        } else {
          // Try to find it again
          this.fileInput = document.getElementById('chatbot-file-upload');
          if (this.fileInput) {
            this.fileInput.click();
          } else {
            console.error('File input not found');
          }
        }
        return false;
      };
      
      // AddEventListener as backup
      this.fileUploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Upload button clicked - addEventListener handler');
        const fileInput = document.getElementById('chatbot-file-upload');
        if (fileInput) {
          fileInput.click();
        }
        return false;
      }, true);
    }
    
    // File input change handler
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log('File selected:', file.name);
          this.handleFileUpload(file);
        }
      });
    }
    
    // Remove report button handler
    if (this.removeReportBtn) {
      this.removeReportBtn.addEventListener('click', () => {
        this.removeUploadedReport();
      });
    }
    
    // Initial greeting - add after a small delay to ensure everything is ready
    setTimeout(() => {
      if (this.addBotMessage) {
        this.addBotMessage("Hello! I'm your AI medical assistant. I can help you with brain tumor information, symptoms, treatment options, and analysis results. You can also upload reports and ask questions about them. How can I assist you today?");
      }
    }, 200);
  }
  
  toggleChatWindow() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.chatbotWidget?.classList.add('active');
      this.chatbotInput?.focus();
      // Hide notification when chat is opened
      const notification = document.querySelector('.chat-notification');
      if (notification) {
        notification.style.display = 'none';
      }
    } else {
      this.chatbotWidget?.classList.remove('active');
    }
  }
  
  closeChat() {
    this.isOpen = false;
    this.chatbotWidget?.classList.remove('active');
  }
  
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    
    if (this.isMinimized) {
      if (this.chatbotWidget) {
        this.chatbotWidget.classList.add('minimized');
      }
      if (this.chatbotMessages) {
        this.chatbotMessages.style.display = 'none';
      }
      if (this.chatbotInput) {
        this.chatbotInput.setAttribute('disabled', 'true');
      }
    } else {
      if (this.chatbotWidget) {
        this.chatbotWidget.classList.remove('minimized');
      }
      if (this.chatbotMessages) {
        this.chatbotMessages.style.removeProperty('display');
      }
      if (this.chatbotInput) {
        this.chatbotInput.removeAttribute('disabled');
        this.chatbotInput.focus();
    }
    }
  }
  
  async handleFileUpload(file) {
    console.log('File selected:', file.name);
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size too large. Please upload a file smaller than 10MB.');
      return;
    }
    
    // Show loading
    if (this.uploadedReportIndicator) {
      this.uploadedReportIndicator.style.display = 'block';
      this.uploadedReportName.textContent = `Uploading ${file.name}...`;
    }
    
    const formData = new FormData();
    formData.append('report', file);
    
    try {
      const response = await fetch('/api/upload-report', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok && data.report_id) {
        this.uploadedReportId = data.report_id;
        this.uploadedReportFileName = file.name;
        
        if (this.uploadedReportIndicator) {
          this.uploadedReportIndicator.style.display = 'block';
          this.uploadedReportName.textContent = file.name;
        }
        
        // Show success message
        let uploadMessage = `✅ Report "${file.name}" uploaded successfully!\n\n`;
        uploadMessage += `📋 **Analyzing report...**\n\n`;
        this.addBotMessage(uploadMessage, false);
        
        // Automatically fetch and display full analysis immediately
        setTimeout(async () => {
          try {
            // Send empty message to get full analysis
            const requestBody = {
              message: '',
              conversation_history: this.conversationHistory
            };
            
            if (this.uploadedReportId) {
              requestBody.report_id = this.uploadedReportId;
            }
            
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
              const data = await response.json();
              // Display the full analysis automatically
              this.addBotMessage(data.response, false);
            }
          } catch (error) {
            console.error('Error fetching analysis:', error);
          }
        }, 500);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload report. Please try again.');
      if (this.uploadedReportIndicator) {
        this.uploadedReportIndicator.style.display = 'none';
      }
    }
  }
  
  removeUploadedReport() {
    this.uploadedReportId = null;
    this.uploadedReportFileName = null;
    if (this.fileInput) {
      this.fileInput.value = '';
    }
    if (this.uploadedReportIndicator) {
      this.uploadedReportIndicator.style.display = 'none';
    }
    this.addBotMessage('Report removed. You can upload a new report if needed.');
  }
  
  async handleSendMessage() {
    console.log('handleSendMessage called');
    
    if (!this.chatbotInput) {
      console.error('Chatbot input not found');
      // Try to find it again
      this.chatbotInput = document.getElementById('chatbot-input');
      if (!this.chatbotInput) {
        console.error('Still cannot find chatbot input');
        return;
      }
    }
    
    const message = this.chatbotInput.value.trim();
    if (!message && !this.uploadedReportId) {
      console.log('Empty message and no report, not sending');
      return;
    }

    console.log('Sending message:', message, 'with report:', this.uploadedReportId);

    // Add user message to chat (with report indicator if applicable)
    let displayMessage = message;
    if (this.uploadedReportId && !message) {
      displayMessage = `[Report: ${this.uploadedReportFileName}] Please analyze this report.`;
    } else if (this.uploadedReportId) {
      displayMessage = `${message} [Report: ${this.uploadedReportFileName}]`;
    }
    
    this.addMessage('user', displayMessage);
    this.chatbotInput.value = '';
    
    // Show typing indicator
    const typingIndicator = this.showTypingIndicator();

    try {
      // Send message to the backend with report ID if available
      const requestBody = {
        message: message || 'Please analyze this report',
        conversation_history: this.conversationHistory
      };
      
      if (this.uploadedReportId) {
        requestBody.report_id = this.uploadedReportId;
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      // Remove typing indicator
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }

      if (response.ok) {
        const data = await response.json();
        this.addMessage('bot', data.response);
        
        // Clear uploaded report indicator after sending message
        // This prevents the report from persisting in subsequent messages
        // User can upload a new report if needed for follow-up questions
        const currentReportId = this.uploadedReportId; // Save for this message
        this.uploadedReportId = null;
        this.uploadedReportFileName = null;
        if (this.uploadedReportIndicator) {
          this.uploadedReportIndicator.style.display = 'none';
        }
        if (this.fileInput) {
          this.fileInput.value = '';
        }
      } else {
        throw new Error('Failed to get response from server');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
      
      // Remove typing indicator if still present
      if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.parentNode.removeChild(typingIndicator);
      }
    }
  }
  
  addMessage(sender, message, isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    const senderName = document.createElement('div');
    senderName.className = 'message-sender';
    senderName.textContent = sender === 'bot' ? 'AI Assistant' : 'You';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    
    if (isHtml) {
      messageText.innerHTML = message;
    } else {
      messageText.textContent = message;
    }
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = this.getCurrentTime();
    
    content.appendChild(senderName);
    content.appendChild(messageText);
    content.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    this.chatbotMessages?.appendChild(messageDiv);
    this.scrollToBottom();
    
    return messageDiv;
  }
  
  addUserMessage(message) {
    this.addMessage('user', message);
  }
  
  addBotMessage(message, isHtml = false) {
    return this.addMessage('bot', message, isHtml);
  }
  
  showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message bot';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.appendChild(indicator);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    this.chatbotMessages?.appendChild(messageDiv);
    this.scrollToBottom();
    
    return messageDiv;
  }
  
  removeTypingIndicator(indicator) {
    indicator?.remove();
  }
  
  scrollToBottom() {
    if (this.chatbotMessages) {
      this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }
  }
  
  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  generateBotResponse(userMessage) {
    // Simple response logic - in a real app, this would call an AI API
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      this.addBotMessage("Hello! I'm your AI medical assistant. How can I help you with brain tumor analysis today?");
    } else if (lowerMessage.includes('symptom')) {
      this.addBotMessage("Common symptoms of brain tumors may include:\n\n" +
        "• Headaches that are worse in the morning\n" +
        "• Seizures\n" +
        "• Nausea or vomiting\n" +
        "• Vision or hearing problems\n" +
        "• Personality or behavior changes\n" +
        "• Difficulty with balance or walking\n" +
        "• Memory problems\n\n" +
        "However, these symptoms can also be caused by other conditions. Please consult a healthcare professional for a proper diagnosis.");
    } else if (lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
      this.addBotMessage("Treatment for brain tumors depends on several factors including the type, size, and location of the tumor, as well as the patient's overall health. Common treatment options include:\n\n" +
        "• <strong>Surgery</strong>: To remove as much of the tumor as possible\n" +
        "• <strong>Radiation therapy</strong>: Using high-energy beams to kill tumor cells\n" +
        "• <strong>Chemotherapy</strong>: Using drugs to kill tumor cells\n" +
        "• <strong>Targeted drug therapy</strong>: Focusing on specific abnormalities in cancer cells\n" +
        "• <strong>Immunotherapy</strong>: Helping the immune system fight cancer\n\n" +
        "A team of specialists will determine the best treatment plan for each individual case.", true);
    } else if (lowerMessage.includes('mri') || lowerMessage.includes('scan') || lowerMessage.includes('result')) {
      this.addBotMessage("I can help you understand MRI results. Please note that I can provide general information but cannot diagnose. A qualified radiologist should interpret your specific MRI results.\n\n" +
        "Common MRI findings for brain tumors may include:\n" +
        "• Abnormal masses or growths\n" +
        "• Changes in brain tissue density\n" +
        "• Swelling or edema around the tumor\n" +
        "• Shifts in brain structures\n\n" +
        "Would you like me to explain any specific terms from your MRI report?");
    } else if (lowerMessage.includes('thank')) {
      this.addBotMessage("You're welcome! If you have any more questions about brain tumors or need further assistance, feel free to ask.");
    } else {
      // Default response for unrecognized queries
      this.addBotMessage("I'm here to help with brain tumor-related questions. You can ask me about:\n\n" +
        "• Brain tumor symptoms\n" +
        "• Diagnosis methods\n" +
        "• Treatment options\n" +
        "• Understanding MRI results\n" +
        "• And more...\n\n" +
        "How can I assist you today?");
    }
  }
}

// Initialize the chatbot when the DOM is fully loaded
function initializeChatbot() {
  // Only initialize if the required elements exist
  const chatbotWidget = document.getElementById('chatbot-widget');
  const chatbotSend = document.getElementById('chatbot-send');
  const toggleButton = document.getElementById('toggle-chat');
  
  if (chatbotWidget) {
    try {
    const chatbot = new Chatbot();
    
    // Make chatbot globally available for debugging
    window.chatbot = chatbot;
      console.log('Chatbot initialized successfully');
    } catch (error) {
      console.error('Error initializing chatbot:', error);
    }
    
    // Ultimate fix: Re-initialize ALL buttons after a delay to ensure they exist
    setTimeout(() => {
      // Re-initialize suggestion buttons
      const suggestionButtons = document.querySelectorAll('.suggestion-btn');
      suggestionButtons.forEach(btn => {
        btn.setAttribute('type', 'button');
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        
        btn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          const message = btn.textContent.trim();
          console.log('✅ SUGGESTION BUTTON CLICKED - DELAYED HANDLER:', message);
          
          const input = document.getElementById('chatbot-input');
          if (input && message) {
            input.value = message;
            if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
              window.chatbot.handleSendMessage();
            }
          }
          return false;
        };
      });
      console.log(`✅ ${suggestionButtons.length} suggestion buttons initialized`);
      
      // Re-initialize send button
      const sendBtn = document.getElementById('chatbot-send');
      if (sendBtn) {
        sendBtn.setAttribute('type', 'button');
        sendBtn.style.cursor = 'pointer';
        sendBtn.style.pointerEvents = 'auto';
        sendBtn.style.zIndex = '9999';
        sendBtn.style.position = 'relative';
        
        // Direct onclick - most reliable
        sendBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('✅ SEND BUTTON CLICKED - ULTIMATE HANDLER');
          
          const input = document.getElementById('chatbot-input');
          if (input) {
            const message = input.value.trim();
            if (message || (window.chatbot && window.chatbot.uploadedReportId)) {
              if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
                window.chatbot.handleSendMessage();
              } else {
                // Manual fallback
                console.log('Manual send:', message);
                input.value = '';
              }
            }
          }
          return false;
        };
        
        console.log('✅ Send button fully initialized');
      }
      
      // Re-initialize upload button
      const uploadBtn = document.getElementById('chatbot-upload-btn');
      const fileInput = document.getElementById('chatbot-file-upload');
      if (uploadBtn && fileInput) {
        uploadBtn.setAttribute('type', 'button');
        uploadBtn.style.cursor = 'pointer';
        uploadBtn.style.pointerEvents = 'auto';
        
        uploadBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('✅ UPLOAD BUTTON CLICKED - ULTIMATE HANDLER');
          fileInput.click();
          return false;
        };
        
        console.log('✅ Upload button fully initialized');
      }
    }, 500);
    
    // Also ensure toggle button works
    if (toggleButton) {
      toggleButton.setAttribute('type', 'button');
      
      // Add direct onclick handler for toggle button
      toggleButton.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Toggle button clicked (direct handler)');
        const widget = document.getElementById('chatbot-widget');
        if (widget) {
          widget.classList.toggle('active');
          if (widget.classList.contains('active')) {
            const input = document.getElementById('chatbot-input');
            if (input) input.focus();
          }
        }
        // Also try the class method if available
        if (window.chatbot && typeof window.chatbot.toggleChatWindow === 'function') {
          window.chatbot.toggleChatWindow();
        }
      };
      
      console.log('Chatbot toggle button initialized');
    }
  } else {
    console.warn('Chatbot widget not found - will retry');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  // DOM is already loaded
  setTimeout(initializeChatbot, 100);
}

// Ultimate fallback: Document-level event delegation for ALL chatbot buttons
// This catches clicks even if other handlers fail
document.addEventListener('click', function(e) {
  // Check if click is on suggestion button
  const suggestionBtn = e.target.closest('.suggestion-btn') ||
                        (e.target.closest('button') && e.target.closest('button').classList.contains('suggestion-btn'));
  
  if (suggestionBtn) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const message = suggestionBtn.textContent.trim();
    console.log('✅ SUGGESTION BUTTON CLICKED - DOCUMENT DELEGATION:', message);
    
    const input = document.getElementById('chatbot-input');
    if (input && message) {
      input.value = message;
      
      // Send message
      if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
        window.chatbot.handleSendMessage();
      } else {
        // Fallback: manually send
        input.value = '';
        const messagesDiv = document.getElementById('chatbot-messages');
        if (messagesDiv) {
          const userMsg = document.createElement('div');
          userMsg.className = 'chatbot-message user';
          userMsg.innerHTML = `
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
              <div class="message-sender">You</div>
              <div class="message-text">${message}</div>
              <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          `;
          messagesDiv.appendChild(userMsg);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
          
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          })
          .then(res => res.json())
          .then(data => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chatbot-message bot';
            botMsg.innerHTML = `
              <div class="message-avatar"><i class="fas fa-robot"></i></div>
              <div class="message-content">
                <div class="message-sender">AI Assistant</div>
                <div class="message-text">${data.response || data.message || 'I received your message.'}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `;
            messagesDiv.appendChild(botMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          })
          .catch(err => console.error('Error:', err));
        }
      }
    }
    return false;
  }
  
  // Check if click is on upload button (paperclip icon)
  const uploadBtn = e.target.closest('#chatbot-upload-btn') ||
                    (e.target.closest('button') && e.target.closest('button').id === 'chatbot-upload-btn') ||
                    (e.target.classList.contains('fa-paperclip') && e.target.closest('#chatbot-upload-btn'));
  
  if (uploadBtn) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log('✅ UPLOAD BUTTON CLICKED - DOCUMENT DELEGATION');
    
    const fileInput = document.getElementById('chatbot-file-upload');
    if (fileInput) {
      fileInput.click();
    } else {
      console.error('File input not found');
    }
    return false;
  }
  
  // Check if click is on send button (including icon inside it)
  const sendBtn = e.target.closest('#chatbot-send') || 
                  (e.target.closest('.send-btn') && e.target.closest('.send-btn').id === 'chatbot-send') ||
                  (e.target.closest('.chatbot-input') && e.target.closest('button')?.id === 'chatbot-send') ||
                  (e.target.classList.contains('fa-paper-plane') && e.target.closest('#chatbot-send'));
  
  if (sendBtn) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log('✅ SEND BUTTON CLICKED - DOCUMENT DELEGATION');
    
    const input = document.getElementById('chatbot-input');
    if (input && input.value.trim()) {
      const message = input.value.trim();
      
      if (window.chatbot && typeof window.chatbot.handleSendMessage === 'function') {
        window.chatbot.handleSendMessage();
      } else {
        // Fallback: manually send message
        console.log('Using fallback send handler');
        input.value = '';
        
        // Add user message to chat
        const messagesDiv = document.getElementById('chatbot-messages');
        if (messagesDiv) {
          const userMsg = document.createElement('div');
          userMsg.className = 'chatbot-message user';
          userMsg.innerHTML = `
            <div class="message-avatar"><i class="fas fa-user"></i></div>
            <div class="message-content">
              <div class="message-sender">You</div>
              <div class="message-text">${message}</div>
              <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          `;
          messagesDiv.appendChild(userMsg);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
          
          // Send to API
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
          })
          .then(res => res.json())
          .then(data => {
            const botMsg = document.createElement('div');
            botMsg.className = 'chatbot-message bot';
            botMsg.innerHTML = `
              <div class="message-avatar"><i class="fas fa-robot"></i></div>
              <div class="message-content">
                <div class="message-sender">AI Assistant</div>
                <div class="message-text">${data.response || data.message || 'I received your message.'}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `;
            messagesDiv.appendChild(botMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          })
          .catch(err => {
            console.error('Error sending message:', err);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chatbot-message bot';
            errorMsg.innerHTML = `
              <div class="message-avatar"><i class="fas fa-robot"></i></div>
              <div class="message-content">
                <div class="message-sender">AI Assistant</div>
                <div class="message-text">Sorry, I encountered an error. Please try again.</div>
                <div class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `;
            messagesDiv.appendChild(errorMsg);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
          });
        }
      }
    }
    return false;
  }
}, true); // Use capture phase
