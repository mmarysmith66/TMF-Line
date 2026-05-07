export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="brand-logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tmfGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#10b981" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="8" stroke="url(#tmfGrad)" strokeWidth="1.4" fill="rgba(16,185,129,0.06)" />
        <path d="M9 22 L9 11 M9 11 L23 11 M16 11 L16 22" stroke="url(#tmfGrad)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="23" cy="22" r="2" fill="url(#tmfGrad)" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="text-[1.05rem] font-semibold text-white tracking-tight">TMF Line</span>
        <span className="font-mono text-[0.62rem] tracking-[0.22em] text-zinc-500 uppercase mt-0.5">Capital Strategy</span>
      </div>
    </div>
  );
}
