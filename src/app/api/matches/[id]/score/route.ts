import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MatchStatus } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { scoreA, scoreB, action, setNumber, winnerId } = await req.json();

  const match = await prisma.match.findUnique({
    where: { id },
    include: { tournament: { include: { sport: true } } },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

  const scoreType = match.tournament.sport.scoreType;

  if (scoreType === "SET" && setNumber !== undefined) {
    // Upsert set score
    await prisma.matchSet.upsert({
      where: { matchId_setNumber: { matchId: id, setNumber } },
      create: { matchId: id, setNumber, scoreA: scoreA ?? 0, scoreB: scoreB ?? 0 },
      update: { scoreA: scoreA ?? 0, scoreB: scoreB ?? 0 },
    });

    const updatedMatch = await prisma.match.findUnique({
      where: { id },
      include: { sets: true, teamA: true, teamB: true },
    });
    return NextResponse.json(updatedMatch);
  }

  // For SIMPLE and POINT types
  let newScoreA = match.scoreA;
  let newScoreB = match.scoreB;

  if (scoreType === "POINT") {
    if (action === "incA") newScoreA += 1;
    else if (action === "decA") newScoreA = Math.max(0, newScoreA - 1);
    else if (action === "incB") newScoreB += 1;
    else if (action === "decB") newScoreB = Math.max(0, newScoreB - 1);
  } else {
    if (scoreA !== undefined) newScoreA = scoreA;
    if (scoreB !== undefined) newScoreB = scoreB;
  }

  const updateData: Record<string, unknown> = {
    scoreA: newScoreA,
    scoreB: newScoreB,
    status: MatchStatus.ONGOING,
  };

  if (winnerId) {
    updateData.winnerId = winnerId;
    updateData.status = MatchStatus.FINISHED;

    // Auto advance winner to next match
    if (match.nextMatchId) {
      const nextMatch = await prisma.match.findUnique({ where: { id: match.nextMatchId } });
      if (nextMatch) {
        if (!nextMatch.teamAId) {
          await prisma.match.update({ where: { id: match.nextMatchId }, data: { teamAId: winnerId } });
        } else if (!nextMatch.teamBId) {
          await prisma.match.update({ where: { id: match.nextMatchId }, data: { teamBId: winnerId } });
        }
      }
    }
  }

  const updated = await prisma.match.update({
    where: { id },
    data: updateData,
    include: { teamA: true, teamB: true, winner: true, sets: true },
  });

  return NextResponse.json(updated);
}
