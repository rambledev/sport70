"use client";

import { useState } from "react";

interface Team { id: string; name: string; seed: number; }
interface Match { id: string; round: number; matchIndex: number; team1: Team | null; team2: Team | null; winner: Team | null; isBye: boolean; }
interface Competition { id: string; name: string; sport: string; status: string; teams: Team[]; matches: Match[]; }
interface Props { competition: Competition; onUpdate: (updated: Competition) => void; }

function getRoundName(ri: number, total: number): string {
  const fromEnd = total - 1 - ri;
  if (fromEnd === 0) return "รอบชิงชนะเลิศ";
  if (fromEnd === 1) return "รอบรองชนะเลิศ";
  if (fromEnd === 2) return "รอบก่อนรองชนะเลิศ";
  return `รอบที่ ${ri + 1}`;
}

export default function BracketView({ competition, onUpdate }: Props) {
  const [picking, setPicking] = useState<string | null>(null);

  const rounds = [...new Set(competition.matches.map((m) => m.round))].sort((a, b) => a - b);
  const totalRounds = rounds.length;
  const baseSlots = competition.matches.filter((m) => m.round === 0).length;

  const pickWinner = async (matchId: string, winnerId: string) => {
    setPicking(matchId);
    const res = await fetch(`/api/competition/${competition.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, winnerId }),
    });
    const data = await res.json();
    if (res.ok) onUpdate(data);
    setPicking(null);
  };

  const champion = competition.matches.find((m) => m.round === Math.max(...rounds))?.winner;

  return (
    <div style={{ overflowX: "auto", paddingBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", minWidth: "fit-content", padding: "8px 4px" }}>
        {rounds.map((r) => {
          const matches = competition.matches.filter((m) => m.round === r).sort((a, b) => a.matchIndex - b.matchIndex);
          const isFinal = r === Math.max(...rounds);
          const slotsPerMatch = baseSlots / matches.length;

          return (
            <div key={r} style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
              <div style={{ fontSize: 10, color: "#C9A84C", letterSpacing: 2, textTransform: "uppercase", textAlign: "center", paddingBottom: 8, marginBottom: 8, borderBottom: "0.5px solid #30363D", fontWeight: 600 }}>
                {getRoundName(r, totalRounds)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {matches.map((m) => (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: slotsPerMatch, minHeight: slotsPerMatch * 62 }}>
                    <div style={{ background: "#161B22", border: `0.5px solid ${isFinal ? "#C9A84C55" : "#30363D"}`, borderRadius: 8, overflow: "hidden", margin: "3px 8px", boxShadow: isFinal ? "0 0 12px rgba(201,168,76,.15)" : "none" }}>
                      {[m.team1, m.team2].map((team, ti) => {
                        const isWinner = !!(team && m.winner?.id === team.id);
                        const isTBD = !team;
                        const canPick = !isTBD && !m.isBye && !!m.team1 && !!m.team2 && !m.winner;
                        const isLoading = picking === m.id;
                        return (
                          <div
                            key={ti}
                            onClick={() => canPick && team && !isLoading ? pickWinner(m.id, team.id) : undefined}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: ti === 0 ? "0.5px solid #30363D" : "none", background: isWinner ? "#1C3A2A" : "transparent", cursor: canPick ? "pointer" : "default", transition: "background .12s", opacity: isLoading ? 0.5 : 1 }}
                            onMouseEnter={(e) => { if (canPick) e.currentTarget.style.background = "#1C2333"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = isWinner ? "#1C3A2A" : "transparent"; }}
                          >
                            <span style={{ fontSize: 10, color: isWinner ? "#3FB95088" : "#8B949E", minWidth: 14, fontWeight: 600 }}>{isTBD ? "—" : team.seed}</span>
                            <span style={{ fontSize: 12, fontWeight: 500, flex: 1, color: isTBD ? "#8B949E" : isWinner ? "#3FB950" : "#E6EDF3", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                              {isTBD ? "TBD" : team.name}
                            </span>
                            {isWinner && <span style={{ fontSize: 10, color: "#3FB950" }}>✓</span>}
                            {m.isBye && team && <span style={{ fontSize: 9, color: "#8B949E", background: "#8B949E22", borderRadius: 3, padding: "1px 4px" }}>BYE</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Champion */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 16px", minWidth: 90 }}>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C9A84C", maxWidth: 90, textAlign: "center", lineHeight: 1.3 }}>{champion?.name ?? "?"}</div>
            <div style={{ fontSize: 9, color: "#8B949E", letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>แชมเปี้ยน</div>
          </div>
        </div>
      </div>
    </div>
  );
}