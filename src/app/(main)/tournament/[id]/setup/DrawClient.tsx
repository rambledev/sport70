"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ─── Slot label: A, B, C, ... Z, AA, AB, ...
function slotLabel(i: number): string {
  if (i < 26) return String.fromCharCode(65 + i);
  return String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
}

const TEAM_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-teal-500",
  "bg-indigo-500", "bg-cyan-500", "bg-lime-500", "bg-rose-500",
  "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500",
];

interface DrawnResult {
  slotIndex: number; // 0-based slot (seed position)
  teamIndex: number; // 0-based index into teamNames
  teamName: string;
}

type Step = "configure" | "ready" | "drawing" | "done";

interface Props {
  tournamentId: string;
  tournamentName: string;
}

export default function DrawClient({ tournamentId, tournamentName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("configure");
  const [teamCount, setTeamCount] = useState(8);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [drawnResults, setDrawnResults] = useState<DrawnResult[]>([]);
  const [currentDrawingSlot, setCurrentDrawingSlot] = useState(-1);
  const [spinningText, setSpinningText] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const spinRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Step 1: Configure ──────────────────────────────────────────────────
  function initTeamNames(count: number) {
    setTeamCount(count);
    setTeamNames(Array.from({ length: count }, (_, i) => `ทีม ${slotLabel(i)}`));
  }

  function handleTeamNameChange(i: number, value: string) {
    setTeamNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  }

  function goToReady() {
    const filled = teamNames.filter((n) => n.trim().length > 0);
    if (filled.length < 2) return;
    setStep("ready");
  }

  // ── Step 2: Ready → Drawing ────────────────────────────────────────────
  async function startDraw() {
    // Create shuffled order
    const indices = Array.from({ length: teamNames.length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    setDrawnResults([]);
    setStep("drawing");

    for (let slot = 0; slot < indices.length; slot++) {
      const teamIdx = indices[slot];
      await animateSlotDraw(slot, teamIdx, teamNames);
    }

    // Store final order
    setDrawnResults(
      indices.map((teamIdx, slotIdx) => ({
        slotIndex: slotIdx,
        teamIndex: teamIdx,
        teamName: teamNames[teamIdx],
      }))
    );
    setCurrentDrawingSlot(-1);
    setIsSpinning(false);
    setStep("done");
  }

  const animateSlotDraw = useCallback(
    (slot: number, teamIdx: number, names: string[]): Promise<void> => {
      return new Promise((resolve) => {
        setCurrentDrawingSlot(slot);
        setIsSpinning(true);

        const SPIN_DURATION = 1800; // ms
        const TICK = 80; // ms per spin frame

        // Spin through random names
        spinRef.current = setInterval(() => {
          const r = Math.floor(Math.random() * names.length);
          setSpinningText(names[r]);
        }, TICK);

        setTimeout(() => {
          if (spinRef.current) clearInterval(spinRef.current);
          setSpinningText(names[teamIdx]);
          setIsSpinning(false);

          // Reveal pause before next
          setTimeout(() => {
            setDrawnResults((prev) => [
              ...prev,
              { slotIndex: slot, teamIndex: teamIdx, teamName: names[teamIdx] },
            ]);
            setTimeout(resolve, 400);
          }, 600);
        }, SPIN_DURATION);
      });
    },
    []
  );

  // ── Step 4: Save / Confirm ─────────────────────────────────────────────
  async function confirmDraw() {
    setSaving(true);
    const drawnOrder = drawnResults.map((r) => r.teamIndex);
    const res = await fetch(`/api/tournaments/${tournamentId}/setup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamNames, drawnOrder }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedOk(true);
      setTimeout(() => router.push(`/tournament/${tournamentId}`), 1200);
    }
  }

  function redraw() {
    setDrawnResults([]);
    setCurrentDrawingSlot(-1);
    setIsSpinning(false);
    setStep("ready");
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (step === "configure") {
    return (
      <div className="space-y-6">
        {/* Select team count */}
        <Card>
          <CardHeader>
            <CardTitle>ขั้นตอนที่ 1 — เลือกจำนวนทีม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[4, 6, 8, 11, 12, 16].map((n) => (
                <button
                  key={n}
                  onClick={() => initTeamNames(n)}
                  className={`px-4 py-2 rounded-lg font-semibold border-2 transition-all ${
                    teamCount === n && teamNames.length === n
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  {n} ทีม
                </button>
              ))}
            </div>

            {teamNames.length > 0 && (
              <>
                <p className="text-sm text-gray-600 font-medium mt-4">
                  กรอกชื่อทีม {teamNames.length} ทีม (ระบบจะจับฉลากตำแหน่ง A–
                  {slotLabel(teamNames.length - 1)} ให้อัตโนมัติ)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teamNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0 ${TEAM_COLORS[i % TEAM_COLORS.length]}`}
                      >
                        {slotLabel(i)}
                      </span>
                      <Input
                        value={name}
                        onChange={(e) => handleTeamNameChange(i, e.target.value)}
                        placeholder={`ชื่อทีม ${slotLabel(i)}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button
                    onClick={goToReady}
                    disabled={teamNames.filter((n) => n.trim()).length < 2}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ถัดไป → เตรียมจับฉลาก
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "ready") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ขั้นตอนที่ 2 — พร้อมจับฉลาก</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              ทีมทั้ง {teamNames.length} ทีมต่อไปนี้จะถูกจับฉลากเพื่อกำหนดตำแหน่ง
              seed ในสายการแข่งขัน
            </p>

            {/* Team balls */}
            <div className="flex flex-wrap gap-3 py-4">
              {teamNames.map((name, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl shadow-md text-white font-bold text-center min-w-[80px] ${TEAM_COLORS[i % TEAM_COLORS.length]}`}
                >
                  <span className="text-2xl font-black">{slotLabel(i)}</span>
                  <span className="text-xs leading-tight">{name}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("configure")}>
                ← แก้ไขชื่อทีม
              </Button>
              <Button
                onClick={startDraw}
                className="bg-red-600 hover:bg-red-700 text-white px-8 text-lg"
              >
                🎰 เริ่มจับฉลาก!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "drawing" || step === "done") {
    const isDrawing = step === "drawing";

    return (
      <div className="space-y-6">
        {/* Lottery machine display */}
        {isDrawing && (
          <Card className="border-2 border-red-400">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-3">
                <p className="text-gray-500 text-sm font-medium">
                  กำลังจับฉลากตำแหน่งที่{" "}
                  <span className="text-red-600 font-bold text-lg">
                    {currentDrawingSlot + 1}
                  </span>{" "}
                  (Seed {currentDrawingSlot + 1})
                </p>

                {/* Spinning display */}
                <div className="relative mx-auto w-64 h-24 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900 z-10" />
                  <span
                    className={`text-2xl font-black text-white z-20 transition-all duration-75 ${
                      isSpinning ? "scale-110 text-yellow-300" : "scale-100 text-green-300"
                    }`}
                  >
                    {spinningText || "..."}
                  </span>
                </div>

                {isSpinning ? (
                  <p className="text-yellow-600 font-semibold animate-pulse">🎰 กำลังสุ่ม...</p>
                ) : (
                  <p className="text-green-600 font-bold">✅ ได้ทีม: {spinningText}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results so far */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isDrawing ? "ผลการจับฉลากที่ผ่านมา" : "✅ ผลการจับฉลาก — ครบทุกทีมแล้ว!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Drawn results */}
              {drawnResults.map((r) => (
                <div
                  key={r.slotIndex}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-left-4 duration-500"
                >
                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-sm flex-shrink-0">
                    #{r.slotIndex + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{r.teamName}</p>
                    <p className="text-xs text-gray-500">Seed {r.slotIndex + 1}</p>
                  </div>
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-xs font-bold ${
                      TEAM_COLORS[r.teamIndex % TEAM_COLORS.length]
                    }`}
                  >
                    {slotLabel(r.teamIndex)}
                  </span>
                </div>
              ))}

              {/* Pending slots */}
              {isDrawing &&
                Array.from(
                  { length: teamNames.length - drawnResults.length - 1 },
                  (_, i) => (
                    <div
                      key={`pending-${i}`}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg opacity-30"
                    >
                      <span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-sm flex-shrink-0">
                        #{drawnResults.length + i + 2}
                      </span>
                      <p className="text-gray-400 text-sm">รอจับฉลาก...</p>
                    </div>
                  )
                )}
            </div>

            {/* Done: action buttons */}
            {step === "done" && (
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={redraw}>
                  🔄 จับฉลากใหม่
                </Button>
                <Button
                  onClick={confirmDraw}
                  disabled={saving || savedOk}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {savedOk
                    ? "✅ บันทึกแล้ว! กำลังไปหน้า Bracket..."
                    : saving
                    ? "กำลังบันทึก..."
                    : "✅ ยืนยันผล & สร้าง Bracket"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bracket preview */}
        {step === "done" && drawnResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>ตัวอย่าง Bracket (ตามผลจับฉลาก)</CardTitle>
            </CardHeader>
            <CardContent>
              <BracketPreview teamNames={drawnResults.map((r) => r.teamName)} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}

// ── Bracket preview (simple, read-only) ───────────────────────────────────────
function BracketPreview({ teamNames }: { teamNames: string[] }) {
  const n = teamNames.length;
  let size = 1;
  while (size < n) size *= 2;

  const seeded = [...teamNames];
  while (seeded.length < size) seeded.push("BYE");

  const pairs: [string, string][] = [];
  let lo = 0, hi = size - 1;
  while (lo < hi) {
    pairs.push([seeded[lo], seeded[hi]]);
    lo++; hi--;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max space-y-2">
        {pairs.map(([a, b], i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">{i + 1}</span>
            <div className="flex items-center gap-1">
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  b === "BYE" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {a}
              </span>
              <span className="text-gray-400 text-xs">vs</span>
              <span
                className={`px-3 py-1 rounded text-sm font-medium ${
                  b === "BYE" ? "bg-gray-100 text-gray-400 italic" : "bg-blue-100 text-blue-800"
                }`}
              >
                {b}
              </span>
              {b === "BYE" && (
                <span className="text-xs text-green-600 ml-1">← ผ่านอัตโนมัติ</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
