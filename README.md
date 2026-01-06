# 🚀 Mobixy - Website → Android App Builder

> Transform any website into a native Android APK or Play Store-ready AAB

**100% Serverless** • **One Vercel Deployment** • **No Backend Server**

## ✨ Features

- ✅ **One-Click Conversion** - Paste URL, customize, build
- ✅ **APK Generation** - For testing and sideloading
- ✅ **AAB Generation** - Play Store ready bundles
- 🔔 **Push Notifications** - Expo Push API support
- 🔁 **OTA Updates** - Update without Play Store
- 🔙 **Native Back Button** - Android navigation
- 🌐 **HTTPS Only** - Secure connections
- ☁️ **Full Serverless** - Single Vercel deployment

## 🏛️ Architecture

```
    ┌─────────────────────────────────────┐
    │         VERCEL (Single Deploy)       │
    │  ┌─────────────┐  ┌──────────────┐  │
    │  │   React     │  │  Serverless  │  │
    │  │   Frontend  │  │  API (/api)  │  │
    │  └─────────────┘  └──────────────┘  │
    └─────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │           EAS Cloud Build            │
    └─────────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────────┐
    │         APK / AAB Download           │
    └─────────────────────────────────────┘
```

## 📁 Project Structure

```
mobixy/
├── .gitignore
├── README.md
│
├── app/                          # Full-Stack Serverless App
│   ├── api/                      # Serverless API Functions
│   │   ├── build.js              # POST /api/build
│   │   ├── push.js               # POST /api/push
│   │   └── build/
│   │       └── [id].js           # GET /api/build/:id
│   │
│   ├── src/                      # React Frontend
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   │
│   ├── public/                   # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # Deployment config
│   └── vite.config.js
│
└── template-expo-app/            # Expo WebView Template
    ├── App.js                    # WebView + notifications
    ├── app.json                  # Expo configuration
    ├── eas.json                  # EAS build profiles
    └── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Run Locally

```bash
npm run dev
# Opens http://localhost:5173
```

### 3. Deploy to Vercel

```bash
npm run deploy
# or
vercel --prod
```

That's it! One command deploys both frontend AND API.

## ⚙️ Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `EXPO_TOKEN` | Expo access token |
| `EAS_PROJECT_ID` | EAS project ID |
| `UPSTASH_REDIS_REST_URL` | State storage (optional) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token (optional) |

## 📡 API Endpoints

All API routes are serverless functions:

### `POST /api/build`
Start a new build.

```json
{
  "websiteUrl": "https://example.com",
  "appName": "My App",
  "packageName": "com.company.myapp",
  "buildType": "apk"
}
```

### `GET /api/build/:id`
Get build status and download link.

### `POST /api/push`
Send push notification.

```json
{
  "expoPushToken": "ExponentPushToken[xxx]",
  "title": "Hello",
  "body": "Message"
}
```

## 🔐 Security

- ✅ HTTPS URL validation
- ✅ Package name format check
- ✅ Input sanitization
- ✅ CORS headers
- ✅ Vercel rate limiting

## 📱 How It Works

1. User enters website URL + app details
2. API validates and queues build
3. EAS Cloud builds the Android app
4. User downloads APK/AAB

## 🔄 OTA Updates

Update app without Play Store:

```bash
cd template-expo-app
eas update --branch production
```

## 🛣️ Roadmap

- [ ] Upstash Redis integration
- [ ] Firebase Analytics
- [ ] Deep linking
- [ ] iOS support
- [ ] Custom splash screens

## 📄 License

MIT

---

<div align="center">
<strong>Mobixy</strong> - Website to App in Minutes
</div>
