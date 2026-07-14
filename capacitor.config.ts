import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vaultsphere.tv',
  appName: 'VaultSphere',
  webDir: 'out',
  server: {
    url: 'https://vaultsphere.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#07090d',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#07090d',
      showSpinner: false,
      launchAutoHide: true,
    },
  },
}

export default config
