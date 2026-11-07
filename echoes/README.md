# Elsewhere

Find the feeling of a place you love, somewhere new.

A responsive Next.js / React app for discovering places by the qualities that matter to you. Includes a usable curated collection, an interactive map, preference-based ranking, destination filters, comparisons with meaningful differences and sources, browser-local bookmarks, and shareable sample searches.

## Run locally

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server (normally http://127.0.0.1:5173).

For the standard Next.js development server instead of the Sites-compatible preview:

```sh
npm run dev:next
```

## Connect Google

The curated sample works without credentials. Copy `.env.example` to `.env.local` and supply:

- `GEMINI_API_KEY`: a server-only Google AI Studio key with access to the configured model and Google Maps grounding.
- `GOOGLE_MAPS_BROWSER_KEY`: a Google Maps JavaScript API key restricted to your app's domains and that API. This key is intentionally public; the Gemini key is never sent to the browser.
- `GEMINI_MODEL`: defaults to `gemini-2.5-flash`; change it to a model available to your Google project that supports Maps grounding.

Restart the server. A "Discover with Gemini + Google Maps" switch appears below the results when Gemini is configured. Enable it, enter any named source place with its city, and search. Unknown sources are resolved and profiled with grounded Gemini before candidates are retrieved. The original collection remains available with the switch off.

`GET /api/config` returns only live-search availability and the restricted browser Maps key. `POST /api/resolve` identifies a source place. `POST /api/discover` retrieves candidates. The two POST routes validate input, apply upstream timeouts, reject recommendations without a matching Google Maps grounding source, and return useful errors. Live results are never silently replaced with sample data.

No credentials were supplied during development, so actual Google calls have not been exercised. Grounded-response parsing is covered with fixtures; connect your project to validate model availability and live search quality. Google Maps grounding currently requires English prompts and responses. The UI and prompts are English.

## Google deployment

Google Firebase App Hosting supports Next.js. `apphosting.yaml` uses the standard Next.js build and runtime rather than the Sites worker. Connect this directory as the backend root in your Firebase project and add the keys in its Environment settings. Store the Gemini key in Secret Manager. The custom build/run commands keep the included Sites preview scripts independent of your Google deployment.

A Dockerfile is also included for Cloud Run. It builds standard Next.js and listens on `PORT` (8080 by default). No Google Cloud resources or paid services have been provisioned.

For the private Sites preview, use the provided workflow helpers and the retained `.openai/hosting.json` identity. Source is built as a Next.js-compatible Vinext worker. Runtime keys can be set through Sites environment settings and require a redeploy.

## Verification

```sh
npm run typecheck
npm test
npm run build:next
npm run build
```

The tests cover preference sensitivity, destination constraints, geographic diversity, source exclusion, link validation, distance, and required live grounding evidence. Desktop and mobile flows are manually verified in the browser.

## Data and privacy

The twelve sample places have editorial feature ratings and approximate suggested starting points. These are illustrative comparisons, not calibrated similarity measurements or live crowd data. The collection covers selected cities in Asia and Europe, not every place worldwide. Global sample searches favor another country and diverse regions.

Sample bookmarks persist as IDs in this browser's local storage. Live bookmarks last for the session. No sign-in, analytics, or location permission is required. The sample map uses OpenStreetMap tiles; configured live maps use Google Maps. Sharing sample discoveries encodes the source ID, qualities, and destination in the URL.

Photos are Wikimedia Commons thumbnails with author/license metadata in `lib/photo-credits.json`, full provenance beside the images, and a visible Photo credits view. Photographs are displayed with responsive crops. The original licenses apply to the photos. Place details link to reference sources; map providers retain their visible attribution.
