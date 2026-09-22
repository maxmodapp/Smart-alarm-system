# Firmware

## EDU-CIAA-NXP

`edu-ciaa/alarm` contains only the program developed for this project. The upstream framework and its dependencies are intentionally not duplicated in this repository.

To build it, use `firmware_v3` with sAPI 0.6.2, copy the `alarm` directory into `examples/c/`, and select the `edu_ciaa_nxp` board and `alarm` program.

## ESP32-CAM

The `esp32-cam/codigoesp32.ino` sketch provides:

- Wi-Fi connectivity;
- a WebSocket ↔ UART bridge;
- a 120-entry circular event history with NTP timestamps;
- JPEG capture and MJPEG streaming;
- the `/cam/health` diagnostic endpoint.

Before building, copy `secrets.example.h` to `secrets.h` and enter the Wi-Fi credentials. The resulting file is excluded from Git.

This implementation is a local-network prototype. Do not expose ports 80 or 81 to the Internet without authentication, encryption, and access controls.
