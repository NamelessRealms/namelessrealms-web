'use client';

export default function Footer() {
    return (
        <footer className="py-12 text-center border-t border-white/5 bg-brand-dark">
            <p className="text-white/20 text-sm uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} Nameless Realms. All Rights Reserved.
            </p>
        </footer>
    );
}
