import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionEyebrow from "@/components/SectionEyebrow";
import FAQ from "@/components/FAQ";

const STEPS = [
  { day: "Day 1", title: "Quick Application", body: "Provide basic business info and 3–4 months of bank statements. Takes about 10 minutes." },
  { day: "Day 1–2", title: "Fast Review", body: "Our team evaluates your business revenue performance and funding fit." },
  { day: "Day 2–3", title: "Offer & Terms", body: "Receive a clear offer with remittance structure and total cost of capital." },
  { day: "Day 2–4", title: "Funding", body: "Upon acceptance, funds can be deposited as fast as same or next business day." },
];

const IDEAL = [
  { t: "Retail Stores", b: "High-volume point-of-sale businesses with consistent daily transactions." },
  { t: "Restaurants & Cafés", b: "Food and beverage businesses with strong daily revenue patterns." },
  { t: "E-Commerce", b: "Online merchants with consistent payment processor volume." },
  { t: "Service Businesses", b: "Companies with regular credit-card or invoice-based income." },
];

const FAQS = [
  { q: "How is MCA different from a traditional loan?", a: "MCA is not a loan — it is a purchase of future receivables. Instead of fixed monthly payments, remittances are taken as a small percentage of your daily or weekly revenue, so payments flex with your business volume." },
  { q: "What are the typical costs of an MCA?", a: "Costs are expressed as a factor rate (e.g. 1.20–1.45) applied to the advance. The total cost depends on your business profile, time in business, credit, and revenue health. We always present the full cost upfront — no hidden fees." },
  { q: "Do I need good credit for an MCA?", a: "MCA underwriting weighs revenue performance more heavily than personal credit. Many businesses with credit scores in the 500s qualify — though stronger credit typically improves rates and funding amounts." },
  { q: "How much can I receive?", a: "Typical MCA advances range from $5K to $500K per position. Funding amounts are generally 75%–150% of monthly revenue, adjusted for industry, time in business, and any existing positions." },
];

export default function MCAPage() {
  return (
    <div data-testid="mca-page">
      <section className="relative overflow-hidden">
        <img src="/images/mca_hero.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-12">
          <div className="eyebrow">Cash Injection</div>
          <h1 className="h1 mt-5 max-w-4xl">
            Fast capital aligned <span className="gradient-text">with your revenue.</span>
          </h1>
          <p className="body-lg mt-6 max-w-2xl">
            Merchant Cash Advance provides quick access to working capital based on your business performance.
            Remittances flex with your daily or weekly revenue — when business is slower, payments adjust accordingly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" data-testid="mca-cta-apply" className="btn-accent">Get Started <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/funding-estimator" data-testid="mca-cta-estimate" className="btn-ghost">Estimate funding</Link>
          </div>
          <p className="text-xs text-zinc-500 mt-4 font-mono">Funding options may vary. Subject to qualification and business performance review.</p>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Process" title="Speed-focused process." description="From application to funding, designed for businesses that need capital quickly." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="card-surface p-7 relative" data-testid={`mca-step-${i}`}>
              <span className="font-mono text-[0.7rem] tracking-[0.22em] text-emerald-400 uppercase">{s.day}</span>
              <div className="mt-4 font-mono text-3xl text-white">0{i + 1}</div>
              <h3 className="h3 mt-3">{s.title}</h3>
              <p className="body text-[0.95rem] mt-3">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <SectionEyebrow label="Mechanics" title="How remittance works." description="Unlike fixed monthly payments, MCA remittances are based on a percentage of your daily or weekly business revenue." />
          </div>
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-surface p-7">
              <h3 className="h3">Revenue-Aligned Payments</h3>
              <p className="body mt-3 text-[0.95rem]">Payments flex with your business volume — higher revenue days mean faster payoff, slower days mean lower remittances.</p>
            </div>
            <div className="card-surface p-7">
              <h3 className="h3">No Fixed Term Pressure</h3>
              <p className="body mt-3 text-[0.95rem]">Since remittances are percentage-based, there's no rigid maturity date — payoff timing adjusts with your business performance.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Ideal For" title="Built for revenue-based businesses." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {IDEAL.map((x, i) => (
            <div key={i} className="card-surface p-7" data-testid={`mca-ideal-${i}`}>
              <h3 className="text-lg text-white tracking-tight">{x.t}</h3>
              <p className="body text-sm mt-3">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="FAQ" title="Frequently asked questions." />
        <div className="mt-10"><FAQ items={FAQS} testIdPrefix="mca-faq" /></div>
        <p className="text-xs text-zinc-500 mt-8 max-w-2xl">MCA is not a loan. It is a purchase of future receivables. Terms and availability depend on qualification.</p>
      </section>

      <section className="container-x pb-24">
        <div className="card-surface p-10 md:p-14 text-center">
          <h2 className="h2">Need fast working capital?</h2>
          <p className="body-lg mt-4 max-w-xl mx-auto">See if MCA is right for your business. Fast review based on your revenue performance.</p>
          <Link to="/contact" data-testid="mca-bottom-cta" className="btn-accent mt-7">Apply for MCA <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
