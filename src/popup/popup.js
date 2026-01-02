document.addEventListener('DOMContentLoaded', () => {
  const vaultNameInput = document.getElementById('vaultName');
  const folderPathInput = document.getElementById('folderPath');
  const saveBtn = document.getElementById('saveToObsidian');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['vaultName', 'folderPath'], (result) => {
    if (result.vaultName) vaultNameInput.value = result.vaultName;
    if (result.folderPath) folderPathInput.value = result.folderPath;
  });

  saveBtn.addEventListener('click', async () => {
    const vaultName = vaultNameInput.value.trim();
    const folderPath = folderPathInput.value.trim();

    if (!vaultName) {
      showStatus('Please enter a Vault Name', 'red');
      return;
    }

    // Save settings
    chrome.storage.local.set({ vaultName, folderPath });

    showStatus('Extracting content...', '#666');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.startsWith('https://gemini.google.com/')) {
        showStatus('Not on Gemini!', 'red');
        return;
      }

      // Execute script or send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
      
      if (response && response.markdown) {
        openObsidian(vaultName, folderPath, response.title, response.markdown);
        showStatus('Opened in Obsidian!', 'green');
      } else {
        showStatus('Failed to extract content.', 'red');
      }

    } catch (err) {
      console.error(err);
      showStatus('Error: Refresh page and try again.', 'red');
    }
  });

  function showStatus(msg, color) {
    statusDiv.textContent = msg;
    statusDiv.style.color = color || '#333';
    setTimeout(() => {
      if (statusDiv.textContent === msg) {
        statusDiv.textContent = '';
      }
    }, 3000);
  }

  function openObsidian(vault, folder, title, content) {
    // Construct filename
    let filename = title || 'Gemini Conversation';
    // Sanitize filename
    filename = filename.replace(/[\\/:*?"<>|]/g, '-');
    
    // Construct Obsidian URI
    // obsidian://new?vault=my%20vault&file=my%20note&content=Hello%20World
    // If folder is provided, prepend to file
    let filePath = filename;
    if (folder) {
        // Ensure folder doesn't end with slash
        const cleanFolder = folder.replace(/\/$/, '');
        filePath = `${cleanFolder}/${filename}`;
    }

    const params = new URLSearchParams();
    params.append('vault', vault);
    params.append('file', filePath);
    params.append('content', content);
    
    // Optional: append 'overwrite' or other flags if needed, default is safer
    // params.append('mode', 'new'); 

    const obsidianUrl = `obsidian://new?${params.toString()}`;
    
    // Open in new tab (which triggers app launch)
    chrome.tabs.create({ url: obsidianUrl });
  }
});
