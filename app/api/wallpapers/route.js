import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") || "50";
    const skip = searchParams.get("skip") || "0"; // pagination offset

    const res = await fetch(
      `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.IMAGEKIT_PRIVATE_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Simplify response
    const wallpapers = data.map((file: any) => ({
      fileId: file.fileId,
      name: file.name,
      url: file.url,
    }));

    return NextResponse.json({
      files: wallpapers,
      count: wallpapers.length,
      skip: Number(skip),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching from ImageKit:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
