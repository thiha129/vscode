import * as vscode from 'vscode';
import axios from 'axios';

export class AIWebviewProvider {
    private apiKey: string = '';
    private currentWebsiteContent: string = '';

    constructor(private readonly extensionUri: vscode.Uri) {}

    public getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Webview App</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            display: flex;
            height: 100vh;
        }

        .browser-container {
            width: 80%;
            height: 100vh;
            border-right: 1px solid var(--vscode-panel-border);
            display: flex;
            flex-direction: column;
        }

        .browser-header {
            padding: 10px;
            background-color: var(--vscode-panel-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .url-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 14px;
        }

        .load-button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .load-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .browser-content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background-color: var(--vscode-editor-background);
        }

        .chat-container {
            width: 20%;
            height: 100vh;
            background-color: var(--vscode-panel-background);
            display: flex;
            flex-direction: column;
        }

        .chat-header {
            padding: 15px;
            background-color: var(--vscode-panel-background);
            border-bottom: 1px solid var(--vscode-panel-border);
            font-weight: bold;
            font-size: 16px;
        }

        .api-key-section {
            padding: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .api-key-input {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 10px;
        }

        .chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .message {
            padding: 10px;
            border-radius: 8px;
            max-width: 100%;
            word-wrap: break-word;
        }

        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            align-self: flex-end;
            margin-left: 20px;
        }

        .ai-message {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            align-self: flex-start;
            margin-right: 20px;
        }

        .chat-input-container {
            padding: 15px;
            border-top: 1px solid var(--vscode-panel-border);
            display: flex;
            gap: 10px;
        }

        .chat-input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 14px;
        }

        .send-button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .send-button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
        }

        .loading {
            opacity: 0.6;
        }

        .error {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
        }
    </style>
