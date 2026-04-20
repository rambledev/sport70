import {
  PrismaClient,
  Role,
  ScoreType,
  SportCategory,
  TournamentStatus,
  MatchStatus,
  AthleteGroup,
  LocationType,
  CertificateType,
  EventStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────
function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}
function minutesFromNow(m: number) {
  return new Date(Date.now() + m * 60 * 1000);
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** 11 มหาวิทยาลัยราชภัฏกลุ่มภาคตะวันออกเฉียงเหนือ */
const UNIVERSITIES = [
  { name: "มหาวิทยาลัยราชภัฏมหาสารคาม",      short: "มรม.",   code: "RMU",   host: true  },
  { name: "มหาวิทยาลัยราชภัฏชัยภูมิ",         short: "มรภ.ชย.", code: "CPRU",  host: false },
  { name: "มหาวิทยาลัยราชภัฏบุรีรัมย์",        short: "มรภ.บร.", code: "BRU",   host: false },
  { name: "มหาวิทยาลัยราชภัฏร้อยเอ็ด",         short: "มรรอ.", code: "RRU",   host: false },
  { name: "มหาวิทยาลัยราชภัฏเลย",              short: "มรภ.ลย.", code: "LRU",   host: false },
  { name: "มหาวิทยาลัยราชภัฏศรีสะเกษ",         short: "มรภ.สก.", code: "SSKRU", host: false },
  { name: "มหาวิทยาลัยราชภัฏสกลนคร",           short: "มรสน.", code: "SNRU",  host: false },
  { name: "มหาวิทยาลัยราชภัฏสุรินทร์",          short: "มรภ.สร.", code: "SRRU",  host: false },
  { name: "มหาวิทยาลัยราชภัฏอุดรธานี",          short: "มรอด.", code: "UDRU",  host: false },
  { name: "มหาวิทยาลัยราชภัฏอุบลราชธานี",       short: "มรอบ.", code: "UBRU",  host: false },
  { name: "มหาวิทยาลัยราชภัฏนครราชสีมา",        short: "มรนม.", code: "NRRU",  host: false },
];

/** ทุกประเภทกีฬาที่ใช้แข่ง (ราชภัฏเกมส์) */
// divisions: ป้ายกำกับประเภท เช่น "ทีมชาย" / "ชาย" / "หญิง" / "ทีมผสม"
// แต่ละ division จะสร้าง 1 Tournament
const SPORTS_DEF = [
  // ─── ทีม
  { name: "ฟุตบอล",            icon: "⚽", scoreType: ScoreType.SIMPLE, category: SportCategory.TEAM,       desc: "ฟุตบอล 11 คน",       divisions: ["ทีมชาย"] },
  { name: "ฟุตซอล",            icon: "🥅", scoreType: ScoreType.SIMPLE, category: SportCategory.TEAM,       desc: "ฟุตซอล 5 คน",        divisions: ["ทีมชาย"] },
  { name: "วอลเลย์บอล",        icon: "🏐", scoreType: ScoreType.SET,    category: SportCategory.TEAM,       desc: "วอลเลย์บอล 6 คน",    divisions: ["ทีมชาย", "ทีมหญิง"] },
  { name: "บาสเกตบอล 3 คน",   icon: "🏀", scoreType: ScoreType.POINT,  category: SportCategory.TEAM,       desc: "บาสเกตบอล 3×3",      divisions: ["ทีมชาย", "ทีมหญิง"] },
  { name: "แอร์โรบิกแดนซ์",   icon: "💃", scoreType: ScoreType.SIMPLE, category: SportCategory.TEAM,       desc: "แอร์โรบิกแดนซ์",     divisions: ["ทีมผสม"] },
  { name: "ประกวดจินตลีลา",   icon: "🎭", scoreType: ScoreType.SIMPLE, category: SportCategory.TEAM,       desc: "ประกวดจินตลีลา",     divisions: ["ทีมผสม"] },
  { name: "แชร์บอล",           icon: "🏐", scoreType: ScoreType.SIMPLE, category: SportCategory.TEAM,       desc: "แชร์บอล",             divisions: ["หญิง"] },
  // ─── บุคคล
  { name: "แบดมินตัน",         icon: "🏸", scoreType: ScoreType.SET,    category: SportCategory.INDIVIDUAL, desc: "แบดมินตัน",           divisions: ["ชาย", "หญิง"] },
  { name: "ลอนเทนนิส",         icon: "🎾", scoreType: ScoreType.SET,    category: SportCategory.INDIVIDUAL, desc: "ลอนเทนนิส",           divisions: ["ชาย", "หญิง"] },
  { name: "เทเบิลเทนนิส",      icon: "🏓", scoreType: ScoreType.SET,    category: SportCategory.INDIVIDUAL, desc: "เทเบิลเทนนิส (ปิงปอง)", divisions: ["ชาย", "หญิง"] },
  { name: "กอล์ฟ",             icon: "⛳", scoreType: ScoreType.SIMPLE, category: SportCategory.INDIVIDUAL, desc: "กอล์ฟ",               divisions: ["ชาย"] },
  // ─── อื่นๆ
  { name: "เปตอง",             icon: "🎯", scoreType: ScoreType.SIMPLE, category: SportCategory.OTHER,      desc: "เปตอง",               divisions: ["ชาย", "หญิง"] },
  { name: "หมากกระดาน",        icon: "♟️", scoreType: ScoreType.SIMPLE, category: SportCategory.OTHER,      desc: "หมากกระดาน / หมากรุก", divisions: ["ชาย", "หญิง"] },
  { name: "E-Sport",           icon: "🎮", scoreType: ScoreType.POINT,  category: SportCategory.OTHER,      desc: "E-Sport (ROV / FIFA)",  divisions: ["ทีมชาย", "ทีมหญิง"] },
  { name: "สนุกเกอร์",         icon: "🎱", scoreType: ScoreType.SIMPLE, category: SportCategory.OTHER,      desc: "สนุกเกอร์",           divisions: ["ชาย"] },
  { name: "กีฬาฮาเฮ",          icon: "🎪", scoreType: ScoreType.SIMPLE, category: SportCategory.OTHER,      desc: "กีฬาฮาเฮ / สันทนาการ", divisions: ["ชาย", "หญิง"] },
];

// ─── Bracket builder ─────────────────────────────────────────────────────────
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * สร้าง single-elimination bracket สำหรับ n ทีม
 * คืน array ของ match slot พร้อม nextMatchIndex (ใน array)
 */
function buildBracket(n: number) {
  const size = nextPow2(n);
  const totalRounds = Math.log2(size);

  // slot[round][matchIndex] → { teamASlot, teamBSlot, nextMatchIndex }
  type Slot = { round: number; matchIndex: number; isBye: boolean };
  const slots: Slot[] = [];

  for (let r = 0; r < totalRounds; r++) {
    const count = size / Math.pow(2, r + 1);
    for (let i = 0; i < count; i++) {
      slots.push({ round: r + 1, matchIndex: i + 1, isBye: false });
    }
  }
  return { slots, totalRounds, size };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 เริ่ม seed ข้อมูล ราชภัฏเกมส์...\n");

  // ══════════════════════════════════════════════
  // 1. Sports
  // ══════════════════════════════════════════════
  console.log("⚽ สร้างประเภทกีฬา...");
  const sportMap: Record<string, string> = {}; // name → id

  for (const s of SPORTS_DEF) {
    const sport = await prisma.sport.upsert({
      where: { name: s.name },
      update: { icon: s.icon, scoreType: s.scoreType, category: s.category, description: s.desc },
      create: {
        name: s.name,
        icon: s.icon,
        scoreType: s.scoreType,
        category: s.category,
        description: s.desc,
      },
    });
    sportMap[s.name] = sport.id;
  }
  console.log(`   ✓ ${SPORTS_DEF.length} ประเภทกีฬา`);

  // ══════════════════════════════════════════════
  // 2. Users
  // ══════════════════════════════════════════════
  console.log("👤 สร้างผู้ใช้...");

  const hostUniv = UNIVERSITIES.find((u) => u.host)!;

  // Admin (เจ้าภาพ)
  const admin = await prisma.user.upsert({
    where: { email: "admin@rmu.ac.th" },
    update: {},
    create: { email: "admin@rmu.ac.th", name: "ผู้ดูแลระบบ (RMU)", role: Role.ADMIN, university: hostUniv.name },
  });

  // Staff = นักศึกษาเจ้าภาพ (3 คน)
  const staffUsers = await Promise.all([
    prisma.user.upsert({ where: { email: "staff1@rmu.ac.th" }, update: {}, create: { email: "staff1@rmu.ac.th", name: "สมชาย บันทึกคะแนน", role: Role.STAFF, university: hostUniv.name } }),
    prisma.user.upsert({ where: { email: "staff2@rmu.ac.th" }, update: {}, create: { email: "staff2@rmu.ac.th", name: "สุภา จัดการแข่ง", role: Role.STAFF, university: hostUniv.name } }),
    prisma.user.upsert({ where: { email: "staff3@rmu.ac.th" }, update: {}, create: { email: "staff3@rmu.ac.th", name: "พงษ์ศักดิ์ เจ้าหน้าที่", role: Role.STAFF, university: hostUniv.name } }),
  ]);
  for (const s of staffUsers) {
    await prisma.staffProfile.upsert({ where: { userId: s.id }, update: {}, create: { userId: s.id, assignedSport: "ฟุตบอล" } });
  }

  // Visitors (คนทั่วไป)
  const visitor = await prisma.user.upsert({
    where: { email: "visitor@gmail.com" },
    update: {},
    create: { email: "visitor@gmail.com", name: "ผู้ชม ทั่วไป", role: Role.VISITOR, phone: "0812345678" },
  });

  // แต่ละมหาวิทยาลัย: สร้าง นักกีฬา 2 คน (STUDENT + PERSONNEL) + ผู้จัดการทีม 1 คน (PERSONNEL)
  console.log("   สร้างผู้ใช้ต่อมหาวิทยาลัย...");
  for (const univ of UNIVERSITIES) {
    const code = univ.code.toLowerCase();

    // นักกีฬา (นักศึกษา)
    const athlete_s = await prisma.user.upsert({
      where: { email: `athlete.student@${code}.ac.th` },
      update: {},
      create: {
        email: `athlete.student@${code}.ac.th`,
        name: `นักกีฬา(นศ.) ${univ.short}`,
        role: Role.ATHLETE,
        university: univ.name,
      },
    });
    await prisma.athleteProfile.upsert({
      where: { userId: athlete_s.id },
      update: {},
      create: { userId: athlete_s.id, athleteGroup: AthleteGroup.STUDENT, sport: "ฟุตบอล" },
    });

    // นักกีฬา (บุคลากร)
    const athlete_p = await prisma.user.upsert({
      where: { email: `athlete.personnel@${code}.ac.th` },
      update: {},
      create: {
        email: `athlete.personnel@${code}.ac.th`,
        name: `นักกีฬา(บคล.) ${univ.short}`,
        role: Role.ATHLETE,
        university: univ.name,
      },
    });
    await prisma.athleteProfile.upsert({
      where: { userId: athlete_p.id },
      update: {},
      create: { userId: athlete_p.id, athleteGroup: AthleteGroup.PERSONNEL, sport: "บาสเกตบอล" },
    });

    // ผู้จัดการทีม (บุคลากร)
    const manager = await prisma.user.upsert({
      where: { email: `manager@${code}.ac.th` },
      update: {},
      create: {
        email: `manager@${code}.ac.th`,
        name: `ผู้จัดการทีม ${univ.short}`,
        role: Role.MANAGER,
        university: univ.name,
      },
    });
    await prisma.managerProfile.upsert({
      where: { userId: manager.id },
      update: {},
      create: { userId: manager.id, sport: "ฟุตบอล" },
    });
  }
  console.log(`   ✓ ${UNIVERSITIES.length * 3 + 4} ผู้ใช้`);

  // ══════════════════════════════════════════════
  // 3. Tournaments + Teams + Brackets
  //    สร้าง tournament ครบทุกกีฬา
  //    และสร้าง bracket เต็มสำหรับ 4 กีฬาหลัก
  // ══════════════════════════════════════════════
  console.log("🏆 สร้าง tournament และสายการแข่งขัน...");

  // ─── สร้าง tournament ทุกกีฬา แยกตาม division (ชาย/หญิง/ผสม) ──────────────
  for (const s of SPORTS_DEF) {
    for (const division of s.divisions) {
      const tName = `ราชภัฏเกมส์ — ${s.name} (${division})`;
      await prisma.tournament.upsert({
        where: { name: tName } as any,
        update: {},
        create: {
          name: tName,
          sportId: sportMap[s.name],
          athleteGroup: null,
          status: TournamentStatus.SETUP,
          startDate: hoursFromNow(24),
          endDate: hoursFromNow(24 * 5),
          location: "ราชภัฏมหาสารคาม",
        },
      });
    }
  }

  // ─── 4 กีฬาหลัก: สร้างทีม + bracket เต็ม ──────────────────────────────────
  await seedFullTournament({
    sportName: "ฟุตบอล",
    tournamentLabel: "ทีมชาย",
    status: TournamentStatus.ONGOING,
    startOffset: -hoursAgo(2),
    location: "สนามฟุตบอล RMU",
    youtubePrefix: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  });

  await seedFullTournament({
    sportName: "บาสเกตบอล 3 คน",
    tournamentLabel: "ทีมชาย",
    status: TournamentStatus.ONGOING,
    startOffset: -hoursAgo(1),
    location: "โรงยิม RMU",
    youtubePrefix: undefined,
  });

  await seedFullTournament({
    sportName: "วอลเลย์บอล",
    tournamentLabel: "ทีมหญิง",
    status: TournamentStatus.SETUP,
    startOffset: hoursFromNow(3).getTime() - Date.now(),
    location: "โรงยิมในร่ม RMU",
    youtubePrefix: undefined,
  });

  await seedFullTournament({
    sportName: "แบดมินตัน",
    tournamentLabel: "ชาย",
    status: TournamentStatus.SETUP,
    startOffset: hoursFromNow(6).getTime() - Date.now(),
    location: "คอร์ตแบดมินตัน RMU",
    youtubePrefix: undefined,
  });

  // ══════════════════════════════════════════════
  // 4. Locations
  // ══════════════════════════════════════════════
  console.log("📍 สร้างสถานที่...");
  const locationData = [
    { name: "สนามฟุตบอลหลัก",       type: LocationType.FIELD,   lat: 16.1769, lng: 103.3003, address: "มรม. สนามกีฬากลาง" },
    { name: "สนามฟุตซอล",           type: LocationType.FIELD,   lat: 16.1772, lng: 103.3010, address: "มรม. อาคารอเนกประสงค์" },
    { name: "โรงยิมในร่ม",          type: LocationType.FIELD,   lat: 16.1765, lng: 103.2998, address: "มรม. โรงยิมนาเซียม" },
    { name: "สระว่ายน้ำ",           type: LocationType.FIELD,   lat: 16.1760, lng: 103.3005, address: "มรม. สระว่ายน้ำมาตรฐาน" },
    { name: "คอร์ตเทนนิส/แบด",      type: LocationType.FIELD,   lat: 16.1775, lng: 103.2995, address: "มรม. คอร์ต A-D" },
    { name: "สนามกรีฑา",            type: LocationType.FIELD,   lat: 16.1768, lng: 103.2990, address: "มรม. ลู่-ลาน" },
    { name: "ห้อง E-Sport",         type: LocationType.FIELD,   lat: 16.1771, lng: 103.3007, address: "มรม. อาคาร IT ชั้น 3" },
    { name: "ห้องน้ำ A (ใกล้สนาม)", type: LocationType.TOILET,  lat: 16.1767, lng: 103.3001, address: "ข้างสนามฟุตบอล" },
    { name: "ห้องน้ำ B (โรงยิม)",   type: LocationType.TOILET,  lat: 16.1764, lng: 103.2997, address: "หน้าโรงยิม" },
    { name: "จุดปฐมพยาบาล",         type: LocationType.SERVICE, lat: 16.1770, lng: 103.3008, address: "กลางสนาม" },
    { name: "ศูนย์อาหาร",           type: LocationType.SERVICE, lat: 16.1773, lng: 103.3015, address: "มรม. โรงอาหารกลาง" },
    { name: "ที่จอดรถ A",           type: LocationType.SERVICE, lat: 16.1762, lng: 103.2993, address: "ด้านหน้าประตู 1" },
    { name: "เต็นท์ลงทะเบียนนักกีฬา", type: LocationType.SERVICE, lat: 16.1766, lng: 103.2999, address: "หน้าอาคารกีฬา" },
  ];
  for (const loc of locationData) {
    await prisma.mapLocation.upsert({
      where: { name: loc.name } as any,
      update: {},
      create: loc,
    });
  }
  console.log(`   ✓ ${locationData.length} สถานที่`);

  // ══════════════════════════════════════════════
  // 5. Events
  // ══════════════════════════════════════════════
  console.log("🎉 สร้างกิจกรรม...");
  const openCeremony = await prisma.event.upsert({
    where: { name: "พิธีเปิดราชภัฏเกมส์" } as any,
    update: {},
    create: {
      name: "พิธีเปิดราชภัฏเกมส์",
      description: "พิธีเปิดอย่างเป็นทางการ พร้อมขบวนพาเหรดจากทั้ง 11 มหาวิทยาลัย",
      location: "สนามกีฬาหลัก มรม.",
      startTime: hoursFromNow(1),
      endTime: hoursFromNow(4),
      status: EventStatus.UPCOMING,
      maxGuests: 5000,
    },
  });

  const closeCeremony = await prisma.event.upsert({
    where: { name: "พิธีปิดและมอบรางวัล" } as any,
    update: {},
    create: {
      name: "พิธีปิดและมอบรางวัล",
      description: "พิธีปิดราชภัฏเกมส์ พร้อมมอบถ้วยรางวัลและเกียรติบัตร",
      location: "สนามกีฬาหลัก มรม.",
      startTime: hoursFromNow(24 * 5),
      endTime: hoursFromNow(24 * 5 + 3),
      status: EventStatus.UPCOMING,
      maxGuests: 5000,
    },
  });

  await prisma.event.upsert({
    where: { name: "กิจกรรมสันทนาการคืนวันแรก" } as any,
    update: {},
    create: {
      name: "กิจกรรมสันทนาการคืนวันแรก",
      description: "ดนตรี การแสดง และกิจกรรมสร้างความสัมพันธ์ระหว่างมหาวิทยาลัย",
      location: "ลาน RMU กลางแจ้ง",
      startTime: hoursFromNow(8),
      endTime: hoursFromNow(12),
      status: EventStatus.UPCOMING,
      maxGuests: 2000,
    },
  });

  // RSVP ตัวอย่าง
  const visitorUser = await prisma.user.findUnique({ where: { email: "visitor@gmail.com" } });
  if (visitorUser) {
    await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: openCeremony.id, userId: visitorUser.id } },
      update: {},
      create: { eventId: openCeremony.id, userId: visitorUser.id, status: "GOING", guests: 2 },
    });
  }
  console.log(`   ✓ 3 กิจกรรม`);

  // ══════════════════════════════════════════════
  // 6. Gallery
  // ══════════════════════════════════════════════
  console.log("📷 สร้างแกลเลอรี...");
  const album1 = await prisma.album.upsert({
    where: { name: "พิธีเปิดราชภัฏเกมส์" } as any,
    update: {},
    create: { name: "พิธีเปิดราชภัฏเกมส์", description: "ภาพบรรยากาศพิธีเปิด", coverUrl: "https://picsum.photos/seed/open/800/600" },
  });
  const album2 = await prisma.album.upsert({
    where: { name: "การแข่งขันฟุตบอล" } as any,
    update: {},
    create: { name: "การแข่งขันฟุตบอล", description: "ไฮไลต์ฟุตบอล", coverUrl: "https://picsum.photos/seed/football/800/600" },
  });
  const album3 = await prisma.album.upsert({
    where: { name: "กิจกรรมสันทนาการ" } as any,
    update: {},
    create: { name: "กิจกรรมสันทนาการ", description: "บรรยากาศงานคืนวันแรก", coverUrl: "https://picsum.photos/seed/party/800/600" },
  });

  const photos = [
    { albumId: album1.id, url: "https://picsum.photos/seed/p1/800/600", caption: "ขบวนพาเหรดนักกีฬา" },
    { albumId: album1.id, url: "https://picsum.photos/seed/p2/800/600", caption: "จุดคบเพลิง" },
    { albumId: album1.id, url: "https://picsum.photos/seed/p3/800/600", caption: "คณะผู้บริหารทั้ง 11 มหาวิทยาลัย" },
    { albumId: album2.id, url: "https://picsum.photos/seed/p4/800/600", caption: "ประตูจากทีม มรม." },
    { albumId: album2.id, url: "https://picsum.photos/seed/p5/800/600", caption: "บรรยากาศในสนาม" },
    { albumId: album3.id, url: "https://picsum.photos/seed/p6/800/600", caption: "การแสดงดนตรี" },
    { albumId: album3.id, url: "https://picsum.photos/seed/p7/800/600", caption: "กิจกรรมเกม" },
  ];
  for (const p of photos) {
    const exists = await prisma.photo.findFirst({ where: { url: p.url } });
    if (!exists) await prisma.photo.create({ data: p });
  }
  console.log(`   ✓ 3 อัลบั้ม, ${photos.length} รูป`);

  // ══════════════════════════════════════════════
  // 7. Certificate Templates
  // ══════════════════════════════════════════════
  console.log("🏅 สร้าง Certificate Templates...");
  const tmplAthlete = await prisma.certificateTemplate.upsert({
    where: { name: "เกียรติบัตรนักกีฬาผู้เข้าร่วมแข่งขัน" } as any,
    update: {},
    create: { name: "เกียรติบัตรนักกีฬาผู้เข้าร่วมแข่งขัน", type: CertificateType.ATHLETE, description: "สำหรับนักกีฬาทุกคนที่เข้าร่วมราชภัฏเกมส์" },
  });
  const tmplCoach = await prisma.certificateTemplate.upsert({
    where: { name: "เกียรติบัตรผู้ฝึกสอน" } as any,
    update: {},
    create: { name: "เกียรติบัตรผู้ฝึกสอน", type: CertificateType.COACH, description: "สำหรับผู้ฝึกสอนและเจ้าหน้าที่ทีม" },
  });
  const tmplManager = await prisma.certificateTemplate.upsert({
    where: { name: "เกียรติบัตรผู้จัดการทีม" } as any,
    update: {},
    create: { name: "เกียรติบัตรผู้จัดการทีม", type: CertificateType.MANAGER, description: "สำหรับผู้จัดการทีมทั้ง 11 มหาวิทยาลัย" },
  });

  // ตัวอย่างเกียรติบัตร
  const sampleAthlete = await prisma.user.findUnique({ where: { email: "athlete.student@rmu.ac.th" } });
  const sampleManager = await prisma.user.findUnique({ where: { email: "manager@rmu.ac.th" } });
  if (sampleAthlete) {
    await prisma.certificate.upsert({
      where: { id: "cert-sample-athlete" } as any,
      update: {},
      create: { userId: sampleAthlete.id, templateId: tmplAthlete.id, sport: "ฟุตบอล", position: "ผู้เข้าร่วม", event: "ราชภัฏเกมส์ ครั้งที่ XX" },
    });
  }
  if (sampleManager) {
    await prisma.certificate.upsert({
      where: { id: "cert-sample-manager" } as any,
      update: {},
      create: { userId: sampleManager.id, templateId: tmplManager.id, sport: "ฟุตบอล", position: "ผู้จัดการทีม", event: "ราชภัฏเกมส์ ครั้งที่ XX" },
    });
  }
  console.log("   ✓ 3 templates, 2 ตัวอย่างเกียรติบัตร");

  // ══════════════════════════════════════════════
  // 8. Notifications
  // ══════════════════════════════════════════════
  console.log("🔔 สร้างการแจ้งเตือน...");
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@rmu.ac.th" } });
  const staffUser = staffUsers[0];
  if (adminUser) {
    await prisma.notification.createMany({
      data: [
        { userId: adminUser.id, title: "เปิดระบบสำเร็จ", message: "ระบบราชภัฏเกมส์พร้อมใช้งานแล้ว มี 11 มหาวิทยาลัยเข้าร่วม", isRead: false },
        { userId: adminUser.id, title: "ลงทะเบียนนักกีฬา", message: "มีผู้ลงทะเบียนแล้ว 22 คน จาก 11 มหาวิทยาลัย", isRead: false },
      ],
      skipDuplicates: true,
    });
  }
  if (staffUser) {
    await prisma.notification.createMany({
      data: [
        { userId: staffUser.id, title: "มอบหมายงาน", message: "คุณได้รับมอบหมายให้บันทึกคะแนนการแข่งขันฟุตบอล", isRead: false },
      ],
      skipDuplicates: true,
    });
  }
  console.log("   ✓ การแจ้งเตือน");

  // ══════════════════════════════════════════════
  // 9. Votes (เตรียมทีมไว้ให้โหวตขบวนพาเหรด)
  // ══════════════════════════════════════════════
  console.log("🗳️ เตรียมข้อมูลโหวต...");
  // โหวตใช้ Team → สร้าง "ทีมขบวนพาเหรด" ต่อมหาวิทยาลัย (ใช้ sport กีฬาฮาเฮ)
  const paradeSportId = sportMap["กีฬาฮาเฮ"];
  for (const univ of UNIVERSITIES) {
    await prisma.team.upsert({
      where: { name_sportId: { name: `ขบวนพาเหรด ${univ.short}`, sportId: paradeSportId } } as any,
      update: {},
      create: {
        name: `ขบวนพาเหรด ${univ.short}`,
        university: univ.name,
        universityShort: univ.short,
        seed: UNIVERSITIES.indexOf(univ) + 1,
        sportId: paradeSportId,
      },
    });
  }
  if (visitorUser) {
    const paradeTeam = await prisma.team.findFirst({ where: { sportId: paradeSportId, university: hostUniv.name } });
    if (paradeTeam) {
      await prisma.vote.upsert({
        where: { userId: visitorUser.id },
        update: {},
        create: { userId: visitorUser.id, teamId: paradeTeam.id },
      });
    }
  }
  console.log("   ✓ ทีมขบวนพาเหรด 11 ทีม");

  // ══════════════════════════════════════════════
  // Done
  // ══════════════════════════════════════════════
  console.log("\n✅ Seed สำเร็จ!\n");
  console.log("📋 สรุป:");
  console.log(`  🏟️  มหาวิทยาลัย: ${UNIVERSITIES.length}`);
  console.log(`  ⚽  กีฬา: ${SPORTS_DEF.length} ประเภท`);
  console.log(`  👤  ผู้ใช้: ${UNIVERSITIES.length * 3 + 4} คน`);
  console.log("\n📧 บัญชีทดสอบ:");
  console.log("  admin@rmu.ac.th            → ADMIN (เจ้าภาพ มรม.)");
  console.log("  staff1@rmu.ac.th           → STAFF (นักศึกษา มรม.)");
  console.log("  athlete.student@rmu.ac.th  → ATHLETE/นักศึกษา");
  console.log("  athlete.personnel@rmu.ac.th→ ATHLETE/บุคลากร");
  console.log("  manager@rmu.ac.th          → MANAGER (บุคลากร มรม.)");
  console.log("  visitor@gmail.com          → VISITOR");
  console.log("  (เปลี่ยน rmu → cpru/bru/rru/lru/sskru/snru/srru/udru/ubru/nrru สำหรับมหาวิทยาลัยอื่น)");
}

