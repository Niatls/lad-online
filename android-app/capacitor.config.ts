import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ru.lad.admin",
  appName: "Лад",
  webDir: "www",
  bundledWebRuntime: false,
  server: {
    url: "https://lad-online.vercel.app/admin",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
