'use client';

import { useState } from 'react';
import { Vote, History, ExternalLink, Box, Clock, ChevronRight, Search } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { modpackHistory } from "@/data/modpackHistory";

export default function VoteModpackPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // 模擬目前的投票狀態
    const currentSeason = 43;
    const isVotingOpen = false;
    const currentModpack = modpackHistory[modpackHistory.length - 1];

    const filteredHistory = modpackHistory
        .slice()
        .reverse()
        .filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.version.includes(searchTerm)
        );

    return (
        <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
            <Navbar />
            {/* 背景裝飾 */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-brand-primary/5 via-transparent to-transparent"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <header className="text-center mb-24 space-y-6">
                    <div className="inline-flex items-center space-x-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
                        <Vote className="w-4 h-4 text-brand-primary" />
                        <span className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Community Choice</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
                        模組包<span className="text-brand-primary">投票</span>
                    </h1>
                    <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
                        決定下一個賽季的冒險旅程。您的每一票都將影響伺服器的發展方向。
                    </p>
                </header>

                {/* 當前狀態區塊 */}
                <section className="mb-32">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:bg-brand-primary/10 transition-all duration-700"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-10 text-center lg:text-left">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">第 {currentSeason} 季</h2>
                                    <div className={`inline-block px-6 py-2 rounded-xl border font-black text-sm uppercase tracking-widest ${isVotingOpen ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'}`}>
                                        {isVotingOpen ? '● 投票進行中' : '正在準備中...'}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-white/60 text-lg leading-relaxed font-medium">
                                        目前伺服器正處於準備階段。我們正在整理下一季的候選名單，請密切關注我們的 Discord 社群以獲取最新消息。
                                    </p>
                                    {!isVotingOpen && (
                                        <button className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-primary transition-all uppercase italic tracking-widest shadow-xl flex items-center mx-auto lg:mx-0">
                                            快去投票吧！ <ChevronRight className="ml-2" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="relative group/card">
                                <div className="bg-brand-dark/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] space-y-8 flex flex-col items-center text-center transform group-hover/card:-rotate-2 transition-transform duration-500">
                                    <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden">
                                        <Box size={60} className="text-brand-primary opacity-50" />
                                        {/* 這裡可以放模組包的圖標 */}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-white italic tracking-tight">{currentModpack.name}</h3>
                                        <p className="text-brand-primary font-black uppercase tracking-widest text-sm">Version: {currentModpack.version}</p>
                                    </div>
                                </div>
                                <div className="absolute -inset-4 bg-brand-primary/20 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity -z-10"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 歷史紀錄區塊 */}
                <section className="space-y-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                <History className="text-brand-primary" />
                            </div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">換包歷史紀錄</h2>
                        </div>

                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="搜尋歷史模組包..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-16 pr-6 focus:border-brand-primary/40 focus:bg-white/[0.05] transition-all outline-none font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredHistory.map((item, index) => (
                            <div
                                key={`${item.name}-${index}`}
                                className="group bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-brand-primary/30 hover:bg-white/[0.04] transition-all duration-500 flex flex-col justify-between"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/10 transition-all duration-500">
                                            <Box className="w-8 h-8 text-white/20 group-hover:text-brand-primary" />
                                        </div>
                                        <span className="text-white/10 font-black italic text-4xl italic tracking-tighter">#{modpackHistory.length - index}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-white group-hover:text-brand-primary transition-colors line-clamp-1">{item.name}</h3>
                                        <div className="flex items-center space-x-3 text-white/40 font-bold text-xs uppercase tracking-widest">
                                            <Clock size={12} className="text-brand-primary" />
                                            <span>{item.version}</span>
                                        </div>
                                    </div>
                                </div>

                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 flex items-center justify-center space-x-2 w-full py-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white hover:text-black transition-all font-black uppercase italic text-xs tracking-widest"
                                >
                                    <span>查看詳情</span>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>

                    {filteredHistory.length === 0 && (
                        <div className="text-center py-40 bg-white/[0.02] border border-dashed border-white/5 rounded-[4rem]">
                            <p className="text-white/20 font-black italic uppercase tracking-tighter text-3xl">找不到相關紀錄</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