// ─── seedFullTournament ───────────────────────────────────────────────────────
async function seedFullTournament(opts: {
  sportName: string;
  tournamentLabel: string;
  status: TournamentStatus;
  startOffset: number; // ms from now (negative = past)
  location: string;
  youtubePrefix?: string;
}) {
  const { sportName, tournamentLabel, status, startOffset, location, youtubePrefix } = opts;

  const sport = await prisma.sport.findUnique({ where: { name: sportName } });
  if (!sport) return;

  const tName = `ราชภัฏเกมส์ — ${sportName} (${tournamentLabel})`;
  const tournament = await prisma.tournament.upsert({
    where: { name: tName } as any,
    update: { status, location },
    create: {
      name: tName,
      sportId: sport.id,
      athleteGroup: null,
      status,
      location,
      startDate: new Date(Date.now() + startOffset),
      endDate: hoursFromNow(24 * 3),
    },
  });

  // สร้างทีมจาก 11 มหาวิทยาลัย
  const teams = [];
  for (let i = 0; i < UNIVERSITIES.length; i++) {
    const univ = UNIVERSITIES[i];
    const teamName = `${univ.short} — ${sportName}`;
    const team = await prisma.team.upsert({
      where: { name_sportId: { name: teamName, sportId: sport.id } } as any,
      update: { tournamentId: tournament.id },
      create: {
        name: teamName,
        university: univ.name,
        universityShort: univ.short,
        seed: i + 1,
        sportId: sport.id,
        tournamentId: tournament.id,
      },
    });
    teams.push(team);
  }

  // สร้าง Single Elimination bracket สำหรับ 11 ทีม → nextPow2 = 16 → 5 byes
  const n = teams.length; // 11
  const size = nextPow2(n); // 16
  const totalRounds = Math.log2(size); // 4

  // สร้าง match slots ทุก round ก่อน (ยังไม่มีทีม)
  type MatchSlot = {
    dbId?: string;
    round: number;
    matchNumber: number;
    teamAId: string | null;
    teamBId: string | null;
    winnerId: string | null;
    status: MatchStatus;
    isBye: boolean;
  };

  const allSlots: MatchSlot[] = [];
  for (let r = 1; r <= totalRounds; r++) {
    const count = size / Math.pow(2, r);
    for (let i = 0; i < count; i++) {
      allSlots.push({ round: r, matchNumber: i + 1, teamAId: null, teamBId: null, winnerId: null, status: MatchStatus.PENDING, isBye: false });
    }
  }

  // ลบ match เก่าของ tournament นี้
  await prisma.matchSet.deleteMany({ where: { match: { tournamentId: tournament.id } } });
  await prisma.match.deleteMany({ where: { tournamentId: tournament.id } });

  // กำหนดทีมใน round 1 ด้วย seeding
  // seed 1 vs 16, 2 vs 15, 3 vs 14 …
  const r1Slots = allSlots.filter((s) => s.round === 1);
  const seeded = [...teams];
  // pad ด้วย null สำหรับ bye
  while (seeded.length < size) seeded.push(null as any);

  // จับคู่ standard seeding
  const pairs: [typeof teams[0] | null, typeof teams[0] | null][] = [];
  let lo = 0, hi = size - 1;
  while (lo < hi) { pairs.push([seeded[lo], seeded[hi]]); lo++; hi--; }

  for (let i = 0; i < r1Slots.length; i++) {
    const [ta, tb] = pairs[i] ?? [null, null];
    r1Slots[i].teamAId = ta?.id ?? null;
    r1Slots[i].teamBId = tb?.id ?? null;

    // ถ้าเป็น bye (tb = null) → ทีม A ชนะอัตโนมัติ
    if (ta && !tb) {
      r1Slots[i].isBye = true;
      r1Slots[i].winnerId = ta.id;
      r1Slots[i].status = MatchStatus.FINISHED;
    }
  }

  // บันทึก match ทั้งหมด และเก็บ id
  // Timing: แต่ละ round ห่างกัน 90 นาที
  // round 1 เริ่มตาม startOffset, round 2 = startOffset + 90min, เป็นต้น
  // แมทช์ใน round เดียวกันห่างกัน 20 นาที (กรณีเล่นสนามเดียว)
  const ROUND_GAP_MS = 90 * 60 * 1000;   // 90 นาทีต่อ round
  const MATCH_GAP_MS = 20 * 60 * 1000;   // 20 นาทีระหว่างแมทช์ในรอบเดียวกัน

  const created: { id: string; round: number; matchNumber: number }[] = [];

  for (const slot of allSlots) {
    // startTime = base + (round-1)*90min + (matchNumber-1)*20min
    const startTime = new Date(
      Date.now() + startOffset
      + (slot.round - 1) * ROUND_GAP_MS
      + (slot.matchNumber - 1) * MATCH_GAP_MS
    );

    const isPast = startTime <= new Date();
    const isOngoingTournament = status === TournamentStatus.ONGOING;

    // สถานะแมทช์
    let matchStatus: MatchStatus;
    if (slot.isBye) {
      matchStatus = MatchStatus.FINISHED;
    } else if (isPast && isOngoingTournament) {
      matchStatus = MatchStatus.ONGOING;
    } else {
      matchStatus = MatchStatus.PENDING;
    }

    // เปิด isLive เฉพาะแมทช์ที่มีทั้งสองทีม, กำลังแข่ง, และยังไม่เกิน 3 ชั่วโมง
    const isLive =
      !slot.isBye &&
      slot.teamAId !== null &&
      slot.teamBId !== null &&
      matchStatus === MatchStatus.ONGOING &&
      isOngoingTournament &&
      startTime.getTime() > Date.now() - 3 * 60 * 60 * 1000;

    const m = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        teamAId: slot.teamAId,
        teamBId: slot.teamBId,
        winnerId: slot.winnerId,
        round: slot.round,
        matchNumber: slot.matchNumber,
        status: matchStatus,
        isLive,
        location,
        startTime,
        youtubeUrl: slot.round === totalRounds ? youtubePrefix : undefined,
      },
    });
    created.push({ id: m.id, round: m.round, matchNumber: m.matchNumber });
  }

  // ผูก nextMatchId: match round r, matchNumber i → round r+1, matchNumber ceil(i/2)
  for (const m of created) {
    if (m.round === totalRounds) continue;
    const nextMatchNumber = Math.ceil(m.matchNumber / 2);
    const next = created.find((x) => x.round === m.round + 1 && x.matchNumber === nextMatchNumber);
    if (next) {
      await prisma.match.update({ where: { id: m.id }, data: { nextMatchId: next.id } });
    }
  }

  // ส่ง bye winner ขึ้น round ถัดไป
  for (const slot of allSlots.filter((s) => s.isBye && s.winnerId)) {
    const current = created.find((c) => c.round === slot.round && c.matchNumber === slot.matchNumber);
    if (!current) continue;
    const dbMatch = await prisma.match.findUnique({ where: { id: current.id } });
    if (!dbMatch?.nextMatchId) continue;
    const nextMatch = await prisma.match.findUnique({ where: { id: dbMatch.nextMatchId } });
    if (!nextMatch) continue;
    if (!nextMatch.teamAId) {
      await prisma.match.update({ where: { id: nextMatch.id }, data: { teamAId: slot.winnerId } });
    } else if (!nextMatch.teamBId) {
      await prisma.match.update({ where: { id: nextMatch.id }, data: { teamBId: slot.winnerId } });
    }
  }

  console.log(`   ✓ ${tName}: ${teams.length} ทีม, ${created.length} แมทช์`);
}

function hoursAgo(h: number) {
  return h * 60 * 60 * 1000;
}

// ─── Run ──────────────────────────────────────────────────────────────────────
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
