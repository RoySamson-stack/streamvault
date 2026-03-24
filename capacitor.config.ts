import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vaultsphere.tv',
  appName: 'VaultSphere',
  webDir: '.next',
  server: {
    // Set this to your deployed URL (Vercel) for TV APK builds
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://vaultsphere.vercel.app',
    cleartext: true,
  },
}

export default config
