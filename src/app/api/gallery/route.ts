import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const albums = await prisma.album.findMany({
    include: {
      photos: { orderBy: { createdAt: "asc" } },
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(albums);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (data.albumId) {
    // Adding photo to album
    const photo = await prisma.photo.create({
      data: { albumId: data.albumId, url: data.url, caption: data.caption },
    });
    return NextResponse.json(photo, { status: 201 });
  }
  // Creating album
  const album = await prisma.album.create({
    data: { name: data.name, description: data.description, coverUrl: data.coverUrl },
  });
  return NextResponse.json(album, { status: 201 });
}
