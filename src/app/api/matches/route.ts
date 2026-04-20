import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { autoTransitionMatches } from "@/lib/matchAutoTransition";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  const isLive = searchParams.get("isLive");

  // Auto-transition PENDING → ONGOING based on startTime
  await autoTransitionMatches();

  const matches = await prisma.match.findMany({
    where: {
      ...(tournamentId ? { tournamentId } : {}),
      ...(isLive === "true" ? { isLive: true } : {}),
    },
    include: {
      teamA: true,
      teamB: true,
      winner: true,
      tournament: { include: { sport: true } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
  });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const match = await prisma.match.create({
    data: {
      tournamentId: data.tournamentId,
      teamAId: data.teamAId,
      teamBId: data.teamBId,
      round: data.round,
      matchNumber: data.matchNumber,
      nextMatchId: data.nextMatchId,
      location: data.location,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
    },
    include: { teamA: true, teamB: true, tournament: { include: { sport: true } } },
  });
  return NextResponse.json(match, { status: 201 });
}
