import { ShieldCheck, Zap, Diamond, Star } from 'lucide-react';

export default function DonatePage() {
  const tiers = [
    { name: "初級贊助", price: "TWD 100 / 月", icon: <Star className="text-brand-primary" />, features: ["專屬聊天頭銜", "基礎資源包", " Discord 專屬身分組"] },
    { name: "核心贊助", price: "TWD 300 / 月", icon: <Zap className="text-brand-primary" />, features: ["進階資源獎勵", "地圖專屬標記", "優先登入權限"] },
    { name: "傳奇贊助", price: "TWD 500 / 月", icon: <Diamond className="text-brand-primary" />, features: ["神級裝備套裝", "自定義特效", "每月全服公告權"] },
  ];

  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <header className="text-center mb-24 space-y-6">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
            Donate <span className="text-brand-primary">Us</span>
          </h1>
          <p className="text-white/40 text-xl max-w-2xl mx-auto">您的支持是我們持續開發、維護伺服器與啟動器的最大動力。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div key={tier.name} className="group bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 hover:border-brand-primary/30 transition-all duration-500 flex flex-col items-center text-center shadow-2xl relative">
              {/* 頂部裝飾 */}
              <div className="w-16 h-16 bg-white/5 rounded-2xl mb-8 flex items-center justify-center scale-125">
                {tier.icon}
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tight">{tier.name}</h3>
              <p className="text-brand-primary font-black text-xl mb-10">{tier.price}</p>
              
              <ul className="space-y-4 w-full mb-12">
                {tier.features.map(f => (
                  <li key={f} className="text-white/40 text-sm font-bold flex items-center justify-center">
                    <ShieldCheck size={14} className="mr-3 text-brand-primary" /> {f}
                  </li>
                ))}
              </ul>

              <button className="mt-auto w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-brand-primary transition-all uppercase italic tracking-widest shadow-lg">
                選擇此方案
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
