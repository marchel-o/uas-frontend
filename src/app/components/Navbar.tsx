'use client'

import { TextAlignJustify, X, Box, NotepadText, Settings, MonitorCloud } from 'lucide-react';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Navbar(){
  const [navOpen, setNavOpen] = useState<boolean>(false);
  const pathName = usePathname();

  const sideLinks = [
    { name: "Dashboard", link: "/main/dashboard" },
    { name: "Produk", link: "/" },
    { name: "Transaksi", link: "/" },
    { name: "Laporan", link: "/"},
    { name: "Pengaturan", link: "/main/settings" },
  ]

  const bottomLinks = [
    { name: "Dashboard", link: "/main/dashboard", icon: (<MonitorCloud size={20} />) },
    { name: "Produk", link: "/", icon: (<Box size={20} />) },
    { name: "Transaksi", link: "/", icon: (<NotepadText size={20} />) },
    { name: "Pengaturan", link: "/main/settings", icon: (<Settings size={20} />) },
  ]
  
  return (
    <>
      <div className='fixed p-3 px-4 w-full bg-white text-gray-800 border-b border-gray-300 z-8 flex justify-between items-center sm:hidden'>
        <TextAlignJustify 
          size="1.5em"
          className='cursor-pointer'
          onClick={() => setNavOpen(true)}
        />

        <h3 className='font-bold text-[var(--primary)] sm:hidden'>MyKasir</h3>
      </div>

      <div 
        className={`w-full h-full fixed inset-0 z-9 bg-black ${navOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-all duration-200 sm:hidden`}
        onClick={() => setNavOpen(false)}
      ></div>

      <nav className={`bg-red-800 fixed inset-0 w-[60%] max-w-50 z-10 ${navOpen ? "translate-x-0" : "-translate-x-full"} transition-all duration-200 sm:translate-x-0 sm:static sm:shrink-0`}>
        <X 
          size="1.5em"
          className='relative inset-4 sm:hidden'
          color='#fff'
          onClick={() => setNavOpen(false)}
        />

        <h3 className='font-bold text-lg text-white hidden sm:block p-5'>MyKasir</h3>
        {/* <div className='items-center p-4 justify-between px-5 hidden sm:flex'>
          <CircleUser size="1.7em" color='#fff' />

          <div className='relative'>
            <div className='absolute w-2 h-2 rounded-full bg-red-500 top-[-5] right-[-1]'></div>
            <Bell size="1.2em" color='#fff' />
          </div>
        </div> */}

        <div className='flex flex-col gap-6 mt-8 sm:mt-0 text-white'>
          {sideLinks.map((link) => (
            <React.Fragment key={link.name}>
              <a
                className='px-3 mx-2 rounded-md cursor-pointer hover:bg-red-800'
                href={link.link == "/" ? "/" : link.link}
              >
                {link.name}
              </a>

            </React.Fragment>
          ))}
        </div>
      </nav>

      <nav className="fixed flex items-center justify-around bottom-0 left-0 w-full bg-white text-gray-800 border-t border-gray-300 z-8 p-2 sm:hidden">
        {bottomLinks.map((link, i) => {
          const active = link.link === pathName;

          return (
            <a 
              key={i} 
              className={`flex flex-col justify-center items-center w-16 ${active ? "text-[var(--primary)] font-semibold" : ""}`} 
              href={link.link}>
              {link.icon}
              <p className='text-[0.7rem]'>{link.name}</p>
            </a>
          )
        })}
      </nav>
    </>
  )
}