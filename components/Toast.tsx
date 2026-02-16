'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-[#121212] border-l-4 border-brand-primary text-white p-6 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(255,125,0,0.1)] flex items-center space-x-4 min-w-[320px]">
                <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <Info className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-brand-primary font-black text-xs uppercase tracking-widest mb-1">System Notification</p>
                    <p className="text-white/80 font-medium leading-relaxed">{message}</p>
                </div>
            </div>
        </div>
    );
}
