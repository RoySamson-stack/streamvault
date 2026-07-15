import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In to Your Account',
  description: 'Sign in to your VaultSphere account to access your watchlist, continue watching, and manage your profile.',
  alternates: {
    canonical: '/auth/login',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
