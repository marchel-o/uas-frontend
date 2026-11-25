'use client'

import { LockKeyhole, LogOut, User } from "lucide-react";
import { SubmitEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type userData = {
  id: number;
  name: string;
  username: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

export default function Profile(){
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState<boolean>(false);
  const [changePasswordPopup, setChangePasswordPopup] = useState<boolean>(false);
  const [data, setData] = useState<userData | null>(null);
  const [oldPass, setOldPass] = useState<string>("");
  const [newPass, setNewPass] = useState<string>("");

  
  useEffect(() => {
    const getData = async () => {
      try{
        const response = await fetch("/api/profile", { method: "GET" })

        if (!response.ok) {
          throw new Error("Gagal mengambil data user");
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (error){
        console.error(error);
      }
    }

    getData();
  }, [])

  const handleLogout = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Gagal melakukan logout. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: SubmitEvent) => {
    e.preventDefault();

    try{
      const response = await fetch("/api/auth/change-password", {
        headers: { 'Content-Type': 'application/json' },
        method: "POST", 
        body: JSON.stringify({ oldPass, newPass }) 
      });

      if (!response.ok){
        throw new Error("Ganti password gagal");
      }
    } catch (error){
      console.error(error);
    }
  }
  
  if (!data) return;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

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
            <p className="font-semibold mt-3 md:mt-0">{data.username}</p>

            <p className="text-[var(--text-secondary)] text-[0.8rem]">
              {data.role == "admin" ? "Administrator" : "Cashier"}
            </p>

            <p className="text-[var(--primary)] text-sm mt-1 font-semibold cursor-pointer">Ubah Foto</p>
          </div>
        </div>

        <div className="w-full h-[.06rem] bg-gray-800 opacity-15 my-6"></div>

        <h3 className="font-bold text-[1.05rem] mt-4">Informasi Pribadi</h3>
        <p className="text-[var(--text-secondary)] text-sm mt-2">Nama</p>
        <p className="font-semibold">{data.name}</p>

        <p className="text-[var(--text-secondary)] text-sm mt-2">Nomor Telepon</p>
        <p className="font-semibold">{data.phone ? data.phone : '-'}</p>

        <p className="text-[var(--text-secondary)] text-sm mt-2">Bergabung Sejak</p>
        <p className="font-semibold">{formatDate(data.createdAt)}</p>
      </div>

      <div className="rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        <h3 className="font-bold text-[1.05rem]">Keamanan Akun</h3>

        <div className="flex gap-2 items-center mt-2" onClick={() => setChangePasswordPopup(true)}>
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
          <button 
            className="text-center p-2 w-full rounded-lg cursor-pointer" 
            onClick={() => setLogoutPopup(false)}
          >
            Tidak
          </button>

          <button
            className="text-center p-2 w-full rounded-lg cursor-pointer" 
            onClick={handleLogout}
          >
              Ya
          </button>
        </div>
      </div>








      <div 
        className={`${changePasswordPopup ? "" : "hidden"} w-full h-full fixed inset-0 z-9 bg-black transition-all opacity-50 duration-200`}
        onClick={() => setChangePasswordPopup(false)}
      ></div>

      <form
        onSubmit={changePassword}
        className={`fixed bg-white p-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 min-w-62.5 max-w-sm rounded-lg ${changePasswordPopup ? "" : "hidden"}`}
      >
        <h3 className="font-semibold mb-2">Ubah Password</h3>
        
        <label htmlFor="oldPass" className="text-sm text-[var(--text-secondary)]">Password Lama</label>
        <input
          name="oldPass"
          type="password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          className="border border-gray-500 rounded w-full p-1 px-2 text-sm mb-2"
          />

        <label htmlFor="newPass" className="text-sm text-[var(--text-secondary)]">Password Lama</label>
        <input
          name="newPass"
          type="password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="border border-gray-500 rounded w-full p-1 px-2 text-sm"
        />

        <button
          type="submit" 
          className="bg-[var(--primary)] text-white rounded p-1 mt-3 w-full"
        >
          Ganti Password
        </button>
      </form>
    </>
  )
}