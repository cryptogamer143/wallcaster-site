import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop(); // ✅ extract [id]

    const key = process.env.IMAGEKIT_PRIVATE_KEY || "";
    const base64 = Buffer.from(`${key}:`).toString("base64");

    // 🔹 Fetch a bigger set (so we can pick related)
    const res = await fetch("https://api.imagekit.io/v1/files?limit=200", {
      headers: { Authorization: `Basic ${base64}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ ImageKit API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch wallpapers", details: errorText },
        { status: res.status }
      );
    }

    const files = await res.json();

    const wallpapers = Array.isArray(files)
      ? files.map((file) => ({
          fileId: file.fileId,
          name: file.name,
          url: file.url,
          width: file.width,
          height: file.height,
          tags: file.tags || [],
        }))
      : [];

    // 🔹 Find requested wallpaper
    const wall = wallpapers.find((f) => f.fileId === id);
    if (!wall) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 });
    }

    // 🔹 Related wallpapers
    let related = [];
    if (wall.tags.length > 0) {
      related = wallpapers.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.tags.some((tag) => wall.tags.includes(tag))
      );
    } else {
      const keyword = wall.name?.split(" ")[0]?.toLowerCase() || "";
      related = wallpapers.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.name?.toLowerCase().includes(keyword)
      );
    }

    return NextResponse.json({
      ...wall,
      related: related.slice(0, 12),
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
