// Options page script for AnkiChrome extension
document.addEventListener('DOMContentLoaded', function() {
    console.log('AnkiChrome options page loaded');
    
    // Initialize options page
    initializeOptions();
    
    // Load current settings
    loadOptions();
    
    // Set up event listeners
    setupEventListeners();
});

function initializeOptions() {
    // Set default values
    const defaults = {
        enabled: true,
        autoSync: false,
        syncInterval: 300000,
        ankiEndpoint: 'http://localhost:8765',
        defaultDeck: 'Default',
        defaultModel: 'Basic',
        showFloatingButton: true,
        contextMenu: true,
        keyboardShortcuts: true
    };
    
    // Store defaults if not already set
    chrome.storage.local.get(Object.keys(defaults), function(result) {
        const missingDefaults = {};
        Object.keys(defaults).forEach(key => {
            if (result[key] === undefined) {
                missingDefaults[key] = defaults[key];
            }
        });
        
        if (Object.keys(missingDefaults).length > 0) {
            chrome.storage.local.set(missingDefaults);
        }
    });
}

function loadOptions() {
    chrome.storage.local.get([
        'enabled', 'autoSync', 'syncInterval', 'ankiEndpoint', 
        'defaultDeck', 'defaultModel', 'showFloatingButton', 
        'contextMenu', 'keyboardShortcuts'
    ], function(result) {
        // Set form values
        document.getElementById('enable-extension').checked = result.enabled !== false;
        document.getElementById('auto-sync').checked = result.autoSync || false;
        document.getElementById('sync-interval').value = result.syncInterval || 300000;
        document.getElementById('anki-endpoint').value = result.ankiEndpoint || 'http://localhost:8765';
        document.getElementById('default-deck').value = result.defaultDeck || 'Default';
        document.getElementById('default-model').value = result.defaultModel || 'Basic';
        document.getElementById('show-floating-button').checked = result.showFloatingButton !== false;
        document.getElementById('context-menu').checked = result.contextMenu !== false;
        document.getElementById('keyboard-shortcuts').checked = result.keyboardShortcuts !== false;
    });
}

function setupEventListeners() {
    // Save options button
    document.getElementById('save-options').addEventListener('click', saveOptions);
    
    // Reset options button
    document.getElementById('reset-options').addEventListener('click', resetOptions);
    
    // Export data button
    document.getElementById('export-data').addEventListener('click', exportData);
    
    // Import data button
    document.getElementById('import-data').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    
    // Import file input
    document.getElementById('import-file').addEventListener('change', importData);
    
    // Clear data button
    document.getElementById('clear-data').addEventListener('click', clearData);
    
    // Auto sync toggle
    document.getElementById('auto-sync').addEventListener('change', function() {
        const syncInterval = document.getElementById('sync-interval');
        syncInterval.disabled = !this.checked;
    });
}

function saveOptions() {
    const options = {
        enabled: document.getElementById('enable-extension').checked,
        autoSync: document.getElementById('auto-sync').checked,
        syncInterval: parseInt(document.getElementById('sync-interval').value),
        ankiEndpoint: document.getElementById('anki-endpoint').value.trim(),
        defaultDeck: document.getElementById('default-deck').value.trim(),
        defaultModel: document.getElementById('default-model').value.trim(),
        showFloatingButton: document.getElementById('show-floating-button').checked,
        contextMenu: document.getElementById('context-menu').checked,
        keyboardShortcuts: document.getElementById('keyboard-shortcuts').checked
    };
    
    // Validate options
    if (!options.ankiEndpoint) {
        showMessage('AnkiConnect endpoint is required', 'error');
        return;
    }
    
    if (!options.defaultDeck) {
        showMessage('Default deck name is required', 'error');
        return;
    }
    
    if (!options.defaultModel) {
        showMessage('Default note type is required', 'error');
        return;
    }
    
    // Save options
    chrome.storage.local.set(options, function() {
        showMessage('Options saved successfully!', 'success');
        
        // Update background script
        chrome.runtime.sendMessage({
            action: 'optionsUpdated',
            options: options
        });
    });
}

function resetOptions() {
    if (confirm('Are you sure you want to reset all options to their default values?')) {
        chrome.storage.local.clear(function() {
            initializeOptions();
            loadOptions();
            showMessage('Options reset to defaults', 'info');
        });
    }
}

function exportData() {
    chrome.storage.local.get(null, function(data) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ankichrome-data.json';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showMessage('Data exported successfully', 'success');
    });
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (typeof data !== 'object' || data === null) {
                throw new Error('Invalid data format');
            }
            
            // Import data
            chrome.storage.local.set(data, function() {
                showMessage('Data imported successfully', 'success');
                loadOptions();
                
                // Update background script
                chrome.runtime.sendMessage({
                    action: 'optionsUpdated',
                    options: data
                });
            });
            
        } catch (error) {
            showMessage('Error importing data: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        chrome.storage.local.clear(function() {
            showMessage('All data cleared', 'info');
            loadOptions();
            
            // Update background script
            chrome.runtime.sendMessage({
                action: 'dataCleared'
            });
        });
    }
}

function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    // Insert at top of content
    const content = document.querySelector('.options-content');
    content.insertBefore(messageEl, content.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateOptions') {
        loadOptions();
    }
}); 