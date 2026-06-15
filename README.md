# 📍 ParkPin

**Never lose your vehicle again.**

A production-grade Progressive Web App that lets you save your parking spot in under 5 seconds — with one-tap navigation back, WhatsApp sharing, QR code generation, and full offline support.

![ParkPin](https://img.shields.io/badge/PWA-Ready-4f46e5?style=flat-square&logo=googlechrome)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)

---

## ✨ Features

- **One-tap save** — GPS + camera + note in a guided 3-step flow
- **Navigate back** — opens Google Maps with one tap
- **Share anywhere** — Web Share API, WhatsApp, QR code image card
- **Full offline support** — all data in IndexedDB (Dexie), SW caches assets
- **Parking history** — last 5 spots, accessible offline
- **Vehicle types** — Car / Motorcycle / Bicycle / Other
- **Live distance tracking** — Haversine distance, updates every 30s
- **Live parking duration** — "Parked 2h 34m ago", updates every minute
- **PWA installable** — passes Chrome installability checks
- **Firebase Analytics** — 18 tracked events
- **Firebase Remote Config** — 5 feature flags
- **PostHog** — parallel analytics pipeline
- **Dark camera UI** — full camera viewfinder with retake

---

## 🚀 Local Development

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Setup

```bash
git clone https://github.com/yourname/parkpin.git
cd parkpin

# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# → Fill in your Firebase and PostHog keys (optional for local dev)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on a mobile browser or use Chrome DevTools device emulation.

> **GPS note:** Chrome on desktop requires HTTPS for Geolocation. For local testing, use `localhost` (allowed by exception) or run via `ngrok` for real device testing.

---

## 🔥 Firebase Setup

### 1. Create Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (disable Google Analytics if desired, or enable it — ParkPin uses the GA4 SDK)
3. Add a **Web app** to the project

### 2. Copy Config

From your web app's settings page, copy the config object values into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXX
```

### 3. Firebase Analytics Setup

1. In Firebase Console → **Analytics** → Enable Google Analytics
2. The SDK auto-initializes. No extra steps needed.
3. Events appear in Firebase Console → Analytics → Events (may take 24h for first data)

**Events tracked by ParkPin:**

| Event | Fired When |
|---|---|
| `app_open` | App loads |
| `parking_saved` | Spot saved |
| `parking_deleted` | Spot deleted |
| `parking_replaced` | Replaced an existing spot |
| `navigation_started` | Navigate button tapped |
| `photo_captured` | Camera capture successful |
| `share_clicked` | Share button tapped |
| `share_success` | Share completed (+ method, hasImage) |
| `share_failed` | Share failed (+ reason) |
| `share_image_generated` | Canvas card generated |
| `location_permission_granted` | GPS allowed |
| `location_permission_denied` | GPS denied |
| `pwa_install_prompt_shown` | Browser fired beforeinstallprompt |
| `pwa_install_accepted` | User accepted install |
| `distance_viewed` | Distance calculated and shown |
| `parking_viewed` | Spot card rendered |
| `first_visit` | First ever app open |
| `return_visit` | Subsequent opens |

---

## 🎛 Firebase Remote Config Setup

1. Firebase Console → **Remote Config** → Create configuration
2. Add these parameters (all Boolean type):

| Parameter | Default | Description |
|---|---|---|
| `show_review_prompt` | `false` | Show in-app review nudge |
| `show_share_button` | `true` | Show Share button on parking card |
| `show_parking_history` | `true` | Enable history sheet |
| `show_qr_share` | `true` | Show QR card generation option |
| `future_cloud_sync` | `false` | Placeholder for cloud sync (not built) |

3. Publish the configuration
4. Values are fetched on app load and cached for 1 hour. Local defaults in `config/remoteConfig.ts` are used as fallback.

---

## 📊 PostHog Setup

1. Create account at [posthog.com](https://posthog.com)
2. Create a new project
3. Copy the **Project API Key** and host:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

PostHog tracks the same events as Firebase Analytics via the unified `Analytics` service in `services/analytics.ts`. Both fire in parallel — zero duplicate code.

---

## 📱 PWA Testing

### Chrome Desktop (DevTools)

1. Open DevTools → Application → Manifest
2. Verify manifest is loaded and valid
3. Check for "Add to home screen" eligibility
4. Application → Service Workers → verify SW is active

### Android Chrome (Real Device)

1. Open in Chrome on Android
2. Tap ⋮ menu → "Add to Home screen"
3. Alternatively, the install banner appears automatically after the app meets PWA criteria
4. Installed app should open in standalone mode (no browser UI)

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit (replace URL with your deployed URL or localhost)
lighthouse https://your-parkpin.vercel.app \
  --only-categories=performance,accessibility,best-practices,seo,pwa \
  --output=html --output-path=./lighthouse-report.html
```

Target scores: Performance >95, Accessibility >95, Best Practices >95, SEO >90, PWA ✓

---

## 🔌 Offline Testing

1. Open Chrome DevTools → Network → **Offline**
2. Reload the page — should serve from SW cache
3. Previously saved parking spot should be visible (IndexedDB persists)
4. Share card generation works offline (Canvas API, no network)
5. Navigate button opens cached Maps URL or shows the offline.html fallback

---

## 🤖 Icon Generation

Place a 1024×1024 source PNG at `public/icons/source.png`, then:

```bash
npm install sharp
node public/generate-icons.js
```

Or use [favicon.io](https://favicon.io) / [maskable.app](https://maskable.app) to generate all sizes manually.

**Required files** (place in `public/icons/`):
- `icon-72.png` through `icon-512.png` (all sizes)
- `icon-apple-touch.png` (180×180)

---

## ▲ Vercel Deployment

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourname/parkpin)

### Manual deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
# Add all variables from .env.local.example
```

### Vercel Settings

| Setting | Value |
|---|---|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node.js Version | 20.x |

---

## ✅ Production Checklist

### Pre-launch

- [ ] All icons generated (72px through 512px + Apple touch)
- [ ] `manifest.json` validated at [web.dev/manifest](https://web.dev/measure/)
- [ ] Service worker registered and active in Chrome DevTools
- [ ] Firebase config values set in Vercel environment variables
- [ ] PostHog config values set in Vercel environment variables
- [ ] Remote Config defaults match `config/remoteConfig.ts`
- [ ] Lighthouse score >90 across all categories
- [ ] Offline flow tested on real Android device
- [ ] Camera flow tested on real device
- [ ] GPS flow tested on real device
- [ ] Share flow tested (Web Share API + WhatsApp fallback)
- [ ] Share card image generation tested
- [ ] QR code verified (scan and confirm Maps link)
- [ ] PWA install prompt appears on Android Chrome
- [ ] Standalone mode works (no browser chrome)
- [ ] `console.log` stripped in production (set in next.config.ts)

### Analytics Validation

- [ ] Open app → `app_open` event fires in Firebase DebugView
- [ ] Enable Firebase Analytics Debug: open Chrome DevTools console and run:
  ```js
  // Set debug device in Firebase
  firebase.analytics().setAnalyticsCollectionEnabled(true);
  ```
- [ ] Or use Chrome extension: **Firebase Analytics Debugger**
- [ ] PostHog: events appear in Live Events feed
- [ ] Verify `parking_saved` fires with correct properties (`hasNote`, `hasPhoto`, `source`)
- [ ] Verify `share_success` fires with `method` property

---

## 🏗 Project Architecture

```
parkpin/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout, metadata, SW registrar
│   ├── page.tsx            # Home page (empty state + parking card)
│   ├── globals.css         # TailwindCSS base + custom utilities
│   └── sw-register.tsx     # Service worker client-side registrar
├── components/
│   ├── ui/                 # Atomic UI: Button, Card, Badge, Input, Toast
│   ├── EmptyState.tsx      # First-time empty screen with CTA
│   ├── ParkingCard.tsx     # Active parking spot display card
│   ├── SaveFlow.tsx        # 3-step save wizard (location → photo → note)
│   ├── ShareModal.tsx      # Share bottom sheet (Web Share / WA / QR card)
│   ├── ConfirmDialog.tsx   # Generic confirm modal
│   ├── VehicleTypePicker.tsx
│   ├── PWAInstallBanner.tsx
│   └── ParkingHistory.tsx
├── hooks/                  # React hooks (no business logic, just state wiring)
│   ├── useGeolocation.ts
│   ├── useParkingSpot.ts
│   ├── useDistance.ts      # Haversine, refreshes every 30s
│   ├── useLiveDuration.ts  # "Parked Xh Ym ago", refreshes every 60s
│   ├── usePWAInstall.ts
│   └── useRemoteConfig.ts
├── services/               # External integrations (Firebase, PostHog)
│   ├── analytics.ts        # Unified event tracker — only file UI calls
│   ├── firebase.ts         # Firebase app init
│   ├── firebaseAnalytics.ts
│   ├── posthog.ts
│   └── remoteConfig.ts
├── storage/                # IndexedDB abstraction
│   ├── db.ts               # Dexie instance
│   ├── parkingRepository.ts # CRUD, history trimming
│   └── nanoid.ts           # Tiny ID generator
├── lib/                    # Pure utilities
│   ├── haversine.ts        # Distance formula + formatting
│   ├── geolocation.ts      # Browser Geolocation API wrapper
│   ├── shareCard.ts        # Canvas share card generator
│   └── utils.ts            # cn(), formatters, URL builders
├── config/
│   └── remoteConfig.ts     # Remote Config defaults
├── types/
│   └── index.ts            # All TypeScript types
└── public/
    ├── manifest.json       # PWA manifest
    ├── sw.js               # Service worker
    ├── offline.html        # Offline fallback page
    ├── icons/              # PWA icons (all sizes)
    └── generate-icons.js   # Icon generation script
```

### Key Design Decisions

**Analytics isolation:** UI components never import Firebase or PostHog directly. They call `Analytics.*` methods from `services/analytics.ts`, which fans out to both providers. Adding a third analytics provider = add 10 lines to one file.

**Storage abstraction:** `parkingRepository.ts` is the only file that touches Dexie. If you add cloud sync later, swap the implementation — zero component changes.

**Remote Config safe fallback:** `REMOTE_CONFIG_DEFAULTS` in `config/remoteConfig.ts` ensures the app works identically offline or when Firebase isn't configured.

**Canvas share card:** Generated entirely client-side with no external APIs. Works offline. Includes vehicle photo, QR code, coordinates, timestamp, and ParkPin branding.

---

## 🔮 Roadmap (not built, architecture is ready)

- Cloud sync (Firebase Firestore)
- Multiple concurrent vehicles
- Recurring locations ("Office", "Home")
- In-app review prompt (Remote Config controlled)
- Parking timer alerts
- Apple Maps support

---

## 📄 License

MIT — free to use, modify, and ship.
