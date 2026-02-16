'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { name: '首頁', href: '/' },
    { name: '社群啟動器', href: '/launcher' },
    { name: '贊助我們', href: '/sponsor' },
    { name: '團隊', href: '/team' },
  ];

  const serverSubItems = [
    { name: '模組包伺服器', href: '/modServer' },
    { name: '模組包投票', href: '/voteModpack' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100]">
      <div className="bg-brand-dark/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/images/logo.png" alt="Nameless Realms Logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-black text-xl tracking-tight uppercase italic">
            Nameless<span className="text-brand-primary">Realms</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
          {/* 首頁 */}
          <Link href="/" className="text-white/60 text-sm font-black hover:text-brand-primary transition-all uppercase tracking-[0.1em]">首頁</Link>

          {/* 伺服器下拉選單 */}
          <div
            className="relative group"
            onMouseEnter={() => setIsServerMenuOpen(true)}
            onMouseLeave={() => setIsServerMenuOpen(false)}
          >
            <button className="flex items-center space-x-1 text-white/60 text-sm font-black hover:text-brand-primary transition-all uppercase tracking-[0.1em]">
              <span>伺服器</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isServerMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* 下拉內容 */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ${isServerMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
              <div className="bg-brand-dark/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-4 min-w-[200px] shadow-2xl space-y-2">
                {serverSubItems.map(sub => (
                  <Link
                    key={sub.name}
                    href={sub.href}
                    className="block px-6 py-3 text-white/60 hover:text-brand-primary hover:bg-white/5 rounded-2xl transition-all font-bold text-sm"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 其他選單項 */}
          {navItems.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/60 text-sm font-black hover:text-brand-primary transition-all uppercase tracking-[0.1em]"
            >
              {item.name}
            </Link>
          ))}

          {session && (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <img src={session.user?.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border border-brand-primary" />
              <button onClick={() => signOut()} className="text-white/40 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 手機版選單 (同步優化下拉邏輯) */}
      {isOpen && (
        <div className="lg:hidden mt-4 bg-brand-dark/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 space-y-6 shadow-2xl">
          <Link href="/" className="block text-white font-black text-2xl uppercase italic">首頁</Link>
          <div className="space-y-4 border-l-2 border-brand-primary/20 pl-4">
            <p className="text-brand-primary font-black text-xs uppercase tracking-widest">伺服器列表</p>
            {serverSubItems.map(sub => (
              <Link key={sub.name} href={sub.href} onClick={() => setIsOpen(false)} className="block text-white/60 font-black text-xl uppercase italic">
                {sub.name}
              </Link>
            ))}
          </div>
          {navItems.slice(1).map((item) => (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="block text-white font-black text-2xl uppercase italic hover:text-brand-primary">
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
