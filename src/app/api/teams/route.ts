import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const teams = await prisma.team.findMany();
  return NextResponse.json(teams);
}
