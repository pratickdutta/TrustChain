import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustChain — Decentralized Social Credit on Stellar",
  description:
    "TrustChain converts social trust into verifiable credit using Stellar blockchain, unlocking financial access for the next billion users.",
  keywords: ["stellar", "blockchain", "microcredit", "DeFi", "financial inclusion", "trust", "web3"],
  openGraph: {
    title: "TrustChain",
    description: "Decentralized Social Credit Network on Stellar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
