import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a Free Account',
  description: 'Create your free VaultSphere account to track your watch history, build a watchlist, and personalize your entertainment experience.',
  alternates: {
    canonical: '/auth/signup',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
