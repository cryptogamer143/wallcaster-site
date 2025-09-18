import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Wallcaster",
  description: "Free Aesthetic Wallpapers with Ads Support",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Insert ad script */}
        <Script
          id="propeller"
          strategy="afterInteractive"
          src="https://YOUR-PROPELLERADS-LINK.js"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
