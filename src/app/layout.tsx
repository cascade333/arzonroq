import type { Metadata } from "next";
import "./globals.css";
import YandexMetrika from "@/components/YandexMetrika";

export const metadata: Metadata = {
  metadataBase: new URL("https://eng-arzon.uz"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
