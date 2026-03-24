import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBracketMatches, nextPow2 } from "@/lib/bracket";

export async function GET() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teams: true,
      _count: { select: { matches: true } },
    },
  });
  return NextResponse.json(competitions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, sport, teams: teamNames }: { name: string; sport: string; teams: string[] } = body;

  if (!name || !sport || !teamNames || teamNames.length < 2) {
    return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const size = nextPow2(teamNames.length);

  const competition = await prisma.competition.create({
    data: {
      name,
      sport,
      status: "ongoing",
      teams: {
        create: teamNames.map((n, i) => ({ name: n, seed: i + 1 })),
      },
    },
    include: { teams: true },
  });

  const teamBySeed: Record<number, string> = {};
  competition.teams.forEach((t) => { teamBySeed[t.seed] = t.id; });

  const matchDefs = buildBracketMatches(teamNames);

  for (const m of matchDefs) {
    const t1id = m.team1Seed ? teamBySeed[m.team1Seed] : null;
    const t2id = m.team2Seed ? teamBySeed[m.team2Seed] : null;
    let winnerId: string | null = null;
    if (m.isBye) winnerId = t1id ?? t2id;

    await prisma.match.create({
      data: {
        competitionId: competition.id,
        round: m.round,
        matchIndex: m.matchIndex,
        team1Id: t1id,
        team2Id: t2id,
        winnerId,
        isBye: m.isBye,
      },
    });

    if (winnerId) {
      await propagateWinner(competition.id, m.round, m.matchIndex, winnerId);
    }
  }

  return NextResponse.json({ id: competition.id });
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