export default function StatStrip({ items, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06] border-y border-white/[0.06] ${className}`}
      data-testid="stat-strip"
    >
      {items.map((s, i) => (
        <div key={i} className="px-6 py-7" data-testid={`stat-${i}`}>
          <div className="font-mono text-2xl md:text-3xl text-white tracking-tight">{s.value}</div>
          <div className="eyebrow mt-2 text-zinc-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
