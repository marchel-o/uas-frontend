'use client'

import { LockKeyhole, LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Profile(){
  const [logoutPopup, setLogoutPopup] = useState<boolean>(false);

  return(
    <>
      <h1 className="font-bold text-2xl">
        Profile
      </h1>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">

        <div className="md:flex">
          <div className="p-5 bg-red-100 text-[var(--primary)] rounded-full w-fit m-auto md:m-0">
            <User size={32} />
          </div>

          <div className="text-center md:text-left md:ml-4 md:flex md:flex-col md:justify-center">
            <p className="font-semibold mt-3 md:mt-0">Andi Saputra</p>
            <p className="text-[var(--text-secondary)] text-[0.8rem]">Administrator</p>
            <p className="text-[var(--primary)] text-sm mt-1 font-semibold cursor-pointer">Ubah Foto</p>
          </div>
        </div>

        <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

        <h3 className="font-bold text-[1.05rem] mt-4">Informasi Pribadi</h3>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Nama</p>
        <p className="font-semibold">Andi Saputra</p>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Email</p>
        <p className="font-semibold">Andi@gmail.com</p>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Nomor Telepon</p>
        <p className="font-semibold">0812-1234-5678</p>
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <h3 className="font-bold text-[1.05rem]">Keamanan Akun</h3>

        <div className="flex gap-2 items-center mt-2">
          <LockKeyhole className="m-1.5" size={18} />
          <p className="font-light">Ubah Password</p>
        </div>

        <div className="flex gap-2 items-center mt-3 text-red-500 cursor-pointer" onClick={() => setLogoutPopup(true)}>
          <div className="p-1.5 bg-red-100 rounded-md">
            <LogOut size={18} />
          </div>
          <p className="font-semibold">Logout</p>
        </div>
      </div>

      <div 
        className={`${logoutPopup ? "" : "hidden"} w-full h-full fixed inset-0 z-9 bg-black transition-all opacity-50 duration-200`}
        onClick={() => setLogoutPopup(false)}
      ></div>

      <div className={`fixed bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 min-w-62.5 max-w-sm rounded-lg ${logoutPopup ? "" : "hidden"}`}>
        <h3 className="text-red-500 text-xl text-center font-semibold">Logout Akun</h3>

        <p className="min-w-fit text-center mt-3 text-[var(--text-secondary)]">Yakin ingin keluar?</p>

        <div className="text-blue-500 font-medium flex gap-4 mt-4">
          <a className="text-center p-2 w-full rounded-lg cursor-pointer" onClick={() => setLogoutPopup(false)}>Tidak</a>
          <a href="/auth/login" className="text-center p-2 w-full rounded-lg cursor-pointer">Ya</a>
        </div>
      </div>
    </>
  )
}