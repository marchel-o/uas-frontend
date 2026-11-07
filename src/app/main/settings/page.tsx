'use client'

import { ChevronRight, Database, Store, User } from "lucide-react";
import React from "react";

export default function Settings(){
  const links = [
    { name: "Profile Pengguna", link: "/main/profile", icon: (<User size={18} />) },
    { name: "Informasi Toko", link: "/", icon: (<Store size={18} />) },
    { name: "Backup Data", link: "/main/backup", icon: (<Database size={18} />) },
  ]

  return (
    <>
      <h1 className="font-bold text-2xl">
        Pengaturan
      </h1>

      <div className="flex flex-col gap-3 rounded-xl p-4 bg-[var(--surface)] shadow-lg">
        {links.map((link, i) => (
          <React.Fragment key={i}>
            <a className="flex items-center gap-5 cursor-pointer" href={link.link}>
              {link.icon}
              <p className="font-semibold">{link.name}</p>
              <ChevronRight size={16} className="ml-auto" />
            </a>
            {i !== links.length - 1 && <div className="w-full h-[.06rem] bg-gray-800 opacity-15"></div>}
          </React.Fragment>
        ))}
      </div>
    </>
  )
}