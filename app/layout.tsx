import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const comicNeue = Comic_Neue({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-neue",
});

export const metadata: Metadata = {
  title: "Ginder (กินเด้อ)",
  description: "โหวตหาร้านอาหารกับเพื่อนง่ายๆ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${comicNeue.variable} antialiased`}
        style={{ fontFamily: "var(--font-main)" }}
      >
        <div className="mx-auto min-h-screen max-w-lg px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}