# Sri Meenakshi Mahal — Venue Booking PWA

A mobile-first Progressive Web App for managing wedding venue bookings and payments,
with Google Sheets as the live database backend.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | The full PWA app (open this in any browser) |
| `manifest.json` | PWA manifest — enables "Add to Home Screen" |
| `sw.js` | Service Worker — offline caching & background sync |
| `Code.gs` | Google Apps Script backend — paste into script.google.com |

---

## Step 1 — Set up the Google Sheets backend

1. Open [https://script.google.com](https://script.google.com) and sign in with your Google account
2. Click **New project**
3. Delete all default code in the editor
4. Open `Code.gs` from this folder and **copy all its contents**
5. Paste into the Apps Script editor
6. Click **Deploy → New deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone** *(so the app can call it from any device)*
7. Click **Deploy** → Authorise when prompted
8. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

A "Bookings" sheet will be auto-created in your Google Drive the first time the app syncs.

---

## Step 2 — Host the PWA files

Choose any free static hosting option:

### Option A — GitHub Pages (recommended, free)
1. Create a free account at [github.com](https://github.com)
2. New repository → upload all 4 files
3. Settings → Pages → Source: main branch
4. Your app URL: `https://yourusername.github.io/repo-name/`

### Option B — Netlify Drop (easiest, free)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire folder onto the page
3. Get an instant URL like `https://random-name.netlify.app`

### Option C — Local use only
- Open `index.html` directly in a mobile browser (no hosting needed)
- **Note:** Service Worker and "Add to Home Screen" require HTTPS — use Options A or B

---

## Step 3 — Connect the app to Google Sheets

1. Open the hosted app URL on your phone
2. Tap **Settings** tab (bottom nav)
3. Paste the **Web App URL** from Step 1
4. Tap **Test connection** — you should see "Connection successful"
5. Tap **Save** — the app will sync all bookings from the sheet

---

## Step 4 — Install on home screen

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap ⋮ → **Add to Home screen**
3. The app icon will appear on your home screen

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down → **Add to Home Screen**
4. Tap **Add** — the app icon appears on your home screen

---

## Features

- ✅ Add, edit, delete bookings
- ✅ Track: client, phone, email, event type, hall, date, guest count, AC, guest rooms
- ✅ Payment ledger: total amount, advance received, balance due (auto-calculated)
- ✅ Status: Confirmed / Tentative / Cancelled
- ✅ Dashboard with revenue & balance stats
- ✅ Booking list with search & filter
- ✅ Monthly calendar view with booking dots
- ✅ Offline support — works without internet, syncs when back online
- ✅ Google Sheets as live database — view & edit from your desktop too
- ✅ CSV export
- ✅ PWA — installable on Android & iOS home screen

---

## How offline sync works

When your phone is offline:
- All changes (add/edit/delete) are saved locally and queued
- When internet returns, queued operations are flushed to Google Sheets automatically
- The sync icon in the top-right shows sync status: ✓ synced, ⚠ pending, spinning = syncing

---

*Sri Meenakshi Group of Companies · Kagithapuram, Karur*
