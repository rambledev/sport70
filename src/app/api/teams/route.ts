import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  const teams = await prisma.team.findMany({
    where: tournamentId ? { tournamentId } : {},
    include: { sport: true },
    orderBy: { seed: "asc" },
  });
  return NextResponse.json(teams);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const team = await prisma.team.create({
    data: {
      name: data.name,
      university: data.university,
      seed: data.seed ?? 0,
      sportId: data.sportId,
      tournamentId: data.tournamentId,
    },
  });
  return NextResponse.json(team, { status: 201 });
}
