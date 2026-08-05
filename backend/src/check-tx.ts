import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.transaction.count();
  console.log('Total transactions in DB:', count);

  const latest = await prisma.transaction.findMany({
    take: 5,
    orderBy: { created_at: 'desc' }
  });
  console.log('Latest 5 transactions:');
  latest.forEach(tx => {
    console.log(`- ID: ${tx.id}, Invoice: ${tx.invoice_number}, Total: ${tx.total}, CreatedAt: ${tx.created_at.toISOString()}`);
  });

  const setting = await prisma.appSetting.findFirst();
  console.log('AppSetting:', setting);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
