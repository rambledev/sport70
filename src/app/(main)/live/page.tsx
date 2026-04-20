"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getMatchStatusColor, getMatchStatusLabel } from "@/lib/utils";
import Link from "next/link";

interface Match {
  id: string; scoreA: number; scoreB: number; status: string;
  isLive: boolean; location?: string; startTime?: string; youtubeUrl?: string;
  teamA?: { name: string }; teamB?: { name: string };
  tournament: { name: string; sport: { name: string; icon?: string } };
}

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"live" | "upcoming" | "finished">("live");

  async function fetchMatches() {
    const res = await fetch("/api/matches");
    const data = await res.json();
    setMatches(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const liveMatches = matches.filter((m) => m.isLive && m.status === "ONGOING");
  const upcomingMatches = matches.filter((m) => m.status === "PENDING");
  const finishedMatches = matches.filter((m) => m.status === "FINISHED");

  const displayedMatches = tab === "live" ? liveMatches : tab === "upcoming" ? upcomingMatches : finishedMatches;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📺 ถ่ายทอดสด</h1>
        {liveMatches.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600">{liveMatches.length} แมทช์กำลังแข่ง</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[
          { key: "live", label: `🔴 LIVE (${liveMatches.length})` },
          { key: "upcoming", label: `🕐 กำลังจะมา (${upcomingMatches.length})` },
          { key: "finished", label: `✅ จบแล้ว (${finishedMatches.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : displayedMatches.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>ไม่มีแมทช์ในหมวดนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((match) => (
            <Link key={match.id} href={`/match/${match.id}`}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
                match.isLive ? "border-red-300 ring-1 ring-red-200" : ""
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {match.tournament.sport.icon} {match.tournament.sport.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {match.isLive && (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          LIVE
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getMatchStatusColor(match.status)}`}>
                        {getMatchStatusLabel(match.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{match.tournament.name}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{match.teamA?.name ?? "TBD"}</p>
                    </div>
                    <div className="text-center px-4">
                      <span className="text-3xl font-black text-gray-900">
                        {match.scoreA}
                        <span className="text-gray-300 mx-1">–</span>
                        {match.scoreB}
                      </span>
                    </div>
                    <div className="text-center flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{match.teamB?.name ?? "TBD"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-gray-400">
                    {match.location && <span>📍 {match.location}</span>}
                    {match.startTime && <span>🕐 {formatDateTime(match.startTime)}</span>}
                    {match.youtubeUrl && <span className="text-red-400">▶ YouTube</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
