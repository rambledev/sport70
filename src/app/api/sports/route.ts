import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sports = await prisma.sport.findMany({
    include: { _count: { select: { tournaments: true, teams: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(sports);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const sport = await prisma.sport.create({ data });
  return NextResponse.json(sport, { status: 201 });
}
