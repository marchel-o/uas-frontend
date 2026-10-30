'use client'

import { TextAlignJustify, X, Bell, CircleUser } from 'lucide-react';
import { useState } from 'react';

export function Navbar(){
  const [navOpen, setNavOpen] = useState<boolean>(false);
  
  return (
    <>
      <div className='fixed p-3 px-4 w-full bg-[var(--primary)] z-8 flex justify-between items-center md:hidden'>
        <TextAlignJustify 
          size="1.5em"
          color='#fff'
          className='cursor-pointer'
          onClick={() => setNavOpen(true)}
        />

        <div className='flex items-center gap-6'>
          <div className='relative'>
            <div className='absolute w-2 h-2 rounded-full bg-red-500 top-[-5] right-[-1]'></div>
            <Bell size="1.2em" color='#fff' />
          </div>

          <CircleUser size="1.7em" color='#fff' />
        </div>
      </div>

      <div 
        className={`w-full h-full fixed inset-0 z-9 bg-black ${navOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-all duration-200 md:hidden`}
        onClick={() => setNavOpen(false)}
      ></div>

      <nav className={`bg-[var(--primary)] fixed inset-0 w-[60%] max-w-50 z-10 ${navOpen ? "translate-x-0" : "-translate-x-full"} transition-all duration-200 md:translate-x-0 md:static md:shrink-0`}>
        <X 
          size="1.5em"
          className='relative inset-4 md:hidden'
          color='#fff'
          onClick={() => setNavOpen(false)}
        />

        <div className='items-center p-4 justify-between px-5 hidden md:flex'>
          <CircleUser size="1.7em" color='#fff' />

          <div className='relative'>
            <div className='absolute w-2 h-2 rounded-full bg-red-500 top-[-5] right-[-1]'></div>
            <Bell size="1.2em" color='#fff' />
          </div>
        </div>

        <div className='flex flex-col mt-8 md:mt-0'>
          <a className='p-4 py-3 bg-gray-500 border-gray-400 border-t'>Dashboard</a>
          <a className='p-4 py-3 bg-gray-500 border-gray-400 border-t'>Dashboard</a>
          <a className='p-4 py-3 bg-gray-500 border-gray-400 border-t'>Dashboard</a>
          <a className='p-4 py-3 bg-gray-500 border-gray-400 border-t'>Dashboard</a>
        </div>
      </nav>
    </>
  )
}