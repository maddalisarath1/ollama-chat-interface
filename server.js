import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Dependency installation function
async function installDependencies() {
  console.log('Checking and installing dependencies...');
  
  try {
    // Check if package.json exists, create if not
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      execSync('npm init -y');
    }

    // Check and install dependencies
    const dependencies = ['express', 'axios'];
    
    dependencies.forEach(dep => {
      try {
        require.resolve(dep);
        console.log(`${dep} is already installed.`);
      } catch (error) {
        console.log(`Installing ${dep}...`);
        execSync(`npm install ${dep}`, { stdio: 'inherit' });
      }
    });

    // Check and install Ollama
    try {
      execSync('ollama --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('Ollama not found. Attempting to install...');
      
      // Platform-specific Ollama installation
      if (process.platform === 'darwin') {
        // macOS installation
        execSync('brew install ollama', { stdio: 'inherit' });
      } else if (process.platform === 'linux') {
        // Linux installation (curl method)
        execSync('curl https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
      } else if (process.platform === 'win32') {
        console.log('Please manually install Ollama from https://ollama.ai/download');
        console.log('Windows requires manual download or using WSL2');
        process.exit(1);
      }
    }

    // Start Ollama service if not running
    try {
      // Check if Ollama is running
      execSync('curl http://localhost:11434', { stdio: 'ignore' });
    } catch (error) {
      console.log('Starting Ollama service...');
      spawn('ollama', ['serve'], { 
        detached: true, 
        stdio: 'ignore' 
      });
      
      // Wait a bit for service to start
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Dynamically import axios and other dependencies
    const axios = (await import('axios')).default;
    const expressModule = await import('express');
    
    return { axios, express: expressModule.default };
  } catch (error) {
    console.error('Failed to install dependencies:', error);
    process.exit(1);
  }
}

// Main application setup
async function startServer() {
  // Install dependencies
  const { axios, express } = await installDependencies();

  // Rest of the previous server code remains the same, 
  // but use the dynamically imported axios and express
  const app = express();
  const port = 3000;

  // Ollama client class (as in previous example)
  class OllamaClient {
    constructor(baseURL = 'http://localhost:11434') {
      this.client = axios.create({
        baseURL,
        timeout: 50000 // 30 seconds timeout
      });
    }

    // List available local models
    async listModels() {
      try {
        const response = await this.client.get('/api/tags');
        return response.data.models;
      } catch (error) {
        console.error('Error listing models:', error.message);
        throw error;
      }
    }

    async getAvailableModels() {
      try {
        const response = await this.client.get('/api/models');
        return response.data.models;
      } catch (error) {
        console.error('Error listing models:', error.message);
        throw error;
      }
    }

    // Generate text using a specific model
    async generateText(model, prompt, options = {}) {
      try {
        const response = await this.client.post('/api/generate', {
          model,
          prompt,
          stream: false,
          ...options
        });

        return response.data.response;
      } catch (error) {
        console.error('Error generating text:', error.message);
        throw error;
      }
    }

    // Chat completion with a model
    async chatCompletion(model, messages, options = {}) {
      try {
        const response = await this.client.post('/api/chat', {
          model,
          messages,
          stream: false,
          ...options
        });

        return response.data.message.content;
      } catch (error) {
        console.error('Error in chat completion:', error.message);
        throw error;
      }
    }

    // Pull a model from Ollama registry
    async pullModel(model) {
      try {
        const response = await this.client.post('/api/pull', { 
          name: model 
        }, {
          responseType: 'stream'
        });

        return new Promise((resolve, reject) => {
          let fullResponse = '';
          response.data.on('data', (chunk) => {
            const status = JSON.parse(chunk.toString());
            console.log(`Pulling ${model}: ${status.status || 'In progress'}`);
            fullResponse += chunk.toString();
          });

          response.data.on('end', () => resolve(fullResponse));
          response.data.on('error', reject);
        });
      } catch (error) {
        console.error('Error pulling model:', error.message);
        throw error;
      }
    }
  }

  // Create Ollama client
  const ollamaClient = new OllamaClient();

  // Middleware
  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, action, model } = req.body;

      // Handle different actions
      if (action === 'changeModel') {
        const result = await ollamaClient.changeModel(message);
        res.json({ response: result });
        return;
      }

      if(action === 'listModels'){
        const result = await ollamaClient.listModels();
        res.json({ response: result });
        return;
      }

      if(action === 'availableModels'){
        const result = await ollamaClient.getAvailableModels();
        res.json({ response: result });
        return;
      }

      if (action === 'clearHistory') {
        const result = ollamaClient.clearHistory();
        res.json({ response: result });
        return;
      }

      // Default chat completion
      console.log("----message-->>>"+message);
      console.log("---model--->>>"+model);
      const response = await ollamaClient.chatCompletion(model, [
        { role: 'user', content: message }
      ]);
      //const response = await ollamaClient.chatCompletion(message);
      console.log("------>>>"+response);
      res.json({ response });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'An error occurred processing your request' });
    }
  });

  // Start server
  app.listen(port, () => {
    console.log(`Ollama Web Interface running at http://localhost:${port}`);
  });
}

// Run the server
startServer();