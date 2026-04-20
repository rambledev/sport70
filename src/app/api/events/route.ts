import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    include: {
      _count: { select: { registrations: true } },
    },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const event = await prisma.event.create({
    data: {
      name: data.name,
      description: data.description,
      location: data.location,
      startTime: new Date(data.startTime),
      endTime: data.endTime ? new Date(data.endTime) : undefined,
      maxGuests: data.maxGuests,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
