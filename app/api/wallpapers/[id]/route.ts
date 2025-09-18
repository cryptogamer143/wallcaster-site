import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const res = await fetch("https://api.imagekit.io/v1/files?limit=100", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.IMAGEKIT_PRIVATE_KEY + ":"
        ).toString("base64")}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: 500 }
      );
    }

    const files: any[] = await res.json();

    // ✅ Find wallpaper by fileId
    const wall = files.find((file) => file.fileId === id);

    if (!wall) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // ✅ Return simplified wallpaper
    return NextResponse.json({
      fileId: wall.fileId,
      name: wall.name,
      url: wall.url,
      width: wall.width,
      height: wall.height,
    });
  } catch (error) {
    console.error("Error fetching wallpaper:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
