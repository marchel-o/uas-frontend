'use client'

import { TextAlignJustify, X, Bell, CircleUser, Home, Box, NotepadText } from 'lucide-react';
import React, { useState } from 'react';

export function Navbar(){
  const [navOpen, setNavOpen] = useState<boolean>(false);

  const links = [
    {
      name: "Dashboard",
      link: "/dashboard"
    },
    {
      name: "Produk",
      link: "/"
    },
    {
      name: "Transaksi",
      link: "/"
    },
    {
      name: "Laporan",
      link: "/"
    },
    {
      name: "Pengaturan",
      link: "/settings"
    },
  ]
  
  return (
    <>
      <div className='fixed p-3 px-4 w-full bg-white text-gray-800 border-b border-gray-300 z-8 flex justify-between items-center sm:hidden'>
        <TextAlignJustify 
          size="1.5em"
          className='cursor-pointer'
          onClick={() => setNavOpen(true)}
        />

        {/* <div className='flex items-center gap-6'>
          <div className='relative'>
            <div className='absolute w-2 h-2 rounded-full bg-red-500 top-[-5] right-[-1]'></div>
            <Bell size="1.2em" color='#fff' />
          </div>

          <CircleUser size="1.7em" color='#fff' />
        </div> */}
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

        <div className='items-center p-4 justify-between px-5 hidden sm:flex'>
          <CircleUser size="1.7em" color='#fff' />

          <div className='relative'>
            <div className='absolute w-2 h-2 rounded-full bg-red-500 top-[-5] right-[-1]'></div>
            <Bell size="1.2em" color='#fff' />
          </div>
        </div>

        {/* <div className='flex flex-col mt-8 sm:mt-0 text-white'>
          <a className='bg-[var(--primary)] m-2 p-2 px-3 rounded-md'>Dashboard</a>
          <a className='m-2 p-2 px-3 rounded-md hover:bg-red-800'>Produk</a>
          <a className='m-2 p-2 px-3 rounded-md'>Transaksi</a>
          <a className='m-2 p-2 px-3 rounded-md'>Laporan</a>
          <a className='m-2 p-2 px-3 rounded-md'>Pengaturan</a>
        </div> */}

        <div className='flex flex-col mt-8 sm:mt-0 text-white'>
          {links.map((link) => (
            <React.Fragment key={link.name}>
              <a
                className='m-2 p-2 px-3 rounded-md cursor-pointer hover:bg-red-800'
                href={link.link == "/" ? "/" : link.link}
              >
                {link.name}
              </a>

            </React.Fragment>
          ))}
        </div>
      </nav>

      <nav className="fixed flex items-center justify-around bottom-0 left-0 w-full bg-white text-gray-800 border-t border-gray-300 z-8 p-2 sm:hidden">
        <div className='flex flex-col justify-center items-center w-16 text-[var(--primary)] font-semibold'>
          <Home size={20} />
          <p className='text-[0.7rem]'>Dashboard</p>
        </div>
        <div className='flex flex-col justify-center items-center w-16'>
          <Box size={20} />
          <p className='text-[0.7rem]'>Products</p>
        </div>
        <div className='flex flex-col justify-center items-center w-16'>
          <NotepadText size={20} />
          <p className='text-[0.7rem]'>Transactions</p>
        </div>
        <div className='flex flex-col justify-center items-center w-16'>
          <CircleUser size={20} />
          <p className='text-[0.7rem]'>Profile</p>
        </div>
      </nav>
    </>
  )
}