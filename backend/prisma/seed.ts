import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database with categories and products...');

  // 1. Seed Users (Upsert)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const cashierPasswordHash = await bcrypt.hash('cashier123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPasswordHash,
      full_name: 'Admin User',
      role: Role.ADMIN,
    },
    create: {
      username: 'admin',
      password: adminPasswordHash,
      full_name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {
      password: cashierPasswordHash,
      full_name: 'John Cashier',
      role: Role.CASHIER,
    },
    create: {
      username: 'cashier',
      password: cashierPasswordHash,
      full_name: 'John Cashier',
      role: Role.CASHIER,
    },
  });

  console.log('Upserted Users:', { admin: admin.username, cashier: cashier.username });

  // 2. Define Categories and Products list
  const data = [
    {
      category: 'Coffee',
      products: [
        { name: 'Es Kopi Gula Aren', price: 13000 },
        { name: 'Es Kopi Pandan', price: 14000 },
        { name: 'Es Kopi Pistachio', price: 15000 },
        { name: 'Es Kopi Caramel', price: 14000 },
        { name: 'Es Kopi Butterscotch', price: 14000 },
        { name: 'Ice Americano', price: 12000 },
        { name: 'Ice Americano Berry', price: 15000 },
        { name: 'Ice Americano Peach', price: 15000 },
        { name: 'Hot Kopi Susu', price: 15000 },
      ],
    },
    {
      category: 'Non Coffee',
      products: [
        { name: 'Ice Chocolate', price: 15000 },
        { name: 'Ice Greentea', price: 15000 },
        { name: 'Vanilla Caramel Lotus', price: 15000 },
        { name: 'Vanilla Regal', price: 15000 },
        { name: 'Ice Lemon Tea', price: 15000 },
        { name: 'Hot Chocolate', price: 15000 },
        { name: 'Yoghurt Strawberry', price: 15000 },
        { name: 'Yoghurt Peach', price: 15000 },
      ],
    },
    {
      category: 'Matcha',
      products: [
        { name: 'Matcha Original', price: 12000 },
        { name: 'Matcha Latte', price: 15000 },
        { name: 'Matcha Pistachio', price: 17000 },
        { name: 'Matcha Butterscotch', price: 17000 },
        { name: 'Matcha Strawberry', price: 17000 },
        { name: 'Matcha Manggo', price: 17000 },
      ],
    },
    {
      category: 'Bottled Drinks',
      products: [
        { name: 'Cold White', price: 17000 },
        { name: 'Coffee 1 Liter', price: 65000 },
      ],
    },
  ];

  // 3. Perform Upsert for Categories and Products
  for (const item of data) {
    const category = await prisma.category.upsert({
      where: { name: item.category },
      update: {},
      create: { name: item.category },
    });

    for (const prod of item.products) {
      await prisma.product.upsert({
        where: { name: prod.name },
        update: {
          price: prod.price,
          category_id: category.id,
          is_active: true,
        },
        create: {
          name: prod.name,
          price: prod.price,
          category_id: category.id,
          is_active: true,
        },
      });
    }
  }

  console.log('Seeding products and categories complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
