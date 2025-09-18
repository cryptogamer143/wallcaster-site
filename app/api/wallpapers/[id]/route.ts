import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // 🔹 Fetch all wallpapers (increase limit if needed)
    const res = await fetch("https://api.imagekit.io/v1/files?limit=200", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.IMAGEKIT_PRIVATE_KEY + ":"
        ).toString("base64")}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: res.status }
      );
    }

    const files: any[] = await res.json();

    // 🔹 Find the requested wallpaper by fileId
    const wall = files.find((file) => file.fileId === id);

    if (!wall) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // 🔹 Find related wallpapers (first by tags, fallback to name)
    let related: any[] = [];
    if (wall.tags && wall.tags.length > 0) {
      related = files.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.tags?.some((tag: string) => wall.tags.includes(tag))
      );
    } else {
      related = files.filter(
        (f) =>
          f.fileId !== wall.fileId &&
          f.name
            ?.toLowerCase()
            .includes(wall.name?.toLowerCase().split(" ")[0] || "")
      );
    }

    // 🔹 Limit related wallpapers (max 12)
    related = related.slice(0, 12).map((file) => ({
      fileId: file.fileId,
      name: file.name,
      url: file.url,
      width: file.width,
      height: file.height,
      tags: file.tags || [],
    }));

    // 🔹 Return current wallpaper + related wallpapers
    return NextResponse.json({
      fileId: wall.fileId,
      name: wall.name,
      url: wall.url,
      width: wall.width,
      height: wall.height,
      tags: wall.tags || [],
      related,
    });
  } catch (error) {
    console.error("Error fetching wallpaper:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
