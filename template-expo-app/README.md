# Mobixy Template Expo App

This is the base WebView template that gets cloned and customized for each build.

## Features

- 📱 **WebView** - Loads any HTTPS website with native feel
- 🔔 **Push Notifications** - Expo notifications support
- 🔁 **OTA Updates** - Hot updates without Play Store
- 🔙 **Back Button** - Native Android back navigation
- 📴 **Offline Screen** - Graceful error handling
- 🎨 **Splash Screen** - Custom branded loading

## Configuration

The app reads configuration from:

1. `app.json` → `expo.extra.websiteUrl`
2. Environment variable `WEBSITE_URL`

## Assets

Place your icons in the `assets/` folder:

- `icon.png` - Main app icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)  
- `splash.png` - Splash screen (1284x2778)
- `favicon.png` - Web favicon (32x32)

## Build Commands

```bash
# Development
npm start

# Build APK (for testing)
npm run build:apk

# Build AAB (for Play Store)
npm run build:aab

# Push OTA update
npm run update
```

## EAS Configuration

The `eas.json` file defines build profiles:

- **development** - Dev client with debug features
- **preview** - APK for internal testing
- **production** - AAB for Play Store

## Note

This template is **not meant to be used directly**. It's cloned and customized by the Mobixy build system for each request.
