import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Beroş Restaurant | Tarihi Sur Mimarisi & Modern Diyarbakır Gastronomisi",
  description:
    "Hasırlı, Yenikapı Sk. No:88 Sur/Diyarbakır. Yerçekimsiz 3D tabaklar ve sinematik modern Diyarbakır mutfağı deneyimi.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Beroş Restaurant",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0c0a09",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark h-full bg-[#0c0a09] text-[#f4f4f5] antialiased">
      <body className="min-h-full flex flex-col bg-[#0c0a09] text-[#f4f4f5] selection:bg-[#d4af37]/30 selection:text-[#fef3c7]">
        {children}
      </body>
    </html>
  );
}
