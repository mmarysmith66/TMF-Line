import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Zap, ShieldCheck, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import StatStrip from "@/components/StatStrip";
import MultiStepCalculator from "@/components/MultiStepCalculator";
import SectionEyebrow from "@/components/SectionEyebrow";

export default function HomePage() {
  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <img
          src="/images/hero_abstract.png"
          alt=""
          className="absolute inset-x-0 top-0 w-full h-[700px] object-cover opacity-30 pointer-events-none [mask-image:linear-gradient(to_bottom,black_30%,transparent_85%)]"
        />
        <div className="container-x relative pt-16 md:pt-24 pb-12">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Reviewing applications · Average decision in 24 hours
              </div>
              <h1 className="h1 mt-6">
                Capital that respects <span className="gradient-text">your timeline.</span>
              </h1>
              <p className="body-lg mt-6 max-w-xl">
                See which funding products match your business — in seconds. No login required.
                Strategic, transparent, and structured for how you actually grow.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link to="/contact" data-testid="hero-cta-primary" className="btn-accent">
                  Start application <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/funding-estimator" data-testid="hero-cta-secondary" className="btn-ghost">
                  Estimate funding <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10">
                <StatStrip
                  items={[
                    { value: "1–24h", label: "Decision Speed" },
                    { value: "$5K–∞", label: "Funding Range" },
                    { value: "37", label: "Products" },
                    { value: "Dedicated", label: "Guidance" },
                  ]}
                />
              </div>
            </div>

            <div className="lg:col-span-5 fade-up" style={{ animationDelay: "0.15s" }}>
              <MultiStepCalculator compact />
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container-x section-y">
        <SectionEyebrow
          label="Why TMF Line"
          title="Speed paired with strategic thinking."
          description="Every funding solution is structured around your business reality — not a one-size product playbook."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {[
            { icon: Zap, title: "Fast Decisions", body: "Typical review within 24–48 hours. No weeks of waiting for answers." },
            { icon: ShieldCheck, title: "Transparent Terms", body: "Clear documentation, zero hidden fees. You understand exactly what you're getting." },
            { icon: Layers, title: "Flexible Solutions", body: "Multiple products and structures adapted to your specific business stage." },
            { icon: Sparkles, title: "Dedicated Guidance", body: "An advisor who understands your industry and growth trajectory." },
          ].map((f, i) => (
            <div key={i} className="bg-[#0b0b0d] p-8 md:p-10 hover:bg-[#101013] transition-colors" data-testid={`why-card-${i}`}>
              <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-emerald-400 mb-5">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="h3">{f.title}</h3>
              <p className="body mt-3 text-[0.97rem]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="container-x section-y">
        <SectionEyebrow
          label="Products"
          title="One platform. Multiple capital paths."
          description="From short-term cash injection to long-term structured loans — choose the structure that fits."
        />
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { to: "/long-term-loans", title: "Long-Term Business Loans", range: "$50K – $5M", term: "1 – 10 years", body: "Predictable monthly payments for sustained growth, expansion, or refinancing." },
            { to: "/mca", title: "Cash Injection (MCA)", range: "$5K – $500K", term: "3 – 18 months", body: "Fast capital with revenue-aligned remittances. Funded as fast as same-day." },
            { to: "/heloc-calculator", title: "HELOC Calculator", range: "$25K – $500K", term: "10 – 30 years", body: "Leverage your home equity for business capital with competitive rates." },
            { to: "/funding-estimator", title: "Revenue-Based Estimator", range: "Instant Output", term: "Real-time", body: "Get matched to the right products based on revenue, credit, and time in business." },
            { to: "/contact", title: "Equipment Financing", range: "$10K – $5M", term: "1 – 7 years", body: "Finance machinery, technology, or vehicles — collateralized by the asset." },
            { to: "/contact", title: "Line of Credit", range: "$10K – $250K", term: "Revolving", body: "Draw what you need, when you need it. Only pay for what you use." },
          ].map((p, i) => (
            <Link
              key={i}
              to={p.to}
              data-testid={`product-card-${i}`}
              className="card-surface p-7 group flex flex-col"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[0.72rem] text-emerald-400 uppercase tracking-[0.18em]">{p.range}</span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
              </div>
              <h3 className="h3 mt-5">{p.title}</h3>
              <p className="body mt-3 text-[0.95rem] flex-1">{p.body}</p>
              <div className="mt-6 pt-5 border-t border-white/[0.05] text-xs text-zinc-500 font-mono uppercase tracking-[0.16em]">{p.term}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative section-y">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="container-x">
          <SectionEyebrow
            label="How it works"
            title="From form to funding in three stages."
            description="Designed to be precise, fast, and free of friction."
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: "01", title: "See your options", body: "Fill out our quick form and instantly see which funding products match your business profile." },
              { n: "02", title: "Talk to a specialist", body: "Get instant answers and personalized guidance. We qualify your needs so we can serve you faster." },
              { n: "03", title: "Get funded", body: "A funding specialist contacts you within 24 hours with a pre-qualified offer tailored to your business." },
            ].map((s, i) => (
              <div key={i} className="relative card-surface p-8" data-testid={`how-step-${i}`}>
                <div className="font-mono text-emerald-400 text-sm tracking-[0.22em]">{s.n}</div>
                <h3 className="h3 mt-4">{s.title}</h3>
                <p className="body mt-3">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-24">
        <div className="relative rounded-3xl border border-white/[0.06] overflow-hidden p-10 md:p-16">
          <img src="/images/data_flow.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#06120c]/80 via-[#09090b]/85 to-[#08151a]/80" />
          <div className="relative max-w-2xl">
            <div className="eyebrow">Get Started</div>
            <h2 className="h2 mt-4">Ready to explore your funding options?</h2>
            <p className="body-lg mt-5">
              Scroll up and use the funding calculator, or speak directly with our team for tailored guidance.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/contact" data-testid="cta-get-funded" className="btn-accent">Get funded <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/about" data-testid="cta-learn-more" className="btn-ghost">Learn about TMF Line</Link>
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
              {["No login required", "Soft credit-aware quotes", "24-48h decision turnaround", "Dedicated funding advisor"].map((x) => (
                <li key={x} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
