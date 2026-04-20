# Partner Quick Start (Minimum Work)

This guide is for a partner with no setup experience.

## Best Handover Strategy

Use this setup for minimum effort:

1. You deploy backend once (Render or Railway).
2. You share one APK already connected to deployed backend.
3. Partner installs APK and uses app directly.

This avoids Node.js, MongoDB, and terminal setup on your partner laptop.

## What You Should Share

1. APK download link.
2. One backup cloud API URL.
3. One short troubleshooting message:
   - "If app shows Network Error, first check internet, then contact me with screenshot."

## Handover Modes

### Mode A (Recommended): Cloud Backend + APK

Partner effort:

1. Install APK.
2. Open app.

Time: 2-5 minutes.

### Mode B (Fallback): Full Local Run on Partner Laptop

Partner effort:

1. Install Node.js.
2. Install MongoDB.
3. Run backend and frontend commands.
4. Configure local network URL for phone testing.

Time: 45-90 minutes.

Use this only if cloud deployment is not possible.

## Which Files to Follow

1. Cloud handover checklist: [PARTNER_CLOUD_DEPLOYMENT.md](PARTNER_CLOUD_DEPLOYMENT.md)
2. Local fallback checklist: [PARTNER_LOCAL_FALLBACK.md](PARTNER_LOCAL_FALLBACK.md)
3. Final verification checklist: [PARTNER_PREHANDOVER_CHECKLIST.md](PARTNER_PREHANDOVER_CHECKLIST.md)

## Recommended Final Deliverable (What You Send to Partner)

1. APK file or APK link.
2. 1-page usage note (login, main screens, expected behavior).
3. Demo video (2-3 minutes).
4. This project ZIP (only as backup, not required for normal use).

## Emergency Backup Plan

If cloud backend goes down during demo:

1. Start backend locally on your own laptop.
2. Connect your phone and partner phone to same Wi-Fi.
3. Use local backend base URL build (if available).

Keep one backup APK for local network tests if possible.
