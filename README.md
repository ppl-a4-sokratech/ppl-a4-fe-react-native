# Sokratech SDK React Native Demo

End-to-end Proof of Concept consuming the [`@ppl-sokratech-sdk/ppl-a4-sdk-react-native`](https://www.npmjs.com/package/@ppl-sokratech-sdk/ppl-a4-sdk-react-native) package on Web, Android, and iOS. Built with Expo SDK 54 + React Native 0.81.

Sibling demo of the [`ppl-a4-fe-web`](https://github.com/ppl-a4-sokratech/ppl-a4-fe-web) (Next.js) and [`ppl-a4-fe-mobile`](https://github.com/ppl-a4-sokratech/ppl-a4-fe-mobile) (Flutter) PoCs.

## Demo surfaces (tabs)

| Tab | What it does |
|---|---|
| **Config** | Enter workflow + profile IDs from the admin portal; SDK reinitializes via `initAsync` and fetches recipes from the backend. Leave blank to use local all-true recipes. |
| **Behavioral** | Touchpad (tap / hold / drag) via `TrackedPressable`, text input via `TrackedTextInput`, scroll via `TrackedScrollView`, simulated lifecycle (background ping), accelerometer + gyroscope (mobile only). Drain buffers the events into a single payload. |
| **Fingerprint** | Collects audio, canvas, graphics, fonts, device, screen. On mobile, canvas + fonts come from the SDK's native TurboModule (real Bitmap render, system fonts scan). |
| **Detection** | Runs emulator detection on mobile and webDriver detection on web. |
| **Flush** | Bundles behavioral + fingerprint + detection signals and POSTs to `/ingest`. Renders the backend decision. |
| **Login** | Full login form with cached-fingerprint toggle, timing breakdown (behavioral / fingerprint / detect / fetch), and an ingest result panel. Falls back to a mock decision when the backend is unreachable. |
| **Profiling** | Lists SDK-internal timings recorded by the SDK `Profiler` (e.g. `sdk.initialize`, `fingerprint.collect`, `sdk.flushIngest`). |

## Prerequisites

- Node.js 20+
- npm
- For Android EAS dev client builds: `eas-cli` and an Expo account
- For iOS: same plus an Apple ID

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

Point this at your local `ppl-a4-api-be`, or a staging URL. For physical mobile devices, replace `localhost` with the LAN IP of the machine running the backend.

Workflow + profile IDs are entered at runtime in the Config tab, not via env vars.

The SDK is consumed from npm as `@ppl-sokratech-sdk/ppl-a4-sdk-react-native`. Bumping the SDK version is a regular `npm install` of the new version.

## Run

### Web

```bash
npx expo start --web
```

Opens at `http://localhost:8081`. All surfaces work except sensors (mobile only) and emulator detection (mobile only).

### Android

```bash
npm run build:android       # eas build --platform android --profile development
```

This runs in the cloud (~10-15 min). Download the APK from the EAS link, install on device. Then:

```bash
npx expo start --dev-client
```

Open the installed dev client app, scan the Metro QR code or tap "Fetch development servers". JS hot reload works.

You need to re-run `npm run build:android` when:
- SDK gets a new version published to npm (after `npm install @ppl-sokratech-sdk/ppl-a4-sdk-react-native@latest`)
- New native dependencies added
- Expo SDK version bumps

For SDK JS-only changes (published to npm), only `npm install` + Metro restart needed.

### iOS

```bash
eas device:create               # register iPhone UDID once
eas build --platform ios --profile development
```

Requires an Apple ID (free tier OK for personal device install; paid Apple Developer Program $99/year for TestFlight). After build, install the IPA via Safari and trust the developer profile in Settings → General → VPN & Device Management.

## SDK development workflow

If you also maintain the [SDK repo](https://github.com/ppl-a4-sokratech/ppl-a4-sdk-react-native) alongside this PoC:

1. Make changes in the SDK repo
2. Bump version + publish to npm:
   ```bash
   cd ppl-a4-sdk-react-native
   npm version patch    # or minor / major
   npm publish
   ```
3. In PoC, update to new version:
   ```bash
   cd ppl-a4-fe-react-native
   npm install @ppl-sokratech-sdk/ppl-a4-sdk-react-native@latest
   ```
4. JS changes: Metro picks up. Native changes: `npm run build:android` for new APK.

For faster iteration during heavy SDK development, you can use `npm link` instead of publishing every change:

```bash
cd ppl-a4-sdk-react-native
npm link
cd ../ppl-a4-fe-react-native
npm link @ppl-sokratech-sdk/ppl-a4-sdk-react-native
```

Note: `npm link` only works for JS resolution; native module changes still need an APK rebuild via `eas build`.

## Configuration

### Runtime config (UI)

The Config tab takes:

- **Workflow ID** + **Profile ID** — UUIDs from the admin portal. When both are set, the SDK fetches the recipe from `GET /sdk/v1/config/:workflowId/:profileId`.

### Build-time config (env)

Only one env var is supported.

```
EXPO_PUBLIC_SOKRATECH_API_DOMAIN=<backend-domain>
```

## Project structure

```
App.tsx                         # SokratechProvider + tab bar
index.ts                        # entry; polyfills crypto.getRandomValues
sdk/sdk.ts                      # buildConfig helper
components/
  ConfigDemo.tsx                # workflow/profile inputs (uses useSokratech)
  BehavioralDemo.tsx            # TrackedPressable / TrackedTextInput / TrackedScrollView
  FingerprintDemo.tsx           # 6-surface display
  DetectionDemo.tsx             # emulator + webDriver verdicts (uses useDetection)
  FlushDemo.tsx                 # POST /ingest (uses useFlushIngest)
  LoginDemo.tsx                 # cache toggle + timing + decision panel
  ProfilingDemo.tsx             # SDK internal metrics table
  ui.tsx                        # design tokens + shared primitives
metro.config.js                 # default Expo config
.env.example                    # EXPO_PUBLIC_SOKRATECH_API_DOMAIN only
app.json                        # Expo config
eas.json                        # EAS Build profiles
```

## Scripts

```bash
npm start                  # expo start
npm run android            # expo start --android
npm run ios                # expo start --ios
npm run web                # expo start --web
npm run build:android      # eas build android development
```
