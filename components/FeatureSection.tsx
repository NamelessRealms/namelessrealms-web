'use client';

export default function FeatureSection() {
  const features = [
    {
      label: "長期開服，服務不間斷",
      desc: "我們的伺服器長期開放，服務穩定持續。不論您需要多人遊玩伺服器、社群討論區，我們都為您提供不間斷的服務，絕不會無預警中斷服務！",
      img: "/images/server_quasi.png",
      reverse: false,
    },
    {
      label: "即將推出，社群啟動器",
      desc: "我們正在為社群開發專屬的無名啟動器！這款啟動器將提供極速載入與自動化模組同步，旨在為玩家帶來更舒適的遊戲啟動體驗，敬請期待。",
      img: "/images/launcher.png",
      reverse: true,
    }
  ];

  return (
    <section className="bg-brand-dark">
      {features.map((f, i) => (
        <div 
          key={i} 
          className={`flex flex-col ${f.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[600px] relative`}
        >
          {/* 移除 background 色塊，改用微妙的邊框裝飾 */}
          <div className="flex-1 flex items-center justify-center p-12 md:p-24">
            <div className="max-w-xl space-y-8 text-center md:text-left relative z-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-tight">
                  {f.label}
                </h2>
                <div className="w-20 h-2 bg-brand-primary mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,125,0,0.5)]"></div>
              </div>
              <p className="text-white/40 text-lg md:text-xl leading-relaxed font-medium">
                {f.desc}
              </p>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12">
            {/* 背景裝飾光暈 - 代替色塊 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-primary/[0.03] blur-[120px] rounded-full"></div>
            
            <div className="relative w-full h-full max-w-lg aspect-square group">
                <img 
                    src={f.img} 
                    alt={f.label} 
                    className="w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(255,125,0,0.15)] transform group-hover:scale-105 transition-all duration-1000" 
                />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
