# Bluetooth Printer Setup Guide

This guide explains how to connect a new Bluetooth ESC/POS receipt printer to the mobile POS application.

---

## 🛠️ Step 1: Hardware Preparation

1. **Turn on the Printer**: Ensure your thermal printer is fully charged or plugged in, and turned ON.
2. **Load Paper**: Verify that thermal paper is loaded correctly (thermal side facing the print head, typically feeding from the bottom).
3. **Verify Bluetooth Mode**: Ensure the printer's Bluetooth status light is flashing (indicating it is discoverable and ready for pairing).

---

## ⚙️ Step 2: Pair with Device Settings (First Time Only)

Before connecting inside the app, the printer **must** be paired with your Android or iOS device's system settings:

### For Android:
1. Open **Settings** > **Connected devices** > **Connection preferences** > **Bluetooth**.
2. Turn on Bluetooth if it's disabled.
3. Tap **Pair new device**.
4. Select your thermal printer from the list of available devices (common names: *MTP-II*, *PT-210*, *POS-58*, *EP-58*, etc.).
5. Enter the pairing PIN when prompted (typically `0000` or `1234`).

### For iOS:
1. Open **Settings** > **Bluetooth**.
2. Turn on Bluetooth.
3. Tap the printer name under **Other Devices** to pair it.

---

## 📱 Step 3: Connect Printer in the App

1. Open the POS app on your device.
2. Navigate to the **Settings** tab.
3. Locate the **Printer Settings** section.
4. Tap **Scan/Refresh Devices**. The app will list all paired Bluetooth devices.
5. Select your printer's name or MAC address from the list.
6. Tap **Connect**. Once successfully connected, a status message will show **Connected** along with the device name.

---

## 🧪 Step 4: Run a Test Print

To verify the connection, layout width, and font configuration:
1. In the **Printer Settings** screen, tap **Print Test Page**.
2. The printer should feed and print a formatted slip showing test text and sample currencies (e.g., `Rp 15.000`).

---

## 🔍 Troubleshooting

### 1. Printer is not showing up in the list
* **Solution**: Ensure you paired the printer in the Android/iOS **System Settings** first. The app scans paired/bonded devices.

### 2. Connection fails
* **Solution**: Turn the printer off and on, turn your phone's Bluetooth off and on, and then try pairing/connecting again. Ensure no other device is currently connected to the printer (most Bluetooth receipt printers only support one active connection at a time).

### 3. Receipts show gibberish characters
* **Solution**: This application uses standard ESC/POS commands via the `PrinterService`. Check if your printer supports standard ESC/POS protocol (usually set via micro-switches or default configuration on the printer).
