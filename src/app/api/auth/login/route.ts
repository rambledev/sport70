import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  const { email, name, role } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const userRole = (role as Role) || Role.VISITOR;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        role: userRole,
      },
    });

    // Create role-specific profile
    if (userRole === Role.ATHLETE) {
      await prisma.athleteProfile.create({ data: { userId: user.id } });
    } else if (userRole === Role.MANAGER) {
      await prisma.managerProfile.create({ data: { userId: user.id } });
    } else if (userRole === Role.STAFF) {
      await prisma.staffProfile.create({ data: { userId: user.id } });
    } else if (userRole === Role.PERSONNEL) {
      await prisma.personnelProfile.create({ data: { userId: user.id } });
    }
  } else if (role) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: userRole },
    });
  }

  const response = NextResponse.json({ user });
  response.cookies.set("userId", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });

  return response;
}
