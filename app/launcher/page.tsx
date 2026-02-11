'use client';

import { Terminal, Github, Hourglass } from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function LauncherPage() {
  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/[0.05] via-transparent to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-24 mb-40">
          <div className="flex-1 space-y-10 text-center lg:text-left">
            <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20 mb-4">
                    <Hourglass className="w-4 h-4 text-brand-primary animate-spin" />
                    <span className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Development in Progress</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black italic uppercase text-white tracking-tighter leading-none">
                    社群<br/><span className="text-brand-primary">啟動器</span>
                </h1>
                <p className="text-white/40 text-2xl font-black uppercase italic tracking-widest">Coming Soon</p>
            </div>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl">
              我們正在開發一款全新的社群專屬啟動器，致力於提供最流暢的 Minecraft 模組安裝與啟動體驗。目前正在進行最後的穩定性測試，敬請期待。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <div className="px-12 py-5 bg-white/5 text-white/40 font-black text-xl rounded-2xl border border-white/10 italic tracking-widest">
                即將推出
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full aspect-square bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center relative overflow-hidden shadow-[0_0_100px_rgba(255,125,0,0.1)]">
            <Terminal size={150} className="text-brand-primary opacity-20" />
            <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center">
                <span className="text-brand-primary font-black text-4xl uppercase italic tracking-tighter -rotate-12">Under Construction</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start space-x-4 text-brand-primary">
                    <Github size={40} />
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Open Source</h2>
                </div>
                <p className="text-white/40 text-xl font-medium">雖然下載尚未開放，但您可以前往 GitHub 追蹤我們的開發進度。</p>
            </div>
            <button onClick={() => window.open("https://github.com/mcKismetLab/mckismetlab-launcher")} className="px-12 py-6 bg-white/5 border border-white/10 rounded-full text-white font-black hover:bg-white hover:text-black transition-all">
                VIEW ON GITHUB
            </button>
        </div>
      </div>
    </div>
  );
}
