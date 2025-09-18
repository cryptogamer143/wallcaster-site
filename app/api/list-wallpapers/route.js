import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 🔹 Pagination
    const limit = searchParams.get("limit") || "50";
    const skip = searchParams.get("skip") || "0";
    const searchQuery = searchParams.get("q") || "";

    // 🔹 Build API URL
    let apiUrl = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`;
    if (searchQuery) {
      apiUrl += `&searchQuery=${encodeURIComponent(
        JSON.stringify({ name: searchQuery })
      )}`;
    }

    // ✅ Debug: Log env var & base64
    const key = process.env.IMAGEKIT_PRIVATE_KEY || "";
    console.log("🔑 Raw key from env:", JSON.stringify(key)); // show exact chars
    console.log(
      "🔑 Base64 encoded:",
      Buffer.from(`${key}:`).toString("base64")
    );

    // ✅ Fetch from ImageKit API
    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`,
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

    const data = await res.json();

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
