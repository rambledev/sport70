import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRoleBadgeColor } from "@/lib/auth";
import { formatDateTime, getMatchStatusColor, getMatchStatusLabel } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Users, Calendar, Bell, Tv } from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [sports, tournaments, liveMatches, upcomingMatches, notifications, events] =
    await Promise.all([
      prisma.sport.count(),
      prisma.tournament.count(),
      prisma.match.findMany({
        where: { isLive: true },
        include: { teamA: true, teamB: true, tournament: { include: { sport: true } } },
        take: 3,
      }),
      prisma.match.findMany({
        where: { status: "PENDING" },
        include: { teamA: true, teamB: true, tournament: { include: { sport: true } } },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.notification.findMany({
        where: { userId: user.id, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.event.findMany({
        where: { status: "UPCOMING" },
        orderBy: { startTime: "asc" },
        take: 3,
      }),
    ]);

  const stats = [
    { label: "ประเภทกีฬา", value: sports, icon: "⚽", color: "bg-blue-500" },
    { label: "การแข่งขัน", value: tournaments, icon: "🏆", color: "bg-green-500" },
    { label: "แมทช์ Live", value: liveMatches.length, icon: "🔴", color: "bg-red-500" },
    { label: "แจ้งเตือน", value: notifications.length, icon: "🔔", color: "bg-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ยินดีต้อนรับ, {user.name} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
            <span className="text-gray-500 text-sm">{user.email}</span>
          </div>
        </div>
        {liveMatches.length > 0 && (
          <Link href="/live"
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium animate-pulse hover:bg-red-600 transition-colors"
          >
            <Tv size={16} />
            LIVE ตอนนี้
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                กำลังแข่งขัน LIVE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {liveMatches.map((match) => (
                  <Link key={match.id} href={`/match/${match.id}`}>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100 hover:border-red-200 transition-colors">
                      <p className="text-xs text-red-500 font-medium mb-1">
                        {match.tournament.sport.icon} {match.tournament.sport.name} — {match.tournament.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{match.teamA?.name ?? "TBD"}</span>
                        <span className="text-xl font-bold text-red-600">
                          {match.scoreA} – {match.scoreB}
                        </span>
                        <span className="font-semibold text-gray-900">{match.teamB?.name ?? "TBD"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={18} />
              แมทช์ที่กำลังจะมาถึง
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ไม่มีแมทช์ที่รอ</p>
            ) : (
              <div className="space-y-2">
                {upcomingMatches.map((match) => (
                  <Link key={match.id} href={`/match/${match.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          {match.tournament.sport.icon} {match.tournament.sport.name}
                        </p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {match.teamA?.name ?? "TBD"} vs {match.teamB?.name ?? "TBD"}
                        </p>
                        {match.startTime && (
                          <p className="text-xs text-gray-400">{formatDateTime(match.startTime)}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${getMatchStatusColor(match.status)}`}>
                        {getMatchStatusLabel(match.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} />
              การแจ้งเตือน
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ไม่มีการแจ้งเตือน</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  </div>
                ))}
                <Link href="/notifications" className="text-sm text-blue-600 hover:underline block text-center pt-2">
                  ดูทั้งหมด →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎉 กิจกรรมที่กำลังจะมาถึง
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">ไม่มีกิจกรรม</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link key={event.id} href="/event">
                    <div className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                      <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                      {event.location && (
                        <p className="text-xs text-gray-500">📍 {event.location}</p>
                      )}
                      <p className="text-xs text-blue-500 mt-1">
                        🕐 {formatDateTime(event.startTime)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">เมนูด่วน</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { href: "/tournament", label: "การแข่งขัน", emoji: "🏆" },
            { href: "/live", label: "ถ่ายทอดสด", emoji: "📺" },
            { href: "/vote", label: "โหวต", emoji: "🗳️" },
            { href: "/event", label: "กิจกรรม", emoji: "🎉" },
            { href: "/gallery", label: "แกลเลอรี", emoji: "📷" },
            { href: "/certificate", label: "เกียรติบัตร", emoji: "🏅" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
