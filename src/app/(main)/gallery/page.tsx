"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Photo { id: string; url: string; caption?: string; }
interface Album { id: string; name: string; description?: string; coverUrl?: string; photos: Photo[]; _count: { photos: number }; }

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((data) => { setAlbums(data); setLoading(false); });
  }, []);

  function downloadPhoto(photo: Photo) {
    const a = document.createElement("a");
    a.href = photo.url;
    a.download = `photo-${photo.id}.jpg`;
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📷 แกลเลอรี</h1>
        {selectedAlbum && (
          <button
            onClick={() => setSelectedAlbum(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← กลับ
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : !selectedAlbum ? (
        // Albums grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <button
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className="text-left group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📷</div>
                  )}
                </div>
                <CardContent className="pt-3 pb-4">
                  <h3 className="font-semibold text-gray-900">{album.name}</h3>
                  {album.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{album.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{album._count.photos} รูป</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      ) : (
        // Photos grid
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{selectedAlbum.name}</h2>
            {selectedAlbum.description && (
              <p className="text-sm text-gray-500">{selectedAlbum.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">{selectedAlbum.photos.length} รูป</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedAlbum.photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <div
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-end justify-end p-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadPhoto(photo); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 text-xs px-2 py-1 rounded-md font-medium"
                    >
                      ⬇ ดาวน์โหลด
                    </button>
                  </div>
                </div>
                {photo.caption && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption ?? ""}
              className="w-full rounded-xl max-h-[80vh] object-contain"
            />
            {selectedPhoto.caption && (
              <p className="text-white text-center mt-3 text-sm">{selectedPhoto.caption}</p>
            )}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => downloadPhoto(selectedPhoto)}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100"
              >
                ⬇ ดาวน์โหลด
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-600"
              >
                ✕ ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
