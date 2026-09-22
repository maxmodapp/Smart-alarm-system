# G12 Smart Alarm System

An Android application and IoT platform for monitoring and controlling a physical, three-zone alarm system with live video and real-time status updates.

This academic project was developed for **Project Workshop I — Computer Engineering, National University of La Plata (UNLP)**. It combines an EDU-CIAA-NXP board, an ESP32-CAM, and PIR motion sensors. This repository is structured as a portfolio presentation, with a particular focus on the mobile application and end-to-end integration.

> **Status:** functional academic prototype. It operates over a local Wi-Fi network and is not intended to be a production-ready security product.

## App demo

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/APP-09.jpeg" width="210" alt="Disarmed system"><br><sub>Disarmed</sub></td>
    <td align="center"><img src="docs/screenshots/APP-04.jpeg" width="210" alt="Arming countdown"><br><sub>Arming countdown</sub></td>
    <td align="center"><img src="docs/screenshots/APP-01.jpeg" width="210" alt="Armed system"><br><sub>Armed</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/APP-02.jpeg" width="210" alt="Triggered alarm"><br><sub>Alarm triggered</sub></td>
    <td align="center"><img src="docs/screenshots/APP-03.jpeg" width="210" alt="Zone management"><br><sub>Zone management</sub></td>
    <td align="center"><img src="docs/screenshots/APP-08.jpeg" width="210" alt="Event history"><br><sub>Event history</sub></td>
  </tr>
</table>

> The screenshots document the original Spanish-language prototype. The current source uses an English interface.

## Features

- Remote system arming and disarming.
- Reactive state: the UI only displays changes confirmed by the hardware.
- Independent enable/disable controls and custom names for three zones.
- Per-zone motion indicators and online/offline connection status.
- Automatic WebSocket reconnection with backoff and heartbeat monitoring.
- Timestamped arming, disarming, and alarm event history.
- Live MJPEG video from the ESP32-CAM.
- Local persistence for the IP address, port, reconnection preference, and zone names.

## Architecture

```mermaid
flowchart LR
    APP[Android app\nReact Native + Expo]
    ESP[ESP32-CAM\nWi-Fi gateway]
    CIAA[EDU-CIAA-NXP\nAlarm controller]
    PIR[3 PIR sensors]
    BUZ[Passive buzzer]
    CAM[OV2640 camera]

    APP <-->|WebSocket · port 81\ncommands + state| ESP
    APP <-->|HTTP · port 80\nMJPEG stream| ESP
    ESP <-->|UART · 115200 baud| CIAA
    CAM --> ESP
    PIR --> CIAA
    CIAA --> BUZ
```

The **EDU-CIAA** is the source of truth for the alarm state. The **ESP32-CAM** bridges UART and the local network, stores an in-memory circular event history, and serves the camera stream. The **Android app** provides the user experience and waits for hardware confirmation before updating its state.

The UART protocol retains its original Spanish state identifiers for firmware compatibility:

```text
DESARMADA ── ARM ──> ARMANDO (5 s) ──> ARMADA
    ^                                      │
    └────────────── DISARM ────────────────┤
                                           │ motion in an enabled zone
                                           v
                                       DISPARO
                                           │
                                           └── DISARM ──> DESARMADA
```

## Technology stack

| Layer | Technologies |
| --- | --- |
| Mobile app | React Native 0.81, Expo 54, Expo Router, TypeScript |
| Local state | React Context + AsyncStorage |
| Real-time transport | WebSocket over the local Wi-Fi network |
| Video | HTTP MJPEG embedded with `react-native-webview` |
| Gateway | ESP32-CAM, Arduino framework, `arduinoWebSockets` |
| Embedded control | EDU-CIAA-NXP, C, sAPI 0.6.2 |
| Hardware | 3 × HC-SR501 PIR sensors, passive buzzer, transistor stage, custom shield PCB |

## Repository structure

