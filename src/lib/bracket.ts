import { prisma } from "@/lib/prisma";

export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function getRoundName(roundNumber: number, totalRounds: number): string {
  const fromEnd = totalRounds - roundNumber;
  if (fromEnd === 0) return "รอบชิงชนะเลิศ";
  if (fromEnd === 1) return "รอบรองชนะเลิศ";
  if (fromEnd === 2) return "รอบก่อนรองชนะเลิศ";
  return `รอบที่ ${roundNumber}`;
}

const ROUND_GAP_MS = 90 * 60 * 1000;
const MATCH_GAP_MS = 20 * 60 * 1000;

/**
 * Build a single-elimination bracket for a tournament.
 * Deletes existing matches, creates new ones with proper seeding and nextMatchId links.
 * teamIds[0] = seed 1 (top), teamIds[n-1] = seed n (bottom)
 * startOffsetMs: ms from now when round 1 match 1 starts
 */
export async function buildBracketForTournament(
  tournamentId: string,
  teamIds: string[],
  startOffsetMs: number = 60 * 60 * 1000,
  location?: string
) {
  const n = teamIds.length;
  if (n < 2) throw new Error("Need at least 2 teams");

  const size = nextPow2(n);
  const totalRounds = Math.log2(size);

  // Pad with nulls for byes
  const seeded: (string | null)[] = [...teamIds];
  while (seeded.length < size) seeded.push(null);

  // Standard seeding: seed 1 vs size, seed 2 vs size-1, ...
  const pairs: [string | null, string | null][] = [];
  let lo = 0, hi = size - 1;
  while (lo < hi) {
    pairs.push([seeded[lo], seeded[hi]]);
    lo++; hi--;
  }

  // Delete existing matches
  await prisma.matchSet.deleteMany({ where: { match: { tournamentId } } });
  await prisma.match.deleteMany({ where: { tournamentId } });

  type SlotData = {
    round: number;
    matchNumber: number;
    teamAId: string | null;
    teamBId: string | null;
    winnerId: string | null;
    isBye: boolean;
    status: "PENDING" | "ONGOING" | "FINISHED";
    isLive: boolean;
  };

  const now = Date.now();
  const baseTime = now + startOffsetMs;
  const allSlots: SlotData[] = [];

  // Round 1: assign teams from seeded pairs
  for (let i = 0; i < pairs.length; i++) {
    const [ta, tb] = pairs[i];
    const isBye = ta !== null && tb === null;
    const startTime = baseTime + i * MATCH_GAP_MS;
    const isPast = startTime <= now;
    allSlots.push({
      round: 1,
      matchNumber: i + 1,
      teamAId: ta,
      teamBId: tb,
      winnerId: isBye ? ta : null,
      isBye,
      status: isBye ? "FINISHED" : isPast ? "ONGOING" : "PENDING",
      isLive: !isBye && ta !== null && tb !== null && isPast && startTime > now - 3 * 60 * 60 * 1000,
    });
  }

  // Rounds 2+: empty slots
  for (let r = 2; r <= totalRounds; r++) {
    const count = size / Math.pow(2, r);
    for (let i = 0; i < count; i++) {
      const startTime = baseTime + (r - 1) * ROUND_GAP_MS + i * MATCH_GAP_MS;
      const isPast = startTime <= now;
      allSlots.push({
        round: r,
        matchNumber: i + 1,
        teamAId: null,
        teamBId: null,
        winnerId: null,
        isBye: false,
        status: isPast ? "ONGOING" : "PENDING",
        isLive: false,
      });
    }
  }

  // Create all matches in DB
  const created: { id: string; round: number; matchNumber: number }[] = [];
  for (const slot of allSlots) {
    const startTime = new Date(
      baseTime
      + (slot.round - 1) * ROUND_GAP_MS
      + (slot.matchNumber - 1) * MATCH_GAP_MS
    );
    const m = await prisma.match.create({
      data: {
        tournamentId,
        teamAId: slot.teamAId,
        teamBId: slot.teamBId,
        winnerId: slot.winnerId,
        round: slot.round,
        matchNumber: slot.matchNumber,
        status: slot.status,
        isLive: slot.isLive,
        location: location ?? null,
        startTime,
      },
    });
    created.push({ id: m.id, round: slot.round, matchNumber: slot.matchNumber });
  }

  // Link nextMatchId: round r match i → round r+1 match ceil(i/2)
  for (const m of created) {
    if (m.round === totalRounds) continue;
    const nextMatchNumber = Math.ceil(m.matchNumber / 2);
    const next = created.find(
      (x) => x.round === m.round + 1 && x.matchNumber === nextMatchNumber
    );
    if (next) {
      await prisma.match.update({ where: { id: m.id }, data: { nextMatchId: next.id } });
    }
  }

  // Advance bye winners to next round slot
  for (const slot of allSlots.filter((s) => s.isBye && s.winnerId)) {
    const cur = created.find(
      (c) => c.round === slot.round && c.matchNumber === slot.matchNumber
    );
    if (!cur) continue;
    const dbMatch = await prisma.match.findUnique({ where: { id: cur.id } });
    if (!dbMatch?.nextMatchId) continue;
    const nextMatch = await prisma.match.findUnique({ where: { id: dbMatch.nextMatchId } });
    if (!nextMatch) continue;
    const updateData =
      nextMatch.teamAId === null ? { teamAId: slot.winnerId } : { teamBId: slot.winnerId };
    await prisma.match.update({ where: { id: dbMatch.nextMatchId }, data: updateData });
  }

  return { matchCount: created.length, totalRounds };
}
