import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File backup tidak ditemukan' }, { status: 400 });
    }

    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed?.meta || !parsed?.data) {
      return NextResponse.json({ error: 'Format file backup tidak valid' }, { status: 400 });
    }

    const user = await requireAuth();

    const { 
      users = [],
      categories = [],
      products = [],
      transactions = [],
      transactionItem = [],
      payment = [],
      supplier = [],
      stockMovement = [],
     } = parsed.data;

    await prisma.$transaction(
      async (tx) => {
        await tx.transactionItem.deleteMany();
        await tx.payment.deleteMany();
        await tx.stockMovement.deleteMany();
        await tx.transaction.deleteMany();
        await tx.product.deleteMany();
        await tx.category.deleteMany();
        await tx.supplier.deleteMany();
        await tx.session.deleteMany();
        await tx.user.deleteMany();

        if (users.length) await tx.user.createMany({ data: users });
        if (categories.length) await tx.category.createMany({ data: categories });
        if (products.length) await tx.product.createMany({ data: products });
        if (transactions.length) await tx.transaction.createMany({ data: transactions });
        if (transactionItem.length) await tx.transactionItem.createMany({ data: transactionItem });
        if (payment.length) await tx.payment.createMany({ data: payment });
        if (supplier.length) await tx.supplier.createMany({ data: supplier });
        if (stockMovement.length) await tx.stockMovement.createMany({ data: stockMovement });

        await tx.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"Category"', 'id'), COALESCE((SELECT MAX(id) + 1 FROM "Category"), 1), false);`
        );
        await tx.$executeRawUnsafe(
          `SELECT setval(pg_get_serial_sequence('"Product"', 'id'), COALESCE((SELECT MAX(id) + 1 FROM "Product"), 1), false);`
        );
        
        await tx.backupHistory.create({
          data: {
            action: 'Restore',
            fileSize: file.size,
            userId: user.id,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    return NextResponse.json({ message: 'Restore database berhasil!' });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload data. Pastikan file JSON sesuai.' },
      { status: 500 }
    );
  }
}