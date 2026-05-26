import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const prisma = new PrismaClient();

async function getActor() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const actorEmail = session?.user?.email || "Unknown User";
  const actorName = session?.user?.user_metadata?.full_name || actorEmail;
  return { actorEmail, actorName };
}

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
  const actor = await getActor();

  try {
    const updated = await prisma.workProgram.update({
      where: { id },
      data: { progress }
    });

    await prisma.activityLog.create({
      data: {
        actorEmail: actor.actorEmail,
        actorName: actor.actorName,
        action: "MEMPERBARUI",
        entityType: "WorkProgram",
        entityTitle: updated.programKerja,
        details: `Progress diperbarui menjadi ${progress}%`,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const actor = await getActor();

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

    await prisma.activityLog.create({
      data: {
        actorEmail: actor.actorEmail,
        actorName: actor.actorName,
        action: "MENGEDIT",
        entityType: "WorkProgram",
        entityTitle: updated.programKerja,
        details: "Detail program kerja diedit",
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getActor();

  try {
    const program = await prisma.workProgram.findUnique({ where: { id } });
    if (!program) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.meeting.deleteMany({ where: { workProgramId: id } });
    await prisma.workProgram.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        actorEmail: actor.actorEmail,
        actorName: actor.actorName,
        action: "MENGHAPUS",
        entityType: "WorkProgram",
        entityTitle: program.programKerja,
        details: "Program kerja telah dihapus",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
