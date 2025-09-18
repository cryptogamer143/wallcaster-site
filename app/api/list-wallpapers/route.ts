import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 🔹 Query params
  const limit = searchParams.get("limit") || "50";
  const skip = searchParams.get("skip") || "0";
  const searchQuery = searchParams.get("q") || ""; // keyword search

  try {
    // 🔹 Build ImageKit API URL
    let apiUrl = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`;
    if (searchQuery) {
      apiUrl += `&searchQuery=${encodeURIComponent(searchQuery)}`;
    }

    // 🔹 Fetch from ImageKit API
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.IMAGEKIT_PRIVATE_KEY + ":"
        ).toString("base64")}`,
      },
      cache: "no-store", // always fresh
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 🔹 Simplify response
    const wallpapers = data.map((file: any) => ({
      fileId: file.fileId,
      name: file.name,
      url: file.url,
      width: file.width,
      height: file.height,
      tags: file.tags || [], // include tags if exist
    }));

    return NextResponse.json({
      files: wallpapers,
      count: wallpapers.length,
      skip: Number(skip),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("Error fetching wallpapers:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
