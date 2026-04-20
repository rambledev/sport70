"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Team { id: string; name: string; university?: string; }
interface LeaderboardEntry { team: Team; count: number; }

export default function VotePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  async function fetchData() {
    const [teamsRes, lbRes] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/votes"),
    ]);
    const teamsData = await teamsRes.json();
    const lbData = await lbRes.json();
    setTeams(teamsData);
    setLeaderboard(lbData);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function vote(teamId: string) {
    setVoting(true); setError("");
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setMyVote(teamId);
      await fetchData();
    } finally {
      setVoting(false);
    }
  }

  const totalVotes = leaderboard.reduce((sum, e) => sum + e.count, 0);
  const maxVotes = Math.max(...leaderboard.map((e) => e.count), 1);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🗳️ โหวตขบวนพาเหรด</h1>
        <p className="text-gray-500 mt-1">โหวตทีมที่ชื่นชอบได้คนละ 1 ครั้ง</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Vote Form */}
          <Card>
            <CardHeader>
              <CardTitle>เลือกทีม</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}
              {myVote ? (
                <div className="text-center py-6">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-semibold text-gray-900">คุณได้โหวตแล้ว!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ทีม: {teams.find((t) => t.id === myVote)?.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teams.slice(0, 12).map((team) => (
                    <button
                      key={team.id}
                      onClick={() => vote(team.id)}
                      disabled={voting}
                      className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <p className="font-medium text-gray-900">{team.name}</p>
                      {team.university && <p className="text-xs text-gray-500">{team.university}</p>}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 ลีดเดอร์บอร์ด</CardTitle>
              <p className="text-sm text-gray-500">{totalVotes} คะแนนทั้งหมด</p>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">ยังไม่มีคะแนน</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const pct = (entry.count / maxVotes) * 100;
                    return (
                      <div key={entry.team.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? "bg-yellow-400 text-white" :
                              index === 1 ? "bg-gray-300 text-gray-700" :
                              index === 2 ? "bg-orange-300 text-white" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-900 text-sm">{entry.team.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700">{entry.count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              index === 0 ? "bg-yellow-400" : "bg-blue-400"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
