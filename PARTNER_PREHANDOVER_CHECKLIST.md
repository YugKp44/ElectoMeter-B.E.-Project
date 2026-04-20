# Pre-Handover Verification Checklist

Use this checklist before sending project to your partner.

## A. Product Readiness

1. App opens without crash.
2. Dashboard loads live data.
3. History chart loads for 6h, 24h, 7d.
4. Bills screen loads.
5. Alerts screen loads.

## B. Backend Readiness

1. Health endpoint works.
2. Live endpoint returns latest reading JSON.
3. History endpoint returns array.
4. No recurring server crash in logs for 10 minutes.

## C. Network Readiness

1. Backend reachable from laptop browser.
2. Backend reachable from phone browser (same Wi-Fi).
3. No firewall block on port 3000 (local mode only).

## D. APK Readiness

1. APK installed successfully on clean device.
2. App can load data with internet on.
3. Build ID documented.
4. APK link tested from another device.

## E. Handover Package Readiness

1. Share this file set:
   - [PARTNER_QUICK_START.md](PARTNER_QUICK_START.md)
   - [PARTNER_CLOUD_DEPLOYMENT.md](PARTNER_CLOUD_DEPLOYMENT.md)
   - [PARTNER_LOCAL_FALLBACK.md](PARTNER_LOCAL_FALLBACK.md)
2. Share APK link.
3. Share backend URL.
4. Share one support contact.

## F. Demo Day Backup

1. Keep one previously working APK link.
2. Keep one local-run backup laptop ready.
3. Keep quick command list prepared:

```text
cd backend && npm start
cd frontend && npm start
```

## Sign-Off

1. Date:
2. Stable backend URL:
3. Stable APK build ID:
4. Verified by:
