import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const votes = await prisma.vote.groupBy({
    by: ["teamId"],
    _count: { teamId: true },
    orderBy: { _count: { teamId: "desc" } },
  });

  const teams = await prisma.team.findMany({
    where: { id: { in: votes.map((v) => v.teamId) } },
  });

  const leaderboard = votes.map((v) => ({
    team: teams.find((t) => t.id === v.teamId),
    count: v._count.teamId,
  }));

  return NextResponse.json(leaderboard);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { teamId } = await req.json();

  const existing = await prisma.vote.findUnique({ where: { userId: user.id } });
  if (existing) {
    return NextResponse.json({ error: "Already voted" }, { status: 400 });
  }

  const vote = await prisma.vote.create({ data: { userId: user.id, teamId } });
  return NextResponse.json(vote, { status: 201 });
}
