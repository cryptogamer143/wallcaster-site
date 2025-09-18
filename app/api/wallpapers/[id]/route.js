import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // 🔹 Fetch wallpapers from ImageKit
    const res = await fetch("https://api.imagekit.io/v1/files?limit=200", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.IMAGEKIT_PRIVATE_KEY || ""}:`
        ).toString("base64")}`,
      },
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

    // ✅ Normalize wallpapers
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

    // 🔹 Find the requested wallpaper
    const wall = wallpapers.find((f) => f.fileId === id);
    if (!wall) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // 🔹 Find related wallpapers
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

    // ✅ Always return { ...wall, related }
    return NextResponse.json({
      ...wall,
      related: related.slice(0, 12), // only top 12 related wallpapers
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
