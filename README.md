# GemiDock 🚀

**GemiDock** is a lightweight, privacy-first Chrome Extension that seamlessly injects custom nested folder organization and prompt templates directly into Google Gemini's native sidebar interface.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Platform](https://img.shields.io/badge/Platform-Google%20Gemini-orange)

---

## ✨ Features

* 📁 **Nested Folders:** Create master folders and infinite subfolders to organize your active project chats.
* 🖱️ **Drag-and-Drop Integration:** Drag any chat link from **Recents** or move subfolders directly into target folders.
* 🎨 **Color-Coded Icons:** Personalize folder vector icons with custom color accents for fast visual navigation.
* ⚡ **Prompt Templates Engine:** Store pre-written prompts, system instructions, or foreknowledge presets. Click any template to pre-fill Gemini's prompt box instantly.
* 🎨 **Native UI Styling:** Blends directly into Gemini's dark theme without awkward floating windows or separate side-panels.
* 🔒 **100% Local & Private:** Uses standard browser storage (`chrome.storage.local`). Your chats, folder structure, and prompt templates never leave your local device.

---

## 🚀 Installation

### Option A: Install from Chrome Web Store (Recommended)
*(Link coming soon upon Web Store review approval)*

---

### Option B: Load Unpacked (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone [https://github.com/thevision9/GemiDock.git](https://github.com/thevision9/GemiDock.git)
2. Open Google Chrome and navigate to chrome://extensions/.

3. Enable Developer mode using the toggle switch in the top-right corner.

4. Click Load unpacked in the top-left corner.

5. Select the GemiDock project directory.

6. Open gemini.google.com and refresh the page.



📖 How to Use
1. Organizing Chats into Folders
Create a Root Folder: Click + New folder inside the Folders section.

Create a Subfolder: Hover over any folder header and click the + button.

Add Chats: Click and drag any chat thread under Recents and drop it onto a folder.

Nest Folders: Click and drag any folder into another master folder.

2. Customizing Folder Colors
Click the palette icon (🎨) on any folder header to expand the color dots.

Select a color preset (Blue, Green, Yellow, Red, Purple, or Default) to tint the SVG folder icon.

3. Using Prompt Templates
Navigate to the Prompt Templates section on the sidebar.

Click + New prompt template to add a title and template text (e.g., sermon outlines, code review guidelines, event planning templates).

Click any saved template to instantly pre-fill Gemini's input box with your saved prompt text without page flickering.

Use the edit (✏️) or delete (✕) buttons to modify templates on the fly.

🛠️ Built With
Manifest V3

JavaScript (ES6+)

HTML5 / CSS3

Chrome Storage API (chrome.storage.local)

MutationObserver API for zero-flicker UI injection

📄 License
Distributed under the MIT License. See LICENSE for more information.