/**
 * Content script for Teams AI Reply Assistant.
 * Injects a "Draft Reply" button and interacts with the DOM to scrape context and insert replies.
 */

/**
 * Scrapes the last 10 messages from the active chat pane.
 * @returns {string} The concatenated text of the last chat messages.
 */
function scrapeChatHistory() {
  // Microsoft Teams chat messages typically have this data attribute
  const messageNodes = document.querySelectorAll('[data-tid="chat-pane-message"]');

  if (!messageNodes || messageNodes.length === 0) {
    return '';
  }

  // Get up to the last 10 messages
  const numMessages = Math.min(messageNodes.length, 10);
  const recentMessages = Array.from(messageNodes).slice(-numMessages);

  const chatText = recentMessages.map((node) => {
    // Extracting text content; this might need refinement depending on precise Teams DOM structure
    return node.textContent.trim();
  }).join('\n');

  return chatText;
}

/**
 * Injects the generated reply into the Teams compose box.
 * @param {string} reply - The reply text to inject.
 */
function injectReply(reply) {
  console.log('AI Reply Assistant: Generated Reply:', reply);

  if (!reply || reply.trim() === '') {
    console.warn('AI Reply Assistant: Generated reply is empty. Nothing to inject.');
    return;
  }

  // The compose box in Teams is usually a rich text editor (contenteditable)
  // We look for common attributes or roles
  const composeBox = document.querySelector('div[contenteditable="true"], div[data-tid="ckeditor-compose-area"]');

  const handleFallback = () => {
    console.warn('AI Reply Assistant: Injection seemingly failed. Triggering fallback UI.');
    try {
      navigator.clipboard.writeText(reply).catch(() => {});
    } catch(e) {}
    prompt('AI Reply (Injection failed, text copied to clipboard. Press Ctrl+C/Cmd+C to copy manually just in case):', reply);
  };

  if (composeBox) {
    try {
      // Attempt to focus the compose box
      composeBox.focus();

      // Ensure cursor is placed correctly in the rich text editor before inserting
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(composeBox);
        range.collapse(false); // collapse to end
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Dispatch beforeinput to mimic real user interaction for React
      composeBox.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: reply, bubbles: true, cancelable: true }));

      // Using document.execCommand to insert text as it simulates user input better
      // for some complex rich text editors than directly setting innerText/innerHTML
      let success = document.execCommand('insertText', false, reply);

      if (!success) {
        // Fallback: simulated paste event for stubborn React editors
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', reply);
        const pasteEvent = new ClipboardEvent('paste', {
          clipboardData: dataTransfer,
          bubbles: true,
          cancelable: true
        });
        composeBox.dispatchEvent(pasteEvent);
      }

      // Dispatch an input event so any React/Angular bindings notice the change
      composeBox.dispatchEvent(new Event('input', { bubbles: true }));

      // Verify if injection worked (either via execCommand or fallback)
      setTimeout(() => {
        if (!composeBox.textContent.includes(reply.trim()) && !composeBox.innerHTML.includes(reply.trim())) {
           handleFallback();
        }
      }, 150);
    } catch (e) {
      console.error("AI Reply Assistant: Error during injection attempt:", e);
      handleFallback();
    }
  } else {
    handleFallback();
  }
}

/**
 * Creates and injects the floating UI button near the compose box.
 */
function injectFloatingButton() {
  // Check if it already exists
  if (document.getElementById('ai-reply-assistant-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'ai-reply-assistant-btn';
  btn.textContent = 'Draft Reply';
  btn.style.cssText = `
    position: fixed;
    bottom: 80px; /* Position it above the typical compose area */
    right: 20px;
    z-index: 999999;
    padding: 8px 16px;
    background-color: #5B5FC7; /* Teams primary purple */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;

  btn.addEventListener('click', async () => {
    const originalText = btn.textContent;
    btn.textContent = 'Drafting...';
    btn.disabled = true;

    try {
      const chatContext = scrapeChatHistory();

      if (!chatContext) {
        alert('Could not find any recent chat context.');
        return;
      }

      // Send a message to the background script
      chrome.runtime.sendMessage(
        { action: 'generateReply', context: chatContext },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            alert('Error communicating with background script.');
          } else if (response && response.success) {
            injectReply(response.reply);
          } else {
            console.error('Failed to generate reply:', response?.error);
            alert(`Failed to generate reply: ${response?.error}`);
          }

          // Reset button state
          btn.textContent = originalText;
          btn.disabled = false;
        }
      );
    } catch (err) {
      console.error('Error during AI reply generation flow:', err);
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  document.body.appendChild(btn);
}

// Basic initialization to add the button when the page loads
// For a SPA like Teams, a MutationObserver is more robust, but a timeout is a simple start
setTimeout(injectFloatingButton, 3000);

// Use a MutationObserver to ensure the button stays injected even if the page structure changes
const observer = new MutationObserver(() => {
  injectFloatingButton();
});

observer.observe(document.body, { childList: true, subtree: true });
