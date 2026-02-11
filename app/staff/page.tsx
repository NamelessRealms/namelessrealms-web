import { staffData } from "@/data/staff";
import Navbar from "@/components/Navbar";

export default function StaffPage() {
  return (
    <div className="pt-48 pb-24 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* 統一的背景背景 */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <header className="mb-24 space-y-4">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter">
            Our <span className="text-brand-primary">Team</span>
          </h1>
          <p className="text-white/40 text-xl font-medium tracking-widest uppercase">開拓者與守護者</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
          {staffData.map((staff) => (
            <div key={staff.name} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl backdrop-blur-xl">
              <div className="w-24 h-24 bg-brand-primary/20 rounded-3xl mb-8 flex items-center justify-center text-brand-primary font-black text-4xl shadow-[0_10px_30px_rgba(255,125,0,0.2)]">
                {staff.name[0]}
              </div>
              <h3 className="text-3xl font-black text-white uppercase italic mb-2 tracking-tight">{staff.name}</h3>
              <p className="text-brand-primary font-black uppercase text-xs tracking-[0.3em] mb-6">{staff.role}</p>
              <p className="text-white/40 text-lg leading-relaxed">{staff.description}</p>
              
              {/* 裝飾性線條 */}
              <div className="mt-8 w-12 h-1 bg-white/5 group-hover:w-full group-hover:bg-brand-primary transition-all duration-700"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
