export default function StatStrip({ items, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06] border-y border-white/[0.06] ${className}`}
      data-testid="stat-strip"
    >
      {items.map((s, i) => (
        <div key={i} className="px-4 sm:px-5 lg:px-6 py-5 sm:py-7 min-w-0" data-testid={`stat-${i}`}>
          <div className="font-mono text-lg sm:text-xl lg:text-2xl text-white tracking-tight">{s.value}</div>
          <div className="font-mono uppercase tracking-[0.16em] text-[0.62rem] sm:text-[0.7rem] font-medium text-zinc-500 mt-1.5 sm:mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
