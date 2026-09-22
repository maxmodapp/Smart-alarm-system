# Communication Protocol

The application does not connect directly to the EDU-CIAA. The ESP32-CAM translates between WebSocket and UART while also serving the camera stream over HTTP.

## Application → ESP32-CAM → EDU-CIAA

Every control message is an ASCII line terminated with `\n`.

| Command | Effect |
| --- | --- |
| `ARM` | Starts the five-second arming period. |
| `DISARM` | Disarms the system and stops the siren. |
| `GET` | Requests the complete current state. |
| `z1=1` / `z1=0` | Enables or disables zone 1. |
| `z2=1` / `z2=0` | Enables or disables zone 2. |
| `z3=1` / `z3=0` | Enables or disables zone 3. |
| `HIST` | Requests history from the ESP32; it is not forwarded over UART. |

The WebSocket server listens on port `81` without an additional path.

## EDU-CIAA → ESP32-CAM

The EDU-CIAA sends four space-separated fields:

```text
<estado> <mask_enable> <mask_active> <disparo_zona>
```

Example:

```text
ARMADA 3 0 0
```

- `estado`: `DESARMADA`, `ARMANDO`, `ARMADA`, or `DISPARO`.
- `mask_enable`: bitmask of enabled zones.
- `mask_active`: bitmask of sensors currently detecting motion.
- `disparo_zona`: `1..3`, or `0` when no zone triggered the alarm.

Bits 0, 1, and 2 represent zones 1, 2, and 3 in both masks. Field names and state values remain in Spanish to preserve compatibility with the original firmware protocol.

## ESP32-CAM → application

Every valid UART state is broadcast as JSON:

```json
{
  "estado": "ARMADA",
  "mask_enable": 3,
  "mask_active": 0,
  "disparo_zona": 0
}
```

The response to `HIST` has the following structure:

```json
{
  "type": "HIST",
  "items": [
    { "tipo": "DISPARO", "zona": 2, "t": 1770413000000 },
    { "tipo": "ARMADA", "t": 1770412990000 }
  ]
}
```

`t` is a Unix timestamp in milliseconds obtained through NTP.

## Camera and diagnostics

The HTTP server listens on port `80`:

| Method and route | Response |
| --- | --- |
| `GET /cam/stream` | Multipart MJPEG stream. |
| `GET /cam/capture` | Single JPEG capture. |
| `GET /cam/health` | JSON containing the IP address and available URLs. |

## Synchronization and recovery

The application sends `GET` every 10 seconds. If it receives no data for more than 25 seconds, it closes the socket to activate automatic reconnection. Backoff starts at 800 ms and is capped at 6 seconds.
