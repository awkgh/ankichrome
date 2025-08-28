// Content script for AnkiChrome extension
console.log('AnkiChrome content script loaded');

// Initialize content script
(function() {
    'use strict';
    
    // Check if extension is enabled
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
        if (response && response.enabled) {
            initializeContentScript();
        }
    });
    
    function initializeContentScript() {
        console.log('Initializing AnkiChrome content script');
        
        // Listen for page content changes
        observePageChanges();
        
        // Add keyboard shortcuts for quick access
        addKeyboardShortcuts();
    }
    
    function observePageChanges() {
        // Observe DOM changes for dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Handle new content being added
                    console.log('Page content changed');
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Shift+A to open extension popup
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                // Trigger extension popup
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }
        });
    }
    
})(); 