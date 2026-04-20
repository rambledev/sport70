import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status, guests, note } = await req.json();

  const registration = await prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId: id, userId: user.id } },
    create: { eventId: id, userId: user.id, status, guests: guests ?? 0, note },
    update: { status, guests: guests ?? 0, note },
  });

  return NextResponse.json(registration);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registrations = await prisma.eventRegistration.findMany({
    where: { eventId: id },
    include: { user: { select: { name: true, email: true } } },
  });
  const going = registrations.filter((r) => r.status === "GOING").length;
  const notGoing = registrations.filter((r) => r.status === "NOT_GOING").length;
  const totalGuests = registrations
    .filter((r) => r.status === "GOING")
    .reduce((sum, r) => sum + r.guests, 0);

  return NextResponse.json({ registrations, going, notGoing, totalGuests });
}
