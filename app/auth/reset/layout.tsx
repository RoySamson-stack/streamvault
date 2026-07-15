import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Set a new password for your VaultSphere account.',
  alternates: {
    canonical: '/auth/reset',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResetLayout({ children }: { children: React.ReactNode }) {
  return children
}
