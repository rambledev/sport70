"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Location {
  id: string; name: string; type: string;
  lat?: number; lng?: number; address?: string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string }> = {
  FIELD: { label: "สนามกีฬา", icon: "⚽", color: "bg-green-100 text-green-700" },
  TOILET: { label: "ห้องน้ำ", icon: "🚻", color: "bg-blue-100 text-blue-700" },
  SERVICE: { label: "บริการ", icon: "🏥", color: "bg-yellow-100 text-yellow-700" },
};

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => { setLocations(data); setLoading(false); });
  }, []);

  const filtered = filter === "ALL" ? locations : locations.filter((l) => l.type === filter);

  function openGoogleMaps(lat?: number, lng?: number, name?: string) {
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
    } else if (name) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(name)}`, "_blank");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🗺️ แผนที่สนามและสถานที่</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[{ value: "ALL", label: "ทั้งหมด", icon: "📍" }, ...Object.entries(typeConfig).map(([k, v]) => ({ value: k, label: v.label, icon: v.icon }))].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((loc) => {
            const tc = typeConfig[loc.type] ?? { label: loc.type, icon: "📍", color: "bg-gray-100 text-gray-700" };
            return (
              <Card key={loc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-3xl">{tc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                      {loc.address && <p className="text-sm text-gray-500 mt-0.5">{loc.address}</p>}
                      {loc.lat && loc.lng && (
                        <p className="text-xs text-gray-400 mt-1">
                          {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </p>
                      )}
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${tc.color}`}>
                        {tc.label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openGoogleMaps(loc.lat, loc.lng, loc.name)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    🔗 เปิดใน Google Maps
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Map Preview note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">💡 สถานที่ทั้งหมดอยู่ใน RMU Campus</p>
        <p>กดปุ่ม "เปิดใน Google Maps" เพื่อดูทิศทางและเดินทาง</p>
      </div>
    </div>
  );
}
