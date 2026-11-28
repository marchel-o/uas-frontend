'use client'

import { Download, RefreshCw, RotateCcwClock, Upload } from "lucide-react"
import React, { useEffect, useState } from "react"

type HistoryDataType = {
  fileSize: number,
  action: string,
  createdAt: string,
}

export default function Profile(){
  const [autoToggle, setAutoToggle] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragFile, setDragFile] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<HistoryDataType[]>([]);

  const formatDate = (inp: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(inp)).replace(".", ":").replace(" pukul", ",");
  }

  useEffect(() => {
    const getHistoryData = async () => {
      try{
        const response = await fetch("/api/backup/history", { method: "GET" })

        if (!response.ok) {
          throw new Error("Gagal mengambil riwayat backup");
        }
        
        const result = await response.json();
        setHistoryData(result.data);
      } catch (error){
        console.error(error);
      }
    }

    getHistoryData();
  }, [])

  const downloadBackup = async () => {
    try {
      const res = await fetch('/api/backup/download');
      if (!res.ok) throw new Error('Gagal download backup');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      window.location.reload();
    } catch (err) {
      alert('Gagal mendownload file backup!');
    }
  }

  const uploadBackup = async (file: File) => {
    setLoading(true);

    if (!file.name.endsWith('.json')) {
      alert('Format file harus .json');
      return;
    }

    const confirmRestore = confirm(
      'Data saat ini akan diubah dengan data dari file backup. Lanjutkan?'
    );
    if (!confirmRestore) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      alert(result.message);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mengupload backup');
    } finally {
      setLoading(false);
    }
  };

  const handleInputFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadBackup(file);
    e.target.value = '';
  };

  const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadBackup(file);
  };

  return(
    <>
      <h1 className="font-bold text-2xl">
        Backup Data
      </h1>


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
        
        <p className="text-md mt-4">
          <span className="font-medium mr-1">Format File:</span>
          <span className="text-[var(--text-secondary)]">.JSON</span>
        </p>

        <div className="mt-2">
          {/* <p className="text-sm text-[var(--text-secondary)]">Terakhir: {history[0].date}</p> */}
          
          <button 
            className="p-2 px-3 bg-[var(--primary)] text-white rounded-lg mt-2 w-full cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
            type="button"
            onClick={downloadBackup}
          >
            Download
          </button>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-3 bg-red-50 rounded">
            <RotateCcwClock size={20} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="font-semibold text-[1.1rem]">Riwayat Backup</p>
            <p className="text-[var(--text-secondary)] text-[.8rem]">Riwayat aksi backup yang terjadi</p>
          </div>
        </div>
        
        <div className="mt-3 flex flex-col gap-2">
          <p className={`mt-2 ${historyData.length && 'hidden'}`}>Belum ada riwayat backup</p>
          {historyData.map((item, i) => (
            <React.Fragment key={i}>
              <div className="flex justify-between mx-2">
                <div>
                  <p className="font-semibold">{item.action}</p>
                  <p className="text-[var(--text-secondary)] text-sm">{formatDate(item.createdAt)}</p>
                  <p className="text-[var(--text-secondary)] text-[.8rem]">{(item.fileSize / 1000).toFixed(2)} kB</p>
                </div>
              </div>

              {i !== historyData.length - 1 && <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>}
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

        <div 
          className={`p-4 py-12 border-gray-400 border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 mt-4 hover:bg-gray-100 ${dragFile && "bg-gray-100"} transition-all`}
          onDragOver={(e) => { e.preventDefault(); setDragFile(true) }}
          onDragLeave={() => setDragFile(false)}
          onDrop={handleDropFile}
        >
          <Upload size={24} className="text-[var(--primary)]" />
          <p className="font-medium text-center text-[.9rem] mt-3">Pilih file backup atau drag and drop</p>
          <p className="text-gray-500 text-[.8rem]">Format file .json atau .sql</p>
          <label className="mt-2">
            <span
              className="p-2 border border-gray-400 rounded-lg shadow-lg text-sm cursor-pointer hover:bg-gray-200 transition-all"
            >
              Cari File
            </span>

            <input
              className="hidden"
              type="file"
              accept=".json,application/json"
              onChange={handleInputFile}
            />
          </label>
        </div>

        <button 
          className="p-2 bg-[var(--primary)] text-white w-full mt-4 rounded-lg cursor-pointer hover:bg-[var(--primary-hover)] transition-all"
        >
            Pulihkan Data
          </button>
        <p className="text-red-500 text-[.8rem] leading-4 mt-2">Pemulihan dapat mengubah data saat ini!</p>
      </div>
    </>
  )
}