# Teams AI Reply Assistant

A Manifest V3 Chrome Extension that acts as an AI-powered reply assistant for the Microsoft Teams Web application. It scrapes the context of your current conversation and uses a local Ollama instance to draft concise, professional replies directly into the chat compose box.

## Prerequisites

1. **Google Chrome** (or a Chromium-based browser).
2. **AI Provider (Choose one)**:
   - **Local (Ollama)**: A local instance of [Ollama](https://ollama.ai/) running on your machine (`http://localhost:11434`). The extension defaults to the `llama3` model.
     **Important for Chrome Extensions:** You must configure your Ollama server to accept CORS requests from the browser extension by setting the `OLLAMA_ORIGINS` environment variable to `*` before starting the service. If you do not do this, you will receive a 403 Forbidden error.
     ```bash
     # Example for macOS/Linux terminal:
     export OLLAMA_ORIGINS="*"
     ollama run llama3
     ```
   - **Cloud (Google Gemini)**: A valid [Google Gemini API Key](https://aistudio.google.com/app/apikey).

## Features

- **Context-Aware Replies**: Automatically reads the last few messages in your active Microsoft Teams chat.
- **Dynamic Routing**: Choose between local privacy (Ollama) or cloud power (Google Gemini REST API).
- **Seamless Integration**: Injects a floating "Draft Reply" button directly into the Teams Web UI and places the generated reply straight into the compose box.

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button.
5. Select the directory containing the extension files (`manifest.json`, `content.js`, `background.js`).

## Configuration

After installing the extension, you must configure your AI provider:
1. Right-click the extension icon in the Chrome toolbar.
2. Select **Options**.
3. Choose your **Active Provider** from the dropdown:
   - **Ollama (Local)**: Specify the exact model name (default is `llama3`).
   - **Google Gemini**: Securely enter your Gemini API Key.
4. Click **Save Settings**.

## Usage

1. (If using Ollama) Ensure your local instance is running (`ollama serve`).
2. Open Microsoft Teams in your web browser (`teams.microsoft.com`).
3. Navigate to a chat or channel conversation.
4. A floating **"Draft Reply"** button will appear near the bottom right of the screen.
5. Click the button. The extension will read the recent conversation, fetch a response from your chosen AI provider, and insert it directly into the compose box.
6. Review the draft, make any necessary edits, and send!

## Architecture

- `manifest.json`: Defines the Manifest V3 extension, requesting `activeTab`, `scripting`, and `storage` permissions. Registers the options page.
- `options.html/js`: Provides a clean UI for saving routing preferences to `chrome.storage.local`.
- `content.js`: Injects the UI button, scrapes chat history using DOM selectors, and inserts the API response into the compose box.
- `background.js`: Listens for messages from the content script, retrieves user settings, and securely routes the POST request to either the local Ollama API or the Google Gemini API.
