'use client';

import { ShieldAlert } from 'lucide-react';
import Navbar from "@/components/Navbar";
import FeatureRow from "@/components/FeatureRow";

export default function ModServerPage() {
  const requirements = [
    "懂得使用 Google 搜尋功能查詢資料",
    "知道電腦配備能足夠跑的動模組包",
    "懂得安裝模組包基本知識"
  ];

  const rules = [
    { label: "禁止使用 BUG", desc: "在模組的幫助下，你可以變得更強，所以請不要使用 BUG。" },
    { label: "禁止破壞伺服器", desc: "破壞伺服器是不道德的，無論是國內還是國外伺服器，都不應該傷害別人的伺服器體驗！" },
    { label: "不要欺負或騷擾其他玩家", desc: "讓我們共同做個好公民，不要惡意對待其他玩家。讓大家都能享受遊戲的樂趣。" }
  ];

  const features = [
    {
      label: "全年無休，一年365天不間斷",
      desc: "我們的伺服器每天提供穩定遊戲體驗，絕不會無預警關閉。",
      img: "/images/server_quasi.png",
      reverse: true
    },
    {
      label: "讓玩家透過投票選擇你喜愛的模組包！",
      desc: "給玩家以投票的方式選擇你喜愛的模組包。",
      img: "https://namelessrealms.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fvote.34df0024.png&w=3840&q=75",
      reverse: false
    },
    {
      label: "定期更換不同的模組包",
      desc: "我們會定期輪換不同的模組包，無需擔心模組包更換會突然中斷伺服器遊戲體驗。",
      img: "https://namelessrealms.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fregular.f5401680.png&w=3840&q=75",
      reverse: true
    }
  ];

  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
      <Navbar />

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="mb-32">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
              模組包<span className="text-brand-primary">伺服器</span>
            </h1>
            <p className="text-white/40 text-xl leading-relaxed font-medium">
              歡迎來到模組包伺服器！我們為您提供多人遊玩平台、模組討論區等多項服務，讓您輕鬆探索、無需擔心自行建立伺服器的困擾。
            </p>
          </div>
        </header>

        <section className="mb-32">
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">
                加入模組服之前<br /><span className="text-brand-primary">必須知道的事!</span>
              </h2>
            </div>
            <div className="flex-1 space-y-4">
              {requirements.map((req) => (
                <div key={req} className="flex items-center space-x-4 bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-brand-primary/30 transition-all">
                  <div className="w-2 h-2 bg-brand-primary rounded-full shadow-[0_0_10px_#ff7d00]"></div>
                  <span className="text-lg font-bold text-white/80">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-32 space-y-12">
          {features.map((f, i) => (
            <FeatureRow key={i} {...f} />
          ))}
        </section>

        <section className="text-center space-y-20">
          <div className="space-y-4 text-center">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">在加入前，請遵守以下<span className="text-brand-primary">三大規則</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {rules.map((rule) => (
              <div key={rule.label} className="bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] space-y-6 hover:bg-white/[0.03] transition-all group">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic text-white">{rule.label}</h3>
                <p className="text-white/30 leading-relaxed font-medium">{rule.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-24 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">馬上加入我們吧</h2>
            <button onClick={() => window.open("https://discord.com/invite/8BB3NY8")} className="px-16 py-6 bg-brand-primary text-brand-dark font-black text-2xl rounded-full hover:scale-105 transition-all shadow-[0_10px_40px_rgba(255,125,0,0.3)]">
              JOIN DISCORD
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
