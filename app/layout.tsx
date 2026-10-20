import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import {
  Footer,
  FooterFrame,
  Header,
  HeaderFrame,
} from "@/components/site-shell";
import { canIndex, site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  robots: { index: canIndex, follow: canIndex },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    images: [{ url: "/share-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/share-image"] },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Suspense fallback={<HeaderFrame />}>
          <Header />
        </Suspense>
        {children}
        <Suspense fallback={<FooterFrame />}>
          <Footer />
        </Suspense>
        <Suspense fallback={null}>
          <PrismicPreview repositoryName={repositoryName} />
        </Suspense>
      </body>
    </html>
  );
}
