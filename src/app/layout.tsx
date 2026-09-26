import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Cinzel, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["500", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.loqumet.com"),
  title: "Loqum Et Steakhouse | Diyarbakır'ın En İyi Steak Deneyimi",
  description:
    "Loqum Et Diyarbakır 75. Yol şubesinde özel dinlendirilmiş dry-aged etler, enfes steakhouse menüsü ve eşsiz atmosfer. Masanızı hemen ayırtın.",
  keywords: [
    "loqum et",
    "lokum et",
    "lokumet",
    "loqumet",
    "loqum et diyarbakır",
    "lokum et diyarbakır",
    "diyarbakır steakhouse",
    "75 yol restoran",
    "dry aged diyarbakır",
  ],
  alternates: {
    canonical: "https://www.loqumet.com",
  },
  openGraph: {
    title: "Loqum Et Steakhouse | Diyarbakır'ın En İyi Steak Deneyimi",
    description:
      "Loqum Et Diyarbakır 75. Yol şubesinde özel dinlendirilmiş dry-aged etler, enfes steakhouse menüsü ve eşsiz atmosfer. Masanızı hemen ayırtın.",
    url: "https://www.loqumet.com",
    siteName: "Loqum Et Steakhouse",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/images/loqum-hero-master.jpg",
        width: 1376,
        height: 768,
        alt: "Loqum Et Steakhouse Diyarbakır - Giriş, Tabela ve Boğalar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loqum Et Steakhouse | Diyarbakır'ın En İyi Steak Deneyimi",
    description:
      "Loqum Et Diyarbakır 75. Yol şubesinde özel dinlendirilmiş dry-aged etler, enfes steakhouse menüsü ve eşsiz atmosfer. Masanızı hemen ayırtın.",
    images: ["/images/loqum-hero-master.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loqum Et Diyarbakır",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "Steakhouse"],
  name: "Loqum Et Steakhouse",
  alternateName: ["Loqum Et", "Lokum Et", "Lokum Et Diyarbakır"],
  image: "https://www.loqumet.com/images/loqum-hero-master.jpg",
  url: "https://www.loqumet.com",
  telephone: "+904125030405",
  servesCuisine: ["Steakhouse", "Dry-Aged Et", "Turkish Grill"],
  priceRange: "$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "75. Yol Ana Şube, Mega Arslan Cadde 75 Sitesi C-Blok",
    addressLocality: "Diyarbakır",
    addressRegion: "Diyarbakır",
    addressCountry: "TR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.9144,
    longitude: 40.2306,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "00:00",
    },
  ],
  menu: "https://www.loqumet.com/#menu",
  acceptsReservations: "True",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      translate="no"
      className={`notranslate dark bg-[#0A0A0A] text-[#f4f4f5] antialiased ${cinzel.variable} ${playfair.variable} ${plusJakarta.variable}`}
    >
      <head>
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col bg-[#0A0A0A] text-[#f4f4f5] selection:bg-[#d4af37]/30 selection:text-[#fef3c7]"
        suppressHydrationWarning
      >
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A]" />}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
