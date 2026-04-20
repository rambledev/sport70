"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, getMatchStatusColor, getMatchStatusLabel } from "@/lib/utils";

interface MatchSet { id: string; setNumber: number; scoreA: number; scoreB: number; }
interface Team { id: string; name: string; university?: string; }
interface Match {
  id: string; round: number; matchNumber: number;
  scoreA: number; scoreB: number; status: string;
  isLive: boolean; location?: string; startTime?: string;
  youtubeUrl?: string;
  teamA?: Team; teamB?: Team; winner?: Team;
  tournament: { id: string; name: string; sport: { name: string; icon?: string; scoreType: string; } };
  sets: MatchSet[];
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [newSetA, setNewSetA] = useState("");
  const [newSetB, setNewSetB] = useState("");
  const [currentRole, setCurrentRole] = useState<string>("");

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${id}`);
      const data = await res.json();
      setMatch(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatch();
    // Get current user role from cookie (simplified)
    fetch("/api/auth/me").then(r => r.json()).then(u => setCurrentRole(u?.role ?? "")).catch(() => {});

    // Poll every 5 seconds for live matches
    const interval = setInterval(fetchMatch, 5000);
    return () => clearInterval(interval);
  }, [fetchMatch]);

  async function updateScore(action: string, data?: Record<string, unknown>) {
    if (!match) return;
    setScoreLoading(true);
    try {
      const res = await fetch(`/api/matches/${id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      });
      const updated = await res.json();
      setMatch(updated);
    } finally {
      setScoreLoading(false);
    }
  }

  async function addSet() {
    if (!newSetA || !newSetB || !match) return;
    const nextSet = (match.sets?.length ?? 0) + 1;
    await updateScore("set", { setNumber: nextSet, scoreA: parseInt(newSetA), scoreB: parseInt(newSetB) });
    setNewSetA(""); setNewSetB("");
  }

  async function setWinner(winnerId: string) {
    await updateScore("finish", { winnerId });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (!match) return <div className="text-red-500">ไม่พบข้อมูลการแข่งขัน</div>;

  const isStaffOrAdmin = currentRole === "STAFF" || currentRole === "ADMIN";
  const scoreType = match.tournament.sport.scoreType;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/tournament/${match.tournament.id}`} className="text-sm text-blue-600 hover:underline">
          ← {match.tournament.name}
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-xl font-bold text-gray-900">
            {match.tournament.sport.icon} แมทช์ {match.matchNumber} — รอบ {match.round + 1}
          </h1>
          {match.isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${getMatchStatusColor(match.status)}`}>
            {getMatchStatusLabel(match.status)}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-1 flex gap-4">
          {match.location && <span>📍 {match.location}</span>}
          {match.startTime && <span>🕐 {formatDateTime(match.startTime)}</span>}
        </div>
      </div>

      {/* Scoreboard */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-gray-900">{match.teamA?.name ?? "TBD"}</p>
              {match.teamA?.university && <p className="text-sm text-gray-500">{match.teamA.university}</p>}
              {match.winner?.id === match.teamA?.id && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  🏆 ชนะ
                </span>
              )}
            </div>
            <div className="px-8 text-center">
              <div className="text-6xl font-black text-gray-900">
                {match.scoreA} <span className="text-gray-300">–</span> {match.scoreB}
              </div>
              <p className="text-sm text-gray-400 mt-1">{match.tournament.sport.name}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold text-gray-900">{match.teamB?.name ?? "TBD"}</p>
              {match.teamB?.university && <p className="text-sm text-gray-500">{match.teamB.university}</p>}
              {match.winner?.id === match.teamB?.id && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  🏆 ชนะ
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sets (Volleyball / Badminton) */}
      {scoreType === "SET" && match.sets.length > 0 && (
        <Card>
          <CardHeader><CardTitle>ผลการแข่งขันแต่ละเซต</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500">ทีม</th>
                    {match.sets.map((s) => (
                      <th key={s.id} className="text-center py-2 px-3 text-gray-500">เซต {s.setNumber}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2 px-3 font-medium">{match.teamA?.name ?? "ทีม A"}</td>
                    {match.sets.map((s) => (
                      <td key={s.id} className={`text-center py-2 px-3 font-bold ${s.scoreA > s.scoreB ? "text-green-600" : "text-gray-500"}`}>
                        {s.scoreA}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium">{match.teamB?.name ?? "ทีม B"}</td>
                    {match.sets.map((s) => (
                      <td key={s.id} className={`text-center py-2 px-3 font-bold ${s.scoreB > s.scoreA ? "text-green-600" : "text-gray-500"}`}>
                        {s.scoreB}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Controls (Staff/Admin only) */}
      {isStaffOrAdmin && match.status !== "FINISHED" && (
        <Card>
          <CardHeader><CardTitle>🎮 ควบคุมคะแนน (Staff)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {scoreType === "POINT" && (
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center space-y-2">
                  <p className="font-semibold text-gray-700">{match.teamA?.name}</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => updateScore("decA")} disabled={scoreLoading}>−</Button>
                    <span className="text-4xl font-black w-16 text-center">{match.scoreA}</span>
                    <Button size="icon" onClick={() => updateScore("incA")} disabled={scoreLoading}>+</Button>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-gray-700">{match.teamB?.name}</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => updateScore("decB")} disabled={scoreLoading}>−</Button>
                    <span className="text-4xl font-black w-16 text-center">{match.scoreB}</span>
                    <Button size="icon" onClick={() => updateScore("incB")} disabled={scoreLoading}>+</Button>
                  </div>
                </div>
              </div>
            )}

            {scoreType === "SIMPLE" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">{match.teamA?.name}</label>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0"
                      className="border border-gray-300 rounded-md px-3 py-2 w-24 text-center text-lg font-bold"
                      defaultValue={match.scoreA}
                      onBlur={(e) => updateScore("set", { scoreA: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-600">{match.teamB?.name}</label>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0"
                      className="border border-gray-300 rounded-md px-3 py-2 w-24 text-center text-lg font-bold"
                      defaultValue={match.scoreB}
                      onBlur={(e) => updateScore("set", { scoreB: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {scoreType === "SET" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">เพิ่มผลการแข่งขันเซตใหม่</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number" min="0" placeholder={match.teamA?.name ?? "A"}
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 text-center"
                    value={newSetA}
                    onChange={(e) => setNewSetA(e.target.value)}
                  />
                  <span className="text-gray-400">–</span>
                  <input
                    type="number" min="0" placeholder={match.teamB?.name ?? "B"}
                    className="border border-gray-300 rounded-md px-3 py-2 w-28 text-center"
                    value={newSetB}
                    onChange={(e) => setNewSetB(e.target.value)}
                  />
                  <Button onClick={addSet} disabled={!newSetA || !newSetB || scoreLoading}>
                    เพิ่มเซต
                  </Button>
                </div>
              </div>
            )}

            {/* Set winner */}
            {match.teamA && match.teamB && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 mb-2">กำหนดผู้ชนะ</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setWinner(match.teamA!.id)}
                    disabled={scoreLoading}
                    className="flex-1"
                  >
                    🏆 {match.teamA.name} ชนะ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setWinner(match.teamB!.id)}
                    disabled={scoreLoading}
                    className="flex-1"
                  >
                    🏆 {match.teamB.name} ชนะ
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* YouTube Stream */}
      {match.youtubeUrl && (
        <Card>
          <CardHeader><CardTitle>📺 ถ่ายทอดสด</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-video">
              <iframe
                src={match.youtubeUrl}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
