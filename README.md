# Teams AI Reply Assistant

A Manifest V3 Chrome Extension that acts as an AI-powered reply assistant for the Microsoft Teams Web application. It scrapes the context of your current conversation and uses a local Ollama instance to draft concise, professional replies directly into the chat compose box.

## Prerequisites

1. **Google Chrome** (or a Chromium-based browser).
2. **Ollama**: A local instance of [Ollama](https://ollama.ai/) running on your machine.
3. **Llama 3 Model**: The extension defaults to using the `llama3` model. Make sure you have it pulled in Ollama:
   ```bash
   ollama run llama3
   ```
   *Note: Ollama must be running and accessible at `http://localhost:11434`.*

## Features

- **Context-Aware Replies**: Automatically reads the last few messages in your active Microsoft Teams chat.
- **Privacy First**: Uses a locally hosted LLM (Ollama) so your chat data never leaves your machine.
- **Seamless Integration**: Injects a floating "Draft Reply" button directly into the Teams Web UI and places the generated reply straight into the compose box.

## Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button.
5. Select the directory containing the extension files (`manifest.json`, `content.js`, `background.js`).

## Usage

1. Start your local Ollama instance (e.g., run `ollama serve` or open the Ollama application).
2. Open Microsoft Teams in your web browser (`teams.microsoft.com`).
3. Navigate to a chat or channel conversation.
4. A floating **"Draft Reply"** button will appear near the bottom right of the screen.
5. Click the button. The extension will read the recent conversation, generate a professional reply, and insert it into the compose box.
6. Review the draft, make any necessary edits, and send!

## Architecture

- `manifest.json`: Defines the Manifest V3 extension, requesting `activeTab` and `scripting` permissions strictly for Microsoft Teams.
- `content.js`: Injects the UI button, scrapes chat history using DOM selectors, and inserts the API response into the compose box.
- `background.js`: Listens for messages from the content script and makes POST requests to the local Ollama API to generate text safely outside the content page's scope.
