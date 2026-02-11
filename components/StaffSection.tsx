import { staffData } from "@/data/staff";

export default function StaffSection() {
  return (
    <section className="py-32 bg-brand-dark px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-primary/[0.05] border border-brand-primary/10 rounded-[4rem] p-12 md:p-20 text-center md:text-left relative overflow-hidden">
          {/* 背景裝飾 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-md">
              <h2 className="text-5xl font-black text-white mb-6">管理團隊</h2>
              <p className="text-white/40 text-lg leading-relaxed">
                由一群熱愛模組、致力於創造完美冒險體驗的開拓者組成。我們維護著無名領域的每一寸土地。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
              {staffData.map((staff) => (
                <div key={staff.name} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:border-brand-primary/40 transition-all group">
                  <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl mb-6 flex items-center justify-center text-brand-primary font-black text-2xl group-hover:scale-110 transition-transform">
                    {staff.name[0]}
                  </div>
                  <h3 className="text-xl font-black text-white">{staff.name}</h3>
                  <p className="text-brand-primary font-bold text-xs uppercase tracking-widest mt-1 mb-4">{staff.role}</p>
                  <p className="text-white/40 text-sm leading-relaxed">{staff.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
