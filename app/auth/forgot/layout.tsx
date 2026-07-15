import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Your Password',
  description: 'Forgot your password? Request a password reset link for your VaultSphere account.',
  alternates: {
    canonical: '/auth/forgot',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ForgotLayout({ children }: { children: React.ReactNode }) {
  return children
}
