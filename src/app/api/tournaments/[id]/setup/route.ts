import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildBracketForTournament } from "@/lib/bracket";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { teamNames, drawnOrder }: { teamNames: string[]; drawnOrder: number[] } = body;

  if (!teamNames || teamNames.length < 2) {
    return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { sport: true },
  });
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // drawnOrder: array of indices into teamNames representing draw result
  // e.g. [2,0,1] means drawn position 1 = teamNames[2], pos 2 = teamNames[0], etc.
  const orderedNames: string[] =
    drawnOrder && drawnOrder.length === teamNames.length
      ? drawnOrder.map((i) => teamNames[i])
      : teamNames;

  // Remove existing teams from this tournament
  await prisma.team.updateMany({
    where: { tournamentId: id },
    data: { tournamentId: null },
  });
  // Create teams in drawn seed order
  const teams = await Promise.all(
    orderedNames.map((name, i) =>
      prisma.team.create({
        data: {
          name,
          sportId: tournament.sportId,
          seed: i + 1,
          tournamentId: id,
          university: name,
          universityShort: name.length <= 8 ? name : name.slice(0, 8),
        },
      })
    )
  );

  // Build bracket
  const { matchCount, totalRounds } = await buildBracketForTournament(
    id,
    teams.map((t) => t.id),
    60 * 60 * 1000, // start in 1 hour
    tournament.location ?? undefined
  );

  // Update tournament status to SETUP (ready to start)
  await prisma.tournament.update({
    where: { id },
    data: { status: "SETUP" },
  });

  return NextResponse.json({
    ok: true,
    teams: teams.length,
    matches: matchCount,
    rounds: totalRounds,
  });
}
