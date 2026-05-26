const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const teamA = await prisma.team.create({ data: { name: 'Tim A' } });
  const teamB = await prisma.team.create({ data: { name: 'Tim B' } });
  const teamC = await prisma.team.create({ data: { name: 'Tim C' } });

  await prisma.user.createMany({
    data: [
      { name: 'Kepala Divisi', email: 'kadiv@dtp.com', role: 'Kepala Divisi', teamId: null },
      { name: 'Manager A', email: 'managera@dtp.com', role: 'Manager', teamId: teamA.id },
      { name: 'Staff A1', email: 'staffa1@dtp.com', role: 'Staff', teamId: teamA.id },
      { name: 'Staff A2', email: 'staffa2@dtp.com', role: 'Staff', teamId: teamA.id },
      { name: 'Manager B', email: 'managerb@dtp.com', role: 'Manager', teamId: teamB.id },
      { name: 'Staff B1', email: 'staffb1@dtp.com', role: 'Staff', teamId: teamB.id },
      { name: 'Staff B2', email: 'staffb2@dtp.com', role: 'Staff', teamId: teamB.id },
      { name: 'Manager C1', email: 'managerc1@dtp.com', role: 'Manager', teamId: teamC.id },
      { name: 'Manager C2', email: 'managerc2@dtp.com', role: 'Manager', teamId: teamC.id },
      { name: 'Staff C1', email: 'staffc1@dtp.com', role: 'Staff', teamId: teamC.id },
      { name: 'Staff C2', email: 'staffc2@dtp.com', role: 'Staff', teamId: teamC.id },
      { name: 'Staff C3', email: 'staffc3@dtp.com', role: 'Staff', teamId: teamC.id },
    ]
  });

  console.log('Seed berhasil!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
