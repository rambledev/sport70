import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      athleteProfile: true,
      managerProfile: true,
      staffProfile: true,
      personnelProfile: true,
      _count: { select: { certificates: true, notifications: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}
