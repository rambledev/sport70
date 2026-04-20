import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getMatchStatusColor, getMatchStatusLabel, getTournamentStatusLabel } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      sport: true,
      teams: { orderBy: { seed: "asc" } },
      matches: {
        include: { teamA: true, teamB: true, winner: true },
        orderBy: [{ round: "asc" }, { matchNumber: "asc" }],
      },
    },
  });

  if (!tournament) notFound();

  const rounds = Array.from(new Set(tournament.matches.map((m) => m.round))).sort();

  const roundNames: Record<number, string> = {};
  const totalRounds = rounds.length;
  rounds.forEach((r, i) => {
    const fromEnd = totalRounds - 1 - i;
    if (fromEnd === 0) roundNames[r] = "รอบชิงชนะเลิศ";
    else if (fromEnd === 1) roundNames[r] = "รอบรองชนะเลิศ";
    else if (fromEnd === 2) roundNames[r] = "รอบก่อนรองชนะเลิศ";
    else roundNames[r] = `รอบที่ ${r + 1}`;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/tournament" className="text-sm text-blue-600 hover:underline">← กลับ</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{tournament.name}</h1>
          <p className="text-gray-500">{tournament.sport.icon} {tournament.sport.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={tournament.status === "ONGOING" ? "success" : tournament.status === "FINISHED" ? "info" : "default"}>
            {getTournamentStatusLabel(tournament.status)}
          </Badge>
          {(user?.role === "ADMIN" || user?.role === "STAFF") && (
            <Link
              href={`/tournament/${id}/setup`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
            >
              🎰 จับฉลากทีม
            </Link>
          )}
        </div>
      </div>

      {/* Teams */}
      <Card>
        <CardHeader>
          <CardTitle>ทีมที่เข้าร่วม ({tournament.teams.length} ทีม)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tournament.teams.map((team) => (
              <div key={team.id} className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="font-semibold text-gray-900 text-sm">{team.name}</p>
                {team.university && <p className="text-xs text-gray-500">{team.university}</p>}
                <p className="text-xs text-gray-400">Seed #{team.seed}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bracket */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">สายการแข่งขัน (Single Elimination)</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {rounds.map((round) => {
            const matchesInRound = tournament.matches.filter((m) => m.round === round);
            return (
              <div key={round} className="flex-shrink-0 w-64">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">
                  {roundNames[round]}
                </h3>
                <div className="space-y-4">
                  {matchesInRound.map((match) => (
                    <Link key={match.id} href={`/match/${match.id}`}>
                      <div className={`rounded-lg border-2 overflow-hidden hover:shadow-md transition-shadow ${
                        match.isLive ? "border-red-400" : "border-gray-200"
                      }`}>
                        {match.isLive && (
                          <div className="bg-red-500 text-white text-xs text-center py-1 font-medium">
                            🔴 LIVE
                          </div>
                        )}
                        <div className="bg-white">
                          <div className={`flex items-center justify-between px-3 py-2 ${
                            match.winnerId === match.teamAId ? "bg-green-50" : ""
                          }`}>
                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                              {match.teamA?.name ?? "TBD"}
                            </span>
                            <span className={`text-lg font-bold ml-2 ${
                              match.winnerId === match.teamAId ? "text-green-600" : "text-gray-700"
                            }`}>
                              {match.scoreA}
                            </span>
                          </div>
                          <div className="border-t border-gray-100" />
                          <div className={`flex items-center justify-between px-3 py-2 ${
                            match.winnerId === match.teamBId ? "bg-green-50" : ""
                          }`}>
                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                              {match.teamB?.name ?? "TBD"}
                            </span>
                            <span className={`text-lg font-bold ml-2 ${
                              match.winnerId === match.teamBId ? "text-green-600" : "text-gray-700"
                            }`}>
                              {match.scoreB}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getMatchStatusColor(match.status)}`}>
                            {getMatchStatusLabel(match.status)}
                          </span>
                          {match.startTime && (
                            <span className="text-xs text-gray-400">{formatDateTime(match.startTime)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
