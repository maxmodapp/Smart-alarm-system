# Android Application

The mobile client for the **G12 Smart Alarm System**. It provides a single interface for monitoring and controlling the alarm prototype from an Android device.

## Main features

- Real-time alarm status and connection indicator.
- Remote arming and disarming through WebSocket commands.
- Independent management of three security zones.
- Custom names for each zone, stored locally on the device.
- Alarm event history with date, time, and triggered zone.
- Live ESP32-CAM video stream embedded in the application.
- Persistent connection settings and automatic reconnection.

## Screens

- **Home:** system status, enabled zones, sensor activity, and alarm controls.
- **Zones:** zone configuration and access to the live camera feed.
- **History:** chronological list of alarm events reported by the hardware.
- **Configuration:** ESP32-CAM network address, WebSocket port, and automatic connection settings.

## Technology

- React Native 0.81
- Expo 54 and Expo Router
- TypeScript
- React Context for shared alarm state
- AsyncStorage for local persistence
- WebSocket for bidirectional control and status updates
- WebView for the MJPEG camera stream

## Communication

The app connects to the ESP32-CAM through a local Wi-Fi network:

- WebSocket control and telemetry: `ws://<device-ip>:81`
- Camera stream: `http://<device-ip>/cam/stream`

The ESP32-CAM acts as the communication bridge between the Android app and the EDU-CIAA controller. The shared application state, WebSocket lifecycle, message processing, reconnection logic, and local persistence are centralized in `store/alarm.tsx`.

## Project structure

```text
app/                 Expo Router screens and navigation
components/          Reusable interface components
constants/           Colors, theme, and shared strings
store/alarm.tsx      Alarm state and communication layer
assets/              Icons, images, and fonts
```

## Running locally

Prerequisites: Node.js, npm, Expo tooling, and an Android device or emulator.

```bash
npm ci
npm run android
```

To run Expo without immediately selecting a platform:

```bash
npm start
```

The Android device and the embedded system must be connected to the same local network. Enter the ESP32-CAM IP address and WebSocket port `81` in the application's configuration screen.

## Code quality

Run the configured Expo lint check with:

```bash
npm run lint
```

This directory contains the original working application source. Portfolio-level project context, hardware architecture, screenshots, demonstrations, and protocol documentation are available in the repository root.
