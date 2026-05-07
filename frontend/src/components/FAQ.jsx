import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export default function FAQ({ items = [], testIdPrefix = "faq" }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-white/[0.06] border-y border-white/[0.06]" data-testid={`${testIdPrefix}-list`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="py-1" data-testid={`${testIdPrefix}-item-${i}`}>
            <button
              data-testid={`${testIdPrefix}-toggle-${i}`}
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-6 text-left py-6 group"
            >
              <span className={`text-lg ${isOpen ? "text-white" : "text-zinc-200"} group-hover:text-emerald-300 transition-colors tracking-tight`}>
                {it.q}
              </span>
              <span className="shrink-0 mt-1 h-7 w-7 rounded-full border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-emerald-300 group-hover:border-emerald-400/40 transition">
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-zinc-400 text-[0.97rem] leading-relaxed max-w-3xl">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
