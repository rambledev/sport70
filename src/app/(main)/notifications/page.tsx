"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Notification { id: string; title: string; message: string; isRead: boolean; createdAt: string; }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifications(data); setLoading(false); });
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  async function markAllRead() {
    await Promise.all(notifications.filter((n) => !n.isRead).map((n) => markRead(n.id)));
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔔 การแจ้งเตือน</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} ยังไม่ได้อ่าน</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">
            อ่านทั้งหมด
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">กำลังโหลด...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔕</p>
          <p className="text-gray-500">ไม่มีการแจ้งเตือน</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-colors ${!notif.isRead ? "border-blue-200 bg-blue-50" : ""}`}
              onClick={() => !notif.isRead && markRead(notif.id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? "bg-blue-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}>
                      {notif.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString("th-TH")}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      ใหม่
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
