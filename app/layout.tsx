import type { Metadata } from "next";
import { Righteous, DM_Sans } from "next/font/google";
import "./globals.css";

const righteous = Righteous({
  weight: ["400"],
  variable: "--font-righteous",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color Palette Generator",
  description: "Generate beautiful color palettes from any base color",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${righteous.variable} ${dmSans.variable}`}>
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
