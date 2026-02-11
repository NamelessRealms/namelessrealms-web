'use client';

import Navbar from "@/components/Navbar";

export default function TeamPage() {
  const members = [
    { name: "Yu // 無名", role: "Owner / Developer", desc: "伺服器創辦人，負責架構開發與整體維護。", img: "/images/quasi.png" },
    { name: "Moon_Flame // 月焰", role: "Admin", desc: "管理團隊成員，協助維護伺服器日常秩序。", img: "/images/Moon_Flame.png" },
    { name: "liujuhsin // 嚕嚕訊", role: "Admin", desc: "管理團隊成員，協助玩家社群經營與管理。", img: "/images/liujuhsin.png" }
  ];

  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
      <Navbar />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <header className="mb-32 space-y-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-[8rem] font-black italic uppercase text-white tracking-tighter leading-none">
              Our <span className="text-brand-primary">Team</span>
            </h1>
            <p className="text-white/20 text-2xl font-medium tracking-[0.4em] uppercase">無名伺服器團隊</p>
          </div>

          <div className="relative w-full max-w-5xl mx-auto bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent z-10 opacity-40"></div>
            <img
              src="/images/team.png"
              alt="Team"
              className="w-full h-auto block transform group-hover:scale-105 transition-all duration-1000"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          {members.map((staff) => (
            <div key={staff.name} className="group bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 -translate-y-16 translate-x-16 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all"></div>

              <div className="w-32 h-32 bg-white/5 rounded-3xl mb-10 overflow-hidden border border-white/10 group-hover:border-brand-primary/50 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <img
                  src={staff.img}
                  alt={staff.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"
                />
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tight leading-tight">{staff.name}</h3>
              <p className="text-brand-primary font-black uppercase text-xs tracking-widest mb-8">{staff.role}</p>
              <p className="text-white/40 text-lg leading-relaxed font-medium">{staff.desc}</p>

              <div className="mt-12 w-full h-px bg-white/5 relative">
                <div className="absolute top-0 left-0 w-0 h-full bg-brand-primary group-hover:w-full transition-all duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
