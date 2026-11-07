'use client'

import { ClipboardClock, Download, RefreshCw, RotateCcwClock, Upload } from "lucide-react"
import React, { useState } from "react"

export default function Profile(){
  const [autoToggle, setAutoToggle] = useState<boolean>(true);

  const history = [
    { type: "Manual", date: "02 November 2026, 11:26", size: "1.8 MB" },
    { type: "Manual", date: "02 November 2026, 10:23", size: "1.67 MB" },
    { type: "Automatic", date: "02 November 2026, 00:00", size: "1.6 MB" },
  ]

  return(
    <>
      <h1 className="font-bold text-2xl">
        Backup Data
      </h1>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col flex-1 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
          
          <div className="flex items-center gap-2.5">
            <div className="p-3 bg-red-50 rounded">
              <Download size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold text-[1.1rem]">Backup Manual</p>
              <p className="text-[var(--text-secondary)] text-[.8rem]">Unduh data toko saat ini</p>
            </div>
          </div>
          
          <p className="text-sm mt-4">
            <span className="font-medium mr-1">Format File:</span>
            <span className="text-[var(--text-secondary)]">.JSON / .SQL</span>
          </p>

          <div className="mt-2">
            <p className="text-[.8rem] text-[var(--text-secondary)]">Terakhir: {history[0].date}</p>
            
            <button 
              className="p-2 px-3 bg-[var(--primary)] text-white rounded-lg mt-2 w-full cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
            >
              Download
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-3 bg-red-50 rounded">
              <ClipboardClock size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="font-semibold text-[1.1rem]">Backup Otomatis</p>
              <p className="text-[var(--text-secondary)] text-[.8rem]">Jadwalkan pencadangan</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="font-medium text-[.95rem]">Aktifkan backup otomatis</p>
            <label className="switch">
              <input type="checkbox" onChange={() => setAutoToggle(prev => !prev)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className={`text-sm ${autoToggle ? "text-gray-500" : ""} font-medium`}>Frekuensi</label>
            
            <div className="relative w-full">
              <select className={`w-full appearance-none rounded-lg border border-gray-300 ${autoToggle ? "bg-gray-200 text-gray-500" : "bg-white cursor-pointer hover:bg-gray-50 transition-all"} py-2 pl-3 pr-10 text-sm outline-none`} disabled={autoToggle} >
                <option>Harian</option>
                <option>Mingguan</option>
                <option>Bulanan</option>
                <option>Tahunan</option>
              </select>
              
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-3 bg-red-50 rounded">
            <RotateCcwClock size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[1.1rem]">Riwayat Backup</p>
            <p className="text-[var(--text-secondary)] text-[.8rem]">Daftar backup yang telah dibuat</p>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-2">
          {history.map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex justify-between mx-2">
                <div>
                  <p className="font-semibold">{item.type} Backup</p>
                  <p className="text-[var(--text-secondary)] text-sm">{item.date}</p>
                  <p className="text-[var(--text-secondary)] text-[.8rem]">{item.size}</p>
                </div>
                <Download size={20} className="text-[var(--primary)] place-self-center cursor-pointer" />
              </div>

              {i !== history.length - 1 && <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-3 bg-red-50 rounded">
            <RefreshCw size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[1.1rem]">Pemulihan Data</p>
            <p className="text-[var(--text-secondary)] text-[.8rem]">Pulihkan data dari file backup</p>
          </div>
        </div>

        <div className="p-4 py-12 border-gray-400 border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 mt-4 hover:bg-gray-100 transition-all">
          <Upload size={24} className="text-[var(--primary)]" />
          <p className="font-medium text-center text-[.9rem] mt-3">Pilih file backup atau drag and drop</p>
          <p className="text-gray-500 text-[.8rem]">Format file .json atau .sql</p>
          <button className="p-2 border border-gray-400 rounded-lg shadow-lg text-sm cursor-pointer hover:bg-gray-200 transition-all">Cari File</button>
        </div>

        <button 
          className="p-2 bg-[var(--primary)] text-white w-full mt-4 rounded-lg cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
        >
            Pulihkan Data
          </button>
        <p className="text-red-500 text-[.75rem] leading-4 mt-2">Pemulihan dapat mengubah data saat ini!</p>
      </div>
    </>
  )
}