# AI Webview App Extension

A VSCode extension that provides an AI-powered webview application with embedded browser and chat functionality.

## Features

- **Embedded Browser (80% width)**: Load and view websites directly within VSCode
- **AI Chat Interface (20% width)**: Chat with an AI assistant about website content
- **OpenAI Integration**: Uses OpenAI's GPT-3.5-turbo model for intelligent responses
- **Website Content Analysis**: AI can analyze and answer questions about loaded website content

## How to Use

1. Install the extension in VSCode
2. Open the Command Palette (Ctrl+Shift+P)
3. Run the command "Open AI Webview App"
4. Enter your OpenAI API key in the chat panel
5. Load a website by entering a URL in the browser panel
6. Ask questions about the website content in the chat panel

## Requirements

- VSCode 1.74.0 or higher
- OpenAI API key (get one from https://platform.openai.com/)

## Installation

1. Clone this repository
2. Navigate to the extension directory
3. Run `npm install` to install dependencies
4. Run `npm run compile` to build the extension
5. Press F5 to run the extension in a new Extension Development Host window

## Architecture

The extension consists of:

- **extension.ts**: Main extension entry point that registers the command and creates webview panels
- **aiWebviewProvider.ts**: Handles webview content, website loading, and AI API communication
- **Webview HTML**: Self-contained HTML/CSS/JavaScript for the UI components

## API Integration

The extension integrates with:
- OpenAI API for AI responses
- Axios for HTTP requests to load websites
- VSCode Webview API for the embedded browser interface

## Security

- API keys are stored locally in the webview and not persisted
- Website content is processed locally before being sent to the AI API
- CORS and security headers are handled appropriately for website loading
