import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    // 🔹 Fetch wallpapers
    const res = await fetch("https://api.imagekit.io/v1/files?limit=200", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.IMAGEKIT_PRIVATE_KEY || ""}:`
        ).toString("base64")}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("ImageKit API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: res.status }
      );
    }

    const files = await res.json();

    // 🔹 Find requested wallpaper
    const wall = files.find((file) => file.fileId === id);
    if (!wall) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // 🔹 Find related wallpapers
    let related = [];
    if (wall.tags && wall.tags.length > 0) {
      related = files.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.tags?.some((tag) => wall.tags.includes(tag))
      );
    } else {
      const keyword = wall.name?.split(" ")[0]?.toLowerCase() || "";
      related = files.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.name?.toLowerCase().includes(keyword)
      );
    }

    // 🔹 Normalize related wallpapers
    const relatedWallpapers = related.slice(0, 12).map((file) => ({
      fileId: file.fileId,
      name: file.name,
      url: file.url,
      width: file.width,
      height: file.height,
      tags: file.tags || [],
    }));

    // 🔹 Return result
    return NextResponse.json({
      fileId: wall.fileId,
      name: wall.name,
      url: wall.url,
      width: wall.width,
      height: wall.height,
      tags: wall.tags || [],
      related: relatedWallpapers,
    });
  } catch (error) {
    console.error("Error fetching wallpaper:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
