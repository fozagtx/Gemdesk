import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Gemdesk - AI-Powered Documentation Assistant",
  description: "Automated documentation management with AI",
  icons: {
    icon: "/gem.png",
    shortcut: "/gem.png",
    apple: "/gem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
