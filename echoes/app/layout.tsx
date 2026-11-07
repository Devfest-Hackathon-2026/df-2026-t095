import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://elsewhere-place-discovery.hexagon-one.chatgpt.site"),
  title: "Elsewhere — find a familiar feeling",
  description: "Start with a place you love. Discover new places that share its feeling, compare what makes them different, and save your next little adventure.",
  openGraph: { title: "Elsewhere — somewhere new, something familiar", description: "Find the feeling of a place you love, somewhere new.", type: "website", images: ["/images/kamo.jpg"] },
  icons: {
    icon: "/elsewhere.svg",
    shortcut: "/elsewhere.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
