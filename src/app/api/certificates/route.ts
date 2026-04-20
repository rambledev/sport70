import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = user.role === "ADMIN";
  const certificates = await prisma.certificate.findMany({
    where: isAdmin ? {} : { userId: user.id },
    include: {
      user: { select: { name: true, email: true } },
      template: true,
    },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json(certificates);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  // Auto-select template based on target user's role if not specified
  let templateId = data.templateId;
  if (!templateId || templateId === "PLACEHOLDER") {
    const targetUser = await prisma.user.findUnique({ where: { id: data.userId } });
    const templateType = targetUser?.role === "MANAGER" ? "MANAGER" : targetUser?.role === "STAFF" ? "COACH" : "ATHLETE";
    const template = await prisma.certificateTemplate.findFirst({ where: { type: templateType as any } });
    if (!template) return NextResponse.json({ error: "No template found" }, { status: 400 });
    templateId = template.id;
  }

  const certificate = await prisma.certificate.create({
    data: {
      userId: data.userId,
      templateId,
      sport: data.sport,
      position: data.position,
      event: data.event,
    },
    include: { user: true, template: true },
  });
  return NextResponse.json(certificate, { status: 201 });
}
