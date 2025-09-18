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

    const files = await res.json();

    // ✅ Find the wallpaper by fileId
    const wall = files.find((file: any) => file.fileId === id);

    if (!wall) {
      return NextResponse.json(
        { error: "Wallpaper not found" },
        { status: 404 }
      );
    }

    // ✅ Return only what frontend needs
    return NextResponse.json({
      fileId: wall.fileId,
      name: wall.name,
      url: wall.url,
    });
  } catch (error) {
    console.error("Error fetching wallpaper:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
