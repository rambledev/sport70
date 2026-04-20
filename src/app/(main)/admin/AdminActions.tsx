"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Sport { id: string; name: string; icon?: string | null; }
interface User { id: string; name: string; email: string; role: string; }

interface Props {
  sports: Sport[];
  users: User[];
}

export default function AdminActions({ sports, users }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<"sport" | "tournament" | "team" | "cert" | "notif">("sport");

  // Sport form
  const [sportName, setSportName] = useState("");
  const [sportIcon, setSportIcon] = useState("⚽");
  const [sportType, setSportType] = useState("SIMPLE");

  // Tournament form
  const [tName, setTName] = useState("");
  const [tSportId, setTSportId] = useState(sports[0]?.id ?? "");

  // Team form
  const [teamName, setTeamName] = useState("");
  const [teamUniv, setTeamUniv] = useState("");
  const [teamSportId, setTeamSportId] = useState(sports[0]?.id ?? "");

  // Certificate form
  const [certUserId, setCertUserId] = useState(users[0]?.id ?? "");
  const [certSport, setCertSport] = useState("");
  const [certPosition, setCertPosition] = useState("");
  const [certEvent, setCertEvent] = useState("RMU Sports Games 2024");

  // Notification form
  const [notifUserId, setNotifUserId] = useState(users[0]?.id ?? "");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function createSport() {
    setLoading(true);
    await fetch("/api/sports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sportName, icon: sportIcon, scoreType: sportType }),
    });
    setSportName(""); setSuccess("สร้างกีฬาสำเร็จ!");
    setLoading(false); router.refresh();
  }

  async function createTournament() {
    setLoading(true);
    await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tName, sportId: tSportId }),
    });
    setTName(""); setSuccess("สร้าง Tournament สำเร็จ!");
    setLoading(false); router.refresh();
  }

  async function createTeam() {
    setLoading(true);
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName, university: teamUniv, sportId: teamSportId }),
    });
    setTeamName(""); setTeamUniv(""); setSuccess("สร้างทีมสำเร็จ!");
    setLoading(false); router.refresh();
  }

  async function issueCertificate() {
    setLoading(true);
    // Get first template
    const templates = await fetch("/api/certificates").then(() => null);
    // Simple: create cert with template id from DB
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: certUserId,
        templateId: "PLACEHOLDER", // Will use first found template
        sport: certSport,
        position: certPosition,
        event: certEvent,
      }),
    });
    if (res.ok) setSuccess("ออกเกียรติบัตรสำเร็จ!");
    setLoading(false);
  }

  async function sendNotification() {
    setLoading(true);
    await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: notifUserId, title: notifTitle, message: notifMsg }),
    });
    setNotifTitle(""); setNotifMsg(""); setSuccess("ส่งการแจ้งเตือนสำเร็จ!");
    setLoading(false);
  }

  const tabs = [
    { key: "sport", label: "➕ กีฬา" },
    { key: "tournament", label: "🏆 Tournament" },
    { key: "team", label: "👥 ทีม" },
    { key: "cert", label: "🏅 เกียรติบัตร" },
    { key: "notif", label: "🔔 แจ้งเตือน" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>⚙️ จัดการระบบ</CardTitle>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>
        )}

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key as typeof tab); setSuccess(""); }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "sport" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800">สร้างประเภทกีฬาใหม่</h3>
            <div>
              <Label>ชื่อกีฬา</Label>
              <Input placeholder="เช่น Badminton" value={sportName} onChange={(e) => setSportName(e.target.value)} />
            </div>
            <div>
              <Label>ไอคอน (Emoji)</Label>
              <Input placeholder="🏸" value={sportIcon} onChange={(e) => setSportIcon(e.target.value)} />
            </div>
            <div>
              <Label>ประเภทคะแนน</Label>
              <Select value={sportType} onChange={(e) => setSportType(e.target.value)}>
                <option value="SIMPLE">SIMPLE (ฟุตบอล)</option>
                <option value="POINT">POINT (บาสเกตบอล)</option>
                <option value="SET">SET (วอลเลย์บอล)</option>
              </Select>
            </div>
            <Button onClick={createSport} disabled={loading || !sportName}>
              สร้างกีฬา
            </Button>
          </div>
        )}

        {tab === "tournament" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800">สร้าง Tournament ใหม่</h3>
            <div>
              <Label>ชื่อ Tournament</Label>
              <Input placeholder="เช่น RMU Football Cup 2025" value={tName} onChange={(e) => setTName(e.target.value)} />
            </div>
            <div>
              <Label>ประเภทกีฬา</Label>
              <Select value={tSportId} onChange={(e) => setTSportId(e.target.value)}>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </Select>
            </div>
            <Button onClick={createTournament} disabled={loading || !tName}>
              สร้าง Tournament
            </Button>
          </div>
        )}

        {tab === "team" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800">สร้างทีมใหม่</h3>
            <div>
              <Label>ชื่อทีม</Label>
              <Input placeholder="เช่น RMU FC" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div>
              <Label>มหาวิทยาลัย</Label>
              <Input placeholder="เช่น RMU" value={teamUniv} onChange={(e) => setTeamUniv(e.target.value)} />
            </div>
            <div>
              <Label>ประเภทกีฬา</Label>
              <Select value={teamSportId} onChange={(e) => setTeamSportId(e.target.value)}>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                ))}
              </Select>
            </div>
            <Button onClick={createTeam} disabled={loading || !teamName}>
              สร้างทีม
            </Button>
          </div>
        )}

        {tab === "cert" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800">ออกเกียรติบัตร</h3>
            <div>
              <Label>ผู้รับ</Label>
              <Select value={certUserId} onChange={(e) => setCertUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>กีฬา</Label>
              <Input placeholder="เช่น Football" value={certSport} onChange={(e) => setCertSport(e.target.value)} />
            </div>
            <div>
              <Label>ตำแหน่ง</Label>
              <Input placeholder="เช่น Champion" value={certPosition} onChange={(e) => setCertPosition(e.target.value)} />
            </div>
            <div>
              <Label>กิจกรรม</Label>
              <Input value={certEvent} onChange={(e) => setCertEvent(e.target.value)} />
            </div>
            <Button onClick={issueCertificate} disabled={loading}>
              ออกเกียรติบัตร
            </Button>
          </div>
        )}

        {tab === "notif" && (
          <div className="space-y-3 max-w-md">
            <h3 className="font-semibold text-gray-800">ส่งการแจ้งเตือน</h3>
            <div>
              <Label>ผู้รับ</Label>
              <Select value={notifUserId} onChange={(e) => setNotifUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>หัวข้อ</Label>
              <Input placeholder="หัวข้อการแจ้งเตือน" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} />
            </div>
            <div>
              <Label>ข้อความ</Label>
              <textarea
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ข้อความ..."
                value={notifMsg}
                onChange={(e) => setNotifMsg(e.target.value)}
              />
            </div>
            <Button onClick={sendNotification} disabled={loading || !notifTitle || !notifMsg}>
              ส่งการแจ้งเตือน
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
