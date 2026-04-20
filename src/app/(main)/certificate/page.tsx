"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string; sport?: string; position?: string; event?: string;
  issuedAt: string;
  user: { name: string; email: string };
  template: { name: string; type: string };
}

const typeIcon: Record<string, string> = {
  ATHLETE: "🏅",
  COACH: "🎯",
  MANAGER: "📋",
};

export default function CertificatePage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => { setCerts(data); setLoading(false); });
  }, []);

  function downloadCert(id: string) {
    window.open(`/api/certificates/${id}/download`, "_blank");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏅 เกียรติบัตรของฉัน</h1>
        <p className="text-gray-500 mt-1">เกียรติบัตรที่ได้รับจากการเข้าร่วมกิจกรรม</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-500">ยังไม่มีเกียรติบัตร</p>
          <p className="text-sm text-gray-400 mt-1">เกียรติบัตรจะปรากฏที่นี่หลังจากเข้าร่วมกิจกรรม</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((cert) => (
            <Card key={cert.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Certificate Preview */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white text-center">
                <div className="text-4xl mb-2">{typeIcon[cert.template.type] ?? "🏅"}</div>
                <p className="font-bold text-lg leading-tight">{cert.template.name}</p>
                <p className="text-blue-200 text-sm mt-1">RMU Sports Games 2024</p>
              </div>

              <CardContent className="py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-20">ผู้รับ</span>
                    <span className="text-sm font-medium text-gray-900">{cert.user.name}</span>
                  </div>
                  {cert.sport && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">กีฬา</span>
                      <span className="text-sm text-gray-700">{cert.sport}</span>
                    </div>
                  )}
                  {cert.position && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">ตำแหน่ง</span>
                      <span className="text-sm text-gray-700">{cert.position}</span>
                    </div>
                  )}
                  {cert.event && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-20">กิจกรรม</span>
                      <span className="text-sm text-gray-700 truncate flex-1">{cert.event}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 w-20">วันที่</span>
                    <span className="text-sm text-gray-500">
                      {new Date(cert.issuedAt).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => downloadCert(cert.id)}
                >
                  ⬇ ดาวน์โหลด PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
