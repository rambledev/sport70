import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { id },
    include: { user: true, template: true },
  });

  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background
  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.97, 0.97, 1) });

  // Border
  page.drawRectangle({
    x: 20, y: 20, width: width - 40, height: height - 40,
    borderColor: rgb(0.2, 0.4, 0.8), borderWidth: 4,
  });
  page.drawRectangle({
    x: 30, y: 30, width: width - 60, height: height - 60,
    borderColor: rgb(0.2, 0.4, 0.8), borderWidth: 1,
  });

  // Header
  page.drawText("CERTIFICATE OF PARTICIPATION", {
    x: width / 2 - 200, y: height - 100,
    font, size: 28, color: rgb(0.1, 0.2, 0.6),
  });

  page.drawText("RMU Sports Games 2024", {
    x: width / 2 - 100, y: height - 135,
    font: fontRegular, size: 16, color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText("This is to certify that", {
    x: width / 2 - 70, y: height - 200,
    font: fontRegular, size: 14, color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(cert.user.name, {
    x: width / 2 - (cert.user.name.length * 11), y: height - 250,
    font, size: 36, color: rgb(0.1, 0.2, 0.6),
  });

  // Underline
  page.drawLine({
    start: { x: 150, y: height - 260 },
    end: { x: width - 150, y: height - 260 },
    thickness: 1.5, color: rgb(0.1, 0.2, 0.6),
  });

  if (cert.sport) {
    page.drawText(`has participated in ${cert.sport}`, {
      x: width / 2 - 100, y: height - 300,
      font: fontRegular, size: 14, color: rgb(0.3, 0.3, 0.3),
    });
  }

  if (cert.position) {
    page.drawText(`Position: ${cert.position}`, {
      x: width / 2 - 60, y: height - 325,
      font: fontRegular, size: 13, color: rgb(0.3, 0.3, 0.3),
    });
  }

  if (cert.event) {
    page.drawText(cert.event, {
      x: width / 2 - (cert.event.length * 4.5), y: height - 355,
      font, size: 16, color: rgb(0.2, 0.4, 0.2),
    });
  }

  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
  page.drawText(`Issued: ${issuedDate}`, {
    x: width / 2 - 70, y: height - 420,
    font: fontRegular, size: 11, color: rgb(0.5, 0.5, 0.5),
  });

  // Footer lines
  page.drawLine({ start: { x: 150, y: 100 }, end: { x: 350, y: 100 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
  page.drawLine({ start: { x: 490, y: 100 }, end: { x: 690, y: 100 }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("President", { x: 215, y: 85, font: fontRegular, size: 11, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("Director of Sports", { x: 543, y: 85, font: fontRegular, size: 11, color: rgb(0.5, 0.5, 0.5) });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${cert.user.name.replace(/\s/g, "_")}.pdf"`,
    },
  });
}
