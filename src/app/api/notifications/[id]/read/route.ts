import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notif = await prisma.notification.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json(notif);
}
