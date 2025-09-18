"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";

// 🔹 Fetcher
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function WallpaperPage() {
  const params = useParams();
  const id = params?.id;

  const [countdown, setCountdown] = useState(null);
  const [ready, setReady] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  // ✅ Fetch single wallpaper (with related)
  const { data, error } = useSWR(id ? `/api/wallpapers/${id}` : null, fetcher);

  // ✅ Detect AdBlock
  useEffect(() => {
    const bait = document.createElement("div");
    bait.className = "adsbox";
    bait.style.position = "absolute";
    bait.style.left = "-9999px";
    document.body.appendChild(bait);

    setTimeout(() => {
      if (!bait || bait.offsetHeight === 0 || bait.offsetParent === null) {
        setAdBlockDetected(true);
      }
      bait.remove();
    }, 800);
  }, []);

  if (error) {
    return (
      <p className="text-red-600 text-center mt-10">
        ⚠️ Failed to load wallpaper.
      </p>
    );
  }

  if (!data) {
    return (
      <p className="text-gray-600 text-center mt-10">
        ⏳ Loading wallpaper…
      </p>
    );
  }

  // ✅ Split wallpaper + related
  const { related = [], ...wall } = data;

  // ✅ Start Ad + Countdown + Download
  const startAdThenDownload = () => {
    if (adBlockDetected) {
      alert("⚠️ Please disable AdBlock or Brave Shields to download.");
      return;
    }

    setReady(false);
    setCountdown(10);

    // Try triggering ad popup
    try {
      const fakeClick = document.createElement("a");
      fakeClick.href = "#";
      fakeClick.style.display = "none";
      document.body.appendChild(fakeClick);
      fakeClick.click();
      fakeClick.remove();
    } catch (e) {
      console.warn("Ad trigger failed", e);
    }

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c <= 1) {
          clearInterval(timer);
          setReady(true);

          const link = document.createElement("a");
          link.href = wall.url;
          link.download = wall.name || "wallpaper.jpg";
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
      {/* ✅ Current Wallpaper */}
      <h1 className="text-3xl font-bold text-center">{wall.name}</h1>
      <img
        src={wall.url}
        alt={wall.name}
        className="max-w-full rounded-lg shadow-lg"
      />

      {wall.width && wall.height && (
        <p className="text-gray-600 text-center">
          📏 Resolution: {wall.width} × {wall.height}
        </p>
      )}

      {/* 🚫 AdBlock Warning */}
      {adBlockDetected && (
        <div className="w-full max-w-lg bg-red-100 p-4 rounded text-center shadow">
          <p className="text-red-600 font-semibold">
            ⚠️ AdBlock detected. Please disable AdBlock or Brave Shields to
            download wallpapers.
          </p>
        </div>
      )}

      {/* ✅ Download Button */}
      {!ready && !adBlockDetected ? (
        <button
          onClick={startAdThenDownload}
          className="px-6 py-3 bg-blue-600 text-white rounded mt-4"
        >
          {countdown === null
            ? "Watch Ad & Download"
            : `Please wait... ${countdown}s`}
        </button>
      ) : ready ? (
        <p className="text-green-600 font-semibold mt-4">
          ✅ Download started!
        </p>
      ) : null}

      {/* ✅ Related Wallpapers */}
      {related.length > 0 && (
        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Related Wallpapers
          </h2>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {related.map((r) => (
              <Link
                key={r.fileId}
                href={`/wallpaper/${r.fileId}`}
                className="break-inside-avoid block group relative"
              >
                <img
                  src={r.url}
                  alt={r.name}
                  className="w-full rounded-lg shadow-md hover:opacity-90 transition"
                />
                <p className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                  {r.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
