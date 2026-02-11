'use client';

export default function HomeHero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* 影片背景 */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        >
          <source src="/video/front.mp4" type="video/mp4" />
        </video>
        {/* 上下漸層遮罩，讓文字更好看 */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-transparent to-brand-dark"></div>
      </div>

      {/* 文字與按鈕 (不再有大盒子) */}
      <div className="relative z-10 text-center space-y-12">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <img src="/images/logo.png" alt="Nameless Realms Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 drop-shadow-[0_0_30px_rgba(255,125,0,0.3)]" />
          <h1 className="text-7xl md:text-[10rem] font-black text-white leading-none tracking-tighter uppercase italic drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            無名<span className="text-brand-primary">伺服器</span>
          </h1>
          <h2 className="text-2xl md:text-5xl font-bold text-white/80 uppercase tracking-widest italic drop-shadow-lg">
            模組生存冒險
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <button
            onClick={() => window.open("https://discord.com/invite/8BB3NY8")}
            className="w-full sm:w-auto px-16 py-6 bg-brand-primary text-brand-dark font-black text-2xl rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,125,0,0.4)]"
          >
            DISCORD
          </button>
          <button className="w-full sm:w-auto px-16 py-6 bg-white/10 text-white/40 font-bold text-2xl rounded-full backdrop-blur-md border border-white/10 cursor-not-allowed">
            即將推出社群啟動器
          </button>
        </div>
      </div>

      {/* 底部滑動指示器 (選加) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
        <div className="w-1 h-12 bg-gradient-to-b from-brand-primary to-transparent rounded-full"></div>
      </div>
    </section>
  );
}
