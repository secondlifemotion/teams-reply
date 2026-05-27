/**
 * Background script for the Teams AI Reply Assistant.
 * Listens for messages from the content script and makes requests to either a local Ollama instance or the Google Gemini API based on user settings.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    const chatContext = request.context;

    // Use async/await inside an IIFE since chrome.runtime.onMessage listener
    // should return a boolean to indicate asynchronous response.
    (async () => {
      try {
        // Retrieve settings from storage
        const settings = await new Promise((resolve) => {
          chrome.storage.local.get(
            { provider: 'ollama', ollamaModel: 'llama3', geminiApiKey: '' },
            resolve
          );
        });

        const prompt = `You are a professional assistant. Draft a concise, professional reply to the following Microsoft Teams chat context. Output only the reply.\n\nContext:\n${chatContext}`;

        let responseText = '';

        if (settings.provider === 'ollama') {
          // Route to local Ollama
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: settings.ollamaModel || 'llama3',
              prompt: prompt,
              stream: false
            })
          });

          if (!response.ok) {
            throw new Error(`Ollama HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          responseText = data.response;

        } else if (settings.provider === 'gemini') {
          // Route to Google Gemini REST API
          if (!settings.geminiApiKey) {
             throw new Error('Gemini API key is not configured in extension options.');
          }

          // Use the recommended model for general text generation
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          });

          if (!response.ok) {
            let errorDetail = `Gemini HTTP error! status: ${response.status}`;
            try {
              const errorData = await response.json();
              if (errorData.error && errorData.error.message) {
                 errorDetail += ` - ${errorData.error.message}`;
              }
            } catch (e) {
               // ignore json parse error
            }
            throw new Error(errorDetail);
          }

          const data = await response.json();
          if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            responseText = data.candidates[0].content.parts[0].text;
          } else {
             throw new Error('Unexpected response format from Gemini API.');
          }
        } else {
            throw new Error(`Unknown provider: ${settings.provider}`);
        }

        // Send back the generated response
        sendResponse({ success: true, reply: responseText });

      } catch (error) {
        console.error('Error generating reply:', error);

        // Fallback or error response to content script
        sendResponse({
          success: false,
          error: error.message || 'Failed to generate reply.'
        });
      }
    })();

    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
