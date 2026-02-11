import { newsData } from "@/data/news";

export default function NewsSection() {
  return (
    <section className="py-32 bg-brand-dark px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-black text-white tracking-tight mb-2">最新動態</h2>
            <p className="text-white/40 font-medium">追蹤 Nameless Realms 的每一次進化</p>
          </div>
          <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white font-bold hover:bg-white/10 transition-all">
            查看所有文章
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsData.map((item) => (
            <div key={item.id} className="group relative bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-4 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2">
              <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-6">
                <div className="absolute inset-0 bg-gray-800 animate-pulse"></div>
                <div className="absolute top-4 left-4 bg-brand-primary text-brand-dark font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              <div className="px-4 pb-4">
                <p className="text-brand-primary font-bold text-xs tracking-widest mb-3">{item.date}</p>
                <h3 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors mb-3 leading-tight">
                  {item.title}
                </h3>
                <p className="text-white/40 text-sm line-clamp-2 mb-6">
                  {item.summary}
                </p>
                <div className="flex items-center text-white/60 font-bold text-sm group-hover:text-white transition-colors">
                  閱讀全文 <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
