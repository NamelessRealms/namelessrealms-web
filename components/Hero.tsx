export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-brand-dark px-6 py-32 overflow-hidden">
      {/* 背景光暈 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 blur-[120px] rounded-full"></div>
      
      <div className="max-w-5xl w-full bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 md:p-24 text-center relative z-10 shadow-2xl">
        <div className="inline-flex items-center space-x-2 bg-brand-primary/10 px-4 py-2 rounded-full mb-8">
          <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          <span className="text-brand-primary font-bold tracking-widest uppercase text-[10px]">
            The Future of Modded Minecraft
          </span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tight mb-8">
          探索 <span className="text-brand-primary">無名領域</span>
        </h1>
        
        <p className="text-white/40 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-12">
          一個結合現代科技與經典冒險的社群平台。加入我們，體驗最極致的模組世界。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto px-12 py-5 bg-brand-primary text-brand-dark font-black text-xl rounded-full hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,125,0,0.3)]">
            立即申請白名單
          </button>
          <button className="w-full sm:w-auto px-12 py-5 bg-white/5 text-white font-bold text-xl rounded-full hover:bg-white/10 transition-all border border-white/10">
            了解更多內容
          </button>
        </div>
      </div>

      {/* 底部裝飾 */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/10 font-black text-9xl select-none pointer-events-none uppercase">
        NAMELESS
      </div>
    </section>
  );
}
