# AnkiChrome - Chrome Extension for Anki Integration

A powerful Chrome extension that seamlessly integrates with Anki to help you create flashcards while browsing the web.

## Features

- **Step-by-Step Card Creation**: Simple 3-step process to create new cards
- **Deck Selection**: Choose from your available Anki decks
- **Note Type Selection**: Select the appropriate note type for your card
- **Dynamic Form Fields**: Automatically generates form fields based on your note type
- **Smart Integration**: Works with AnkiConnect for seamless Anki integration

- **Customizable Settings**: Configure AnkiConnect endpoint and preferences

## Installation

### Development Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension should now appear in your extensions list

### Production Installation

1. Download the `.crx` file (when available)
2. Drag and drop the file into Chrome's extensions page
3. Confirm the installation

## Setup

### AnkiConnect Setup

1. Install AnkiConnect addon in Anki:
   - Open Anki
   - Go to Tools > Add-ons > Browse & Install
   - Enter code: `2055492159`
   - Restart Anki

2. Configure the extension:
   - Click the extension icon in Chrome
   - Click "Options" to open settings
   - Set your AnkiConnect endpoint (default: `http://localhost:8765`)

## Usage

### Creating New Cards

The extension provides a simple 3-step process:

1. **Select Deck**: Choose which Anki deck to add your card to
2. **Select Note Type**: Choose the type of note (Basic, Cloze, etc.)
3. **Fill Fields**: Enter the content for each field in your note type

### Quick Access

- **Extension Icon**: Click the extension icon in your toolbar


### Workflow

1. Click the AnkiChrome extension icon
2. Select a deck from the dropdown
3. Click "Continue to Note Type"
4. Select a note type from the dropdown
5. Click "Continue to Card Creation"
6. Fill in the required fields
7. Click "Create Card"

## File Structure

```
ankichrome/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker with AnkiConnect API
├── content.js            # Content script for web pages
├── popup.html            # Extension popup interface
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── options.html          # Options page
├── options.css           # Options page styles
├── options.js            # Options page functionality
├── icons/                # Extension icons
│   ├── icon16.png        # 16x16 icon
│   ├── icon32.png        # 32x32 icon
│   ├── icon48.png        # 48x48 icon
│   └── icon128.png       # 128x128 icon
└── README.md             # This file
```

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Anki with AnkiConnect addon

### Building

1. Make your changes to the source files
2. Test in Chrome's extension development mode
3. Use Chrome's "Pack Extension" feature to create a `.crx` file

### Testing

1. Load the extension in development mode
2. Test the step-by-step card creation flow
3. Check console for any errors
4. Verify Anki integration works correctly

## Configuration

### Extension Settings

- **Enable Extension**: Toggle the extension on/off
- **AnkiConnect Endpoint**: URL for AnkiConnect (usually http://localhost:8765)

### AnkiConnect Integration

The extension automatically:
- Tests connection to AnkiConnect
- Retrieves available decks
- Gets note types and field information
- Creates cards with proper field mapping

## Troubleshooting

### Common Issues

1. **Extension not working**: Check if it's enabled in Chrome extensions
2. **Anki connection failed**: Verify AnkiConnect is installed and Anki is running
3. **No decks shown**: Ensure you have decks created in Anki
4. **No note types available**: Check that your Anki has note types configured

### Debug Mode

1. Open Chrome DevTools
2. Go to Console tab
3. Look for AnkiChrome-related messages
4. Check for any error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
- Check the troubleshooting section
- Review the console for error messages
- Ensure AnkiConnect is properly configured
- Verify Chrome extension permissions

## Changelog

### Version 1.0.0
- Initial release
- Step-by-step card creation interface
- Deck and note type selection
- Dynamic form field generation
- AnkiConnect integration
- Options page for configuration

## Roadmap

- [ ] Advanced card templates
- [ ] Batch import functionality
- [ ] Cloud sync support
- [ ] Mobile app companion
- [ ] Advanced search and filtering
- [ ] Integration with other flashcard apps 