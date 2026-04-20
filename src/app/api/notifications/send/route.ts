import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, title, message } = await req.json();
  const notif = await prisma.notification.create({
    data: { userId, title, message },
  });
  return NextResponse.json(notif, { status: 201 });
}
