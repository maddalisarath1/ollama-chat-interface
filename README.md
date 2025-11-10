# HLS Ollama Chat Interface

A web-based chat interface for interacting with Ollama AI models. This interface provides an intuitive way to chat with various Large Language Models (LLMs) running locally through Ollama.

## Features

- **Model Selection**: Choose from multiple available Ollama models
- **Model Management**: Download new models directly from the interface
- **Interactive Chat**: Real-time chat interface with AI models
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **History Management**: Clear chat history with a single click
- **Mobile Friendly**: Responsive layout for various screen sizes

## Prerequisites

Before running this application, ensure you have:

- [Ollama](https://ollama.ai/) installed and running on your system
- A backend server to handle API requests (see Backend Setup below)
- A modern web browser

## Installation

1. **Install Ollama**
   ```bash
   # Visit https://ollama.ai/ for installation instructions
   # Or use curl (Linux/macOS):
   curl https://ollama.ai/install.sh | sh
   ```

2. **Clone or Download the Project**
   ```bash
   git clone <repository-url>
   cd hls-ollama-chat
   ```

3. **Set Up Backend Server**
   
   The frontend expects API endpoints at `/api/chat`. You'll need to create a backend server that handles:
   - `POST /api/chat` - Main endpoint for chat and model operations

## Backend Setup

Create a simple Node.js/Express backend or use your preferred framework:

```javascript
// Example Express.js backend
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve the HTML file

app.post('/api/chat', async (req, res) => {
    const { action, message, model } = req.body;
    
    if (action === 'listModels') {
        // Execute: ollama list
        // Return available models
    } else if (action === 'chat') {
        // Execute: ollama run <model> "<message>"
        // Return AI response
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Usage

1. **Start Ollama Service**
   ```bash
   ollama serve
   ```

2. **Start Your Backend Server**
   ```bash
   node server.js
   ```

3. **Open the Application**
   - Navigate to `http://localhost:3000` in your browser
   - Or open `index.html` directly if using a different server setup

4. **Using the Interface**
   - Select a model from the "Current Model" dropdown
   - Type your message in the text area
   - Click "Send" or press Enter to chat
   - Download new models from the "Downloadable Models" section
   - Clear chat history using the "Clear History" button

## Available Models

The interface includes the following downloadable models:

- gemma3
- deepseek-r1
- llama3.3
- phi4
- nomic-embed-text
- mistral
- qwen2.5-coder
- llava
- codellama
- deepseek-v3
- deepseek-coder-v2
- snowflake-arctic-embed
- dolphin3
- openchat
- llama3.1-claude

For more models, visit the [Ollama Model Library](https://ollama.com/library).

## API Endpoints

### POST `/api/chat`

**Request Body:**
```json
{
  "action": "chat" | "listModels" | "clearHistory",
  "message": "Your message here",
  "model": "model-name"
}
```

**Response:**
```json
{
  "response": "AI response or model list"
}
```

## Project Structure

```
.
├── index.html          # Main application file
├── README.md          # Project documentation
└── server.js          # Backend server (to be implemented)
```

## Technologies Used

- **HTML5** - Structure
- **Tailwind CSS** - Styling via CDN
- **Vanilla JavaScript** - Functionality
- **Ollama** - Local LLM runtime
- **Fetch API** - HTTP requests

## Layout Methods

The interface demonstrates multiple CSS layout techniques:
- Flexbox layout for main sections
- CSS Grid for alternative layouts
- Responsive breakpoints for mobile devices
- Custom styled select dropdowns

## Configuration

Modify the `models` array in the `getDownloadableModels()` function to add or remove available models:

```javascript
models = [
    'gemma3', 
    'deepseek-r1',
    // Add more models here
];
```

## Troubleshooting

**Models not loading:**
- Ensure Ollama is running: `ollama serve`
- Check if models are installed: `ollama list`

**API errors:**
- Verify backend server is running
- Check CORS settings if frontend and backend are on different ports

**Chat not working:**
- Confirm selected model is downloaded
- Check browser console for errors
- Verify API endpoint URLs match your server configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues related to:
- **Ollama**: Visit [Ollama Documentation](https://github.com/ollama/ollama)
- **This Interface**: Open an issue in the project repository

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing local LLM capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling framework

---

**Note**: This is a frontend interface. A backend server implementation is required to handle API requests to Ollama. The backend should manage model operations, chat history, and communicate with the Ollama service running locally.
