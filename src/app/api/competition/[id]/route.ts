import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const competition = await prisma.competition.findUnique({
    where: { id },
    include: {
      teams: { orderBy: { seed: "asc" } },
      matches: {
        orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
        include: { team1: true, team2: true, winner: true },
      },
    },
  });
  if (!competition) return NextResponse.json({ error: "ไม่พบ" }, { status: 404 });
  return NextResponse.json(competition);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { matchId, winnerId } = await req.json();

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.competitionId !== id)
    return NextResponse.json({ error: "ไม่พบแมช" }, { status: 404 });

  await prisma.match.update({ where: { id: matchId }, data: { winnerId } });
  await clearDownstream(id, match.round, match.matchIndex);
  await propagateWinner(id, match.round, match.matchIndex, winnerId);

  const allMatches = await prisma.match.findMany({ where: { competitionId: id } });
  const maxRound = Math.max(...allMatches.map((m) => m.round));
  const finalMatch = allMatches.find((m) => m.round === maxRound);
  if (finalMatch?.winnerId) {
    await prisma.competition.update({ where: { id }, data: { status: "completed" } });
  }

  const updated = await prisma.competition.findUnique({
    where: { id },
    include: {
      teams: { orderBy: { seed: "asc" } },
      matches: {
        orderBy: [{ round: "asc" }, { matchIndex: "asc" }],
        include: { team1: true, team2: true, winner: true },
      },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.competition.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

async function clearDownstream(
  competitionId: string,
  round: number,
  matchIndex: number
) {
  const nextRound = round + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const isTeam1 = matchIndex % 2 === 0;

  const nextMatch = await prisma.match.findUnique({
    where: {
      competitionId_round_matchIndex: { competitionId, round: nextRound, matchIndex: nextMatchIndex },
    },
  });
  if (!nextMatch) return;

  const clearData = isTeam1
    ? { team1Id: null, winnerId: null }
    : { team2Id: null, winnerId: null };

  await prisma.match.update({ where: { id: nextMatch.id }, data: clearData });
  await clearDownstream(competitionId, nextRound, nextMatchIndex);
}

async function propagateWinner(
  competitionId: string,
  round: number,
  matchIndex: number,
  winnerId: string
) {
  const nextRound = round + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const isTeam1 = matchIndex % 2 === 0;

  const nextMatch = await prisma.match.findUnique({
    where: {
      competitionId_round_matchIndex: { competitionId, round: nextRound, matchIndex: nextMatchIndex },
    },
  });
  if (!nextMatch) return;

  const update = isTeam1 ? { team1Id: winnerId } : { team2Id: winnerId };
  const updated = await prisma.match.update({ where: { id: nextMatch.id }, data: update });

  const t1 = isTeam1 ? winnerId : updated.team1Id;
  const t2 = isTeam1 ? updated.team2Id : winnerId;

  if (t1 && !t2) {
    await prisma.match.update({ where: { id: nextMatch.id }, data: { winnerId: t1 } });
    await propagateWinner(competitionId, nextRound, nextMatchIndex, t1);
  } else if (!t1 && t2) {
    await prisma.match.update({ where: { id: nextMatch.id }, data: { winnerId: t2 } });
    await propagateWinner(competitionId, nextRound, nextMatchIndex, t2);
  }
}