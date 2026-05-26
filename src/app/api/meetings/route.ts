import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    include: { 
      workProgram: {
        include: { team: true }
      } 
    },
    orderBy: { date: 'asc' }
  });
  return NextResponse.json(meetings);
}

export async function POST(request: Request) {
  const body = await request.json();
  
  try {
    const meeting = await prisma.meeting.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        description: body.description,
        notifyKepalaDivisi: body.notifyKepalaDivisi,
        workProgramId: body.workProgramId,
      },
      include: {
        workProgram: {
          include: { team: true }
        }
      }
    });
    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 });
  }
}
