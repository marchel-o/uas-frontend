'use client'

import { Navbar } from "./components/Navbar";
import { 
  Banknote, 
  ShoppingCart, 
  PackageCheck,
  Calendar
} from 'lucide-react';

export default function Home() {
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

  
  return (
    <>
      <div className="fixed w-full h-full inset-0 bg-[var(--bg)] z-[-5]"></div>

      <div className="flex min-h-screen">
        <Navbar />

        <section className="flex flex-col flex-1 min-w-0 gap-4 p-4 py-18 md:p-12 md:py-8">
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

          <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
            <p className="font-semibold">Transaksi Terbaru</p>
            <table>
              <thead>
                <tr className="divide-y">
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                </tr>
              </tbody>
            </table>
          </div>

        </section>
      </div>
    </>
  );
}
