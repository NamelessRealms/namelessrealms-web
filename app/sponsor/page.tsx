'use client';

import { useState } from 'react';
import { Gift, ShieldCheck, Heart, Star, Award } from 'lucide-react';
import Navbar from "@/components/Navbar";

export default function SponsorPage() {
  const [selectedPlan, setSelectedPlan] = useState<number | 'custom'>(150);
  const [customAmount, setCustomAmount] = useState<string>('');

  const welfares = [
    { label: "Discord 贊助者身分組", desc: "Discord 伺服器上的贊助者提供了一個特別的身分組。", icon: <Star size={24} /> },
    { label: "永久白名單", desc: "無需擔心，您不會因遊玩時間不足而失去白名單。", icon: <ShieldCheck size={24} /> },
    { label: "代表你的支持", desc: "Minecraft 聊天室中顯示你是一位贊助者。", icon: <Award size={24} /> }
  ];

  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
      <Navbar />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row items-center gap-16 mb-32">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
              <Heart className="w-4 h-4 text-brand-primary fill-brand-primary" />
              <span className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Your Support Matters</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
              贊助<span className="text-brand-primary">我們</span>
            </h1>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl">
              長期維護伺服器需要耗費時間和金錢，而您的贊助對我們來說非常重要，我們衷心感謝您的支持！
            </p>
          </div>
          <div className="flex-1 w-full aspect-square bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent animate-pulse opacity-50"></div>
            <img
              src="/images/sponsor.png"
              alt="Sponsor"
              className="w-full h-full object-contain p-12 drop-shadow-[0_20px_60px_rgba(255,125,0,0.15)] transform group-hover:scale-105 transition-all duration-1000"
            />
          </div>
        </header>

        <section className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-24 text-center space-y-20 relative overflow-hidden shadow-2xl">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-tight">贊助能獲得什麼福利？</h2>
            <p className="text-white/40 text-lg leading-relaxed">
              嚴格來說你並不會有福利，贊助可以讓你參與伺服器的長期運營，讓我們提供更好的服務和體驗。雖然我們希望玩家支持我們出於對伺服器的愛，而不是僅為了特定福利，但我們還是會為贊助者提供一些小禮物和特殊功能，以示感謝。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {welfares.map((w) => (
              <div key={w.label} className="bg-black/40 border border-white/5 p-12 rounded-[3rem] space-y-8 flex flex-col items-center group hover:border-brand-primary/40 transition-all">
                {/* 修正 Icon 容器：強制置中並保持固定大小 */}
                <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-[0_0_30px_rgba(255,125,0,0.1)] group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-brand-dark transition-all duration-500">
                  {w.icon}
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{w.label}</h3>
                  <p className="text-white/40 text-sm leading-relaxed font-medium">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:border-brand-primary/20 transition-all">
              <div className="space-y-2">
                <h4 className="text-brand-primary font-black uppercase text-sm tracking-[0.2em]">主要贊助管道</h4>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Main Donation Channel</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { amount: 150, label: "純支持" },
                    { amount: 300, label: "核心贊助" },
                    { amount: 500, label: "傳奇贊助" },
                    { amount: 'custom' as const, label: "隨喜支持" },
                  ].map((option, i) => {
                    const isActive = selectedPlan === option.amount;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedPlan(option.amount)}
                        className={`p-6 rounded-2xl text-center transition-all duration-300 group/opt cursor-pointer flex flex-col items-center justify-center min-h-[100px]
                          ${isActive
                            ? 'bg-brand-primary/20 border border-brand-primary ring-2 ring-brand-primary scale-[1.02]'
                            : 'bg-zinc-900/50 border border-white/5 hover:bg-zinc-800/80 hover:border-white/10'}`}
                      >
                        {option.amount === 'custom' && isActive ? (
                          <div className="relative w-full flex items-center justify-center group/input">
                            <span className="absolute left-0 text-brand-primary font-black italic text-sm">NT$</span>
                            <input
                              type="number"
                              placeholder="150"
                              min="150"
                              autoFocus
                              className="bg-transparent border-b-2 border-brand-primary/30 focus:border-brand-primary w-full text-center text-2xl font-black italic outline-none text-white placeholder:text-white/10 transition-all pl-8 pr-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={customAmount}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || parseInt(val) >= 0) {
                                  setCustomAmount(val);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <span className={`text-xl font-black italic ${isActive ? 'text-white' : 'text-white/80'}`}>
                            {option.amount === 'custom' ? '自訂金額' : `NT$ ${option.amount}`}
                          </span>
                        )}
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">{option.label}</span>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const finalAmount = selectedPlan === 'custom' ? customAmount : selectedPlan.toString();
                  const isCustomBelowMin = selectedPlan === 'custom' && (parseInt(customAmount) < 150);
                  const isCustomEmpty = selectedPlan === 'custom' && !customAmount;
                  const isDisabled = isCustomEmpty || isCustomBelowMin;

                  return (
                    <div className="space-y-3">
                      <button
                        disabled={isDisabled}
                        onClick={() => console.log('準備發送綠界 API，金額:', finalAmount)}
                        className={`w-full py-5 font-black rounded-2xl transition-all uppercase italic tracking-[0.2em] shadow-lg
                          ${isDisabled
                            ? 'bg-zinc-700 text-white/20 cursor-not-allowed shadow-none'
                            : 'bg-brand-primary text-white hover:bg-orange-400 shadow-brand-primary/20'}`}
                      >
                        確認贊助{finalAmount ? ` NT$ ${finalAmount}` : ''}
                      </button>
                      {isCustomBelowMin && (
                        <p className="text-red-500/80 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                          自訂金額最低需為 NT$ 150
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-8 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] group hover:border-brand-primary/20 transition-all">
              <div className="space-y-2">
                <h4 className="text-brand-primary font-black uppercase text-sm tracking-[0.2em]">海外贊助管道</h4>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Overseas Donation Channel</p>
              </div>

              <div className="space-y-6">
                <div className="bg-[#003087]/10 border border-[#003087]/20 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6 group/paypal hover:bg-[#003087]/20 transition-all duration-500">
                  <div className="w-20 h-20 bg-[#003087] rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(0,48,135,0.3)] group-hover/paypal:scale-110 transition-transform">
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="w-12 object-contain brightness-0 invert" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-white font-black text-2xl italic tracking-tight">PayPal</h5>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">International Payment</p>
                  </div>
                  <button
                    // onClick={() => window.open("https://www.paypal.me/liujuhsin", "_blank")}
                    className="w-full py-4 bg-[#0070ba] text-white font-black rounded-2xl hover:bg-[#005ea6] transition-all uppercase italic tracking-[0.15em] text-sm shadow-lg shadow-[#0070ba]/20"
                  >
                    Donate via PayPal
                  </button>
                </div>

                {/* <div className="py-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-2 opacity-50">
                  <p className="text-white/20 font-black italic uppercase tracking-tighter text-sm">Other Methods Coming Soon</p>
                  <p className="text-white/10 text-[10px] uppercase font-bold tracking-widest">More options are being integrated.</p>
                </div> */}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
