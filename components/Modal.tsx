'use client';

import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export default function Modal({ isOpen, onClose, title, message }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-zinc-900 border border-brand-primary/30 rounded-[2.5rem] p-10 md:p-16 max-w-xl w-full shadow-[0_20px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(255,125,0,0.1)] animate-in fade-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center space-y-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-primary/10 mb-2">
                        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    </div>

                    <div className="space-y-4">
                        {title && (
                            <h3 className="text-brand-primary font-black text-2xl uppercase italic tracking-tighter">
                                {title}
                            </h3>
                        )}
                        <p className="text-white text-xl md:text-2xl font-bold leading-relaxed">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-5 bg-brand-primary text-black font-black text-xl rounded-2xl hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest italic"
                    >
                        我瞭解了
                    </button>
                </div>
            </div>
        </div>
    );
}
