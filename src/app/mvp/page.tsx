import Link from "next/link";

const SYSTEM_NAME = "ระบบบริหารจัดการแข่งขันกีฬาบุคลากร\nมหาวิทยาลัยราชภัฏภาคอีสาน";

const CAPABILITIES = [
  {
    icon: "🏟️",
    title: "การจัดการแข่งขัน",
    headline: "จัดสายและตารางแข่งได้ในไม่กี่คลิก",
    points: [
      "รองรับ 16 ชนิดกีฬา แบ่งชาย · หญิง · ผสม",
      "จับฉลากสายการแข่งขันพร้อม animation โปร่งใส",
      "สร้าง bracket อัตโนมัติ รองรับ bye และ wildcard",
      "ผลแข่งขันวิ่งขึ้น bracket รอบถัดไปอัตโนมัติ",
    ],
    color: "from-blue-600 to-blue-700",
    light: "bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    icon: "👥",
    title: "การลงทะเบียน",
    headline: "บุคลากร ทีม และนักกีฬาจาก 11 มหาวิทยาลัย",
    points: [
      "ลงทะเบียนนักกีฬาแยกตาม มหาวิทยาลัย · ประเภท",
      "ผู้จัดการทีมดูแลข้อมูลทีมของตนเองได้",
      "เจ้าหน้าที่เจ้าภาพตรวจสอบและอนุมัติ",
      "รองรับทุก role: Admin · Staff · Manager · Athlete · Visitor",
    ],
    color: "from-purple-600 to-purple-700",
    light: "bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    icon: "📊",
    title: "การรายงานผล",
    headline: "คะแนนสดทุกนาที ตารางคะแนนครบถ้วน",
    points: [
      "Live score อัปเดตทุก 5 วินาที ไม่ต้อง refresh",
      "รองรับ 3 รูปแบบ: นับแต้ม · นับเซต · นับรวม",
      "เจ้าหน้าที่บันทึกคะแนนผ่านหน้าจอเดียว",
      "ออกเกียรติบัตร PDF ได้ทันทีเมื่อการแข่งขันสิ้นสุด",
    ],
    color: "from-green-600 to-green-700",
    light: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  {
    icon: "📣",
    title: "การสื่อสาร",
    headline: "ทุกคนรู้ข่าวพร้อมกัน ทุกที่ทุกเวลา",
    points: [
      "ถ่ายทอดสดผ่าน YouTube ฝังในระบบอัตโนมัติ",
      "แจ้งเตือน push ถึงผู้ใช้รายบุคคลหรือทั้งหมด",
      "แกลเลอรีภาพกิจกรรม + ช่องทางติดต่อ LINE OA",
      "ประกาศข่าวสารและกำหนดการจากส่วนกลาง",
    ],
    color: "from-orange-500 to-orange-600",
    light: "bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
  },
  {
    icon: "🗺️",
    title: "ระบบอำนวยความสะดวก",
    headline: "รู้จุด รู้ทาง เข้าถึงได้ทุกคน",
    points: [
      "แผนที่จุดอำนวยความสะดวกภายในมหาวิทยาลัย",
      "พิกัด GPS พร้อมลิงก์นำทาง Google Maps ทันที",
      "ครอบคลุม: สนามแข่ง · ที่จอดรถ · ห้องน้ำ · จุดปฐมพยาบาล",
      "เข้าถึงได้โดยไม่ต้องล็อกอิน — ทุก role ใช้ได้",
    ],
    color: "from-teal-600 to-teal-700",
    light: "bg-teal-50 border-teal-200",
    dot: "bg-teal-500",
  },
];

const ROLES = [
  {
    icon: "👑",
    label: "Admin",
    desc: "ควบคุมระบบทั้งหมด",
    account: "admin@rmu.ac.th",
    color: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-700",
  },
  {
    icon: "⚙️",
    label: "Staff",
    desc: "บันทึกคะแนน · จัดการแมทช์",
    account: "staff1@rmu.ac.th",
    color: "border-blue-300 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    icon: "🤝",
    label: "Manager",
    desc: "ดูแลทีมของมหาวิทยาลัยตนเอง",
    account: "manager@rmu.ac.th",
    color: "border-purple-300 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    icon: "🏃",
    label: "Athlete",
    desc: "ดูตาราง · รับเกียรติบัตร",
    account: "athlete.student@rmu.ac.th",
    color: "border-green-300 bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
  {
    icon: "👥",
    label: "Visitor",
    desc: "ดูผลแข่ง · โหวต · แผนที่",
    account: "visitor@gmail.com",
    color: "border-gray-300 bg-gray-50",
    badge: "bg-gray-100 text-gray-700",
  },
];

const SPORTS_COUNT = 16;
const UNIV_COUNT = 11;
const TOURNAMENT_COUNT = 25;

export default function MvpPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="bg-linear-to-br from-blue-800 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            MVP — พร้อมใช้งาน
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight whitespace-pre-line">
            {SYSTEM_NAME}
          </h1>
          <p className="text-blue-200 text-lg max-w-xl mx-auto leading-relaxed">
            ระบบครบวงจรสำหรับจัดการแข่งขัน รายงานผลสด และสื่อสารกับผู้เข้าร่วม
            จาก {UNIV_COUNT} มหาวิทยาลัยราชภัฏภาคอีสาน
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 pt-4">
            {[
              { value: `${UNIV_COUNT}`, label: "มหาวิทยาลัย" },
              { value: `${SPORTS_COUNT}`, label: "ชนิดกีฬา" },
              { value: `${TOURNAMENT_COUNT}+`, label: "รายการแข่งขัน" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-blue-300 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-white text-blue-800 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
            >
              ทดลองใช้งาน →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4 Capabilities ───────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-5">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">ความสามารถหลักของระบบ</h2>
          <p className="text-gray-500 text-sm mt-1">ครอบคลุมทุกขั้นตอนตั้งแต่เปิดรายการจนปิดการแข่งขัน</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CAPABILITIES.map((cap, i) => (
            <div
              key={cap.title}
              className={`rounded-2xl border-2 overflow-hidden ${cap.light} ${
                CAPABILITIES.length % 2 !== 0 && i === CAPABILITIES.length - 1
                  ? "sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full"
                  : ""
              }`}
            >
              {/* Card header */}
              <div className={`bg-linear-to-r ${cap.color} px-5 py-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cap.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-base">{cap.title}</h3>
                    <p className="text-white/80 text-xs leading-tight">{cap.headline}</p>
                  </div>
                </div>
              </div>
              {/* Points */}
              <div className="px-5 py-4">
                <ul className="space-y-2">
                  {cap.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cap.dot}`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Who uses it ───────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">ผู้ใช้งานและสิทธิ์</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <div key={r.label} className={`rounded-xl border-2 p-4 ${r.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{r.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.badge}`}>
                    {r.label}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{r.desc}</p>
                <p className="text-xs text-gray-400 font-mono mt-1.5">{r.account}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Test accounts quick ref ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">บัญชีทดสอบ</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wider">มหาวิทยาลัย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { email: "admin@rmu.ac.th",              role: "ADMIN",   univ: "มรม. (เจ้าภาพ)" },
                { email: "staff1@rmu.ac.th",             role: "STAFF",   univ: "มรม." },
                { email: "manager@rmu.ac.th",            role: "MANAGER", univ: "มรม." },
                { email: "athlete.student@rmu.ac.th",    role: "ATHLETE", univ: "มรม." },
                { email: "visitor@gmail.com",            role: "VISITOR", univ: "—" },
                { email: "manager@nrru.ac.th",           role: "MANAGER", univ: "มรนม." },
              ].map((acc) => (
                <tr key={acc.email} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-blue-700 text-xs">{acc.email}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                      {acc.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{acc.univ}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              เปลี่ยน <code className="bg-gray-200 px-1 rounded font-mono">rmu</code> →{" "}
              <code className="bg-gray-200 px-1 rounded font-mono">cpru / bru / rru / lru / sskru / snru / srru / udru / ubru / nrru</code>{" "}
              สำหรับ 10 มหาวิทยาลัยที่เหลือ
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/login"
            className="inline-block px-10 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-base rounded-2xl shadow-lg transition-colors"
          >
            🚀 เริ่มใช้งาน →
          </Link>
          <p className="text-gray-400 text-xs mt-3">ไม่ต้องสมัคร · ใช้ email ด้านบนเข้าสู่ระบบได้เลย</p>
        </div>
      </div>

    </div>
  );
}
