import { prisma } from "@/lib/prisma";

export async function getDashboardData(){
  const currentDate = new Date();

  const wibDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(currentDate);

  const [year, month, day] = wibDate.split("-").map(Number);

  const startDate = new Date(
    Date.UTC(year, month - 1, day, -7, 0, 0)
  );

  const endDate = new Date(
    Date.UTC(year, month - 1, day + 1, -7, 0, 0)
  );
  
  const yesterdayStartDate = new Date(
    Date.UTC(year, month - 1, day - 1, -7, 0, 0)
  );

  const [
    todaySales,
    todayQuantity,
    recentTransactions,
    yesterdaySales,
    yesterdayQuantity
  ] = await Promise.all([
    await prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        }
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    }),

    await prisma.transactionItem.aggregate({
      where: {
        transaction: {
          createdAt: {
            gte: startDate,
            lt: endDate,
          }
        }
      },
      _sum: {
        quantity: true,
      },
    }),

    await prisma.transaction.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    await prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: yesterdayStartDate,
          lt: startDate,
        }
      },
      _sum: {
        total: true,
      },
      _count: {
        _all: true,
      },
    }),

    await prisma.transactionItem.aggregate({
      where: {
        transaction: {
          createdAt: {
            gte: yesterdayStartDate,
            lt: startDate,
          }
        }
      },
      _sum: {
        quantity: true,
      },
    }),
  ]);
  
  const currentSales = Number(todaySales._sum.total ?? 0);
  const beforeSales = Number(yesterdaySales._sum.total ?? 0);
  const salesPercentage = ((currentSales - beforeSales) / beforeSales) * 100;
  
  const currentTransactions = todaySales._count._all ?? 0;
  const beforeTransactions = yesterdaySales._count._all ?? 0;
  const transactionsPercentage = ((currentTransactions - beforeTransactions) / beforeTransactions) * 100;

  const currentQuantity = todayQuantity._sum.quantity ?? 0;
  const beforeQuantity = yesterdayQuantity._sum.quantity ?? 0;
  const quantityPercentage = ((currentQuantity - beforeQuantity) / beforeQuantity) * 100;

  return {
    todaySales: Number(todaySales._sum.total ?? 0),
    todayTransactions: todaySales._count._all ?? 0,
    todayQuantity: todayQuantity._sum.quantity ?? 0,
    recentTransactions: recentTransactions.map((item) => ({
      ...item,
      total: Number(item.total),
    })),
    salesPercentage,
    transactionsPercentage,
    quantityPercentage,
  }
}