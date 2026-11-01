import { ChevronRight, Database, Store, User } from "lucide-react";
import { Background } from "../components/Background";
import { Navbar } from "../components/Navbar";

export default function Settings(){
  return (
    <>
      <Background />

      <div className="flex min-h-screen">
        <Navbar />

        <section className="flex flex-col flex-1 min-w-0 gap-4 p-4 py-18 sm:p-12 sm:py-8 max-w-250">
          <h1 className="font-bold text-2xl">
            Pengaturan
          </h1>

          <div className="flex flex-col gap-3 rounded-xl p-4 bg-[var(--surface)] shadow-lg">

            <div className="flex items-center gap-5">
              <User size={18} />
              <p className="font-semibold">Profil Pengguna</p>
              <ChevronRight size={16} className="ml-auto" />
            </div>

            <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>

            <div className="flex items-center gap-5">
              <Store size={18} />
              <p className="font-semibold">Informasi Toko</p>
              <ChevronRight size={16} className="ml-auto" />
            </div>

            <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>
            
            <div className="flex items-center gap-5">
              <Database size={18} />
              <p className="font-semibold">Backup Data</p>
              <ChevronRight size={16} className="ml-auto" />
            </div>
          </div>

        </section>
      </div>

    </>
  )
}