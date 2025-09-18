"use client";
import { useParams, useRouter } from "next/navigation";
import wallpapers from "../../../data/wallpapers.json";
import Script from "next/script";
import { useState } from "react";

export default function WallpaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const wall = (wallpapers as any[]).find(w => w.id === id);
  const [countdown, setCountdown] = useState(10);
  const [ready, setReady] = useState(false);

  if (!wall) return <p>Not found</p>;

  // When user clicks Download we navigate to /download flow OR show in-place ad + countdown
  const startAdThenDownload = () => {
    // If you need to call propeller ad JS to trigger onClick popunder, do it here (see Propeller docs).
    // For now we'll do a simple countdown that will be replaced by actual ad behavior.
    setReady(false);
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          setReady(true);
          // then trigger actual download:
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
    <div className="flex flex-col items-center gap-6">
      <img src={wall.url} alt={wall.title} className="max-w-full rounded-lg shadow-lg" />
      {!ready ? (
        <>
          <div className="w-full max-w-lg bg-gray-100 p-4 rounded">
            {/* This is the ad area. PropellerAds will fill it if your zone is set up as a banner */}
            <div id="ad-slot" className="h-24 flex items-center justify-center">
              <p>Ad area — Propeller / Your Ad Network</p>
            </div>
          </div>

          <button
            onClick={startAdThenDownload}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            Watch ad / Download (starts {countdown}s)
          </button>
        </>
      ) : null}
      {/* If you need Script loaded only on this page, you can add it here */}
      {/* <Script id="propeller-page" strategy="afterInteractive" src="https://YOUR-PROPELLERADS-LINK.js" /> */}
    </div>
  );
}
