# Ardeidae 🪶

Ardeidae is a NodeJS application that reads input from multiple sensors, processes their data, and sends it via OSC (Open Sound Control). This allows integration with audio applications or other systems that support OSC.

## Features
- **HID Ring Device Support**: Works with HID-based ring controllers.
- **WITMotion Accelerometer Support**: Currently tested with the WT9011DCL but may work with other models.
- **TFLuna Support (partial)**: Currently forwarding data from https://github.com/zkmkarlsruhe/tfluna.
- **OSC Integration**: Sends processed data (or forwards it) to an OSC-compatible system.

## Purpose
This project is all about building the software for a musical glove that lets you control a DAW or instrument using OSC/MIDI.

![Example of implementation](ardeidae.png)

Note: Rasperry Pi Pico W implementation with the Lidar sensor (to allow the device being standalone and be used as a standalone BLE device) is not implemented.

## Installation
1. Clone this repository:
   ```sh
   git clone https://github.com/rafaelbecks/ardeidae.git
   cd ardeidae
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Usage
### Headless Mode
Run the application in CLI mode with:
```sh
npm run cli
```

### UI Mode
You can use a deployed version of the UI by running:
```sh
npm run ui:remote
```
This will run an Electron host pointing to the latest remote deployed UI. Make sure to refresh (Ctrl+Shift+R) if you see an outdated UI.

Alternatively, you can run a local version of the UI by cloning the UI repository and setting it up:
```sh
git clone https://github.com/rafaelbecks/ardeidae-ui
```
Ensure both projects are in the same root folder. Then run:
```sh
npm run ui:local
```
This will run a version of the UI on a local server, and the Electron host will point to that local URL.

### Default Behavior
- Ensure the HID ring is connected and that your terminal has Bluetooth access (on macOS, adjust this in Privacy settings).
- The device name can be changed in the `config.js` file.
- By default, the application connects to the first device that matches the BLE service UUID. This behavior can be modified by updating `SelectFirstFoundDevice` in the `WITAccelerometer` class.
- For the TFLuna sensor, the Python package [tfluna](https://github.com/zkmkarlsruhe/tfluna) is required. The OSC data is then forwarded accordingly.
- This is a work-in-progress project and is constantly being updated.
- The application sends OSC messages to `127.0.0.1` on port `3333`.

## OSC Parameters
### Ring Device Events
- `/ring-button` (integer) → Button press values (mapped from hex codes)

### Accelerometer Data
- `/accelerometer/ax` → X-axis acceleration
- `/accelerometer/ay` → Y-axis acceleration
- `/accelerometer/az` → Z-axis acceleration
- `/accelerometer/angx` → X-axis angle
- `/accelerometer/angy` → Y-axis angle
- `/accelerometer/angz` → Z-axis angle
- `/accelerometer/gx` → X-axis gyroscope
- `/accelerometer/gy` → Y-axis gyroscope
- `/accelerometer/gz` → Z-axis gyroscope

### Lidar Sensor Data
- `/tfluna` (integer) → Distance read by the LiDAR sensor

## Configuration
Modify `src/config.js` to adjust settings such as OSC host, port, or device service IDs (for Bluetooth Low Energy) and mappings.

## TODO
- Move UI and current TFLuna dependency to git submodules.
- Write a USB serial port driver for the TFLuna.
  - Allow setting the serial USB device address in the config file.
  - Remove the current dependency and OSC forwarding.
- In the UI script and CLI, allow selecting which sensors should be enabled via arguments (CLI) and an array of sensors (for the UI).
  ```js
  const Sensors = {
    RING: 'RING',
    ACCELEROMETER: 'ACCELEROMETER',
    LIDAR: 'LIDAR'
  }
  ```
- Allow changing the rate of sending for sensors like the accelerometer.
  - Optionally, allow turning off OSC sending while still reading sensor data.
- Implement MIDI support and mapping.
  - Design a declarative way to configure MIDI mappings for ease of use.
- Fix cache issue with the UI project.
