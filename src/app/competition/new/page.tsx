"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SPORTS = ["ฟุตบอล","บาสเกตบอล","วอลเลย์บอล","เทนนิส","แบดมินตัน","ปิงปอง","ว่ายน้ำ","กรีฑา","มวย","รักบี้","ฮอกกี้","กอล์ฟ","อื่น ๆ"];

function nextPow2(n: number): number { let p = 1; while (p < n) p *= 2; return p; }

export default function NewCompetitionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [customSport, setCustomSport] = useState("");
  const [teams, setTeams] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTeam = () => { if (teams.length < 32) setTeams([...teams, ""]); };
  const removeTeam = (i: number) => { if (teams.length > 2) setTeams(teams.filter((_, idx) => idx !== i)); };
  const updateTeam = (i: number, val: string) => { const c = [...teams]; c[i] = val; setTeams(c); };

  const handleSubmit = async () => {
    const validTeams = teams.map((t) => t.trim()).filter(Boolean);
    const finalSport = sport === "อื่น ๆ" ? customSport.trim() : sport;
    if (!name.trim()) return setError("กรุณาใส่ชื่อการแข่งขัน");
    if (!finalSport) return setError("กรุณาเลือกประเภทกีฬา");
    if (validTeams.length < 2) return setError("กรุณาใส่ทีมอย่างน้อย 2 ทีม");
    setLoading(true); setError("");
    const res = await fetch("/api/competition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), sport: finalSport, teams: validTeams }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error ?? "เกิดข้อผิดพลาด"); return; }
    router.push(`/competition/${data.id}`);
  };

  const valid = teams.filter((t) => t.trim()).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E6EDF3", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/competition" style={{ color: "#8B949E", fontSize: 13, textDecoration: "none" }}>← กลับ</Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#C9A84C", margin: "8px 0 0" }}>สร้างการแข่งขันใหม่</h1>
        </div>

        {/* Info */}
        <div style={card}>
          <label style={lbl}>ชื่อการแข่งขัน</label>
          <input style={inp} placeholder="เช่น กีฬาสี RMU 2024" value={name} onChange={(e) => setName(e.target.value)} />
          <label style={{ ...lbl, marginTop: 16 }}>ประเภทกีฬา</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {SPORTS.map((s) => (
              <button key={s} onClick={() => setSport(s)} style={{ background: sport === s ? "#C9A84C" : "transparent", color: sport === s ? "#000" : "#8B949E", border: `0.5px solid ${sport === s ? "#C9A84C" : "#30363D"}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: sport === s ? 600 : 400, transition: "all .15s" }}>{s}</button>
            ))}
          </div>
          {sport === "อื่น ๆ" && <input style={inp} placeholder="ระบุประเภทกีฬา" value={customSport} onChange={(e) => setCustomSport(e.target.value)} />}
        </div>

        {/* Teams */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ ...lbl, marginBottom: 0 }}>ทีมที่เข้าร่วม</label>
            <span style={{ fontSize: 12, color: "#8B949E" }}>{valid} / {teams.length} ทีม</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {teams.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#8B949E", minWidth: 20, textAlign: "right" }}>{i + 1}</span>
                <input style={{ ...inp, flex: 1 }} placeholder={`ทีม ${i + 1}`} value={t} onChange={(e) => updateTeam(i, e.target.value)} />
                {teams.length > 2 && <button onClick={() => removeTeam(i)} style={{ background: "transparent", border: "none", color: "#8B949E", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>}
              </div>
            ))}
          </div>
          {teams.length < 32 && <button onClick={addTeam} style={{ width: "100%", background: "transparent", border: "0.5px dashed #30363D", borderRadius: 6, color: "#8B949E", fontSize: 13, padding: "8px", cursor: "pointer" }}>+ เพิ่มทีม</button>}
        </div>

        {/* Preview */}
        {valid >= 2 && (
          <div style={{ ...card, background: "#1C2333", border: "0.5px solid #388BFD33", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
              <div><span style={{ color: "#8B949E" }}>ทีม </span><strong style={{ color: "#388BFD" }}>{valid}</strong></div>
              <div><span style={{ color: "#8B949E" }}>รอบ </span><strong style={{ color: "#388BFD" }}>{Math.log2(nextPow2(valid))}</strong></div>
              <div><span style={{ color: "#8B949E" }}>แมชทั้งหมด </span><strong style={{ color: "#388BFD" }}>{nextPow2(valid) - 1}</strong></div>
              {nextPow2(valid) - valid > 0 && <div><span style={{ color: "#8B949E" }}>BYE </span><strong style={{ color: "#C9A84C" }}>{nextPow2(valid) - valid}</strong></div>}
            </div>
          </div>
        )}

        {error && <div style={{ background: "#E0525222", border: "0.5px solid #E05252", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#E05252", marginBottom: 12 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: loading ? "#555" : "#C9A84C", color: "#000", border: "none", borderRadius: 8, padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "กำลังสร้าง..." : "🏆 สร้าง Bracket"}
        </button>
      </div>
    </div>
  );
}

const card: React.CSSProperties = { background: "#161B22", border: "0.5px solid #30363D", borderRadius: 12, padding: "20px", marginBottom: 16 };
const lbl: React.CSSProperties = { display: "block", fontSize: 12, color: "#8B949E", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 };
const inp: React.CSSProperties = { display: "block", width: "100%", background: "#1C2333", border: "0.5px solid #30363D", borderRadius: 6, color: "#E6EDF3", fontSize: 13, padding: "8px 12px", fontFamily: "sans-serif", outline: "none" };