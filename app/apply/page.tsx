'use client';

import { useState } from 'react';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // ... 保持之前的提交邏輯 ...
    setTimeout(() => { setSubmitted(true); setLoading(false); }, 1000); 
  }

  if (submitted) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10 text-center space-y-6">
          <div className="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto">
            <div className="w-12 h-12 bg-brand-primary rounded-full"></div>
          </div>
          <h1 className="text-5xl font-black text-white">提交成功</h1>
          <p className="text-white/40">請等待管理團隊審核，我們將在 Discord 通知您。</p>
          <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-brand-primary text-black font-bold rounded-full">返回首頁</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen bg-brand-dark">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-[3rem] p-12 shadow-2xl space-y-12">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-4">申請白名單</h1>
            <p className="text-white/40">填寫下方資訊，加入我們的冒險隊伍。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-white/60 font-bold text-sm ml-2">Minecraft ID</label>
                <input required name="gameId" type="text" placeholder="你的遊戲名稱" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-white/60 font-bold text-sm ml-2">Discord ID</label>
                <input required name="discordTag" type="text" placeholder="例如: yucheng._.0918" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all" />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-white/60 font-bold text-sm ml-2">加入原因</label>
              <textarea required name="reason" rows={4} placeholder="告訴我們關於你的冒險經歷..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none"></textarea>
            </div>

            <button disabled={loading} className="w-full py-5 bg-brand-primary text-brand-dark font-black text-xl rounded-2xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(255,125,0,0.2)] disabled:opacity-50">
              {loading ? '正在提交...' : '發送申請'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
