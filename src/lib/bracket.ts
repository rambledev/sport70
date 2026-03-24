export function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function getRoundName(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return "รอบชิงชนะเลิศ";
  if (fromEnd === 1) return "รอบรองชนะเลิศ";
  if (fromEnd === 2) return "รอบก่อนรองชนะเลิศ";
  return `รอบที่ ${roundIndex + 1}`;
}

export function buildBracketMatches(teamNames: string[]): Array<{
  round: number;
  matchIndex: number;
  team1Seed: number | null;
  team2Seed: number | null;
  isBye: boolean;
}> {
  const size = nextPow2(teamNames.length);
  const totalRounds = Math.log2(size);
  const matches: Array<{
    round: number;
    matchIndex: number;
    team1Seed: number | null;
    team2Seed: number | null;
    isBye: boolean;
  }> = [];

  const seeds = Array.from({ length: size }, (_, i) =>
    i < teamNames.length ? i + 1 : null
  );

  for (let i = 0; i < size; i += 2) {
    const t1 = seeds[i];
    const t2 = seeds[i + 1];
    const isBye =
      (t1 !== null && t2 === null) || (t1 === null && t2 !== null);
    matches.push({ round: 0, matchIndex: i / 2, team1Seed: t1, team2Seed: t2, isBye });
  }

  for (let r = 1; r < totalRounds; r++) {
    const matchCount = size / Math.pow(2, r + 1);
    for (let i = 0; i < matchCount; i++) {
      matches.push({ round: r, matchIndex: i, team1Seed: null, team2Seed: null, isBye: false });
    }
  }

  return matches;
}