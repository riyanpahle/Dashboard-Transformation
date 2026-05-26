import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const program = await prisma.workProgram.findUnique({
      where: { id },
      include: { 
        team: true,
        meetings: {
          orderBy: { date: 'asc' }
        }
      }
    });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(program);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch program" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { progress } = body;

  try {
    const updated = await prisma.workProgram.update({
      where: { id },
      data: { progress }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const updated = await prisma.workProgram.update({
      where: { id },
      data: {
        no: body.no,
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
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.meeting.deleteMany({ where: { workProgramId: id } });
    await prisma.workProgram.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
