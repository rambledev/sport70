import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRoleBadgeColor } from "@/lib/auth";
import Link from "next/link";
import AdminActions from "./AdminActions";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [
    users, sports, tournaments, matches, events, albums, certs, notifications
  ] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.sport.findMany(),
    prisma.tournament.findMany({ include: { sport: true } }),
    prisma.match.count(),
    prisma.event.count(),
    prisma.album.count(),
    prisma.certificate.count(),
    prisma.notification.count(),
  ]);

  const stats = [
    { label: "ผู้ใช้", value: users.length, icon: "👥", color: "bg-blue-500" },
    { label: "กีฬา", value: sports.length, icon: "⚽", color: "bg-green-500" },
    { label: "Tournament", value: tournaments.length, icon: "🏆", color: "bg-yellow-500" },
    { label: "แมทช์", value: matches, icon: "⚔️", color: "bg-red-500" },
    { label: "กิจกรรม", value: events, icon: "🎉", color: "bg-purple-500" },
    { label: "รูปภาพ", value: albums, icon: "📷", color: "bg-pink-500" },
    { label: "เกียรติบัตร", value: certs, icon: "🏅", color: "bg-indigo-500" },
    { label: "แจ้งเตือน", value: notifications, icon: "🔔", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🛡️ Admin Dashboard</h1>
        <p className="text-gray-500">จัดการระบบทั้งหมด</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-xl`}>
                  {s.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Actions (create sport, tournament, etc.) */}
      <AdminActions sports={sports} users={users} />

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>ผู้ใช้ทั้งหมด ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">ชื่อ</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">บทบาท</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">มหาวิทยาลัย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-2 px-3 text-gray-500">{u.email}</td>
                    <td className="py-2 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{u.university ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle>รายการแข่งขัน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.sport.icon} {t.sport.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    t.status === "ONGOING" ? "bg-green-100 text-green-700" :
                    t.status === "FINISHED" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {t.status}
                  </span>
                  <Link href={`/tournament/${t.id}`} className="text-xs text-blue-600 hover:underline">
                    ดูสาย →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
