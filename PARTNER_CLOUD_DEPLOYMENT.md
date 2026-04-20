# Partner Handover - Cloud Deployment Checklist

This is the easiest way to hand over the project.

## Goal

Deploy backend once, then share APK that always points to cloud URL.

## Step 1 - Deploy Backend

Deploy folder: backend

Suggested platforms:

1. Render
2. Railway

Required environment variables:

```env
PORT=3000
MONGODB_URI=<your-atlas-connection-string>
NODE_ENV=production
ENABLE_SIMULATION=true
SEED_DATABASE=true
ESP_SERIAL_ENABLED=false
ESP_DEFAULT_METER_ID=MTR-1001
```

Notes:

1. Keep ESP serial disabled in cloud.
2. Use MongoDB Atlas connection string for cloud database.

## Step 2 - Verify Backend Health

After deployment, test these endpoints in browser or Postman:

1. GET / (health)
2. GET /api/meters/MTR-1001/live
3. GET /api/meters/MTR-1001/history?period=24h
4. GET /api/meters/MTR-1001/bills
5. GET /api/meters/MTR-1001/alerts

Expected:

1. No 500 errors.
2. Live endpoint returns JSON.

## Step 3 - Point Frontend to Cloud Backend

Edit [frontend/.env](frontend/.env):

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain/api
```

## Step 4 - Build APK

From folder frontend:

```bash
npx eas build -p android --profile preview --non-interactive
```

Build profile already supports APK in [frontend/eas.json](frontend/eas.json).

## Step 5 - Share APK

Share:

1. APK link from EAS build page.
2. Basic install instruction: allow unknown apps.
3. One support contact line.

## Step 6 - Freeze a Stable Release

Before handover, keep a stable release note:

1. Backend URL used
2. APK build ID
3. Build date
4. Known limitations

## Quick Rollback

If latest APK fails:

1. Re-share previous working APK link.
2. Keep previous backend release alive for 24h.
