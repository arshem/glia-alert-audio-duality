const alertSound = "https://libs.salemove.com/6d8ca61eb6a0ae1f45a1.mp3";

async function updateDeviceDropdown() {
    let deviceSelect = document.getElementById("deviceSelect");

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputDevices = devices.filter(device => device.kind === "audiooutput");

        // Clear dropdown before repopulating
        deviceSelect.innerHTML = `<option value="default">Default Output</option>`;

        outputDevices.forEach(device => {

            let option = document.createElement("option");
            option.value = device.label;
            option.textContent = device.label || "Unknown Device";
            deviceSelect.appendChild(option);
        });

        // Restore stored selection
        chrome.storage.local.get(["selectedDeviceLabel"], (data) => {
            let storedDevice = [...deviceSelect.options].find(option => option.value === data.selectedDeviceLabel);

            if (storedDevice) {
                deviceSelect.value = data.selectedDeviceLabel;
            } else {
                console.warn("⚠️ Stored device not found in the list, defaulting.");
            }
        });

        deviceSelect.disabled = false;
    } catch (err) {
        console.error("🚨 Error fetching devices:", err);
    }
}

// 📌 **Store `label` properly & ensure correct UI selection**
document.getElementById("deviceSelect").addEventListener("change", async (event) => {
    let selectedLabel = event.target.value; // No need to parse JSON anymore

    try {
        await chrome.storage.local.set({
            selectedDeviceLabel: selectedLabel
        });

        chrome.runtime.sendMessage({
            type: "SAVE_DEVICE_LABEL",
            deviceLabel: selectedLabel
        });

    } catch (error) {
        console.error("❌ Failed to store selected device:", error);
    }
});

// 📌 **Test Alert Button**
document.getElementById("testAudio").addEventListener("click", async () => {
    try {
        chrome.storage.local.get(["selectedDeviceLabel"], async (storageData) => {
            let selectedDeviceLabel = storageData.selectedDeviceLabel || "default";

            let devices = await navigator.mediaDevices.enumerateDevices();
            let matchingDevice = devices.find(device =>
                device.kind === "audiooutput" && device.label === selectedDeviceLabel
            );

            let matchingDeviceId = matchingDevice ? matchingDevice.deviceId : "default";

            const audio = new Audio(alertSound);
            if (audio.setSinkId && matchingDeviceId !== "default") {
                await audio.setSinkId(matchingDeviceId);
            }
            audio.play();
        });
    } catch (error) {
        console.error("❌ Test alert failed:", error);
    }
});


// Initialize UI
document.addEventListener("DOMContentLoaded", updateDeviceDropdown);
