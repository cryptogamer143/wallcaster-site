import Link from "next/link";
import wallpapers from "../data/wallpapers.json";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Wallcaster Wallpapers</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wallpapers.map((w) => (
          <Link key={w.id} href={`/wallpaper/${w.id}`}>
            <img
              src={w.url}
              alt={w.title}
              className="rounded-lg shadow-sm object-cover h-40 w-full"
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
