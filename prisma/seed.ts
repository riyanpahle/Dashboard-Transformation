import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create Teams
  const timA = await prisma.team.create({ data: { name: 'Tim A' } })
  const timB = await prisma.team.create({ data: { name: 'Tim B' } })
  const timC = await prisma.team.create({ data: { name: 'Tim C' } })

  // Create Users
  await prisma.user.createMany({
    data: [
      { name: 'Bapak Kepala Divisi', email: 'kadiv@example.com', role: 'Kepala Divisi' },
      // Tim A: 1 Manager, 2 Staff
      { name: 'Manager A', email: 'managera@example.com', role: 'Manager', teamId: timA.id },
      { name: 'Staff A1', email: 'staffa1@example.com', role: 'Staff', teamId: timA.id },
      { name: 'Staff A2', email: 'staffa2@example.com', role: 'Staff', teamId: timA.id },
      // Tim B: 1 Manager, 2 Staff
      { name: 'Manager B', email: 'managerb@example.com', role: 'Manager', teamId: timB.id },
      { name: 'Staff B1', email: 'staffb1@example.com', role: 'Staff', teamId: timB.id },
      { name: 'Staff B2', email: 'staffb2@example.com', role: 'Staff', teamId: timB.id },
      // Tim C: 2 Manager, 3 Staff
      { name: 'Manager C1', email: 'managerc1@example.com', role: 'Manager', teamId: timC.id },
      { name: 'Manager C2', email: 'managerc2@example.com', role: 'Manager', teamId: timC.id },
      { name: 'Staff C1', email: 'staffc1@example.com', role: 'Staff', teamId: timC.id },
      { name: 'Staff C2', email: 'staffc2@example.com', role: 'Staff', teamId: timC.id },
      { name: 'Staff C3', email: 'staffc3@example.com', role: 'Staff', teamId: timC.id },
    ],
  })

  // Create dummy Work Programs for Tim A (from screenshot)
  await prisma.workProgram.create({
    data: {
      no: '1',
      kategori: 'Business',
      programKerja: 'Perbaikan End-to-End Sistem Asuransi Kredit Perdagangan',
      output: 'BMC, Kebutuhan Sistem',
      target: 'Des 2026',
      linkToRjpp: 'IS 3 - Pembaharuan dan pemeliharaan core system serta digitalisasi proses bisnis front-end dan back-end',
      effortLevel: 'High',
      impactLevel: 'High',
      priority: 'Medium',
      whatHasBeenDone: 'Jum\'at, 10 Mar 26 : Pembahasan Internal Tim A\nRabu, 15 Apr 26 : Penyampaian Value Proposition',
      nextActivity: 'M2 Mei 26 : Cari waktu pembahasan',
      progress: 40,
      teamId: timA.id,
    }
  })

  await prisma.workProgram.create({
    data: {
      no: '2',
      kategori: 'SDM',
      programKerja: 'Performance Appraisal BSC',
      output: 'BSC',
      target: 'Des 2026',
      linkToRjpp: 'IS 7 - Mengembangkan KPI yang tepat sasaran serta sistem performance reporting secara real time',
      effortLevel: 'Medium',
      impactLevel: 'High',
      priority: 'Medium',
      whatHasBeenDone: '',
      nextActivity: 'M2 Mei 26 : Koordinasi dengan SDM',
      progress: 10,
      teamId: timA.id,
    }
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
