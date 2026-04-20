import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: "bg-red-100 text-red-700",
    ATHLETE: "bg-blue-100 text-blue-700",
    MANAGER: "bg-green-100 text-green-700",
    STAFF: "bg-yellow-100 text-yellow-700",
    PERSONNEL: "bg-purple-100 text-purple-700",
    VISITOR: "bg-gray-100 text-gray-700",
  };
  return colors[role] ?? "bg-gray-100 text-gray-700";
}

export function getRoleDashboardPath(role: Role): string {
  return "/dashboard";
}
