# Sokratech SDK React Native Demo

End-to-end Proof of Concept consuming the [`ppl-a4-sdk-react-native`](https://github.com/ppl-a4-sokratech/ppl-a4-sdk-react-native) package on Web, Android, and iOS. Built with Expo SDK 54 + React Native 0.81.

Sibling demo of the [`ppl-a4-fe-web`](https://github.com/ppl-a4-sokratech/ppl-a4-fe-web) (Next.js) and [`ppl-a4-fe-mobile`](https://github.com/ppl-a4-sokratech/ppl-a4-fe-mobile) (Flutter) PoCs.

## Demo surfaces (tabs)

| Tab | What it does |
|---|---|
| **Config** | Enter workflow + profile IDs from the admin portal; SDK reinitializes via `initAsync` and fetches recipes from the backend. Leave blank to use local all-true recipes. |
| **Behavioral** | Touchpad (tap / hold / drag), input fields, scroll view, simulated lifecycle (background ping), accelerometer + gyroscope (mobile only). Drain buffers the events into a single payload. |
| **Fingerprint** | Collects device + screen + (web only) audio / canvas / graphics / fonts. |
| **Detection** | Runs emulator detection on mobile and webDriver detection on web. |
| **Flush** | Bundles behavioral + fingerprint + detection signals and POSTs to `/ingest`. Renders the backend decision. |
| **Login** | Full login form with cached-fingerprint toggle, timing breakdown (behavioral / fingerprint / detect / fetch), and an ingest result panel matching the [`ppl-a4-fe-web`](https://github.com/ppl-a4-sokratech/ppl-a4-fe-web) login UX. Falls back to a mock decision when the backend is unreachable. |
| **Profiling** | Lists SDK-internal timings recorded by the SDK `Profiler` (e.g. `sdk.initialize`, `fingerprint.collect`, `sdk.flushIngest`). |

## Prerequisites

- Node.js 20+
- npm
- For Android: Android Studio + JDK 17 + SDK Platform 34 (only if you want to build a native dev client locally instead of using EAS)
- For iOS: Xcode + macOS (only if you want to build locally; otherwise use EAS Build)
- The SDK source must sit as a sibling folder at `../ppl-a4-sdk-react-native` — Metro is configured to resolve the package locally via this path.

## Setup

```bash
git clone <repo-url> ppl-a4-fe-react-native
cd ppl-a4-fe-react-native
npm install
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_SOKRATECH_API_DOMAIN=http://localhost:3000
```

Point this at your local `ppl-a4-api-be`, or a staging URL. The workflow + profile IDs are entered at runtime in the Config tab, not via env vars.

## Run

### Web

```bash
npx expo start --web
```

Opens at `http://localhost:8081`. All surfaces work except sensors (mobile only) and emulator detection (mobile only).

### Android

#### Option A: EAS dev client (recommended from Windows)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile development
```

EAS builds an APK in the cloud that includes the native modules (`react-native-device-info`, `expo-sensors`, `react-native-get-random-values`). Install the APK on your device, then run Metro:

```bash
npx expo start --dev-client
```

Open the installed dev client app, scan the Metro QR code or tap "Fetch development servers".

#### Option B: Local native build

```bash
npx expo prebuild --platform android --clean
npx expo run:android
```

Requires Android Studio + emulator or USB-connected device with debugging enabled. First run is slow (~10 minutes, downloads Gradle); subsequent runs are fast.

### iOS

#### Option A: EAS dev client (works from Windows)

```bash
eas device:create               # register iPhone UDID once
eas build --platform ios --profile development
```

Requires an Apple ID (free tier OK for personal device install; paid Apple Developer Program $99/year for TestFlight). After build, install the IPA via Safari and trust the developer profile in Settings → General → VPN & Device Management.

#### Option B: Local native build (Mac only)

```bash
npx expo run:ios
```

## Configuration

### Runtime config (UI)

The Config tab takes:

- **Workflow ID** + **Profile ID** — UUIDs from the admin portal at `ppl-a4-fe-web`. When both are set, the SDK fetches the recipe from `GET /sdk/v1/config/:workflowId/:profileId`.

### Build-time config (env)

Only one env var is supported. Everything else (workflow / profile IDs, ingest endpoint) is either entered at runtime or hardcoded in the SDK.

```
EXPO_PUBLIC_SOKRATECH_API_DOMAIN=<backend-domain>
```

For physical devices, replace `localhost` with the LAN IP of the machine running the backend.

## Project structure

```
App.tsx                         # tab bar + SDK init lifecycle
index.ts                        # entry; polyfills crypto.getRandomValues
sdk/sdk.ts                      # buildConfig helper + initSdk
components/
  ConfigDemo.tsx                # workflow/profile inputs + resolved state
  BehavioralDemo.tsx            # touchpad, scroll, input, sensor
  FingerprintDemo.tsx           # 6-surface display with web/native badges
  DetectionDemo.tsx             # emulator + webDriver verdicts
  FlushDemo.tsx                 # POST /ingest + decision render
  LoginDemo.tsx                 # cache toggle + timing + decision panel
  ProfilingDemo.tsx             # SDK internal metrics table
  ui.tsx                        # design tokens + shared primitives
metro.config.js                 # local SDK resolution, dep dedup
.env.example                    # EXPO_PUBLIC_SOKRATECH_API_DOMAIN only
app.json                        # Expo config
eas.json                        # EAS Build profiles (auto-generated)
```
