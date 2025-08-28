// Popup script for AnkiChrome extension
document.addEventListener('DOMContentLoaded', function() {
    console.log('AnkiChrome popup loaded');
    
    // Initialize popup
    initializePopup();
    
    // Load decks and restore last selections
    loadDecksAndRestoreSelections();
});

let currentDeck = null;
let currentModel = null;
let availableDecks = [];
let availableModels = [];

function initializePopup() {
    // Extension toggle
    const extensionToggle = document.getElementById('extension-toggle');
    extensionToggle.addEventListener('change', function() {
        toggleExtension(this.checked);
    });
    
    // Deck selection
    document.getElementById('deck-select').addEventListener('change', handleDeckSelection);
    
    // Model selection
    document.getElementById('model-select').addEventListener('change', handleModelSelection);
    
    // Continue button
    document.getElementById('continue-to-card').addEventListener('click', showCardCreation);
    
    // Navigation buttons
    document.getElementById('back-to-selection').addEventListener('click', () => showStep('step-selection'));
    
    // Card creation
    document.getElementById('create-card-btn').addEventListener('click', createCard);

    // Footer buttons (guarded)
    const btnOptions = document.getElementById('open-options');
    if (btnOptions) btnOptions.addEventListener('click', openOptions);
    const btnAnki = document.getElementById('open-anki');
    if (btnAnki) btnAnki.addEventListener('click', openAnki);
}

function loadDecksAndRestoreSelections() {
    console.log('Loading decks and restoring selections...');
    
    chrome.runtime.sendMessage({
        action: 'getDecks'
    }, function(response) {
        console.log('Decks response:', response);
        
        if (response && response.success) {
            availableDecks = response.decks;
            console.log('Decks loaded:', availableDecks);
            populateDeckDropdown();
            
            // Restore last selections and decide which step to show
            restoreLastSelections();
        } else {
            const errorMsg = response ? response.error : 'Failed to load decks';
            console.error('Failed to load decks:', errorMsg);
            showError(`Failed to load decks: ${errorMsg}`);
        }
    });
}

function populateDeckDropdown() {
    const deckSelect = document.getElementById('deck-select');
    deckSelect.innerHTML = '<option value="">Select a deck...</option>';
    
    availableDecks.forEach(deck => {
        const option = document.createElement('option');
        option.value = deck.name;
        option.textContent = deck.name;
        deckSelect.appendChild(option);
    });
}

function restoreLastSelections() {
    chrome.storage.local.get(['lastDeck', 'lastModel'], function(result) {
        if (result.lastDeck && result.lastModel) {
            const deckSelect = document.getElementById('deck-select');
            deckSelect.value = result.lastDeck;
            currentDeck = availableDecks.find(deck => deck.name === result.lastDeck);

            if (currentDeck) {
                // Deck exists, now check model
                loadModelsAndRestoreModel(result.lastModel, true); // Pass a flag to show card creation
            } else {
                // Saved deck doesn't exist anymore
                showStep('step-selection');
            }
        } else {
            // No saved deck or model
            showStep('step-selection');
        }
    });
}

function handleDeckSelection() {
    const deckSelect = document.getElementById('deck-select');
    const selectedDeckName = deckSelect.value;
    
    if (selectedDeckName) {
        currentDeck = availableDecks.find(deck => deck.name === selectedDeckName);
        
        // Save selection to storage
        chrome.storage.local.set({ lastDeck: selectedDeckName });
        
        // Load models for the selected deck
        loadModels();
        
        // Clear model selection when deck changes
        currentModel = null;
        document.getElementById('model-select').value = '';
        updateContinueButton('continue-to-card', false);
    } else {
        currentDeck = null;
        currentModel = null;
        updateContinueButton('continue-to-card', false);
    }
}

function loadModels() {
    console.log('Loading models...');
    
    chrome.runtime.sendMessage({
        action: 'getModels'
    }, function(response) {
        console.log('Models response:', response);
        
        if (response && response.success) {
            availableModels = response.models;
            console.log('Models loaded:', availableModels);
            populateModelDropdown();
        } else {
            const errorMsg = response ? response.error : 'Failed to load models';
            console.error('Failed to load models:', errorMsg);
            showError(`Failed to load models: ${errorMsg}`);
        }
    });
}

