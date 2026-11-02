import { Navbar } from "@/app/components/Navbar";
import { 
  Banknote, 
  ShoppingCart, 
  PackageCheck,
  Calendar
} from 'lucide-react';
import { Background } from "../components/Background";

export default function Dashboard(){
  const date = new Date();

  const cards = [
    {
      icon: (<Banknote size={26} className="p-1 bg-gray-200 rounded text-gray-500" />),
      title: "Total Penjualan",
      amount: {
        text: 1500.25,
        currency: true,
        text2: "",
      },
      percentage: {
        text: "+5% than yesterday",
        green: true
      }
    },
    {
      icon: (<ShoppingCart size={26} className="p-1 bg-gray-200 rounded text-gray-500" />),
      title: "Jumlah Transaksi",
      amount: {
        text: 68,
        currency: false,
        text2: "transaksi",
      },
      percentage: {
        text: "-10% than yesterday",
        green: false
      }
    },
    {
      icon: (<PackageCheck size={26} className="p-1 bg-gray-200 rounded text-gray-500" />),
      title: "Produk Terjual",
      amount: {
        text: 350,
        currency: false,
        text2: "pcs",
      },
      percentage: {
        text: "+15% than yesterday",
        green: true
      }
    },
  ]

  const transactions = [
    {
      id: "TRX-001",
      price: 250000,
      time: "10:00"
    },
    {
      id: "TRX-002",
      price: 350000,
      time: "11:00"
    },
    {
      id: "TRX-003",
      price: 150000,
      time: "12:00"
    },
    {
      id: "TRX-004",
      price: 200000,
      time: "13:00"
    },
    {
      id: "TRX-005",
      price: 100000,
      time: "14:00"
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
      <Background />

      <div className="flex min-h-screen">
        <Navbar />

        <section className="flex flex-col flex-1 min-w-0 gap-4 p-4 py-18 sm:p-12 sm:py-8 max-w-250">
          <div>
            <h1 className="font-bold text-2xl">
              Selamat Datang!
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">Ini adalah ringkasan aktivitas toko hari ini.</p>
            
            <div className="flex items-center gap-1.5 mt-2 text-[var(--text-secondary)] text-[0.85rem]">
              <Calendar size={18} />
              <p className="mt-[0.2rem]">{date.getDate()} - {date.getMonth() + 1} - {date.getFullYear()}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
            {cards.map((item) => (
              <div key={item.title} className="relative rounded-xl p-4 bg-[var(--surface)] shadow-lg">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <p className="font-semibold text-[.9em]">{item.title}</p>
                </div>

                {/* <EllipsisVertical size={16} className="absolute top-5 right-2.5" /> */}
                
                <div className="flex justify-between mt-4">
                  <p className="flex items-center gap-1.5 font-semibold text-2xl">
                    {item.amount.currency ? "$" : ""}{item.amount.text} <span className="text-sm text-[var(--text-secondary)]">{item.amount.text2}</span>
                  </p>
                  
                  <p 
                    className={`p-0.5 px-2 text-[.7em] ${item.percentage.green ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} rounded text-center font-[550] self-center`}
                  >
                      {item.percentage.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
            <div className="flex justify-between items-center">
              <p className="font-semibold">Transaksi Terbaru</p>
              <a className="text-blue-600 text-sm">Lihat semua</a>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
             {transactions.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <p className="font-medium">{item.id}</p>
                  <p className="text-sm text-[var(--text-secondary)] font-semibold">{item.time}</p>
                </div>

                <p className="font-semibold">{formatRupiah(item.price)}</p>
              </div>
             ))}
            </div>
          </div>

        </section>
      </div>
    </>
  );
}