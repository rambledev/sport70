import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import DrawClient from "./DrawClient";

export default async function TournamentSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      sport: true,
      teams: { orderBy: { seed: "asc" } },
    },
  });

  if (!tournament) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <a href={`/tournament/${id}`} className="text-sm text-blue-600 hover:underline">
          ← กลับหน้า Bracket
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          จับฉลากทีม — {tournament.name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {tournament.sport.icon} {tournament.sport.name}
        </p>
      </div>

      <DrawClient tournamentId={id} tournamentName={tournament.name} />
    </div>
  );
}
