import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoTransitionMatches } from "@/lib/matchAutoTransition";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Auto-transition before fetching single match
  await autoTransitionMatches();

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      teamA: true,
      teamB: true,
      winner: true,
      tournament: { include: { sport: true } },
      sets: { orderBy: { setNumber: "asc" } },
    },
  });
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(match);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const match = await prisma.match.update({
    where: { id },
    data,
    include: { teamA: true, teamB: true, winner: true },
  });
  return NextResponse.json(match);
}
