"use client";

import { useParams } from "next/navigation";
import Script from "next/script";
import wallpapers from "../../data/wallpapers.json";
import { useState } from "react";

export default function WallpaperPage() {
  const params = useParams();
  const id = Number(params?.id);
  const wall = wallpapers.find((w) => w.id === id);

  const [countdown, setCountdown] = useState(null);
  const [ready, setReady] = useState(false);

  if (!wall) return <p>Not found</p>;

  const startAdThenDownload = () => {
    setReady(false);
    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          clearInterval(timer);
          setReady(true);

          // trigger download
          const link = document.createElement("a");
          link.href = wall.url;
          link.download = `${wall.title}.jpg`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <img
        src={wall.url}
        alt={wall.title}
        className="max-w-full rounded-lg shadow-lg"
      />

      {!ready && (
        <>
          <div className="w-full max-w-lg bg-gray-100 p-4 rounded">
            <div id="ad-slot" className="h-24 flex items-center justify-center">
              <p>Ad loading...</p>
            </div>
          </div>

          <button
            onClick={startAdThenDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded mt-4"
          >
            {countdown === null
              ? "Watch ad / Download"
              : `Please wait... ${countdown}s`}
          </button>
        </>
      )}

      <Script
        id="propeller-page"
        strategy="afterInteractive"
        src="https://YOUR-PROPELLERADS-LINK.js"
      />
    </div>
  );
}
