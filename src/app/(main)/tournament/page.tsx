import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  getTournamentStatusLabel,
  getScoreTypeLabel,
  getSportCategoryLabel,
  getSportCategoryIcon,
} from "@/lib/utils";
import Link from "next/link";

const CATEGORY_ORDER = ["TEAM", "INDIVIDUAL", "COMBAT", "OTHER"] as const;

const statusColor = {
  SETUP: "default" as const,
  ONGOING: "success" as const,
  FINISHED: "info" as const,
};

export default async function TournamentPage() {
  const [sports, tournaments] = await Promise.all([
    prisma.sport.findMany({
      include: { _count: { select: { tournaments: true, teams: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tournament.findMany({
      include: {
        sport: true,
        _count: { select: { teams: true, matches: true } },
      },
      orderBy: [{ sport: { name: "asc" } }, { createdAt: "desc" }],
    }),
  ]);

  // Group sports by category
  const sportsByCategory = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = sports.filter((s) => s.category === cat);
      return acc;
    },
    {} as Record<string, typeof sports>
  );

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">การแข่งขัน 🏆</h1>

      {/* Sports grouped by category */}
      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-gray-700">ประเภทกีฬา</h2>
        {CATEGORY_ORDER.filter((cat) => sportsByCategory[cat]?.length > 0).map((cat) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{getSportCategoryIcon(cat)}</span>
              <h3 className="text-base font-semibold text-gray-800">{getSportCategoryLabel(cat)}</h3>
              <span className="text-sm text-gray-400 ml-1">({sportsByCategory[cat].length} ชนิด)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sportsByCategory[cat].map((sport) => (
                <Card key={sport.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{sport.icon ?? "🏅"}</div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 leading-tight">{sport.name}</h4>
                        {sport.description && (
                          <p className="text-xs text-gray-500 truncate">{sport.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-400">
                            {sport._count.tournaments} รายการ · {sport._count.teams} ทีม
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {getScoreTypeLabel(sport.scoreType)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tournaments grouped by category */}
      <div className="space-y-8">
        <h2 className="text-lg font-semibold text-gray-700">รายการแข่งขัน</h2>
        {CATEGORY_ORDER.filter((cat) =>
          tournaments.some((t) => t.sport.category === cat)
        ).map((cat) => {
          const catTournaments = tournaments.filter((t) => t.sport.category === cat);
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{getSportCategoryIcon(cat)}</span>
                <h3 className="text-base font-semibold text-gray-800">{getSportCategoryLabel(cat)}</h3>
                <span className="text-sm text-gray-400 ml-1">({catTournaments.length} รายการ)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catTournaments.map((t) => (
                  <Link key={t.id} href={`/tournament/${t.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm leading-tight">{t.name}</CardTitle>
                          <Badge variant={statusColor[t.status]}>
                            {getTournamentStatusLabel(t.status)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {t.sport.icon} {t.sport.name}
                          {t.athleteGroup && (
                            <span className="ml-1 text-gray-400">
                              · {t.athleteGroup === "STUDENT" ? "นักศึกษา" : "บุคลากร"}
                            </span>
                          )}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-gray-900">{t._count.teams}</p>
                            <p className="text-xs text-gray-500">ทีม</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-gray-900">{t._count.matches}</p>
                            <p className="text-xs text-gray-500">แมทช์</p>
                          </div>
                        </div>
                        {t.startDate && (
                          <p className="text-xs text-gray-400 mt-2">
                            📅 {formatDate(t.startDate)}
                            {t.endDate && ` → ${formatDate(t.endDate)}`}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
