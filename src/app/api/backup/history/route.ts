import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const history = await prisma.backupHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    })

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    console.error('Gagal memuat riwayat backup:', error);
    return NextResponse.json({ error: 'Gagal memuat riwayat backup' }, { status: 500 });
  }
}