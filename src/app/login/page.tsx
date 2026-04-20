"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const ROLES = [
  { value: "VISITOR", label: "Visitor (ผู้เยี่ยมชม)" },
  { value: "ATHLETE", label: "Athlete (นักกีฬา)" },
  { value: "MANAGER", label: "Manager (ผู้จัดการทีม)" },
  { value: "STAFF", label: "Staff (เจ้าหน้าที่)" },
  { value: "PERSONNEL", label: "Personnel (บุคลากร)" },
  { value: "ADMIN", label: "Admin (ผู้ดูแลระบบ)" },
];

const QUICK_LOGIN = [
  { email: "admin@rmu.ac.th", name: "Admin", role: "ADMIN" },
  { email: "athlete1@rmu.ac.th", name: "Somchai Jaidee", role: "ATHLETE" },
  { email: "manager@rmu.ac.th", name: "Kitti Wongchai", role: "MANAGER" },
  { email: "staff@rmu.ac.th", name: "Nong Staff", role: "STAFF" },
  { email: "visitor@rmu.ac.th", name: "Guest User", role: "VISITOR" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("VISITOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("กรุณากรอก Email"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, role }),
      });
      if (!res.ok) throw new Error("Login failed");
      router.push("/dashboard");
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(acc: typeof QUICK_LOGIN[0]) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acc.email, name: acc.name, role: acc.role }),
      });
      if (!res.ok) throw new Error();
      router.push("/dashboard");
    } catch {
      setError("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold">RMU Sports Games</h1>
          <p className="text-blue-200 mt-2">ระบบจัดการกีฬามหาวิทยาลัย 2024</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>กรอก Email และเลือกบทบาทของคุณ</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="name">ชื่อ (ไม่บังคับ)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="ชื่อ-นามสกุล"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">บทบาท</Label>
                <Select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Login (Demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_LOGIN.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-left text-sm transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{acc.name}</p>
                    <p className="text-gray-500 text-xs">{acc.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* MVP Info Link */}
        <div className="text-center">
          <a
            href="/mvp"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-sm font-medium transition-colors"
          >
            📋 MVP ระบบ — ดูรายละเอียดโมดูลและ Role ทั้งหมด
          </a>
        </div>
      </div>
    </div>
  );
}
