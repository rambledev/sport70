import { prisma } from "./prisma";

/**
 * Auto-transitions match status based on startTime:
 *   PENDING  → ONGOING + isLive=true   when startTime has passed
 *   ONGOING  → isLive=false            when match has been ONGOING > MAX_LIVE_DURATION_MS
 *              (safety cutoff so matches don't stay live forever if staff forgets)
 *
 * Called on every GET /api/matches and GET /api/matches/[id]
 * Uses updateMany so it's a single DB round-trip.
 */

const MAX_LIVE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours safety cutoff

export async function autoTransitionMatches() {
  const now = new Date();

  // PENDING → ONGOING + isLive when startTime has passed
  await prisma.match.updateMany({
    where: {
      status: "PENDING",
      startTime: { lte: now },
      // Only transition matches that have both teams assigned
      teamAId: { not: null },
      teamBId: { not: null },
    },
    data: {
      status: "ONGOING",
      isLive: true,
    },
  });

  // Safety: ONGOING matches older than MAX_LIVE_DURATION_MS → turn off isLive flag
  // (status stays ONGOING until staff finalizes winner)
  const cutoff = new Date(now.getTime() - MAX_LIVE_DURATION_MS);
  await prisma.match.updateMany({
    where: {
      status: "ONGOING",
      isLive: true,
      startTime: { lte: cutoff },
    },
    data: {
      isLive: false,
    },
  });
}
