"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Competition {
  id: string;
  name: string;
  sport: string;
  status: string;
  createdAt: string;
  teams: { id: string }[];
}

const statusLabel: Record<string, { label: string; color: string }> = {
  setup:     { label: "ตั้งค่า",      color: "#8B949E" },
  ongoing:   { label: "กำลังแข่ง",   color: "#3FB950" },
  completed: { label: "จบแล้ว",       color: "#C9A84C" },
};

function getSportEmoji(sport: string): string {
  const map: Record<string, string> = {
    ฟุตบอล: "⚽", บาสเกตบอล: "🏀", วอลเลย์บอล: "🏐", เทนนิส: "🎾",
    แบดมินตัน: "🏸", ปิงปอง: "🏓", ว่ายน้ำ: "🏊", กรีฑา: "🏃",
    มวย: "🥊", รักบี้: "🏉", ฮอกกี้: "🏒", กอล์ฟ: "⛳",
  };
  return map[sport] ?? "🏅";
}

export default function CompetitionPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/competition")
      .then((r) => r.json())
      .then((data) => { setCompetitions(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0D1117", color: "#E6EDF3", fontFamily: "sans-serif", padding: "40px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: "#8B949E", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Sport RMU</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "#C9A84C", margin: 0 }}>🏆 การแข่งขัน</h1>
          </div>
          <Link href="/competition/new" style={{ background: "#C9A84C", color: "#000", padding: "10px 22px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            + สร้างการแข่งขันใหม่
          </Link>
        </div>

        {loading ? (
          <div style={{ color: "#8B949E", textAlign: "center", padding: "60px 0" }}>กำลังโหลด...</div>
        ) : competitions.length === 0 ? (
          <div style={{ border: "1px dashed #30363D", borderRadius: 12, padding: "60px 24px", textAlign: "center", color: "#8B949E" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>ยังไม่มีการแข่งขัน</div>
            <Link href="/competition/new" style={{ color: "#C9A84C", fontSize: 14 }}>สร้างการแข่งขันแรก →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {competitions.map((c) => {
              const st = statusLabel[c.status] ?? statusLabel.setup;
              return (
                <Link key={c.id} href={`/competition/${c.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{ background: "#161B22", border: "0.5px solid #30363D", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "border-color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#C9A84C")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#30363D")}
                  >
                    <div style={{ fontSize: 32 }}>{getSportEmoji(c.sport)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "#E6EDF3", marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: "#8B949E" }}>{c.sport} · {c.teams.length} ทีม · {new Date(c.createdAt).toLocaleDateString("th-TH")}</div>
                    </div>
                    <div style={{ background: st.color + "22", color: st.color, border: `0.5px solid ${st.color}55`, borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{st.label}</div>
                    <div style={{ color: "#8B949E", fontSize: 18 }}>›</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}