'use client';

import { useState } from 'react';
import {
  Terminal, Github, Hourglass, UserCircle, Layout, Package, Users, Settings, Server,
  CheckCircle2, Compass, Cpu, MessageSquare, ShieldCheck, Banknote, HardDrive, Palette
} from 'lucide-react';
import Navbar from "@/components/Navbar";
import Modal from "@/components/Modal";

export default function LauncherPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
                社群<br /><span className="text-brand-primary">啟動器</span>
              </h1>
              <p className="text-white/40 text-2xl font-black uppercase italic tracking-widest">Coming Soon</p>
            </div>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl">
              重新定義傳統啟動器。這不僅是一個登入工具，更是專為玩家與伺服主打造的專屬生態圈，將社群連結、伺服器探索、強大模組管理與極簡開服流程完美揉合。
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-12 py-5 bg-white/5 text-brand-primary hover:bg-brand-primary/10 hover:text-brand-primary transition-all font-black text-xl rounded-2xl border border-brand-primary/20 italic tracking-widest cursor-pointer"
              >
                查看開發進度
              </button>
            </div>
          </div>

          <div className="flex-1 w-full aspect-square bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center justify-center relative overflow-hidden shadow-[0_0_100px_rgba(255,125,0,0.1)]">
            <Terminal size={150} className="text-brand-primary opacity-20" />
            <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm flex items-center justify-center">
              <span className="text-brand-primary font-black text-4xl uppercase italic tracking-tighter -rotate-12">Under Construction</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white/[0.02] border border-white/5 p-10 md:p-16 rounded-[4rem] space-y-12">
            <h3 className="text-brand-primary font-black text-4xl italic uppercase tracking-tighter ml-6 text-center md:text-left">對於玩家</h3>
            <div className="grid grid-cols-1 gap-10 pr-6">
              {[
                { icon: Palette, title: "展現自我", desc: "客製化 Skin 一鍵無縫替換" },
                { icon: Compass, title: "跨界探索", desc: "快速瀏覽並秒連熱門伺服器" },
                { icon: Package, title: "告別報錯", desc: "零門檻的伺服器模組自動同步" },
                { icon: Users, title: "社群連線", desc: "好友狀態追蹤與即時動態" },
                { icon: Cpu, title: "效能釋放", desc: "AI 智慧記憶體與流暢度優化" },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-8 group transition-all duration-500">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all duration-500">
                    <item.icon className="w-7 h-7 text-brand-primary" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-white font-black text-xl italic tracking-tighter group-hover:translate-x-1 transition-transform">{item.title}</span>
                    <span className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-10 md:p-16 rounded-[4rem] space-y-12">
            <h3 className="text-brand-primary font-black text-4xl italic uppercase tracking-tighter ml-6 text-center md:text-left">對於伺服主</h3>
            <div className="grid grid-cols-1 gap-10 pr-6">
              {[
                { icon: MessageSquare, title: "凝聚玩家", desc: "專屬伺服器社群與頻道整合" },
                { icon: Layout, title: "掌控全局", desc: "強大的模組版本自動化控管" },
                { icon: ShieldCheck, title: "杜絕作弊", desc: "進階玩家客戶端檔案深度驗證" },
                { icon: Banknote, title: "流量變現", desc: "內建贊助方案與金流收款系統" },
                { icon: HardDrive, title: "解放硬體", desc: "彈性且穩定的開服託管選擇" },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-8 group transition-all duration-500">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-brand-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-primary/20 transition-all duration-500">
                    <item.icon className="w-7 h-7 text-brand-primary" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-white font-black text-xl italic tracking-tighter group-hover:translate-x-1 transition-transform">{item.title}</span>
                    <span className="text-white/40 text-sm font-medium leading-relaxed max-w-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-40 bg-white/[0.02] border border-white/5 p-12 md:p-20 rounded-[4rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
          <div className="relative z-10 space-y-8 max-w-4xl">
            <div className="space-y-2">
              <h3 className="text-brand-primary font-black text-4xl italic uppercase tracking-tight">平台願景</h3>
              <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em]">Our Platform Vision</p>
            </div>
            <p className="text-white/60 text-xl md:text-2xl font-medium leading-relaxed italic">
              「我們致力於打破伺服器與玩家之間的隔閡。在啟動器平台上，玩家能無縫探索無數世界；而伺服主則能告別繁瑣的模組同步與新手除錯。您只需專心打造獨一無二的遊戲體驗，最硬核的技術底層交由我們一站式解決。」
            </p>
          </div>
        </div>

        <div className="mb-40 space-y-12">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-center">核心功能模組預覽</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: UserCircle, label: "Skin 系統" },
              { icon: Layout, label: "伺服器瀏覽器" },
              { icon: Package, label: "模組管理器" },
              { icon: Users, label: "好友社群" },
              { icon: Settings, label: "自動優化" },
              { icon: Server, label: "一鍵開服" },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:bg-brand-primary/5 transition-colors">
                <item.icon className="w-10 h-10 text-brand-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="text-white/40 font-black text-sm uppercase tracking-widest group-hover:text-white transition-colors">{item.label}</span>
              </div>
            ))}
            <div className="col-span-2 bg-brand-primary/10 border border-brand-primary/20 p-8 rounded-3xl flex items-center justify-center">
              <span className="text-brand-primary font-black italic tracking-widest">MORE FEATURES COMING SOON...</span>
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
          <button onClick={() => setIsModalOpen(true)} className="px-12 py-6 bg-white/5 border border-white/10 rounded-full text-white font-black hover:bg-white hover:text-black transition-all">
            VIEW ON GITHUB
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Coming Soon"
        message="開發日誌與社群連結正在籌備中，敬請期待！"
      />
    </div>
  );
}
