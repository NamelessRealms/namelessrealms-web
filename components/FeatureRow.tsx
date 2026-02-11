'use client';

interface FeatureRowProps {
    label: string;
    desc: string;
    img: string;
    reverse?: boolean;
}

export default function FeatureRow({ label, desc, img, reverse = false }: FeatureRowProps) {
    return (
        <div
            className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} min-h-[500px] relative items-center`}
        >
            <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                <div className="max-w-xl space-y-6 text-center md:text-left relative z-10">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
                            {label}
                        </h2>
                        <div className="w-16 h-1.5 bg-brand-primary mx-auto md:mx-0 shadow-[0_0_15px_rgba(255,125,0,0.5)]"></div>
                    </div>
                    <p className="text-white/40 text-base md:text-lg leading-relaxed font-medium">
                        {desc}
                    </p>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-primary/[0.02] blur-[100px] rounded-full"></div>

                <div className="relative w-full h-full max-w-md aspect-square group">
                    <img
                        src={img}
                        alt={label}
                        className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(255,125,0,0.1)] transform group-hover:scale-105 transition-all duration-1000"
                    />
                </div>
            </div>
        </div>
    );
}
