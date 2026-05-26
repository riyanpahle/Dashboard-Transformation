import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const programs = await prisma.workProgram.findMany({
    include: { team: true },
    orderBy: { priority: 'asc' }
  });
  return NextResponse.json(programs);
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const newProgram = await prisma.workProgram.create({
      data: {
        no: body.no || "0",
        kategori: body.kategori,
        programKerja: body.programKerja,
        output: body.output,
        target: body.target,
        linkToRjpp: body.linkToRjpp,
        effortLevel: body.effortLevel,
        impactLevel: body.impactLevel,
        priority: body.priority,
        whatHasBeenDone: body.whatHasBeenDone,
        nextActivity: body.nextActivity,
        teamId: body.teamId,
      }
    });
    return NextResponse.json(newProgram);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create program" }, { status: 500 });
  }
}
