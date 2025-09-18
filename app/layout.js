import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wallcaster",
  description: "Free Aesthetic Wallpapers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-white text-slate-900">
        {/* PropellerAds script — REPLACE the src with the exact script provided by PropellerAds */}
        <Script
          id="propellerads"
          strategy="afterInteractive"
          src="https://YOUR-PROPELLERADS-LINK.js"
          data-cfasync="false"
        />
        <div className="max-w-6xl mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
