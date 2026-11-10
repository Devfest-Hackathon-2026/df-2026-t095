import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:5173'),
  title: 'Elsewhere｜好きな場所から、次の行き先へ',
  description:
    '好きな場所の風景や過ごし方から、似た場所を探せます。共通点と違いを比べて、次に訪ねたい場所を見つけましょう。',
  openGraph: {
    title: 'Elsewhere｜好きな場所から、次の行き先へ',
    description: '風景や過ごし方から、次に行きたい場所を探す。',
    type: 'website',
    images: ['/images/copenhagen.jpg'],
  },
  icons: {
    icon: '/elsewhere.svg',
    shortcut: '/elsewhere.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
