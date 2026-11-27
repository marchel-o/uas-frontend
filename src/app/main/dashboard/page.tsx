import { getDashboardData } from '@/services/getDashboardData';
import { 
  Banknote, 
  ShoppingCart, 
  PackageCheck,
  Calendar
} from 'lucide-react';

export default async function Dashboard(){
  const currentDate = new Date();
  
  const { 
    todaySales,
    todayTransactions,
    todayQuantity,
    recentTransactions,
    salesPercentage,
    quantityPercentage,
    transactionsPercentage
  } = await getDashboardData();

  const cards = [
    {
      icon: (<Banknote size={26} nonScalingStroke strokeWidth={1.5} className="text-[var(--primary)] p-0.5" />),
      title: "Total Penjualan",
      amount: {
        text: todaySales,
        currency: true,
        text2: "",
      },
      percentage: {
        num: salesPercentage,
        text: `${salesPercentage.toFixed(0)}% than yesterday`,
        green: salesPercentage >= 0
      }
    },
    {
      icon: (<ShoppingCart size={26} nonScalingStroke strokeWidth={1.5} className="text-[var(--primary)] p-0.5" />),
      title: "Jumlah Transaksi",
      amount: {
        text: todayTransactions,
        currency: false,
        text2: "transaksi",
      },
      percentage: {
        num: transactionsPercentage,
        text: `${transactionsPercentage.toFixed(0)}% than yesterday`,
        green: transactionsPercentage >= 0
      }
    },
    {
      icon: (<PackageCheck size={26} nonScalingStroke strokeWidth={1.5} className="text-[var(--primary)] p-0.5" />),
      title: "Produk Terjual",
      amount: {
        text: todayQuantity,
        currency: false,
        text2: "pcs",
      },
      percentage: {
        num: quantityPercentage,
        text: `${quantityPercentage.toFixed(0)}% than yesterday`,
        green: quantityPercentage >= 0
      }
    },
  ]

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      <div>
        <h1 className="font-bold text-2xl">
          Selamat Datang!
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">Ini adalah ringkasan aktivitas toko hari ini.</p>
        
        <div className="flex items-center gap-1.5 mt-2 text-[var(--text-secondary)] text-[0.85rem]">
          <Calendar size={18} />
          <p className="mt-[0.2rem]">{currentDate.getDate()} - {currentDate.getMonth() + 1} - {currentDate.getFullYear()}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
        {cards.map((item, i) => (
          <div key={i} className="relative rounded-xl p-4 bg-[var(--surface)] shadow-lg">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded">
                {item.icon}
              </div>
              <p className="font-semibold text-[.95em]">{item.title}</p>
            </div>
            
            <div className="flex justify-between mt-4">
              <p className="flex items-center gap-1.5 font-semibold text-[1.2em] sm:text-2xl">
                {item.amount.currency ? formatRupiah(item.amount.text) : item.amount.text} 
                <span className="text-sm text-[var(--text-secondary)]">{item.amount.text2}</span>
              </p>
              
              <p 
                className={`p-0.5 px-2 text-[.6em] sm:text-[.7em] ${item.percentage.green ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} rounded text-center font-[550] self-center`}
              >
                  {Number.isFinite(item.percentage.num) ? `${item.percentage.green ? "+" : "-"}${item.percentage.text}` : "Belum Ada Pembanding"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Transaksi Terbaru</p>
          <a href='/main/history' className="text-blue-600 text-sm cursor-pointer">Lihat semua</a>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          {recentTransactions.map((item, i) => (
          <div key={item.id} className="flex justify-between">
            <div>
              <p className="font-medium text-[.95rem]">{item.invoice}</p>
              <p className="text-sm text-[var(--text-secondary)] font-semibold">
                {item.createdAt.toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }).replace(".", ':')}
              </p>
            </div>

            <p className="font-semibold">{formatRupiah(Number(item.total))}</p>
          </div>
          ))}
        </div>
      </div>
    </>
  );
}