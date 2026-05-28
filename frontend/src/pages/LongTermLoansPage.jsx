import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SectionEyebrow from "@/components/SectionEyebrow";
import FAQ from "@/components/FAQ";

const USE_CASES = [
  { t: "Business Expansion", b: "Open new locations, enter new markets, or scale existing operations with structured capital." },
  { t: "Equipment & Assets", b: "Finance machinery, technology, vehicles, or other essential business equipment." },
  { t: "Debt Refinancing", b: "Consolidate higher-cost debt into a single, more manageable monthly payment." },
  { t: "Working Capital", b: "Bridge seasonal gaps or fund day-to-day operations during growth phases." },
];

const BENEFITS = [
  "Predictable fixed monthly payments for easier budgeting",
  "Lower monthly cost compared to short-term products",
  "Larger funding amounts available ($50K – $10M typical range)",
  "Build business credit history with consistent repayment",
  "Retain full ownership — no equity dilution",
  "Potential tax-deductible interest payments",
];

const QUAL = [
  { l: "Time in Business", v: "2+ years typical" },
  { l: "Annual Revenue", v: "$250K+ preferred" },
  { l: "Credit Score", v: "650+ (varies)" },
  { l: "Loan Terms", v: "1 – 10 years" },
  { l: "Funding Amount", v: "$50K – $10M" },
];

const FAQS = [
  { q: "What credit score is typically needed for a long-term business loan?", a: "Most long-term loan products start considering applicants at 650+, with the strongest rates reserved for 700+. Compensating factors like long time-in-business or strong cash flow can offset lower scores." },
  { q: "How long does the approval process take?", a: "Initial decisions typically come within 24–48 hours. Full underwriting and funding for long-term loans generally completes in 5–14 business days, depending on documentation and product." },
  { q: "What documentation is required?", a: "Common requirements include 3–6 months of business bank statements, recent tax returns, a profit & loss statement, balance sheet, and basic business identification documents." },
  { q: "Are there prepayment penalties?", a: "It depends on the structure. Many of our long-term products offer no-prepayment-penalty options or graduated penalty schedules. We always disclose this clearly upfront." },
];

export default function LongTermLoansPage() {
  return (
    <div data-testid="loans-page">
      <section className="relative overflow-hidden">
        <img src="/images/loans_architecture.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-12">
          <div className="eyebrow">Long-Term Business Loans</div>
          <h1 className="h1 mt-5 max-w-4xl">Structured capital for <span className="gradient-text">sustained growth.</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            Long-term business loans provide predictable monthly payments over 1–10 years,
            giving your business the runway it needs to grow strategically without cash-flow pressure.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" data-testid="ltl-cta-apply" className="btn-accent">Start your application <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/funding-estimator" data-testid="ltl-cta-estimate" className="btn-ghost">Estimate funding</Link>
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Use Cases" title="Ideal use cases." description="Long-term loans work best when you need substantial capital with predictable repayment structure." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {USE_CASES.map((u, i) => (
            <div key={i} className="bg-[#0b0b0d] p-8 md:p-10 hover:bg-[#101013] transition" data-testid={`ltl-usecase-${i}`}>
              <div className="font-mono text-emerald-400 text-[0.7rem] tracking-[0.22em] uppercase">USE CASE 0{i + 1}</div>
              <h3 className="h3 mt-4">{u.t}</h3>
              <p className="body mt-3 text-[0.97rem]">{u.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionEyebrow label="Benefits" title="Why long-term financing." description="Built around predictability, capacity, and long-horizon planning." />
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-3">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-3 card-surface p-5" data-testid={`ltl-benefit-${i}`}>
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-zinc-200 text-[0.95rem]">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Qualification" title="Highlights at a glance." />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-5 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {QUAL.map((q, i) => (
            <div key={i} className="bg-[#0b0b0d] p-5 md:p-8 min-w-0" data-testid={`ltl-qual-${i}`}>
              <div className="font-mono uppercase tracking-[0.14em] text-[0.6rem] sm:text-[0.7rem] text-zinc-500 truncate">{q.l}</div>
              <div className="font-mono text-base sm:text-lg md:text-xl text-white mt-3 tracking-tight break-words">{q.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="FAQ" title="Frequently asked questions." />
        <div className="mt-10"><FAQ items={FAQS} testIdPrefix="ltl-faq" /></div>
      </section>

      <section className="container-x pb-24">
        <div className="card-surface p-10 md:p-14 text-center">
          <h2 className="h2">Ready to apply for a long-term business loan?</h2>
          <p className="body-lg mt-4 max-w-xl mx-auto">Start your application today. Our team typically responds within 24–48 hours.</p>
          <Link to="/contact" data-testid="ltl-bottom-cta" className="btn-accent mt-7">Apply Now <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
