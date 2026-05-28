import { Link } from "react-router-dom";
import MultiStepCalculator from "@/components/MultiStepCalculator";
import SectionEyebrow from "@/components/SectionEyebrow";
import FAQ from "@/components/FAQ";
import FundingRange from "@/components/FundingRange";

const PRODUCTS = [
  { t: "Revenue Based Financing (RBF)", range: "$5K – $500K", term: "3 – 18 months", funding: "1 – 3 days", body: "Fast capital with flexible daily or weekly remittances based on your revenue.", to: "/mca" },
  { t: "Line of Credit", range: "$10K – $250K", term: "Revolving", funding: "3 – 7 days", body: "Revolving credit line you draw from as needed. Only pay for what you use.", to: "/contact" },
  { t: "Equipment Financing", range: "$10K – $10M", term: "1 – 7 years", funding: "3 – 10 days", body: "Finance machinery, technology, vehicles, or other essential business equipment.", to: "/contact" },
  { t: "HELOC", range: "$25K – $500K", term: "10 – 30 years", funding: "2 – 4 weeks", body: "Leverage your home equity for business capital with competitive rates.", to: "/heloc-calculator" },
  { t: "Long-Term Business Loan", range: "$50K – $10M", term: "1 – 10 years", funding: "5 – 14 days", body: "Structured financing with predictable monthly payments for sustained growth.", to: "/long-term-loans" },
];

const FAQS = [
  { q: "How does the revenue-to-funding ratio work?", a: "Most revenue-based products sit between 75% and 150% of your monthly revenue per position. Strong businesses with clean bank statements and lower existing debt can reach the upper end of that range." },
  { q: "How does industry affect funding amounts?", a: "Higher-margin and more stable industries (healthcare, professional services, technology) often unlock slightly higher multiples. More volatile industries can see tighter ratios but still qualify with solid revenue." },
  { q: "How does time in business affect the amount?", a: "Time in business is a major risk indicator. Businesses under 6 months see significantly reduced funding multiples; 2+ years and 5+ years tend to receive the most favorable structures." },
  { q: "What role does credit score play?", a: "Credit influences pricing more than approval. Even sub-600 credit profiles can qualify for many revenue-based products — but stronger credit unlocks better factor rates and longer terms." },
  { q: "How do existing positions affect funding?", a: "Each existing RBF position increases risk and reduces additional funding capacity. Clean, single-position files typically have the most flexibility for new advances." },
];

export default function FundingEstimatorPage() {
  return (
    <div data-testid="estimator-page">
      <section className="relative overflow-hidden">
        <img src="/images/funding_prism.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-12">
          <div className="eyebrow">Revenue-Based Funding Estimator</div>
          <h1 className="h1 mt-5 max-w-4xl">How much funding <span className="gradient-text">can you get?</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            Three quick steps. We match you to the right products based on your revenue, credit, and time in business — no desired amount needed.
          </p>
        </div>
      </section>

      <section className="container-x pb-12">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <MultiStepCalculator />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="glass rounded-2xl p-6">
              <div className="eyebrow">Products You May Qualify For</div>
              <div className="mt-4 space-y-3">
                {PRODUCTS.map((p, i) => (
                  <div key={i} className="card-surface p-5" data-testid={`est-product-${i}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="text-white font-medium tracking-tight">{p.t}</h4>
                      <span className="font-mono text-[0.72rem] text-emerald-400 uppercase tracking-[0.18em] shrink-0">{p.range}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-2">{p.body}</p>
                    <div className="flex justify-between text-xs text-zinc-500 mt-3 font-mono uppercase tracking-[0.16em]">
                      <span>{p.term}</span><span>{p.funding}</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Link to={p.to} className="text-xs text-emerald-400 hover:text-emerald-300">Learn more →</Link>
                      <Link to="/contact" className="text-xs text-zinc-300 hover:text-white">Apply →</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Methodology" title="How RBF funding amounts are determined." />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {[
            { v: "75–150%", l: "1st Position Advance" },
            { v: <FundingRange />, l: "RBF Funding Range" },
            { v: "1.05–1.45", l: "Factor Rate" },
            { v: "500+", l: "Min Credit Accepted" },
          ].map((s, i) => (
            <div key={i} className="bg-[#0b0b0d] p-5 md:p-8 min-w-0" data-testid={`est-method-${i}`}>
              <div className="font-mono text-lg sm:text-xl md:text-2xl text-white tracking-tight break-words">{s.v}</div>
              <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] sm:text-[0.7rem] text-zinc-500 mt-3 truncate">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-12"><FAQ items={FAQS} testIdPrefix="est-faq" /></div>
      </section>
    </div>
  );
}
