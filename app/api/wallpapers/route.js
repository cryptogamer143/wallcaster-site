import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔹 Pagination params
    const limit = searchParams.get("limit") || "50";
    const skip = searchParams.get("skip") || "0";

    // 🔹 Build ImageKit API URL
    const apiUrl = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`;

    // 🔹 Fetch from ImageKit
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.IMAGEKIT_PRIVATE_KEY || ""}:`
        ).toString("base64")}`,
      },
      cache: "no-store", // disable caching
    });

    if (!res.ok) {
      console.error("ImageKit API error:", res.status, res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch wallpapers" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // 🔹 Normalize wallpapers
    const wallpapers = Array.isArray(data)
      ? data.map((file) => ({
          fileId: file.fileId,
          name: file.name,
          url: file.url,
          width: file.width,
          height: file.height,
          tags: file.tags || [],
        }))
      : [];

    // 🔹 Return response
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
