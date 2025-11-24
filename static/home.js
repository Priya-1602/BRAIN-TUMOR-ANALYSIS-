// home.js - Home page specific functionality

// Setup header navigation for home page
document.addEventListener('DOMContentLoaded', function() {
  // Setup AI Assistant link on home page
  const aiAssistantLink = document.getElementById('home-ai-assistant-link');
  if (aiAssistantLink) {
    aiAssistantLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('AI Assistant link clicked on home page');
      const chatWidget = document.getElementById('chatbot-widget');
      if (chatWidget) {
        chatWidget.classList.add('active');
        const chatInput = document.getElementById('chatbot-input');
        if (chatInput) chatInput.focus();
      }
    });
    console.log('Home page AI Assistant link handler attached');
  }
  
  // Setup active state for Dashboard link
  const currentPath = window.location.pathname;
  const dashboardLink = document.querySelector('.nav-links a[href="/"]');
  const analysisLink = document.querySelector('.nav-links a[href="/analysis"]');
  
  if (dashboardLink && (currentPath === '/' || currentPath === '')) {
    dashboardLink.classList.add('active');
  }
  if (analysisLink && currentPath === '/analysis') {
    analysisLink.classList.add('active');
  }
  
  // Accordion functionality
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const accordionItem = this.parentElement;
      const isActive = accordionItem.classList.contains('active');
      
      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Open clicked item if it wasn't active
      if (!isActive) {
        accordionItem.classList.add('active');
      }
    });
  });
});
