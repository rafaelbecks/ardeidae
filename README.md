# Ardeidae 🪶

Ardeidae is a NodeJS application that reads input from HID-based  devices and WITMotion accelerometers, processing their data and sending it via OSC (Open Sound Control). This allows integration with audio applications or other systems that support OSC.

## Features
- **HID Ring Device Support**: Works with HID-based ring controllers.
- **WITMotion Accelerometer Support**: Currently tested with the WT9011DCL, but may work with other models.
- **OSC Integration**: Sends processed data to an OSC-compatible system.

## Purpose

This project is all about building the software for a musical glove that lets you control a DAW or instrument using OSC/MIDI.

![Example of implementation](ardeidae.png)

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
Make sure the HID ring is connected, and make sure your terminal has bluetooth access (If you are on a mac this is changed on the privacy settings).

Run the application with:
```sh
node src/ardeidae.js
```
By default, it will connect to the first device that match the BLE service uuid, this can be change updating `SelectFirstFoundDevice` on the `WITAccelerometer` class,
It sends OSC messages to `127.0.0.1` on port `3333`.

## OSC Parameters
The software sends the following OSC parameters:
- **Ring Device Events**
  - `/ring-button` (integer) → Button press values (mapped from hex codes)
- **Accelerometer Data**
  - `/accelerometer/ax` → X-axis acceleration
  - `/accelerometer/ay` → Y-axis acceleration
  - `/accelerometer/az` → Z-axis acceleration
  - `/accelerometer/angx` → X-axis angle
  - `/accelerometer/angy` → Y-axis angle
  - `/accelerometer/angz` → Z-axis angle
  - `/accelerometer/gx` → X-axis gyroscope
  - `/accelerometer/gy` → Y-axis gyroscope
  - `/accelerometer/gz` → Z-axis gyroscope

## Configuration
Modify `src/config.js` to adjust settings such as OSC host, port, or device service IDs (for bluetooth low energy) and mappings.
