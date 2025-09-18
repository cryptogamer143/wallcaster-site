"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import useSWRInfinite from "swr/infinite";
import { ChevronUp, Search } from "lucide-react";

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
  count: number;
  skip: number;
  limit: number;
}

// 🔹 Fetcher
const fetcher = async (url: string): Promise<WallpapersResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
};

// 🔹 Key generator
const getKey =
  (query: string) =>
  (pageIndex: number, previousPageData: WallpapersResponse | null) => {
    if (previousPageData && previousPageData.files.length === 0) return null;
    return `/api/list-wallpapers?limit=20&skip=${
      pageIndex * 20
    }&q=${encodeURIComponent(query)}`;
  };

export default function Home() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const { data, error, size, setSize, isValidating, mutate } =
    useSWRInfinite<WallpapersResponse>(getKey(search), fetcher);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [showTop, setShowTop] = useState(false);

  // ✅ Flatten paginated data safely
  const allFiles: Wallpaper[] = Array.isArray(data)
    ? data.flatMap((p) => p?.files ?? [])
    : [];

  // ✅ Safe reachedEnd check
  const reachedEnd =
    Array.isArray(data) &&
    data.length > 0 &&
    (data[data.length - 1]?.files?.length ?? 0) === 0;

  // ✅ Infinite scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          setSize((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [isValidating, setSize]);

  // ✅ Show "Back to Top"
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSize(1); // reset pagination
    setSearch(query.trim());
    mutate();
  };

  if (error)
    return (
      <p className="text-red-600 text-center mt-10">
        ⚠️ Failed to load wallpapers.
      </p>
    );

  if (!data)
    return (
      <div className="p-6">
        <h1 className="text-4xl font-extrabold mb-8 text-center tracking-tight text-gray-800">
          Wallcaster Wallpapers
        </h1>
        <p className="text-gray-500 text-center">⏳ Loading wallpapers…</p>
      </div>
    );

  return (
    <main className="p-4">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-6 text-center tracking-tight text-gray-800">
        Wallcaster Wallpapers
      </h1>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="max-w-xl mx-auto mb-8 flex items-center gap-2 bg-gray-100 p-2 rounded-lg shadow-sm"
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

      {/* No Results */}
      {allFiles.length === 0 && !isValidating && (
        <p className="text-center text-gray-500">
          ❌ No results found for <b>{search}</b>
        </p>
      )}

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {allFiles.map((w, i) => (
          <div key={w.fileId} className="break-inside-avoid relative group mb-4">
            <Link href={`/wallpaper/${w.fileId}`}>
              <img
                src={w.url}
                alt={w.name}
                className="w-full rounded-lg shadow-md hover:opacity-90 transition"
              />
            </Link>
            <p className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              {w.name}
            </p>
            {/* Ad block every 12th item */}
            {(i + 1) % 12 === 0 && (
              <div className="break-inside-avoid bg-gray-100 rounded-lg h-32 border border-dashed border-gray-400 flex items-center justify-center mt-4 relative">
                <p className="absolute top-1 left-2 text-xs text-gray-400">
                  Sponsored
                </p>
                <Script
                  id={`ad-grid-${i}`}
                  strategy="afterInteractive"
                  src="https://fpyf8.com/88/tag.min.js"
                  data-zone="171814"
                  data-cfasync="false"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Infinite Loader */}
      <div ref={loaderRef} className="text-center py-6">
        {isValidating && !reachedEnd && (
          <p className="text-gray-500">⏳ Loading more wallpapers…</p>
        )}
        {reachedEnd && (
          <p className="text-gray-400">✅ No more wallpapers to load</p>
        )}
      </div>

      {/* Back to Top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </main>
  );
}