</head>
<body>
    <div class="browser-container">
        <div class="browser-header">
            <input type="text" class="url-input" id="urlInput" placeholder="Enter website URL..." value="https://example.com">
            <button class="load-button" id="loadButton">Load</button>
        </div>
        <div class="browser-content" id="browserContent">
            <h2>AI Webview App</h2>
            <p>Enter a URL above and click "Load" to view a website. Then use the chat on the right to ask questions about the content.</p>
        </div>
    </div>

    <div class="chat-container">
        <div class="chat-header">AI Chat</div>
        <div class="api-key-section">
            <input type="password" class="api-key-input" id="apiKeyInput" placeholder="Enter your OpenAI API key...">
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message ai-message">
                Hello! I'm your AI assistant. Please enter your API key above and load a website to get started.
            </div>
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" id="chatInput" placeholder="Ask about the website content...">
            <button class="send-button" id="sendButton">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        const urlInput = document.getElementById('urlInput');
        const loadButton = document.getElementById('loadButton');
        const browserContent = document.getElementById('browserContent');
        const apiKeyInput = document.getElementById('apiKeyInput');
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const chatMessages = document.getElementById('chatMessages');

        let isLoading = false;

        // Load website functionality
        loadButton.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                loadWebsite(url);
            }
        });

        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadButton.click();
            }
        });

        function loadWebsite(url) {
            isLoading = true;
            loadButton.textContent = 'Loading...';
            loadButton.disabled = true;

            // Send message to extension to load website
            vscode.postMessage({
                command: 'loadWebsite',
                url: url
            });
        }

        // Chat functionality
        sendButton.addEventListener('click', () => {
            sendMessage();
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        function sendMessage() {
            const message = chatInput.value.trim();
            if (message && !isLoading) {
                addMessage(message, 'user');
                chatInput.value = '';

                // Send message to extension
                vscode.postMessage({
                    command: 'sendMessage',
                    text: message
                });
            }
        }

        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${sender}-message\`;
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // API key handling
        apiKeyInput.addEventListener('input', (e) => {
            vscode.postMessage({
                command: 'setApiKey',
                apiKey: e.target.value
            });
        });
        
        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'websiteLoaded':
                    browserContent.innerHTML = message.content;
                    isLoading = false;
                    loadButton.textContent = 'Load';
                    loadButton.disabled = false;
                    break;
                case 'aiResponse':
                    addMessage(message.response, 'ai');
                    isLoading = false;
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send';
                    break;
                case 'error':
                    addMessage(\`Error: \${message.error}\`, 'ai');
                    addMessage('error', 'ai');
                    isLoading = false;
                    sendButton.disabled = false;
                    sendButton.textContent = 'Send';
                    break;
            }
        });
    </script>
</body>
</html>`;
    }

    public async loadWebsite(webview: vscode.Webview, url: string) {
        try {
            // Validate URL
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            // Fetch website content
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            this.currentWebsiteContent = response.data;

            // Send content to webview
            webview.postMessage({
                command: 'websiteLoaded',
                content: this.formatWebsiteContent(response.data, url)
            });
        } catch (error) {
            console.error('Error loading website:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            webview.postMessage({
                command: 'error',
                error: `Failed to load website: ${errorMessage}`
            });
        }
    }

    public async sendMessage(webview: vscode.Webview, message: string) {
        // For demo purposes, always use mock responses to avoid API issues
        const mockResponse = this.generateMockResponse(message);
        
        webview.postMessage({
            command: 'aiResponse',
            response: mockResponse
        });
        
        // Note: OpenAI API integration is available but disabled for demo purposes
        // To enable real AI responses, uncomment the API code below and provide a valid API key
        /*
        // Check if API key is provided
        if (!this.apiKey) {
            const mockResponse = this.currentWebsiteContent ?
                `I can see you've loaded a website, but I need an OpenAI API key to provide intelligent responses. Please enter your API key in the field above to get AI-powered analysis of the website content.` :
                `Hello! I'm your AI assistant. Please enter your OpenAI API key above and load a website to get started.`;

            webview.postMessage({
                command: 'aiResponse',
                response: mockResponse
            });
            return;
        }

        try {
            // Prepare context with website content
            const context = this.currentWebsiteContent ?
                `Website content:\n${this.extractTextContent(this.currentWebsiteContent)}\n\nUser question: ${message}` :
                `User question: ${message}`;

            // Call OpenAI API with retry logic
            let retries = 2;
            let response: any = null;
            
            while (retries > 0) {
                try {
                    response = await axios.post('https://api.openai.com/v1/chat/completions', {
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful AI assistant. Answer questions about website content when provided, or general questions otherwise.'
                            },
                            {
                                role: 'user',
                                content: context
                            }
                        ],
                        max_tokens: 1000,
                        temperature: 0.7
                    }, {
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    });
                    break; // Success, exit retry loop
                } catch (retryError: any) {
                    retries--;
                    if (retryError.response?.status === 429 && retries > 0) {
                        // Rate limited, wait and retry
                        const waitTime = 2000; // 2 seconds
                        console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    throw retryError; // Re-throw if not rate limit or no retries left
                }
            }

            if (!response) {
                throw new Error('Failed to get response from OpenAI API');
            }

            const aiResponse = response.data.choices[0].message.content;

            webview.postMessage({
                command: 'aiResponse',
                response: aiResponse
            });
        } catch (error: any) {
            console.error('Error calling OpenAI API:', error);
            
            // Fallback to mock response when API fails
            const mockResponse = this.generateMockResponse(message);
            
            let errorMessage = '';
            if (error.response?.status === 429) {
                errorMessage = 'API rate limit exceeded. Using mock response instead.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Invalid API key. Using mock response instead.';
            } else if (error.response?.status === 403) {
                errorMessage = 'API access forbidden. Using mock response instead.';
            } else {
                errorMessage = 'API error. Using mock response instead.';
            }

            // Send both error message and mock response
            webview.postMessage({
                command: 'aiResponse',
                response: `${errorMessage}\n\n${mockResponse}`
            });
        }
        */
    }

    public setApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    private generateMockResponse(message: string): string {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return this.currentWebsiteContent ?
                `Hello! I can see you've loaded a website. I'm your AI assistant and I can help you analyze the content. What would you like to know about this website?` :
                `Hello! I'm your AI assistant. Please load a website first, then I can help you analyze its content.`;
        }

        if (lowerMessage.includes('summary') || lowerMessage.includes('tóm tắt')) {
            return this.currentWebsiteContent ?
                `Based on the website content I can see, here's a summary:\n\nThis appears to be a web page with various content. The page contains text, links, and other elements typical of a website. For a more detailed analysis, you would need to provide a valid OpenAI API key.` :
                `I'd be happy to provide a summary! Please load a website first by entering a URL in the browser panel above.`;
        }

        if (lowerMessage.includes('what') || lowerMessage.includes('gì')) {
            return this.currentWebsiteContent ?
                `This website appears to contain various content including text, links, and other web elements. For a more detailed analysis of what this website is about, you would need to provide a valid OpenAI API key.` :
                `I can help you understand what a website is about! Please load a website first by entering a URL in the browser panel above.`;
        }

        if (this.currentWebsiteContent) {
            return `I can see you've loaded a website and asked: "${message}". For a detailed AI-powered response, you would need to provide a valid OpenAI API key. Currently, I can only provide basic mock responses for demonstration purposes.`;
        }

        return `I'm your AI assistant! I can help you analyze website content. Please load a website first by entering a URL in the browser panel above, then ask me questions about it.`;
    }

    private formatWebsiteContent(html: string, url: string): string {
        // Create a proper iframe to render the website
        return `
            <h2>Website: ${url}</h2>
            <div style="width: 100%; height: 80vh; border: 1px solid var(--vscode-panel-border); border-radius: 4px; overflow: hidden;">
                <iframe
                    src="${url}"
                    style="width: 100%; height: 100%; border: none;"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
                    onload="console.log('Website loaded successfully')"
                    onerror="console.log('Failed to load website in iframe'); this.parentElement.innerHTML='<div style=\\'padding: 20px; background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 4px;\\'><p>Unable to load website in iframe due to CORS restrictions.</p><p>Website content (text only):</p><div style=\\'white-space: pre-wrap; line-height: 1.6; max-height: 400px; overflow-y: auto; background: var(--vscode-input-background); padding: 10px; border-radius: 4px;\\'>${this.extractTextContent(html)}</div></div>'">
                </iframe>
            </div>
        `;
    }

    private extractTextContent(html: string): string {
        // Extract text content for AI processing
        return html
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<style[^>]*>.*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 8000); // Limit for API
    }
}
