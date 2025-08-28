// Background service worker for AnkiChrome extension
console.log('AnkiChrome background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AnkiChrome extension installed');
    // Initialize default settings
    chrome.storage.local.set({
      
      autoSync: false,
      syncInterval: 300000, // 5 minutes
      ankiEndpoint: 'http://localhost:8765'
    });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  switch (request.action) {
    case 'getStatus':
      sendResponse({ status: 'active' });
      break;
      
    
      
    case 'getSettings':
      chrome.storage.local.get(['autoSync', 'syncInterval'], (result) => {
        sendResponse(result);
      });
      return true;
      
    case 'getDecks':
      getDecks().then(sendResponse);
      return true;
      
    case 'getModels':
      getModels().then(sendResponse);
      return true;
      
    case 'createCard':
      createCard(request.data).then(sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('Tab updated:', tab.url);
    // You can add logic here to handle page loads
  }
});

// AnkiConnect API functions
async function getDecks() {
  try {
    const settings = await chrome.storage.local.get(['ankiEndpoint']);
    const endpoint = settings.ankiEndpoint || 'http://localhost:8765';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deckNames',
        version: 6
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const decks = data.result.map(name => ({ name }));
      return { success: true, decks };
    } else {
      return { success: false, error: 'HTTP ' + response.status + ': ' + response.statusText };
    }
  } catch (error) {
    console.error('Failed to get decks:', error);
    return { success: false, error: error.message };
  }
}

async function getModels() {
  try {
    const settings = await chrome.storage.local.get(['ankiEndpoint']);
    const endpoint = settings.ankiEndpoint || 'http://localhost:8765';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'modelNames',
        version: 6
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const modelNames = data.result;
      
      // Get detailed model information for each model
      const models = [];
      for (const modelName of modelNames) {
        const modelResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'modelFieldNames',
            version: 6,
            params: { modelName }
          })
        });
        
        if (modelResponse.ok) {
          const modelData = await modelResponse.json();
          models.push({
            name: modelName,
            fields: modelData.result.map(fieldName => ({ name: fieldName }))
          });
        }
      }
      
      return { success: true, models };
    } else {
      return { success: false, error: 'HTTP ' + response.status + ': ' + response.statusText };
    }
  } catch (error) {
    console.error('Failed to get models:', error);
    return { success: false, error: error.message };
  }
}

async function createCard(cardData) {
  try {
    const settings = await chrome.storage.local.get(['ankiEndpoint']);
    const endpoint = settings.ankiEndpoint || 'http://localhost:8765';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
          note: {
            deckName: cardData.deckName,
            modelName: cardData.modelName,
            fields: cardData.fields,
            tags: ['ankichrome']
          }
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.result) {
        // Update statistics
        updateCardStats();
        return { success: true, noteId: data.result };
      } else {
        return { success: false, error: 'Failed to create note' };
      }
    } else {
      return { success: false, error: 'HTTP ' + response.status + ': ' + response.statusText };
    }
  } catch (error) {
    console.error('Failed to create card:', error);
    return { success: false, error: error.message };
  }
}

async function updateCardStats() {
  try {
    const stats = await chrome.storage.local.get(['totalCards', 'todayCards']);
    const today = new Date().toDateString();
    
    let totalCards = (stats.totalCards || 0) + 1;
    let todayCards = stats.todayCards || 0;
    
    // Check if it's a new day
    if (stats.lastCardDate !== today) {
      todayCards = 1;
    } else {
      todayCards += 1;
    }
    
    await chrome.storage.local.set({
      totalCards,
      todayCards,
      lastCardDate: today
    });
  } catch (error) {
    console.error('Failed to update card stats:', error);
  }
} 