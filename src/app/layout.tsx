import type { Metadata, Viewport } from "next";
import { cormorant, dmSans, dmMono } from "@/lib/fonts";
import { cn }                        from "@/lib/utils";
import { SITE_CONFIG }               from "@/constants";
import { Toaster }                   from "@/components/ui/Toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default:  `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords:    ["fashion", "bangladesh", "clothing", "premium", "minimal", "luxury"],
  authors:     [{ name: SITE_CONFIG.name }],
  icons: {
    icon:    "/favicon.ico",
    apple:   "/icons/icon-192.svg",
    shortcut:"/favicon.ico",
  },
  openGraph: {
    type:        "website",
    locale:      "en_BD",
    url:         SITE_CONFIG.url,
    siteName:    SITE_CONFIG.name,
    title:       `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: SITE_CONFIG.name }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor:   "#080808",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(cormorant.variable, dmSans.variable, dmMono.variable)}
    >
      <body className="font-sans bg-brand-white text-brand-black antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
