# Лад APK wrapper

Android wrapper for the `/admin` panel hosted at `https://lad-online.vercel.app/admin`.

## What is inside

- Capacitor app in `android-app/`
- Android project generated into `android-app/android/`
- The app opens the production admin panel in a native WebView

## Local commands

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

## Build APK

1. Install Android Studio, JDK, and Android SDK.
2. Run:

```bash
cd android-app
npm install
npx cap sync android
npx cap open android
```

3. In Android Studio:
   - wait for Gradle sync
   - choose `Build > Build Bundle(s) / APK(s) > Build APK(s)`

## Important

- The app depends on the live website and admin route being available.
- Set `ADMIN_PASSWORD` in Vercel so the admin panel is not public.
- If the admin URL changes, update `capacitor.config.ts` and run `npx cap sync android`.
