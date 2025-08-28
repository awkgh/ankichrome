# Development Guide

This document provides guidance for developers working on the AnkiChrome extension.

## Development Setup

### Prerequisites

1. **Chrome Browser**: Latest stable version
2. **Anki**: Install Anki and the AnkiConnect addon
3. **Code Editor**: VS Code, Sublime Text, or your preferred editor
4. **Git**: For version control

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ankichrome.git
   cd ankichrome
   ```

2. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Project Structure

### Core Files

- **`manifest.json`**: Extension configuration and permissions
- **`background.js`**: Service worker for background tasks
- **`content.js`**: Script injected into web pages
- **`popup.html/js/css`**: Extension popup interface
- **`options.html/js/css`**: Settings and configuration page

### Key Components

#### Background Script (`background.js`)
- Handles extension lifecycle
- Manages communication between components
- Stores and retrieves settings
- Handles AnkiConnect API calls

#### Content Script (`content.js`)
- Injected into web pages
- Adds floating action button
- Handles text selection
- Manages page interactions

#### Popup (`popup.html/js/css`)
- Quick access interface
- Shows statistics
- Provides quick actions
- Displays recent items

#### Options (`options.html/js/css`)
- Comprehensive settings
- Data import/export
- Anki configuration
- Extension preferences

## Development Workflow

### Making Changes

1. **Edit Source Files**: Modify HTML, CSS, or JavaScript files
2. **Reload Extension**: Click the refresh button on the extension in Chrome
3. **Test Changes**: Navigate to a webpage and test functionality
4. **Debug**: Use Chrome DevTools console for debugging

### Testing

1. **Manual Testing**: Test on various websites
2. **Console Logging**: Check for errors in DevTools
3. **Anki Integration**: Verify AnkiConnect communication
4. **Cross-browser**: Test in different Chrome versions

### Debugging

1. **Background Script**: Check `chrome://extensions/` > "Service Worker"
2. **Content Script**: Use DevTools on web pages
3. **Popup**: Right-click popup > "Inspect"
4. **Options**: Use DevTools on options page

## Chrome Extension APIs

### Key APIs Used

- **`chrome.runtime`**: Extension lifecycle and messaging
- **`chrome.storage`**: Data persistence
- **`chrome.tabs`**: Tab management
- **`chrome.action`**: Extension icon and popup
- **`chrome.contentScripts`**: Script injection

### Message Passing

```javascript
// Send message to background script
chrome.runtime.sendMessage({ action: 'getData' }, response => {
    console.log('Response:', response);
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateData') {
        // Handle request
        sendResponse({ success: true });
    }
});
```

## AnkiConnect Integration

### Setup

1. Install AnkiConnect addon (code: `2055492159`)
2. Restart Anki
3. Verify endpoint: `http://localhost:8765`

### API Calls

```javascript
// Add note to Anki
const response = await fetch('http://localhost:8765', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
            note: {
                deckName: 'Default',
                modelName: 'Basic',
                fields: { Front: 'Question', Back: 'Answer' },
                tags: ['ankichrome']
            }
        }
    })
});
```

## Styling Guidelines

### CSS Structure

- Use BEM methodology for class naming
- Maintain consistent color scheme
- Ensure responsive design
- Follow Chrome extension design patterns

### Color Palette

- Primary: `#4CAF50` (Green)
- Secondary: `#6c757d` (Gray)
- Success: `#4CAF50` (Green)
- Error: `#f44336` (Red)
- Info: `#2196F3` (Blue)

## Performance Considerations

### Best Practices

1. **Minimize DOM Manipulation**: Batch DOM updates
2. **Efficient Storage**: Use appropriate storage APIs
3. **Lazy Loading**: Load resources when needed
4. **Memory Management**: Clean up event listeners

### Optimization Tips

- Use `requestAnimationFrame` for animations
- Debounce frequent events
- Cache DOM queries
- Minimize message passing

## Security

### Permissions

- **`activeTab`**: Access to current tab only
- **`storage`**: Local data persistence
- **`host_permissions`**: HTTP/HTTPS access for AnkiConnect

### Data Handling

- Validate all user inputs
- Sanitize HTML content
- Use HTTPS for external requests
- Implement proper error handling

## Building and Distribution

### Development Build

1. Make changes to source files
2. Test thoroughly in development mode
3. Commit changes to version control

### Production Build

1. Create production-ready icons
2. Update version in `manifest.json`
3. Test in production environment
4. Package extension using Chrome's "Pack Extension"

### Distribution

1. **Chrome Web Store**: Submit for review and publication
2. **Direct Distribution**: Share `.crx` file (limited to developer mode)
3. **GitHub Releases**: Host source code and documentation

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check manifest syntax and file paths
2. **Permissions denied**: Verify manifest permissions
3. **Content script not working**: Check injection rules
4. **Anki connection failed**: Verify AnkiConnect setup

### Debug Steps

1. Check Chrome extension console
2. Verify file paths and permissions
3. Test on different websites
4. Check AnkiConnect status

## Contributing

### Code Style

- Follow existing code patterns
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Include error handling

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes and test
4. Submit pull request with description
5. Address review feedback

## Resources

### Documentation

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [AnkiConnect Documentation](https://github.com/FooSoft/anki-connect)

### Tools

- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Web Extension Polyfill](https://github.com/mozilla/webextension-polyfill)

## Support

For development questions:
- Check this guide first
- Review Chrome extension documentation
- Search existing issues
- Create new issue with detailed description 