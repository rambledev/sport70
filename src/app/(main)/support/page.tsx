import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🎧 ช่วยเหลือและติดต่อ</h1>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💬</span> LINE Official Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              ติดต่อทีมงาน RMU Sports ผ่าน LINE OA ได้ตลอด 24 ชั่วโมง
            </p>
            <a
              href="https://line.me/R/ti/p/@rmugames"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 5.92 2 10.72c0 3.18 1.88 5.98 4.72 7.68l-.48 3.6 4.12-2.16c.52.08 1.06.12 1.64.12 5.52 0 10-3.92 10-8.72S17.52 2 12 2z" />
              </svg>
              เพิ่มเพื่อนใน LINE
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📞</span> ติดต่อโดยตรง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📱</span>
                <div>
                  <p className="font-medium text-gray-900">โทรศัพท์</p>
                  <p className="text-gray-500">043-XXX-XXXX (เวลาทำการ 08:00 - 17:00)</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="font-medium text-gray-900">อีเมล</p>
                  <p className="text-gray-500">sports@rmu.ac.th</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium text-gray-900">สถานที่</p>
                  <p className="text-gray-500">กองพลศึกษา มหาวิทยาลัยราชมงคลมหานคร</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">❓</span> คำถามที่พบบ่อย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { q: "ลงทะเบียนอย่างไร?", a: "ใช้ email เข้าสู่ระบบ แล้วเลือกบทบาทที่ต้องการ" },
                { q: "ดูผลการแข่งขัน LIVE ได้อย่างไร?", a: "ไปที่เมนู 'ถ่ายทอดสด' เพื่อดูผลแบบ real-time" },
                { q: "เกียรติบัตรอยู่ที่ไหน?", a: "ไปที่เมนู 'เกียรติบัตร' และกดดาวน์โหลด PDF" },
                { q: "โหวตได้กี่ครั้ง?", a: "โหวตได้คนละ 1 ครั้งเท่านั้น" },
              ].map((faq, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer font-medium text-gray-900 py-2 flex items-center justify-between">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-500 text-sm pb-2 pt-1 pl-2 border-l-2 border-blue-200">{faq.a}</p>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
