import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔹 Pagination
    const limit = searchParams.get("limit") || "50";
    const skip = searchParams.get("skip") || "0";

    // 🔹 Build ImageKit API URL
    const apiUrl = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`;

    // 🔹 Auth header
    const key = process.env.IMAGEKIT_PRIVATE_KEY || "";
    const authHeader = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;

    // 🔹 Fetch wallpapers
    const res = await fetch(apiUrl, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ ImageKit API error:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to fetch wallpapers", details: errText },
        { status: res.status }
      );
    }

    const files = await res.json();

    // 🔹 Normalize wallpapers
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

    // 🔹 Return paginated response
    return NextResponse.json({
      files: wallpapers,
      count: wallpapers.length,
      skip: Number(skip),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
