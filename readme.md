# 🔊 Audio Alert Selector - Chrome Extension

## 📌 Overview
**Audio Alert Selector** is a Chrome extension that allows users to choose a specific audio output device for notifications. Unlike most applications that respect the system default audio device, this extension enforces sound routing based on a selected device, ensuring alerts are always played consistently.

---

## ❗ Problem Statement: Why `setSinkId` is Needed
### ❌ Shortcomings of System Default Audio Routing
Typically, audio in web apps and browser-based applications plays through **the system's default audio output device**. However, this causes issues in multi-device setups:
1. **Changing Default Devices Disrupts Alerts**:
   - If the user's default sound device changes (e.g., Bluetooth headphones disconnect), alerts may route unpredictably.
2. **Limited Control for Users with Multiple Audio Outputs**:
   - Many users (e.g., customer service reps with speakers + headsets) need alerts on **a dedicated device** while continuing calls on another.
3. **Web Applications Cannot Select an Audio Device Dynamically**:
   - Browsers do not allow web-based applications to programmatically choose an output device **unless explicitly set using `setSinkId`**.

### ✅ The Power of `setSinkId`
- **Overrides system default and forces audio to play on a specific device**.
- **Ensures alerts never "vanish" to unintended headphones, Bluetooth devices, or inactive speakers**.
- **Saves selections per device session**, preventing unnecessary changes.

This extension **fixes gaps in audio routing behavior** by **allowing users to select an output device permanently**, ensuring all alerts play on the right device every time.

---

## ✨ Features
✔️ Allows users to **select an audio output device**  
✔️ Uses **device label matching only**, avoiding unstable `deviceId` changes  
✔️ **Plays alerts automatically** when an incoming event is detected  
✔️ **Includes a test sound button** to verify correct routing  
✔️ **Remembers your selection** even if the system audio setup changes  

---

## ⚙️ Installation

1. **Unzip the extension**
    - Download the extension
    - Unzip the downloaded file to a directory where it won't be accidentally deleted
2. **Load the unpacked extension in Chrome**:
    - Open `chrome://extensions/`
    - Enable **Developer Mode** (top right corner).
    - Click **"Load Unpacked"**.
    - Select the folder containing `manifest.json`.

3. **Grant permission to access audio devices**:
    - Click the extension icon in Chrome.
    - Click **"Grant Access"** if required.


---

## 🚀 How It Works

### 1️⃣ **Device Selection (`popup.js`)**
- The popup displays all **available audio output devices**.
- When a user selects a device:
- Its **label** is stored in `chrome.storage.local` (NOT `deviceId` or `groupId`).
- On playback, the extension **matches the label to the latest available device**.

---

### 2️⃣ **Playing Alerts (`content.js`)**
- **Monitors incoming browser events (like engagement notifications)**.
- **Fetches the latest audio devices before playing each alert**.
- Uses `setSinkId(deviceId)` to ensure playback happens on the selected output.

#### 📧 **Interprocess Communication**
- `popup.js` → Sends selected **device label** to `content.js`.
- `content.js` → Monitors for storage updates and **ensures dynamic switching**.

---

## 🔄 Updating The Extension
If you make changes:
1. Go to `chrome://extensions/`
2. Click **"Reload"** on your extension and your browser window.

---

## 🛠️ Troubleshooting

### ❌ "Extensions cannot access audio devices"
**Fix**: Navigate to `chrome://settings/content/sound` and allow sound playback. *Note:* This has to be enabled on the Chrome Extension level, not the page level. Right click on the extension icon and select "View Web Permissions".

### ❌ No devices appear in the dropdown
**Fix**:
1. Ensure an **audio output device is connected**.
2. Click **"Grant Access"** to allow device enumeration.
3. Reload the extension.

### ❌ Alert sounds do not play on the selected device
**Fix**:
1. Open Developer Console (`Ctrl + Shift + J` / `Cmd + Option + J`).
2. Run:
navigator.mediaDevices.enumerateDevices().then(console.log);- Ensure the intended output device appears.
3. Verify saved selection:
chrome.storage.local.get(["selectedDeviceLabel"], console.log);4. Confirm `setSinkId` support:
let audio = new Audio("<media url>");
audio.setSinkId("your_device_id").then(() => audio.play());

---

## 📜 License
MIT License.
---

Made with ❤️ and :coffee: for better audio routing!