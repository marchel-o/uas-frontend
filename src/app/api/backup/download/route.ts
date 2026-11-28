import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const [
      users,
      categories,
      products,
      transactions,
      transactionItem,
      payment,
      supplier,
      stockMovement,
    ] = await prisma.$transaction([
      prisma.user.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.transaction.findMany(),
      prisma.transactionItem.findMany(),
      prisma.payment.findMany(),
      prisma.supplier.findMany(),
      prisma.stockMovement.findMany(),
    ]);

    const backupPayload = {
      meta: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        source: 'neon-prisma',
      },
      data: {
        users,
        categories,
        products,
        transactions,
        transactionItem,
        payment,
        supplier,
        stockMovement,
      },
    };

    const fileName = `backup-${new Date().toISOString().split('T')[0]}.json`;
    const jsonString = JSON.stringify(backupPayload, null, 2)

    const user = await requireAuth();
    await prisma.backupHistory.create({
      data: {
        action: 'Download',
        fileSize: Buffer.byteLength(jsonString, 'utf8'),
        userId: user.id,
      },
    });

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Gagal membuat file backup' }, { status: 500 });
  }
}