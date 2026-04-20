import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMatchStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "รอการแข่งขัน",
    ONGOING: "กำลังแข่ง",
    FINISHED: "จบแล้ว",
  };
  return labels[status] ?? status;
}

export function getMatchStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-600",
    ONGOING: "bg-green-100 text-green-700",
    FINISHED: "bg-blue-100 text-blue-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getTournamentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SETUP: "เตรียมการ",
    ONGOING: "กำลังดำเนินการ",
    FINISHED: "จบแล้ว",
  };
  return labels[status] ?? status;
}

export function getScoreTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SIMPLE: "นับคะแนนรวม",
    POINT: "นับแต้มต่อเนื่อง",
    SET: "นับเซต",
  };
  return labels[type] ?? type;
}

export function getSportCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    TEAM: "กีฬาทีม",
    INDIVIDUAL: "กีฬาบุคคล",
    COMBAT: "กีฬาต่อสู้",
    OTHER: "กีฬาอื่นๆ",
  };
  return labels[category] ?? category;
}

export function getSportCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    TEAM: "👥",
    INDIVIDUAL: "🏃",
    COMBAT: "🥊",
    OTHER: "🎯",
  };
  return icons[category] ?? "🏅";
}
