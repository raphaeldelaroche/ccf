import type { Metadata } from "next";
import localFont from "next/font/local";
import { STIX_Two_Text } from "next/font/google";
import "./globals.css";
import { SITE_METADATA } from "@/config/seo-pages";

const maisonNeue = localFont({
  src: [
    { path: "../public/fonts/Maison_Neue_Light.ttf", weight: "300" },
    { path: "../public/fonts/Maison_Neue_Book.ttf", weight: "400" },
    { path: "../public/fonts/Maison_Neue_Bold.ttf", weight: "700" },
  ],
  variable: "--font-maison",
});

const maisonNeueMono = localFont({
  src: [{ path: "../public/fonts/Maison_Neue_Mono.ttf", weight: "400" }],
  variable: "--font-maison-mono",
});

const stixTwoText = STIX_Two_Text({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = SITE_METADATA;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${maisonNeue.variable} ${maisonNeueMono.variable} ${stixTwoText.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
