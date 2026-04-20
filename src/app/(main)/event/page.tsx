"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

interface EventReg { going: number; notGoing: number; totalGuests: number; }
interface EventItem {
  id: string; name: string; description?: string; location?: string;
  startTime: string; endTime?: string; status: string; maxGuests?: number;
  _count: { registrations: number };
}

const statusColor: Record<string, "default" | "success" | "info" | "warning"> = {
  UPCOMING: "info",
  ONGOING: "success",
  FINISHED: "default",
};
const statusLabel: Record<string, string> = {
  UPCOMING: "กำลังจะมาถึง",
  ONGOING: "กำลังจัด",
  FINISHED: "จบแล้ว",
};

export default function EventPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [regData, setRegData] = useState<Record<string, EventReg>>({});
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }

  async function fetchReg(eventId: string) {
    const res = await fetch(`/api/events/${eventId}/register`);
    const data = await res.json();
    setRegData((prev) => ({ ...prev, [eventId]: data }));
  }

  useEffect(() => {
    fetchEvents().then(() => {
      // Fetch registration summary for each event
      events.forEach((e) => fetchReg(e.id));
    });
  }, []);

  useEffect(() => {
    events.forEach((e) => fetchReg(e.id));
  }, [events]);

  async function register(eventId: string, status: "GOING" | "NOT_GOING") {
    setRegistering(eventId);
    await fetch(`/api/events/${eventId}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, guests: 0 }),
    });
    await fetchReg(eventId);
    setRegistering(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🎉 กิจกรรม</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ไม่มีกิจกรรม</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {events.map((event) => {
            const reg = regData[event.id];
            return (
              <Card key={event.id} className="overflow-hidden">
                <div className={`h-2 ${
                  event.status === "ONGOING" ? "bg-green-500" :
                  event.status === "UPCOMING" ? "bg-blue-500" : "bg-gray-300"
                }`} />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-snug">{event.name}</CardTitle>
                    <Badge variant={statusColor[event.status]}>
                      {statusLabel[event.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}

                  <div className="space-y-1.5 text-sm text-gray-500">
                    {event.location && <p>📍 {event.location}</p>}
                    <p>🕐 เริ่ม: {formatDateTime(event.startTime)}</p>
                    {event.endTime && <p>🕕 สิ้นสุด: {formatDateTime(event.endTime)}</p>}
                    {event.maxGuests && <p>👥 รองรับ: {event.maxGuests} คน</p>}
                  </div>

                  {/* Registration summary */}
                  {reg && (
                    <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3">
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">{reg.going}</p>
                        <p className="text-xs text-gray-500">เข้าร่วม</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-red-500">{reg.notGoing}</p>
                        <p className="text-xs text-gray-500">ไม่เข้าร่วม</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-blue-600">{reg.totalGuests}</p>
                        <p className="text-xs text-gray-500">แขกรวม</p>
                      </div>
                    </div>
                  )}

                  {event.status === "UPCOMING" && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        onClick={() => register(event.id, "GOING")}
                        disabled={registering === event.id}
                        className="flex-1"
                      >
                        ✅ เข้าร่วม
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => register(event.id, "NOT_GOING")}
                        disabled={registering === event.id}
                        className="flex-1"
                      >
                        ❌ ไม่เข้าร่วม
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
