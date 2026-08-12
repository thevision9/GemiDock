(function () {
  'use strict';

  let foldersData = [];
  let promptsData = [];
  let openFoldersState = new Set();

  const COLOR_PALETTE = [
    { name: 'Default', text: '#e3e3e3' },
    { name: 'Blue', text: '#a8c7fa' },
    { name: 'Green', text: '#6edfa1' },
    { name: 'Yellow', text: '#fde293' },
    { name: 'Red', text: '#f28b82' },
    { name: 'Purple', text: '#d7aefb' }
  ];

  function getFolderSVG(colorHex) {
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${colorHex}" style="flex-shrink: 0; display: inline-block; vertical-align: middle;">
        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
      </svg>
    `;
  }

  function getPromptSVG() {
    return `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#a8c7fa" style="flex-shrink: 0; display: inline-block; vertical-align: middle;">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
      </svg>
    `;
  }

  try {
    if (!document?.getElementById('gf-styles')) {
      const style = document?.createElement('style');
      if (style) {
        style.id = 'gf-styles';
        style.textContent = `
          #gf-sidebar-root {
            position: relative !important;
            display: block !important;
            width: 100% !important;
            box-sizing: border-box !important;
            margin: 12px 0 4px 0 !important;
            clear: both !important;
          }

          .gf-header {
            color: #c4c7c5;
            font-size: 14px;
            font-weight: 500;
            padding: 4px 16px;
            user-select: none;
          }

          .gf-new-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 16px;
            color: #e3e3e3;
            font-size: 14px;
            background: transparent;
            border: none;
            width: 100%;
            cursor: pointer;
            border-radius: 20px;
            text-align: left;
            font-family: inherit;
          }

          .gf-new-btn:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .gf-tree {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 0 8px;
          }

          .gf-folder {
            border-radius: 16px;
            transition: background 0.15s ease;
            overflow: visible !important;
          }

          .gf-folder.drag-over {
            background: rgba(168, 199, 250, 0.2) !important;
            outline: 1px dashed #a8c7fa;
          }

          .gf-folder-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            color: #e3e3e3;
            font-size: 14px;
            cursor: pointer;
            border-radius: 16px;
            user-select: none;
            position: relative;
            background: transparent;
          }

          .gf-folder-header:hover {
            background: rgba(255, 255, 255, 0.08);
          }

          .gf-folder-title {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .gf-children-list {
            display: none;
            padding-left: 12px;
            margin-top: 2px;
          }

          .gf-folder.open > .gf-children-list {
            display: block;
          }

          .gf-chat-item, .gf-prompt-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 10px;
            color: #c4c7c5;
            font-size: 13px;
            border-radius: 16px;
            text-decoration: none;
            cursor: pointer;
          }

          .gf-chat-item:hover, .gf-prompt-item:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
          }

          .gf-action-btn {
            background: transparent;
            border: none;
            color: #8e918f;
            cursor: pointer;
            font-size: 12px;
            padding: 2px 4px;
            line-height: 1;
          }

          .gf-action-btn:hover { color: #e3e3e3; }

          .gf-color-picker {
            display: none;
            position: absolute;
            top: 100%;
            right: 8px;
            background: #282a2c;
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 6px 10px;
            gap: 8px;
            z-index: 9999;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          }

          .gf-color-picker.show {
            display: flex;
          }

          .gf-color-dot {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.3);
          }

          .gf-color-dot:hover {
            transform: scale(1.2);
          }

          .gf-prompt-section {
            margin-top: 16px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }
        `;
        document.head?.appendChild(style);
      }
    }
  } catch (err) {
    console.warn('[GemiDock] Failed to inject custom CSS styles:', err);
  }

  function loadData(callback) {
    try {
      chrome?.storage?.local?.get(['gemini_folders', 'gemini_prompts'], (result) => {
        try {
          let rawFolders = result?.gemini_folders || [
            { id: 'f_default', name: 'My Folder', chats: [], subfolders: [], colorIndex: 0 }
          ];

          foldersData = rawFolders.map(f => ({
            ...f,
            name: (f?.name || '').replace(/^📁\s*/, ''),
            subfolders: (f?.subfolders || []).map(sf => ({
              ...sf,
              name: (sf?.name || '').replace(/^📁\s*/, '')
            })),
            colorIndex: f?.colorIndex || 0
          }));

          promptsData = result?.gemini_prompts || [
            { id: 'p_1', title: 'Sermon Writing Assistant', text: 'You are an expert theological writer helping brainstorm sermon outlines for Sunday...' },
            { id: 'p_2', title: 'jcKIDS Event Planner', text: 'Act as a children ministry director planning fun engaging games and lessons...' }
          ];

          if (typeof callback === 'function') callback();
        } catch (err) {
          console.warn('[GemiDock] Error processing loaded storage data:', err);
        }
      });
    } catch (err) {
      console.warn('[GemiDock] Unable to access chrome.storage:', err);
    }
  }

  function saveData() {
    try {
      chrome?.storage?.local?.set({ gemini_folders: foldersData, gemini_prompts: promptsData }, () => {
        try {
          renderUI();
        } catch (err) {
          console.warn('[GemiDock] Error re-rendering UI after save:', err);
        }
      });
    } catch (err) {
      console.warn('[GemiDock] Unable to save to chrome.storage:', err);
    }
  }

  function findFolder(tree, id) {
    if (!Array.isArray(tree)) return null;
    for (let item of tree) {
      if (item?.id === id) return item;
      if (item?.subfolders && item.subfolders.length > 0) {
        let found = findFolder(item.subfolders, id);
        if (found) return found;
      }
    }
    return null;
  }

  function removeFolder(tree, id) {
    if (!Array.isArray(tree)) return null;
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]?.id === id) {
        return tree.splice(i, 1)[0];
      }
      if (tree[i]?.subfolders) {
        let removed = removeFolder(tree[i].subfolders, id);
        if (removed) return removed;
      }
    }
    return null;
  }

  function isDescendant(sourceFolder, targetId) {
    if (!sourceFolder?.subfolders || !Array.isArray(sourceFolder.subfolders)) return false;
    for (let child of sourceFolder.subfolders) {
      if (child?.id === targetId || isDescendant(child, targetId)) {
        return true;
      }
    }
    return false;
  }

  function launchChatWithPrompt(promptText) {
    try {
      const inputEl = document?.querySelector('rich-textarea div[contenteditable="true"]') || document?.querySelector('textarea');
      if (inputEl) {
        inputEl.focus();
        if (inputEl.tagName === 'TEXTAREA') {
          inputEl.value = promptText;
        } else {
          inputEl.innerText = promptText;
        }
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.warn('[GemiDock] Chat prompt input field not found on page.');
      }
    } catch (err) {
      console.warn('[GemiDock] Error pre-filling prompt into input field:', err);
    }
  }

  function injectFoldersUI() {
    try {
      const existingRoot = document?.getElementById('gf-sidebar-root');

      const allElements = Array.from(document?.querySelectorAll('*') || []);
      const recentsHeader = allElements.find(el => 
        el?.children?.length === 0 && el?.textContent?.trim() === 'Recents'
      );

      if (!recentsHeader) {
        console.warn('[GemiDock] Sidebar element ("Recents") not found on current page layout.');
        return;
      }

      let recentsBlock = recentsHeader;
      while (recentsBlock && recentsBlock.parentElement) {
        const parent = recentsBlock.parentElement;
        if (
          parent?.tagName === 'NAV' || 
          parent?.getAttribute?.('role') === 'navigation' ||
          (parent?.children && parent.children.length > 3)
        ) {
          break;
        }
        recentsBlock = parent;
      }

      if (!recentsBlock || !recentsBlock.parentNode) {
        console.warn('[GemiDock] Unable to isolate recents parent container block.');
        return;
      }

      if (existingRoot && existingRoot.nextElementSibling === recentsBlock) {
        return;
      }

      const root = existingRoot || document?.createElement('div');
      if (!root) return;
      root.id = 'gf-sidebar-root';

      recentsBlock.parentNode.insertBefore(root, recentsBlock);

      renderUI();
      makeNativeChatsDraggable();
    } catch (err) {
      console.warn('[GemiDock] Error during injectFoldersUI execution:', err);
    }
  }

  function makeNativeChatsDraggable() {
    try {
      const chatLinks = document?.querySelectorAll('a[href*="/app/"]') || [];
      chatLinks.forEach(link => {
        if (link && !link.dataset?.gfDraggable) {
          if (!link.dataset) link.dataset = {};
          link.dataset.gfDraggable = "true";
          link.setAttribute('draggable', 'true');
          link.addEventListener('dragstart', (e) => {
            try {
              const chatData = {
                type: 'CHAT',
                title: link?.innerText?.trim() || 'Gemini Chat',
                url: link?.href || ''
              };
              e.dataTransfer?.setData('text/plain', JSON.stringify(chatData));
            } catch (err) {
              console.warn('[GemiDock] DragStart failed:', err);
            }
          });
        }
      });
    } catch (err) {
      console.warn('[GemiDock] Error in makeNativeChatsDraggable:', err);
    }
  }

  function buildTreeDOM(folderList) {
    const container = document?.createElement('div');
    if (!container) return document?.createElement('div');
    container.className = 'gf-tree-nodes';

    if (!Array.isArray(folderList)) return container;

    folderList.forEach((folder) => {
      if (!folder) return;
      const folderEl = document?.createElement('div');
      if (!folderEl) return;

      const isOpen = openFoldersState.has(folder.id);
      folderEl.className = `gf-folder ${isOpen ? 'open' : ''}`;
      folderEl.setAttribute('draggable', 'true');

      const colorStyle = COLOR_PALETTE[folder.colorIndex || 0] || COLOR_PALETTE[0];
      const folderIcon = getFolderSVG(colorStyle.text);
      const itemCount = (folder.chats?.length || 0) + (folder.subfolders?.length || 0);

      folderEl.innerHTML = `
        <div class="gf-folder-header">
          <div class="gf-folder-title">
            ${folderIcon}
            <span>${folder.name || 'Folder'} (${itemCount})</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button class="gf-action-btn gf-color-btn" title="Change Icon Color">🎨</button>
            <button class="gf-action-btn gf-add-sub" title="Add Subfolder">+</button>
            <button class="gf-action-btn gf-del" title="Delete Folder">✕</button>
            
            <div class="gf-color-picker">
              ${COLOR_PALETTE.map((c, i) => `
                <div class="gf-color-dot" style="background: ${c.text};" data-color="${i}" title="${c.name}"></div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="gf-children-list"></div>
      `;

      const childrenList = folderEl.querySelector('.gf-children-list');

      if (folder.subfolders && folder.subfolders.length > 0 && childrenList) {
        childrenList.appendChild(buildTreeDOM(folder.subfolders));
      }

      (folder.chats || []).forEach((c, cIndex) => {
        if (!c) return;
        const chatEl = document?.createElement('div');
        if (!chatEl) return;

        chatEl.className = 'gf-chat-item';
        chatEl.innerHTML = `
          <a href="${c.url || '#'}" style="color:inherit; text-decoration:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:80%;">
            ${c.title || 'Untitled Chat'}
          </a>
          <button class="gf-action-btn gf-rm-chat">✕</button>
        `;

        chatEl.querySelector('.gf-rm-chat')?.addEventListener('click', (e) => {
          e.stopPropagation();
          folder.chats.splice(cIndex, 1);
          saveData();
        });

        childrenList?.appendChild(chatEl);
      });

      const colorBtn = folderEl.querySelector('.gf-color-btn');
      const colorPicker = folderEl.querySelector('.gf-color-picker');

      if (colorBtn && colorPicker) {
        colorBtn.onclick = (e) => {
          e.stopPropagation();
          document?.querySelectorAll('.gf-color-picker.show')?.forEach(p => {
            if (p !== colorPicker) p.classList.remove('show');
          });
          colorPicker.classList.toggle('show');
        };

        colorPicker.querySelectorAll('.gf-color-dot')?.forEach(dot => {
          dot.onclick = (e) => {
            e.stopPropagation();
            folder.colorIndex = parseInt(dot.getAttribute('data-color') || '0', 10);
            colorPicker.classList.remove('show');
            saveData();
          };
        });
      }

      folderEl.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        e.dataTransfer?.setData('text/plain', JSON.stringify({ type: 'FOLDER', id: folder.id }));
      });

      folderEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        folderEl.classList.add('drag-over');
      });

      folderEl.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        folderEl.classList.remove('drag-over');
      });

      folderEl.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        folderEl.classList.remove('drag-over');

        try {
          const rawData = e.dataTransfer?.getData('text/plain');
          if (!rawData) return;
          const data = JSON.parse(rawData);

          if (data?.type === 'CHAT') {
            if (!folder.chats.some(c => c.url === data.url)) {
              folder.chats.push({ title: data.title || 'Chat', url: data.url });
              saveData();
            }
          } else if (data?.type === 'FOLDER') {
            if (data.id !== folder.id) {
              const draggedFolder = findFolder(foldersData, data.id);
              if (draggedFolder && !isDescendant(draggedFolder, folder.id)) {
                removeFolder(foldersData, data.id);
                if (!folder.subfolders) folder.subfolders = [];
                folder.subfolders.push(draggedFolder);
                openFoldersState.add(folder.id);
                saveData();
              }
            }
          }
        } catch (err) {
          console.error('[GemiDock] Failed handling drag drop:', err);
        }
      });

      folderEl.querySelector('.gf-folder-header')?.addEventListener('click', (e) => {
        if (!e.target?.classList?.contains('gf-action-btn') && !e.target?.classList?.contains('gf-color-dot')) {
          if (folderEl.classList.contains('open')) {
            folderEl.classList.remove('open');
            openFoldersState.delete(folder.id);
          } else {
            folderEl.classList.add('open');
            openFoldersState.add(folder.id);
          }
        }
      });

      folderEl.querySelector('.gf-add-sub')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const subName = prompt(`Create subfolder inside "${folder.name}":`);
        if (subName && subName.trim()) {
          if (!folder.subfolders) folder.subfolders = [];
          folder.subfolders.push({
            id: 'f_' + Date.now(),
            name: subName.trim(),
            chats: [],
            subfolders: [],
            colorIndex: 0
          });
          openFoldersState.add(folder.id);
          saveData();
        }
      });

      folderEl.querySelector('.gf-del')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${folder.name}" and all its contents?`)) {
          removeFolder(foldersData, folder.id);
          openFoldersState.delete(folder.id);
          saveData();
        }
      });

      container.appendChild(folderEl);
    });

    return container;
  }

  function renderUI() {
    try {
      const root = document?.getElementById('gf-sidebar-root');
      if (!root) return;

      root.innerHTML = `
        <div class="gf-header">Folders</div>
        <button class="gf-new-btn" id="gf-add-folder-btn">
          <span style="font-size: 18px; font-weight: 300;">+</span>
          <span>New folder</span>
        </button>
        <div class="gf-tree" id="gf-tree"></div>

        <!-- PROMPT TEMPLATES SECTION -->
        <div class="gf-prompt-section">
          <div class="gf-header">Prompt Templates</div>
          <button class="gf-new-btn" id="gf-add-prompt-btn">
            <span style="font-size: 18px; font-weight: 300;">+</span>
            <span>New prompt template</span>
          </button>
          <div class="gf-tree" id="gf-prompt-list"></div>
        </div>
      `;

      const addFolderBtn = document?.getElementById('gf-add-folder-btn');
      if (addFolderBtn) {
        addFolderBtn.onclick = () => {
          const name = prompt('Root Folder Name:');
          if (name && name.trim()) {
            foldersData.push({
              id: 'f_' + Date.now(),
              name: name.trim(),
              chats: [],
              subfolders: [],
              colorIndex: 0
            });
            saveData();
          }
        };
      }

      const addPromptBtn = document?.getElementById('gf-add-prompt-btn');
      if (addPromptBtn) {
        addPromptBtn.onclick = () => {
          const title = prompt('Template Title (e.g., "Sermon Assistant"):');
          if (title && title.trim()) {
            const text = prompt('Enter your preset prompt/foreknowledge text:');
            if (text && text.trim()) {
              promptsData.push({
                id: 'p_' + Date.now(),
                title: title.trim(),
                text: text.trim()
              });
              saveData();
            }
          }
        };
      }

      const tree = document?.getElementById('gf-tree');
      if (tree) {
        tree.appendChild(buildTreeDOM(foldersData));
      }

      // Render Prompts List
      const promptListEl = document?.getElementById('gf-prompt-list');
      if (promptListEl) {
        promptsData.forEach((promptItem, pIndex) => {
          if (!promptItem) return;
          const pEl = document?.createElement('div');
          if (!pEl) return;

          pEl.className = 'gf-prompt-item';
          pEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
              ${getPromptSVG()}
              <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${promptItem.title || 'Template'}</span>
            </div>
            <div>
              <button class="gf-action-btn gf-edit-p" title="Edit Prompt">✏️</button>
              <button class="gf-action-btn gf-del-p" title="Delete Prompt">✕</button>
            </div>
          `;

          pEl.onclick = (e) => {
            if (!e.target?.classList?.contains('gf-action-btn')) {
              launchChatWithPrompt(promptItem.text || '');
            }
          };

          pEl.querySelector('.gf-edit-p')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTitle = prompt('Edit Title:', promptItem.title);
            if (newTitle && newTitle.trim()) {
              const newText = prompt('Edit Prompt Text:', promptItem.text);
              if (newText && newText.trim()) {
                promptItem.title = newTitle.trim();
                promptItem.text = newText.trim();
                saveData();
              }
            }
          });

          pEl.querySelector('.gf-del-p')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete prompt template "${promptItem.title}"?`)) {
              promptsData.splice(pIndex, 1);
              saveData();
            }
          });

          promptListEl.appendChild(pEl);
        });
      }
    } catch (err) {
      console.warn('[GemiDock] Error in renderUI:', err);
    }
  }

  document?.addEventListener('click', (e) => {
    try {
      if (!e.target?.classList?.contains('gf-color-btn') && !e.target?.classList?.contains('gf-color-dot')) {
        document?.querySelectorAll('.gf-color-picker.show')?.forEach(p => p?.classList?.remove('show'));
      }
    } catch (err) {
      console.warn('[GemiDock] Error handling click listener:', err);
    }
  });

  /**
   * Detects if user is currently logged out on gemini.google.com
   */
  function isLoggedOut() {
  // 1. Explicit splash/auth routes
  const isAuthPath = window.location.pathname.startsWith('/about') || 
                     window.location.pathname.startsWith('/auth');
  
  // 2. Strict check for active sign-in buttons on the page
  const hasSignInBtn = !!document.querySelector('a[href*="accounts.google.com/ServiceLogin"]') ||
                       !!document.querySelector('a[href*="accounts.google.com/signin"]');

  return isAuthPath || hasSignInBtn;
}

  /**
   * Robust Initialization Wrapper using MutationObserver & Exponential Backoff
   */
  function initializeWithRetry() {
    const MAX_RETRIES = 6;
    let retryCount = 0;
    let delay = 500; // Starting backoff delay in ms
    let isInitialized = false;
    let timeoutId = null;
    let initObserver = null;

    function attemptInitialization() {
      try {
        if (isInitialized) return;

        // 1. Logged-Out Guard Clause
        if (isLoggedOut()) {
          console.warn('[GemiDock] User is logged out. Halting extension initialization gracefully.');
          cleanup();
          return;
        }

        // 2. Check for Target Container Presence
        const allElements = Array.from(document?.querySelectorAll('*') || []);
        const recentsHeader = allElements.find(el => 
          el?.children?.length === 0 && el?.textContent?.trim() === 'Recents'
        );

        if (recentsHeader) {
          // Target container found successfully
          isInitialized = true;
          cleanup();

          loadData(() => {
            try {
              injectFoldersUI();
              makeNativeChatsDraggable();

              // Persistent observer for dynamic SPA re-renders and chat updates
              const persistentObserver = new MutationObserver(() => {
                try {
                  injectFoldersUI();
                  makeNativeChatsDraggable();
                } catch (err) {
                  console.warn('[GemiDock] Persistent observer callback error:', err);
                }
              });
              if (document?.body) {
                persistentObserver.observe(document.body, { childList: true, subtree: true });
              }
            } catch (err) {
              console.warn('[GemiDock] Initialization post-data load error:', err);
            }
          });
          return;
        }

        // 3. Fallback: Exponential Backoff Retry Loop
        retryCount++;
        if (retryCount <= MAX_RETRIES) {
          console.log(`[GemiDock] Target element not found yet. Retrying (${retryCount}/${MAX_RETRIES}) in ${delay}ms...`);
          timeoutId = setTimeout(attemptInitialization, delay);
          delay = Math.min(delay * 2, 8000); // 500ms, 1000ms, 2000ms, 4000ms, 8000ms
        } else {
          console.warn('[GemiDock] Max retries reached waiting for target element. Disconnecting initialization observer.');
          cleanup();
        }
      } catch (err) {
        console.warn('[GemiDock] Error during attemptInitialization:', err);
        cleanup();
      }
    }

    function cleanup() {
      try {
        if (initObserver) {
          initObserver.disconnect();
          initObserver = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      } catch (err) {
        console.warn('[GemiDock] Error during observer cleanup:', err);
      }
    }

    // MutationObserver watches for DOM nodes being attached as Gemini hydrates
    try {
      initObserver = new MutationObserver(() => {
        if (!isInitialized) {
          attemptInitialization();
        }
      });

      if (document?.body) {
        initObserver.observe(document.body, { childList: true, subtree: true });
      } else {
        document?.addEventListener('DOMContentLoaded', () => {
          if (document?.body) {
            initObserver.observe(document.body, { childList: true, subtree: true });
          }
        });
      }

      attemptInitialization();
    } catch (err) {
      console.warn('[GemiDock] Failed to start initialization observer:', err);
    }
  }

  try {
    initializeWithRetry();
  } catch (err) {
    console.warn('[GemiDock] Uncaught exception in main extension entry point:', err);
  }
})();