import type { CapacitorConfig } from '@capacitor/cli';

// Backend that the Android WebView talks to.
// Override via env when building for a different stage:
//   APP_API_URL=https://oikos.onrender.com npm run android:sync
const API_URL = process.env.APP_API_URL || 'https://oikos.onrender.com';

const config: CapacitorConfig = {
  appId: 'com.oikos.app',
  appName: 'Oikos',
  webDir: 'client/dist',
  // Load the production web app directly from the Render-hosted backend.
  // This keeps the AAB tiny and means UI updates ship instantly without
  // a Play Store release.
  server: {
    androidScheme: 'https',
    url: API_URL,
    cleartext: false,
    allowNavigation: [
      'oikos.onrender.com',
      '*.onrender.com',
      'wa.me',
      'api.whatsapp.com',
      'blinkit.com',
      'www.zeptonow.com',
      'www.bigbasket.com',
      'www.swiggy.com',
      'www.amazon.in',
    ],
  },
  android: {
    backgroundColor: '#FAF7F2',
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#FAF7F2',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
      showSpinner: false,
    },
  },
};

export default config;
