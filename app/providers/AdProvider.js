"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function AdProvider({ children }) {
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  // ✅ Detect AdBlock globally
  useEffect(() => {
    const bait = document.createElement("div");
    bait.className = "adsbox";
    bait.style.position = "absolute";
    bait.style.left = "-999px";
    document.body.appendChild(bait);

    setTimeout(() => {
      if (!bait || bait.offsetParent === null || bait.offsetHeight === 0) {
        setAdBlockDetected(true);
      }
      if (bait.parentNode) bait.parentNode.removeChild(bait);
    }, 1000);
  }, []);

  return (
    <>
      {/* Global Ad Script */}
      <Script
        id="propeller-global"
        strategy="afterInteractive"
        src="https://fpyf8.com/88/tag.min.js"
        data-zone="171814"
        data-cfasync="false"
      />

      {/* 🚫 Global AdBlock Warning */}
      {adBlockDetected && (
        <div className="w-full bg-red-100 text-center p-4 shadow">
          <p className="text-red-600 font-bold">
            ⚠️ AdBlock or Brave Shields detected. Please disable it to use
            Wallcaster.
          </p>
        </div>
      )}

      {/* ✅ Global Banner (ads only if no AdBlock) */}
      {!adBlockDetected && (
        <div className="w-full bg-gray-100 p-4 text-center shadow">
          <p className="text-sm text-gray-600">Advertisement</p>
          <div
            id="ad-slot-global"
            className="h-20 flex items-center justify-center border border-dashed border-gray-400 rounded"
          >
            <p className="text-xs text-gray-400">Ad will load here…</p>
          </div>
        </div>
      )}

      {/* ✅ Page Content */}
      <main>{children}</main>
    </>
  );
}
