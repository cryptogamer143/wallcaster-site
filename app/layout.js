import "./globals.css";
import AdProvider from "./providers/AdProvider";

export const metadata = {
  title: "Wallcaster",
  description: "Free Aesthetic Wallpapers with Ads",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdProvider>{children}</AdProvider>
      </body>
    </html>
  );
}
