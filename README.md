# Offema (https://offema.com) — Offers & Deals Discovery Application

A responsive, mobile-first web and native mobile application for discovering local and global offers, built with React, TypeScript, Tailwind CSS, Capacitor, and clean domain-driven architecture.

---

## 1. Executive Summary & Features Implemented

The application implements the complete discovery journey for **Offema** (https://offema.com):

- **Authentication Flow**:
  - Phone number login with international country code selector (`+91` default).
  - 6-digit OTP verification with countdown timer, auto-advance, and clipboard paste support.
  - Transparent **Demo Mode** banner disclosing test credentials with 1-click auto-fill (`123456`).
  - Production-ready `FirebaseAuthService` adapter with reCAPTCHA verifier architecture.
- **Location Detection & Geolocation**:
  - Live browser geolocation detection using the HTML5 Geolocation API.
  - Geographic distance calculated dynamically from coordinates using the **Haversine formula** (`calculateHaversineDistanceKm`).
  - **5 km default radius** for nearby discovery.
  - Developer/Evaluation anchor: **Banjara Hills, Hyderabad, India** (17.4156° N, 78.4350° E) for testing physical merchants.
  - Graceful fallback for location denial/timeout without breaking Global Offers browsing.
  - Coordinate privacy: sensitive GPS coordinates stay in in-memory session state and are never logged to console or remote analytics.
- **Offer Discovery Feed**:
  - Visually differentiated **Nearby Offers** and **Global Offers** sections/tabs.
  - Default sorting: **Highest Offer** first.
  - Also supports: Lowest Offer, Nearest Distance (location-dependent), and Newest.
  - Multi-tier filtering combining with strict **AND** logic:
    - Distance presets: 1 km, 3 km, 5 km (default), 10 km.
    - Typed Offer Value filters: Minimum Percentage Off (10%, 20%, 30%, 50%) and Minimum Flat Savings (₹200, ₹400, ₹750, ₹1,500).
    - Multi-select dynamic categories from repository.
    - Full-text search across offer title, merchant, description, and location tags.
  - Dismissible active filter pill tags with 1-click "Clear all".
- **Visual Urgency Countdown Timers**:
  - Live 1-second ticking countdown on every offer card with `tabular-nums` alignment.
  - Multi-tiered urgency visual indicators:
    - **Flash Deals (< 24h)**: High-urgency rose gradient banner with flame icon and highlighted remaining time (`🔥 Flash Deal · Ends in 04h 32m 18s`).
    - **Limited Time (< 48h)**: Amber gradient banner with lightning icon (`⚡ Limited Time · Ends in 1d 14h 22m 10s`).
    - **Active Offers (>= 48h)**: Clean subtle slate banner (`⏱ Expires in 14d 06h 18m 45s`).
  - Segmented digital unit blocks (`Days : Hours : Mins : Secs`) inside the Offer Details modal.
- **Save to Favorites / Bookmarking**:
  - Instant one-tap bookmarking on each offer card (floating heart on card visual and dedicated button in metadata row).
  - Dedicated **Saved** tab in the main navigation with a live badge counter.
  - Contextual empty state with guidance to save preferred deals.
  - Backed by `LocalStorageFavoritesService` with multi-subscriber syncing and user-scoped storage, architected for seamless Firestore sync.
- **Web Share API**:
  - Native share trigger on each card for mobile/desktop sharing via WhatsApp, Messages, or Email with clipboard fallback.
- **Offer Details Screen**:
  - Modal/view preserving previous feed filters, search, and scroll state.
  - Prominent discount callout (percentage or fixed amount with ₹ INR formatting).
  - Merchant name, address, calculated live distance, and OpenStreetMap directions link.
  - Expiry status countdown (e.g. "Expires in 18 hrs" / "Valid until 31 Dec 2026").
  - Terms and conditions bullet list.
  - Promo code clipboard copying with redemption status toggle.
  - Customer reviews with explicit `Sample Demo Review` disclaimer badges.
- **Interactive Map View (Google Maps-Free)**:
  - Interactive OpenStreetMap and CartoDB Voyager tiles map integration built with Leaflet.
  - Custom category-themed map pins displaying discount values directly on pins (e.g., `25% OFF`, `₹300 OFF`).
  - Real-time user position circle marker with a 5 km discovery radius overlay.
  - Interactive popup deal preview cards with 1-click "View Deal →" triggering the offer modal.
  - Center on user, fit all pins, and fullscreen toggle controls.
  - Seamless Cards / Map view mode switcher directly on the HomePage.
- **Advertisement Submission & Approval Workflow**:
  - Dedicated **Advertizer Portal** allowing merchants, shopkeepers, and authorized businesses to submit promotional offers and sales campaigns.
  - Comprehensive ad submission modal with title, provider details, category, discount percentage or flat amount, GPS coordinates or address detection, validity dates, promo code, and terms & conditions.
  - Interactive live card preview inside the submission modal before sending for approval.
  - **Pending Approval** initial status: all submitted campaigns must be reviewed by an authorized administrator before going live.
  - **Admin Review & Decision Workflow**:
    - Review advertisement content, business details, coordinates, discount value, and validity schedule.
    - Full Administrative Detail Modification: Admins can correct typos or adjust dates directly during review.
    - **Approval**: Instantly approves and automatically publishes the advertisement into live consumer feeds.
    - **Mandatory Rejection Reason**: Rejecting an advertisement strictly requires a detailed, actionable rejection reason explaining why the submission was declined.
    - **Advertizer Feedback & 1-Click Revisions**: Advertizers receive real-time notifications with the rejection reason and a 1-click "Edit & Resubmit" action that pre-fills previous fields for revision.
    - **Reapproval Workflow**: Modifying an approved or rejected advertisement automatically marks it `PENDING_APPROVAL` and enters the approval pipeline.
    - **Audit History**: Complete chronological timeline recording submissions, edits, reviewer decisions, and timestamps.
    - **User Feed Isolation**: Pending and rejected advertisements are strictly excluded from regular user feeds and discovery queries.
- **3-Role Authentication & Access Management (User | Advertizer | Admin)**:
  - **Login Persona Selection**: Standard login screen provides two selectable options: **User** (browse & discover) or **Advertizer** (submit & manage campaigns).
  - **Admin Authentication Protection**: The Admin role is strictly **never** a selectable option on the login screen. Admin access is verified by the backend against trusted credentials (`9999999999`), redirecting verified admins directly to the Admin Dashboard.
  - **Seamless Role Switching**: Users and Advertizers can switch between User and Advertizer roles at any time from their profile dashboard without creating separate accounts or losing bookmarks, profile data, or submitted ads. Role switching never grants administrative privileges.
- **Resilient Visuals & Anti-Slop Design**:
  - Category-themed SVG artwork and gradient containers with zero broken external images.
  - Zero-pill metadata discipline with unboxed text and typographic `·` separators.
  - 1-line Top Bar Contract.

---

## 2. Project Architecture & Structure

```text
src/
├── App.tsx                     # Top-level authentication & screen router
├── main.tsx                    # React DOM entry point
├── index.css                   # Tailwind CSS v4 styling & typography
├── domain/
│   ├── models/
│   │   └── Offer.ts            # Domain interfaces (Offer, Category, Review, Filters, AuthUser)
│   └── logic/
│       ├── distance.ts         # Haversine distance calculation and formatters
│       ├── offerValidity.ts    # Offer active/valid boundary checkers & expiry labels
│       ├── filterOffers.ts     # Pure filter logic honoring strict AND rules
│       └── sortOffers.ts       # Deterministic sorting (Highest Offer, Nearest, tie-breakers)
├── services/
│   ├── auth/
│   │   ├── AuthService.ts      # IAuthService interface & DTOs
│   │   ├── DemoAuthService.ts  # Demo mode auth (test OTP 123456 & session storage)
│   │   └── FirebaseAuthService.ts # Production Firebase Phone Auth adapter
│   ├── location/
│   │   ├── LocationService.ts  # ILocationService interface & error types
│   │   └── BrowserGeolocationService.ts # HTML5 Geolocation API & Hyderabad demo anchor
│   ├── favorites/
│   │   └── FavoritesService.ts # LocalStorage & Firestore-ready bookmarking service
│   └── offers/
│       ├── OfferRepository.ts  # IOfferRepository interface
│       ├── DemoOfferRepository.ts # 14 realistic sample offers + expired test fixtures
│       └── FirebaseOfferRepository.ts # Firestore collection query adapter
├── components/
│   ├── AppHeader.tsx           # 3-Zone top bar contract header
│   ├── TabBar.tsx              # Segmented switch between Nearby, Global, and Saved feeds
│   ├── LocationBanner.tsx      # Location detection trigger & 5 km radius notice
│   ├── SearchBar.tsx           # Search input with filter drawer trigger
│   ├── SortSelect.tsx          # Sort dropdown with location awareness
│   ├── FilterDrawer.tsx        # Filter drawer with distance, value, and categories
│   ├── OfferCard.tsx           # Accessible offer card with zero-pill metadata
│   ├── OfferCardVisual.tsx     # Resilient category visual with zero external dependencies
│   ├── OfferDetailsModal.tsx   # Detailed offer view with directions & promo code
│   ├── NearbyOffersMap.tsx     # Interactive Leaflet / OpenStreetMap map with pins & radius
│   ├── CountdownTimer.tsx      # Multi-tier visual urgency countdown timer
│   ├── useCountdown.ts         # Live countdown hook with sub-second accuracy
│   ├── LocationModal.tsx       # Location settings (GPS vs Demo Anchor vs Clear)
│   ├── DemoInfoModal.tsx       # Demo mode details & Firebase setup guide
│   ├── EmptyState.tsx          # Contextual empty states (out of radius, no location)
│   ├── ErrorState.tsx          # Error state with retry action
│   └── LoadingSkeleton.tsx     # Skeleton loading cards
├── config/
│   └── categories.ts           # Configurable category taxonomy
└── tests/
    ├── distance.test.ts        # Haversine formula and distance formatting unit tests
    ├── favorites.test.ts       # Favorites service persistence & event subscriber tests
    ├── offerValidity.test.ts   # Boundary tests (exact validFrom/validUntil, 1ms after)
    ├── filterOffers.test.ts    # AND logic, keyword, scope, and distance filter tests
    └── sortOffers.test.ts      # Highest offer, typed sorting, tie-breakers, immutability
```

---

## 3. How to Run Locally

### Prerequisites
- Node.js 18+ and npm

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

### Running Unit Tests
```bash
npm run test
```

### Type Checking & Build
```bash
npm run lint
npm run build
```

---

## 4. Demo Evaluation Mode & Role Test Accounts

When running without external credentials, the app operates in zero-config **Demo Evaluation Mode** with full persistent capabilities:

| Role | Test Mobile Number | Fixed OTP | Description | Landing Destination |
|---|---|---|---|---|
| **User (Buyer)** | `9876543210` | `123456` | Browse nearby & global deals, bookmarks, directions | Marketplace Home Feed |
| **Advertizer** | `9811122233` | `123456` | Submit discount ads, track review status, receive notifications | Advertizer Campaign Hub |
| **Authorized Admin** | `9999999999` | `123456` | Verified by trusted backend identity registry | Admin Review & Oversight Dashboard |

### Key Workflow Highlights
- **No Admin Option on Login**: The Admin role is strictly never displayed as a selectable option on the login screen. Authorized admins log in using standard credentials and are verified against the backend trusted registry.
- **Seamless Role Switching**: From the profile modal, users and advertizers can toggle between User and Advertizer roles with 1 click without losing account data, saved bookmarks, or campaign history.
- **Mandatory Rejection Feedback**: Rejecting an advertisement requires an explicit, actionable reason which is delivered directly to the advertizer's notification center with 1-click revision.
- **Reapproval Pipeline**: Modifying any approved or rejected advertisement automatically marks it `PENDING_APPROVAL` for admin re-evaluation.
- **Immediate Live Publishing**: Approved advertisements are instantly converted into active offers and visible on the user map and discovery feed.

---

## 5. Production Firebase Configuration

To switch from Demo Mode to production Firebase services, provide these environment variables:

```bash
VITE_FIREBASE_API_KEY="AIzaSyYourFirebaseApiKeyHere"
VITE_FIREBASE_AUTH_DOMAIN="your-app-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

### Firebase Setup Steps
1. In the [Firebase Console](https://console.firebase.google.com), create a new project.
2. Go to **Authentication > Sign-in method** and enable the **Phone** provider.
3. Add your deployment domain (e.g. `your-app.run.app` or `localhost`) to **Authorized Domains**.
4. Go to **Firestore Database**, create a database, and create the `offers` collection.
5. In production Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /offers/{offerId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.token.role == 'admin';
       }
       match /categories/{categoryId} {
         allow read: if true;
       }
     }
   }
   ```

---

## 6. Business Decisions & Assumptions

As requested by the specification, the following open decisions from the product brief are resolved explicitly:

1. **Offer Margin Interpretation**: Interpreted as consumer-facing offer value (percentage discount or flat savings), labeled as "Offer Value" in the UI.
2. **Global vs Nearby Separation**: Implemented as high-contrast segmented tabs with independent result counters.
3. **Location Permission Fallback**: When location is denied or unavailable, Nearby Offers shows an informative prompt with a switch to Demo Anchor, while Global Offers remains fully browsable without location constraints.
4. **Percentage vs Fixed-Amount Ranking**: Percentages and rupee discounts are not silently equated. Within the same type, values are compared directly; across mixed types, the model prioritizes explicit `rankingScore` provided by the merchant dataset.
5. **Tie-Breaking Rule**: When two offers share the same value score, ties are broken deterministically by nearer distance first, then title alphabetically.
6. **Sample Data Disclaimer**: All demo reviews and seed data are explicitly marked with disclaimer notices.

---

## 7. Release, Hosting & Android Builds (v1.0.0)

| What | How |
|---|---|
| **Web app** | `.github/workflows/pages.yml` builds the site and deploys it to GitHub Pages on the custom domain **https://offema.com** on every push to `main`. |
| **Android APK** | `.github/workflows/android.yml` type-checks, runs the tests, builds the web bundle with `VITE_API_BASE_URL=https://offema.com` (from `.env.android`), syncs Capacitor, and assembles a release APK. Pushes to `main` upload it as a workflow artifact; tags `v*` publish it to a GitHub Release. |
| **App identity** | `com.offema.app` · name **Offema** · versionCode = CI run number. |

### Signing secrets (Settings → Secrets and variables → Actions)
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
Without them the release APK is signed with the Android debug key (installable, but not suitable for Play Store and not upgrade-compatible with release-signed builds).

### DNS for offema.com (GitHub Pages)
- `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www`: `hamid-iqbal-khan.github.io`

### Backend AI endpoints
GitHub Pages serves the static app only. The Gemini-powered endpoints in `server.ts` (`/api/banner/ai-analyze`, `/api/vendor/ai-generate-offer`) fall back to built-in client-side logic when unreachable. To enable them, run `server.ts` on a Node host with `GEMINI_API_KEY` and route `offema.com/api/*` to it (CORS for the app is already configured).

### Local Android build
```bash
npm run build:android   # web build for the app + cap sync
cd android && ./gradlew assembleRelease
```
