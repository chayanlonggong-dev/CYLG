import type { Metadata } from "next";

import Script from "next/script";

import {
  Cinzel,
} from "next/font/google";

import "./globals.css";

import { LanguageProvider } from "@/app/providers/LanguageProvider";
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker";

import {
  prisma,
} from "@/lib/prisma";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.websiteSettings.findUnique({
    where: {
      id: 1,
    },
  });

  const siteName =
    settings?.siteName?.trim() || "ChaYanLongGong";

  const favicon =
    settings?.favicon?.trim() || "/favicon.ico";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://chayanlonggong.com";

  return {
    verification: {
      google:
        "97OYqRCTX_X37leMlAgujXq6QrtoKq7qGzHpSWu0lU0",
    },

    metadataBase: new URL(siteUrl),

    alternates: {
      canonical: "/",
    },

    title: {
      default: `${siteName} | Luxury Elite Companion Agency`,
      template: `%s | ${siteName}`,
    },

    description:
      `${siteName} is a luxury elite companion agency providing a premium private experience.`,

    keywords: [
      "Luxury Elite Companion",
      "Luxury Lifestyle",
      "Private Experience",
      "Elite Companion Agency",
      siteName,
    ],

    authors: [
      {
        name: siteName,
      },
    ],

    creator: siteName,

    icons: {
      icon: [
        {
          url: favicon,
        },
      ],
      shortcut: favicon,
      apple: favicon,
    },

    manifest: "/site.webmanifest",

    openGraph: {
      title: `${siteName} | Luxury Elite Companion Agency`,
      description:
        "Luxury private experience with an elite collection.",
      url: siteUrl,
      siteName: siteName,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${siteName} | Luxury Elite Companion Agency`,
      description:
        "Luxury private experience with an elite collection.",
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${cinzel.variable}
        h-full
        antialiased
      `}
    >
      <body
        className="
          min-h-full
          flex
          flex-col
          bg-black
          text-white
        "
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-28KCE5VPMT"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
window.dataLayer = window.dataLayer || [];
function gtag(){
  window.dataLayer.push(arguments);
}
gtag('js', new Date());
gtag(
  'config',
  'G-28KCE5VPMT'
);
`}
        </Script>

        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ChaYanLongGong",
              url: "https://chayanlonggong.com",
              logo: "https://chayanlonggong.com/logo.png",
            }),
          }}
        />

        {/* Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "ChaYanLongGong",
              url: "https://chayanlonggong.com",
              inLanguage: "en",
              publisher: {
                "@type": "Organization",
                name: "ChaYanLongGong",
                logo: {
                  "@type": "ImageObject",
                  url: "https://chayanlonggong.com/logo.png",
                },
              },
            }),
          }}
        />

        <LanguageProvider>
          <AnalyticsTracker />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}