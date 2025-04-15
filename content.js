let selectedDeviceLabel = "default";
let userInteracted = false;
let alertAudio = null; // Store reference to audio instance
let stopPlayback = false;


const alertSound = "https://libs.salemove.com/6d8ca61eb6a0ae1f45a1.mp3";

// Detect user interaction to allow autoplay
document.addEventListener("click", () => { userInteracted = true; }, { once: true });

async function getStoredDeviceLabel() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["selectedDeviceLabel"], (data) => {
            if (!data || !data.selectedDeviceLabel) {
                console.warn("⚠️ No stored device found, using default.");
                resolve("default");
                return;
            }
            resolve(data.selectedDeviceLabel);
        });
    });
}

async function playAlertSound() {
    stopPlayback = false; // Ensure playback starts if allowed

    let selectedDeviceLabel = await getStoredDeviceLabel(); // Fetch only the label

    // Refresh device list
    let devices = await navigator.mediaDevices.enumerateDevices();
    let matchingDevice = devices.find(device =>
        device.kind === "audiooutput" && device.label === selectedDeviceLabel
    );

    let deviceId = matchingDevice ? matchingDevice.deviceId : "default";

    alertAudio = new Audio(alertSound);
    alertAudio.loop = true; // Enable looping

    if (typeof alertAudio.setSinkId === "function" && deviceId !== "default") {
        try {
            await alertAudio.setSinkId(deviceId);
        } catch (error) {
            console.error("❌ Failed to set output device:", error);
        }
    }

    try {
        while (!stopPlayback) { // Keep playing until stopped
            await alertAudio.play();
            await new Promise(resolve => alertAudio.onended = resolve); // Wait for one loop to finish
        }
    } catch (error) {
        console.error("❌ Failed to play audio:", error);
    }
}

// 📌 Stop the looping alert
function stopAlertSound() {
    stopPlayback = true;
    if (alertAudio) {
        alertAudio.pause();
        alertAudio.currentTime = 0;
    }
}

// 📌 **Monitor "Incoming * Engagement" messages**
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        // 🚀 Detect incoming events (added nodes)
        mutation.addedNodes.forEach(async (node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.textContent.match(/Incoming(?:\s.*)?\s(Engagement|Transfer|Callback|Join)/)) {
                if (!userInteracted) return;
                await playAlertSound();
            }
        });

        // ⏹️ Detect when the engagement modal is removed (deleted nodes)
        mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.textContent.match(/(Engagement|Transfer|Callback|Join)/)) {
                stopAlertSound();
            }
        });
    });
});

// Start observing changes in the document body
observer.observe(document.body, { childList: true, subtree: true });

// Listen for updates from background & popup scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SAVE_DEVICE_LABEL") {
        selectedDeviceLabel = request.deviceLabel;
        sendResponse({ status: "success" }); // Confirm receipt
    }
});

// Listen for storage updates as a backup mechanism
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.selectedDeviceLabel?.newValue) {
        selectedDeviceLabel = changes.selectedDeviceLabel.newValue;
    }
});