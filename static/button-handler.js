// button-handler.js
console.log('Button handler script loaded!');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, setting up button handlers...');

    // Event delegation for action buttons
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.action-button');
        if (!button) return;
        
        e.preventDefault();
        
        // Show loading state
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.style.pointerEvents = 'none';
        
        // Handle based on button action
        const action = button.getAttribute('data-action');
        console.log('Button clicked:', action);
        
        setTimeout(() => {
            if (action === 'dashboard') {
                console.log('Navigating to dashboard...');
                window.location.href = '/dashboard';
            } else if (action === 'chat') {
                console.log('Opening chat...');
                const chatWidget = document.getElementById('chatbot-widget');
                if (chatWidget) {
                    chatWidget.classList.toggle('active');
                    const chatInput = document.getElementById('chatbot-input');
                    if (chatInput) chatInput.focus();
                } else {
                    window.location.href = '/chat';
                }
            }
            
            // Reset button after a short delay
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.pointerEvents = 'auto';
            }, 1000);
        }, 500);
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.action-button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseover', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
        });
        
        btn.addEventListener('mouseout', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    });
    
    console.log('Button handlers initialized successfully');
});
