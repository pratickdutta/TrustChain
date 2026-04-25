import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TrustChain — Decentralized Social Credit on Stellar',
  description: 'TrustChain converts social trust into verifiable credit scores on the Stellar blockchain, enabling fair micro-loans for the unbanked.',
  keywords: ['Stellar', 'blockchain', 'DeFi', 'micro-credit', 'TrustChain', 'social credit'],
  openGraph: {
    title: 'TrustChain — Decentralized Social Credit on Stellar',
    description: 'Social trust → verifiable credit. Micro-loans for the next billion.',
    type: 'website',
  },
};

import Footer from '@/components/Footer';
import FloatingLogos from '@/components/FloatingLogos';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <FloatingLogos />
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
