"use client";

import { useParams } from "next/navigation";
import Script from "next/script";
import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Search } from "lucide-react";

// 🔹 Types
interface Wallpaper {
  fileId: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
}

interface WallpapersResponse {
  files: Wallpaper[];
}

// 🔹 Fetcher
const fetcher = (url: string): Promise<WallpapersResponse> =>
  fetch(url).then((res) => res.json());

export default function WallpaperPage() {
  const params = useParams();
  const id = params?.id as string;

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  // ✅ Fetch wallpapers (with optional search)
  const { data, error } = useSWR(
    `/api/list-wallpapers?limit=100${search ? `&q=${encodeURIComponent(search)}` : ""}`,
    fetcher
  );

  const [countdown, setCountdown] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);

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
      if (bait.parentNode) bait.parentNode.removeChild(bait);
    }, 800);
  }, []);

  // ✅ Error / Loading states
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

  // ✅ Find current wallpaper
  const wall = data.files.find((w) => w.fileId === id);
  if (!wall) {
    return (
      <p className="text-center text-red-600 mt-10">
        ⚠️ Wallpaper not found
      </p>
    );
  }

  // ✅ Wallpapers to show (related or search results)
  const gridWallpapers = search
    ? data.files // show search results
    : data.files.filter((w) => w.fileId !== id); // related

  // ✅ Start Ad + Countdown + Download
  const startAdThenDownload = () => {
    if (adBlockDetected) {
      alert("⚠️ Please disable AdBlock or Brave Shields to download.");
      return;
    }

    setReady(false);
    setCountdown(10);

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

  // ✅ Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(query);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* ✅ Search Bar */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-xl mx-auto mb-8 flex items-center gap-2 bg-gray-100 p-2 rounded-lg shadow-sm"
      >
        <Search className="text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search wallpapers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-700"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

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

      {/* ✅ Ad below image */}
      {!adBlockDetected && (
        <div className="w-full max-w-lg bg-gray-100 p-4 rounded text-center shadow">
          <p className="text-gray-600 mb-2">Advertisement</p>
          <div
            id="ad-slot-below-image"
            className="h-32 flex items-center justify-center border border-dashed border-gray-400 rounded"
          >
            <Script
              id="ad-below-image"
              strategy="afterInteractive"
              src="https://fpyf8.com/88/tag.min.js"
              data-zone="171814"
              data-cfasync="false"
            />
          </div>
        </div>
      )}

      {/* ✅ Ad above button */}
      {!ready && !adBlockDetected && (
        <div className="w-full max-w-lg bg-gray-100 p-4 rounded text-center shadow">
          <p className="text-gray-600 mb-2">Advertisement</p>
          <div
            id="ad-slot-wallpaper"
            className="h-32 flex items-center justify-center border border-dashed border-gray-400 rounded"
          >
            <Script
              id="ad-wallpaper"
              strategy="afterInteractive"
              src="https://fpyf8.com/88/tag.min.js"
              data-zone="171814"
              data-cfasync="false"
            />
          </div>
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

      {/* ✅ Grid: Related or Search Results */}
      {gridWallpapers.length > 0 && (
        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {search ? `Search Results for "${search}"` : "Related Wallpapers"}
          </h2>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {gridWallpapers.map((r) => (
              <Link
                key={r.fileId}
                href={`/wallpaper/${r.fileId}`}
                className="break-inside-avoid block group"
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