function loadModelsAndRestoreModel(lastModelName, showCardUI = false) {
    console.log('Loading models and restoring model selection...');
    
    chrome.runtime.sendMessage({
        action: 'getModels'
    }, function(response) {
        console.log('Models response:', response);
        
        if (response && response.success) {
            availableModels = response.models;
            console.log('Models loaded:', availableModels);
            populateModelDropdown();
            
            // Restore model selection
            if (lastModelName) {
                const modelSelect = document.getElementById('model-select');
                modelSelect.value = lastModelName;
                currentModel = availableModels.find(model => model.name === lastModelName);
                
                if (currentModel) {
                    updateContinueButton('continue-to-card', true);
                    if (showCardUI) {
                        showCardCreation();
                    }
                } else if (showCardUI) {
                    // Saved model doesn't exist anymore
                    showStep('step-selection');
                }
            } else if (showCardUI) {
                showStep('step-selection');
            }
        } else {
            const errorMsg = response ? response.error : 'Failed to load models';
            console.error('Failed to load models:', errorMsg);
            showError(`Failed to load models: ${errorMsg}`);
            if (showCardUI) {
                showStep('step-selection');
            }
        }
    });
}

function populateModelDropdown() {
    const modelSelect = document.getElementById('model-select');
    modelSelect.innerHTML = '<option value="">Select a note type...</option>';
    
    availableModels.forEach(model => {
        const option = document.createElement('option');
        option.value = model.name;
        option.textContent = model.name;
        modelSelect.appendChild(option);
    });
}

function handleModelSelection() {
    const modelSelect = document.getElementById('model-select');
    const selectedModelName = modelSelect.value;
    
    if (selectedModelName) {
        currentModel = availableModels.find(model => model.name === selectedModelName);
        
        // Save selection to storage
        chrome.storage.local.set({ lastModel: selectedModelName });
        
        updateContinueButton('continue-to-card', true);
    } else {
        currentModel = null;
        updateContinueButton('continue-to-card', false);
    }
}

function updateContinueButton(buttonId, enabled) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = !enabled;
    }
}

function showCardCreation() {
    if (!currentDeck || !currentModel) {
        return;
    }
    
    // Update UI to show selected deck and model
    document.getElementById('card-deck-name').textContent = currentDeck.name;
    document.getElementById('card-model-name').textContent = currentModel.name;
    
    // Create form fields based on the model
    createCardFields();
    
    showStep('step-card');
}

function handleFieldToggle(event) {
    const toggle = event.target;
    const titleRow = toggle.closest('.field-title');
    if (!titleRow) return;
    const content = titleRow.nextElementSibling;
    if (!content || !content.classList.contains('field-content')) return;

    const fieldName = titleRow.querySelector('h4')?.textContent || '';

    if (toggle.checked) {
        content.classList.remove('hidden');
    } else {
        content.classList.add('hidden');
    }

    // Save user preference for this specific field
    chrome.storage.local.set({ [`showField_${fieldName}`]: toggle.checked });
}