```text
.
├── android-app/                 # React Native/Expo application
│   ├── app/                     # Screens and tab navigation
│   ├── components/              # Reusable UI components
│   ├── constants/               # Visual constants and color palette
│   └── store/alarm.tsx          # State, persistence, and WebSocket client
├── firmware/
│   ├── edu-ciaa/alarm/          # FSM, sensors, siren, and UART protocol
│   └── esp32-cam/               # WebSocket/UART gateway and camera server
├── docs/
│   ├── Informe.pdf              # Original academic report in Spanish
│   ├── PROTOCOL.md              # Communication contract
│   ├── DEMOS.md                 # Recorded demo inventory
│   ├── videos/                   # Full prototype demonstrations (Git LFS)
│   └── screenshots/             # App screenshots
```

## Run the Android app

Requirements: Node.js 20 or newer, Android Studio/an emulator or an Android phone compatible with Expo SDK 54, and the phone connected to the same 2.4 GHz Wi-Fi network as the ESP32-CAM.

```bash
cd android-app
npm ci
npm run android
```

In the **Config** tab:

1. Enter the ESP32-CAM local IP address.
2. Keep port `81` for WebSocket communication.
3. Save the configuration and press **Connect**.

The UI can run without the physical system, but its controls only take effect while the WebSocket is connected.

## Flash the firmware

### ESP32-CAM

1. Open [`firmware/esp32-cam/codigoesp32.ino`](firmware/esp32-cam/codigoesp32.ino) in the Arduino IDE.
2. Install the ESP32 core and the `arduinoWebSockets` library.
3. Copy `secrets.example.h` to `secrets.h` and enter credentials for a 2.4 GHz Wi-Fi network.
4. Select the board profile compatible with the AI-Thinker ESP32-CAM and upload the sketch.
5. Read the assigned IP address from the serial monitor at 115200 baud.

### EDU-CIAA-NXP

The application firmware uses [firmware_v3](https://github.com/epernia/firmware_v3) with sAPI 0.6.2. Copy [`firmware/edu-ciaa/alarm`](firmware/edu-ciaa/alarm) into `firmware_v3/examples/c/alarm` and select:

```makefile
BOARD = edu_ciaa_nxp
PROGRAM_PATH = examples/c
PROGRAM_NAME = alarm
```

Firmware pin map:

| Function | Pin |
| --- | --- |
| Zone 1 PIR | `GPIO1` |
| Zone 2 PIR | `GPIO4` |
| Zone 3 PIR | `GPIO6` |
| Passive buzzer | `GPIO7` |
| ESP32-CAM link | `UART_232`, 115200 baud |
| Debug output | `UART_USB`, 115200 baud |

Wire UART TX/RX as a crossover connection and use a shared ground. Power delivery and the buzzer driver stage must follow the schematic in the [academic report](docs/Informe.pdf).

## Protocol

Commands are newline-terminated ASCII messages: `ARM`, `DISARM`, `GET`, `HIST`, and `z1=0|1` through `z3=0|1`. The EDU-CIAA reports its state and bitmasks over UART; the ESP32 converts them to JSON and broadcasts them over WebSocket. See [docs/PROTOCOL.md](docs/PROTOCOL.md) for the complete contract and camera endpoints.

## Known limitations

- The system operates over the LAN using `ws://` and `http://`; it has no authentication or encryption.
- Wi-Fi credentials are supplied at compile time in a Git-ignored `secrets.h` file.
- The ESP32 stores up to 120 events in RAM; history is lost after a restart.
- The app mirrors the five-second countdown locally because the firmware does not transmit the remaining time.
- The app does not send background push notifications.
- Sensors are wired, and this version is limited to three zones.
- Full prototype recordings are available in [docs/videos](docs/videos) and indexed in [docs/DEMOS.md](docs/DEMOS.md).

## Portfolio contribution

**Máximo Dappiano** led development of the Android application, user interface, event history, ESP32-CAM firmware, HTTP/WebSocket communication, and final system integration. The complete project also involved electronics design, low-level firmware, PCB manufacturing, and validation on physical hardware.

## Team

- Máximo Dappiano
- Tiago Restucha
- Ignacio Andrés Schwindt
- Valentín Ventos

Developed for Project Workshop I at the School of Engineering, National University of La Plata. The original technical report and complete task breakdown are available in the [final report](docs/Informe.pdf) (Spanish).
