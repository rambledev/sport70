import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const locations = await prisma.mapLocation.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(locations);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const location = await prisma.mapLocation.create({ data });
  return NextResponse.json(location, { status: 201 });
}
