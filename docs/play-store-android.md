# Kharcha Android + Play Store Guide

This project is now prepared for Android packaging with Capacitor.

## 1) Configure environment

- Build and API env values should be configured in your server deployment.
- Add AI key for production:
  - `GEMINI_API_KEY=...` (recommended)
  - `ANTHROPIC_API_KEY=...` (optional fallback)

## 2) Initialize Android project (one time)

Run from repo root:

```bash
npm run android:init
```

This creates the `android/` folder.

## 3) Sync web updates into Android

Every time UI code changes:

```bash
npm run android:sync
```

## 4) Open Android Studio

```bash
npm run android:open
```

In Android Studio:
- Set package/app name if required.
- Replace launcher icons with production assets.
- Set splash screen assets/colors.

## 5) Build Play Store bundle (AAB)

In Android Studio:
- `Build` -> `Generate Signed Bundle / APK`
- Choose `Android App Bundle (AAB)`
- Use release keystore and save key credentials securely.

## 6) Play Store checklist (minimum)

- Privacy Policy URL
- Data Safety form completed
- App icon (512x512), feature graphic, screenshots
- Target SDK as required by Google Play
- Test on multiple devices (small + large screen)
- Verify login, AI chat, transactions, sound effects, offline behavior

## 7) Recommended production checks

- Ensure backend uses persistent DB (not local demo DB)
- Ensure HTTPS domain and CORS origin list are correct
- Run smoke tests for:
  - Assistant chat stream
  - Meal generation
  - Finance transaction add/delete
  - Pantry and grocery sync
