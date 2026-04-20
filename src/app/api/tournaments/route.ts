import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: {
      sport: true,
      _count: { select: { teams: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const tournament = await prisma.tournament.create({
    data: {
      name: data.name,
      sportId: data.sportId,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: { sport: true },
  });
  return NextResponse.json(tournament, { status: 201 });
}
