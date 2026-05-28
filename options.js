// Restore options from chrome.storage
const restoreOptions = () => {
  chrome.storage.local.get(
    { provider: 'ollama', ollamaModel: 'llama3', geminiApiKey: '' },
    (items) => {
      document.getElementById('provider').value = items.provider;
      document.getElementById('ollamaModel').value = items.ollamaModel;
      document.getElementById('geminiApiKey').value = items.geminiApiKey;
      toggleFields();
    }
  );
};

// Save options to chrome.storage
const saveOptions = () => {
  const provider = document.getElementById('provider').value;
  const ollamaModel = document.getElementById('ollamaModel').value;
  const geminiApiKey = document.getElementById('geminiApiKey').value;

  chrome.storage.local.set(
    { provider, ollamaModel, geminiApiKey },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

// Toggle visibility of fields based on selected provider
const toggleFields = () => {
  const provider = document.getElementById('provider').value;
  const ollamaSettings = document.getElementById('ollamaSettings');
  const geminiSettings = document.getElementById('geminiSettings');

  if (provider === 'ollama') {
    ollamaSettings.classList.remove('hidden');
    geminiSettings.classList.add('hidden');
  } else if (provider === 'gemini') {
    ollamaSettings.classList.add('hidden');
    geminiSettings.classList.remove('hidden');
  }
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('provider').addEventListener('change', toggleFields);
