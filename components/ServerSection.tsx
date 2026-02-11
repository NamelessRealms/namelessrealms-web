'use client';

'use client';

import { useState } from 'react';
import { Copy, CheckCircle, Users, ExternalLink } from 'lucide-react';

export default function ServerSection() {
  const [copied, setCopied] = useState(false);
  const serverIp = "namelessrealms.com";

  const servers = [
    {
      name: "模組包生存伺服器",
      desc: "集結百種科技與魔法模組，打造最硬核的冒險。體驗自動化生產與傳奇冒險的樂趣。",
      image: "/images/server_01.png",
      players: "42/100",
      tag: "熱門"
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText("play.mcKismetLab.net");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-48 px-6 bg-[#0c0c0c] border-t border-white/[0.03] relative overflow-hidden">
      {/* 1. 高級背景：網格與光暈 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50"></div>
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto space-y-28 relative z-10">
        
        {/* 2. 標題區：強化排版張力 */}
        <div className="text-center space-y-12">
            <div className="space-y-6">
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.8] drop-shadow-2xl">
                    立即開始你的<br/>
                    <span className="text-brand-primary">無名旅程</span>
                </h2>
                <p className="text-white/30 text-lg md:text-xl max-w-xl mx-auto font-medium">
                    跨越伺服器的界限，與全球冒險者共同打造屬於你們的傳奇領域。
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <button 
                  onClick={() => window.open("https://discord.com/invite/8BB3NY8")}
                  className="group relative w-full md:w-auto px-12 py-6 bg-white text-black font-black text-2xl rounded-2xl transition-all hover:bg-brand-primary hover:scale-105 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                    <span className="relative z-10 flex items-center">
                        進入 DISCORD <ExternalLink className="ml-3 w-6 h-6" />
                    </span>
                </button>

                <div 
                    onClick={handleCopy}
                    className="group w-full md:w-auto cursor-pointer bg-white/[0.03] border border-white/10 hover:border-brand-primary/40 rounded-2xl px-12 py-6 flex items-center justify-between space-x-8 transition-all backdrop-blur-xl"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Copy Server IP</span>
                        <span className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none mt-1">{serverIp}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-dark transition-all">
                        {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                    </div>
                </div>
            </div>
        </div>

        {/* 3. 卡片區：強化玻璃質感 */}
        <div className="max-w-5xl mx-auto">
            {servers.map((s, i) => (
                <div key={i} className="group relative bg-white/[0.01] border border-white/5 rounded-[4rem] overflow-hidden flex flex-col md:flex-row hover:bg-white/[0.03] transition-all duration-700 shadow-2xl backdrop-blur-sm">
                    <div className="flex-1 relative aspect-video md:aspect-auto overflow-hidden bg-gray-900">
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c] via-transparent to-transparent hidden md:block"></div>
                        <div className="absolute top-8 left-8 z-20">
                            <span className="bg-brand-primary text-brand-dark font-black px-6 py-2 rounded-full text-xs uppercase italic tracking-widest shadow-2xl">
                                {s.tag}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 p-12 md:p-20 space-y-8 flex flex-col justify-center border-l border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 text-brand-primary font-black text-xs tracking-[0.3em] uppercase">
                                <Users size={14} />
                                <span>{s.players} ONLINE</span>
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">{s.name}</h3>
                        </div>
                        <p className="text-white/30 text-lg leading-relaxed">{s.desc}</p>
                        <div className="inline-flex items-center text-white/60 font-black uppercase text-xs tracking-[0.3em] group-hover:text-brand-primary transition-colors cursor-pointer">
                            SERVER DETAILS <span className="ml-4 h-[1px] w-12 bg-white/10 group-hover:w-20 group-hover:bg-brand-primary transition-all"></span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
