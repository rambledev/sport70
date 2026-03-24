"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BracketView from "../components/BracketView";

interface Team { id: string; name: string; seed: number; }
interface Match { id: string; round: number; matchIndex: number; team1: Team | null; team2: Team | null; winner: Team | null; isBye: boolean; }
interface Competition { id: string; name: string; sport: string; status: string; teams: Team[]; matches: Match[]; }

const statusInfo: Record<string, { label: string; color: string }> = {
  setup:     { label: "ตั้งค่า",    color: "#8B949E" },
  ongoing:   { label: "กำลังแข่ง", color: "#3FB950" },
  completed: { label: "จบแล้ว",     color: "#C9A84C" },
};

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/competition/${id}`).then((r) => r.json()).then((data) => { setCompetition(data); setLoading(false); });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("ลบการแข่งขันนี้?")) return;
    setDeleting(true);
    await fetch(`/api/competition/${id}`, { method: "DELETE" });
    router.push("/competition");
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B949E" }}>กำลังโหลด...</div>;
  if (!competition) return <div style={{ minHeight: "100vh", background: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", color: "#E05252" }}>ไม่พบการแข่งขัน</div>;

  const rounds = [...new Set(competition.matches.map((m) => m.round))];
  const totalMatches = competition.matches.filter((m) => !m.isBye).length;
  const played = competition.matches.filter((m) => m.winner && !m.isBye).length;
  const champion = competition.matches.find((m) => m.round === Math.max(...rounds))?.winner;
  const st = statusInfo[competition.status] ?? statusInfo.setup;

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E6EDF3", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        <div style={{ marginBottom: 24 }}>
          <Link href="/competition" style={{ color: "#8B949E", fontSize: 13, textDecoration: "none" }}>← การแข่งขันทั้งหมด</Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 10, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>{competition.sport}</div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#E6EDF3", margin: "0 0 6px" }}>{competition.name}</h1>
              <span style={{ background: st.color + "22", color: st.color, border: `0.5px solid ${st.color}55`, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{st.label}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/competition/new" style={{ background: "#C9A84C", color: "#000", padding: "9px 18px", borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>+ สร้างรายการใหม่</Link>
              <button onClick={handleDelete} disabled={deleting} style={{ background: "transparent", border: "0.5px solid #E05252", color: "#E05252", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                {deleting ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { label: "ทีม", value: competition.teams.length },
            { label: "รอบ", value: rounds.length },
            { label: "แมชทั้งหมด", value: totalMatches },
            { label: "แข่งแล้ว", value: `${played}/${totalMatches}` },
            ...(champion ? [{ label: "🏆 แชมเปี้ยน", value: champion.name }] : []),
          ].map((s, i) => (
            <div key={i} style={{ background: "#161B22", border: `0.5px solid ${i === 4 ? "#C9A84C55" : "#30363D"}`, borderRadius: 8, padding: "10px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: i === 4 ? "#C9A84C" : "#E6EDF3" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Bracket */}
        <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: 12, padding: "20px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
            ตาราง bracket · คลิกที่ทีมเพื่อเลือกผู้ชนะ
          </div>
          <BracketView competition={competition} onUpdate={setCompetition} />
        </div>

        {/* Team list */}
        <div style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>ทีมทั้งหมด</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {competition.teams.map((t) => (
              <div key={t.id} style={{ background: "#1C2333", border: "0.5px solid #30363D", borderRadius: 6, padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#8B949E", minWidth: 18, fontWeight: 600 }}>{t.seed}</span>
                <span style={{ color: "#E6EDF3" }}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}