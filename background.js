/**
 * Background script for the Teams AI Reply Assistant.
 * Listens for messages from the content script and makes requests to a local Ollama instance.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    const chatContext = request.context;

    // Use async/await inside an IIFE since chrome.runtime.onMessage listener
    // should return a boolean to indicate asynchronous response.
    (async () => {
      try {
        const prompt = `You are a professional assistant. Draft a concise, professional reply to the following Microsoft Teams chat context. Output only the reply.\n\nContext:\n${chatContext}`;

        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3',
            prompt: prompt,
            stream: false
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Send back the generated response
        sendResponse({ success: true, reply: data.response });
      } catch (error) {
        console.error('Error generating reply:', error);

        // Fallback or error response to content script
        sendResponse({
          success: false,
          error: error.message || 'Failed to generate reply. Is Ollama running locally?'
        });
      }
    })();

    // Return true to indicate that we will send a response asynchronously
    return true;
  }
});