// Helper to generate safe DOM ids from field names
function toSafeId(name) {
    return String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function restoreFieldVisibility(fieldName) {
    chrome.storage.local.get([`showField_${fieldName}`], function(result) {
        const safe = toSafeId(fieldName);
        const titleRow = document.getElementById(`field-title-${safe}`);
        const content = document.getElementById(`field-content-${safe}`);
        if (!titleRow || !content) return;

        const toggle = titleRow.querySelector('input[type="checkbox"]');
        const shouldShow = result[`showField_${fieldName}`] !== undefined ? result[`showField_${fieldName}`] : true;

        if (toggle) toggle.checked = shouldShow;
        if (shouldShow) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}

function restoreFieldsVisibility() {
    chrome.storage.local.get(['showFields'], function(result) {
        const toggle = document.getElementById('show-fields-toggle');
        const fieldsContainer = document.getElementById('card-fields-container');
        
        // Default to showing fields if no preference is saved
        const shouldShowFields = result.showFields !== undefined ? result.showFields : true;
        
        toggle.checked = shouldShowFields;
        
        if (shouldShowFields) {
            fieldsContainer.classList.remove('hidden');
        } else {
            fieldsContainer.classList.add('hidden');
        }
    });
}

function createCardFields() {
    const container = document.getElementById('card-fields-container');
    container.innerHTML = '';

    if (!currentModel || !currentModel.fields) {
        return;
    }

    currentModel.fields.forEach(field => {
        const safe = toSafeId(field.name);
        // Title row with field name and tiny switch
        const titleRow = document.createElement('div');
        titleRow.className = 'field-title';
        titleRow.id = `field-title-${safe}`;

        const fieldNameEl = document.createElement('h4');
        fieldNameEl.textContent = field.name;

        const fieldToggle = document.createElement('label');
        fieldToggle.className = 'field-toggle';

        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.checked = true; // Default to showing
        toggleInput.addEventListener('change', handleFieldToggle);

        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'field-toggle-slider';

        fieldToggle.appendChild(toggleInput);
        fieldToggle.appendChild(toggleSlider);

        titleRow.appendChild(fieldNameEl);
        titleRow.appendChild(fieldToggle);

        // Content area (input/textarea)
        const fieldContent = document.createElement('div');
        fieldContent.className = 'field-content';
        fieldContent.id = `field-content-${safe}`;

        const label = document.createElement('label');
        label.className = 'field-label';
        label.textContent = field.name;

        let input;
        if (field.name.toLowerCase().includes('note') || field.name.toLowerCase().includes('back')) {
            input = document.createElement('textarea');
            input.className = 'field-textarea';
        } else {
            input = document.createElement('input');
            input.className = 'field-input';
            input.type = 'text';
        }

        input.id = `field-${safe}`;
        input.placeholder = `Enter ${field.name.toLowerCase()}`;

        fieldContent.appendChild(label);
        fieldContent.appendChild(input);

        container.appendChild(titleRow);
        container.appendChild(fieldContent);

        // Restore per-field visibility preference
        restoreFieldVisibility(field.name);
    });
}

function createCard() {
    if (!currentDeck || !currentModel) {
        return;
    }
    
    // Collect field values (no validation required)
    const fieldValues = {};
    
    currentModel.fields.forEach(field => {
        const safe = toSafeId(field.name);
        const input = document.getElementById(`field-${safe}`);
        if (input) {
            const value = input.value.trim();
            fieldValues[field.name] = value; // Allow empty values
            input.style.borderColor = '#ced4da'; // Reset border color
        }
    });
    
    // Show loading state
    const createBtn = document.getElementById('create-card-btn');
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<span class="loading-spinner"></span> Creating...';
    createBtn.disabled = true;
    
    // Create the card
    chrome.runtime.sendMessage({
        action: 'createCard',
        data: {
            deckName: currentDeck.name,
            modelName: currentModel.name,
            fields: fieldValues
        }
    }, function(response) {
        // Reset button state
        createBtn.innerHTML = originalText;
        createBtn.disabled = false;
        
        if (response && response.success) {
            // Card created successfully
            alert('Card created successfully!');
            
            // Clear form and go back to selection
            clearForm();
            showStep('step-selection');
        } else {
            // Error creating card
            const error = (response && response.error) || 'Unknown error';
            alert('Failed to create card: ' + error);
        }
    });
}

function clearForm() {
    // Clear all input fields
    const inputs = document.querySelectorAll('#card-fields-container input[type="text"], #card-fields-container textarea');
    inputs.forEach(input => {
        input.value = '';
        input.style.borderColor = '#ced4da';
    });
    
    // Maintain individual field toggle states
    // Don't reset the toggles - let user keep their preferences
}

function showStep(stepId) {
    // Hide all steps
    const steps = document.querySelectorAll('.step-container');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Show the specified step
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
    }
}

function showError(message) {
    // Show error in a simple alert for now
    alert('Error: ' + message);
}

function toggleExtension(enabled) {
    chrome.runtime.sendMessage({
        action: 'toggleExtension'
    }, function(response) {
        if (response && response.enabled !== undefined) {
            document.getElementById('extension-toggle').checked = response.enabled;
        }
    });
}

function openOptions() {
    chrome.runtime.openOptionsPage();
}

function openAnki() {
    // Open Anki application or web interface
    chrome.tabs.create({
        url: 'http://localhost:8765' // Default AnkiConnect endpoint
    });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'connectionStatus') {
        if (request.connected) {
            loadDecksAndRestoreSelections();
        } else {
            showError('Connection lost');
        }
    }
}); 