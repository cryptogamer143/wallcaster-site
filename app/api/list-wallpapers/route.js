import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const limit = searchParams.get("limit") || "50";
    const skip = searchParams.get("skip") || "0";

    const apiUrl = `https://api.imagekit.io/v1/files?limit=${limit}&skip=${skip}`;

    // 🔹 Explicitly log key details
    const key = process.env.IMAGEKIT_PRIVATE_KEY || "";
    console.log("🔑 [ENV RAW] ->", JSON.stringify(key));
    console.log("🔑 [ENV LENGTH] ->", key.length);
    const base64 = Buffer.from(`${key}:`).toString("base64");
    console.log("🔑 [BASE64] ->", base64);

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${base64}`,
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("🔥 Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
