import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Input, SelectField } from "@/components/FundingCalculator";
import SectionEyebrow from "@/components/SectionEyebrow";
import FAQ from "@/components/FAQ";
import { ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const INDUSTRIES = ["Restaurant / Food Service", "Retail", "E-Commerce", "Construction", "Healthcare", "Transportation", "Professional Services", "Auto Repair", "Beauty / Salon", "Manufacturing", "Real Estate", "Technology", "Other"];
const TIBS = ["Under 6 months", "6 – 12 months", "1 – 2 years", "2 – 5 years", "5+ years"];
const SCORES = ["500 – 549", "550 – 599", "600 – 649", "650 – 699", "700 – 749", "750+"];
const POSITIONS = ["None", "1 position", "2 positions", "3+ positions"];

const PRODUCTS = [
  { t: "Merchant Cash Advance", range: "$5K – $500K", term: "3 – 18 months", funding: "1 – 3 days", body: "Fast capital with flexible daily or weekly remittances based on your revenue.", to: "/mca" },
  { t: "Line of Credit", range: "$10K – $250K", term: "Revolving", funding: "3 – 7 days", body: "Revolving credit line you draw from as needed. Only pay for what you use.", to: "/contact" },
  { t: "Equipment Financing", range: "$10K – $5M", term: "1 – 7 years", funding: "3 – 10 days", body: "Finance machinery, technology, vehicles, or other essential business equipment.", to: "/contact" },
  { t: "HELOC", range: "$25K – $500K", term: "10 – 30 years", funding: "2 – 4 weeks", body: "Leverage your home equity for business capital with competitive rates.", to: "/heloc-calculator" },
  { t: "Long-Term Business Loan", range: "$50K – $5M", term: "1 – 10 years", funding: "5 – 14 days", body: "Structured financing with predictable monthly payments for sustained growth.", to: "/long-term-loans" },
];

const FAQS = [
  { q: "How does the revenue-to-funding ratio work?", a: "Most revenue-based products sit between 75% and 150% of your monthly revenue per position. Strong businesses with clean bank statements and lower existing debt can reach the upper end of that range." },
  { q: "How does industry affect funding amounts?", a: "Higher-margin and more stable industries (healthcare, professional services, technology) often unlock slightly higher multiples. More volatile industries can see tighter ratios but still qualify with solid revenue." },
  { q: "How does time in business affect the amount?", a: "Time in business is a major risk indicator. Businesses under 6 months see significantly reduced funding multiples; 2+ years and 5+ years tend to receive the most favorable structures." },
  { q: "What role does credit score play?", a: "Credit influences pricing more than approval. Even sub-600 credit profiles can qualify for many revenue-based products — but stronger credit unlocks better factor rates and longer terms." },
  { q: "How do existing positions affect funding?", a: "Each existing MCA position increases risk and reduces additional funding capacity. Clean, single-position files typically have the most flexibility for new advances." },
];

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function FundingEstimatorPage() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", business_name: "",
    monthly_revenue: 50000, industry: "", time_in_business: "", credit_score: "",
    existing_positions: "", desired_amount: 100000, phone: "", email: "", notes: "",
  });
  const [estimate, setEstimate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${API}/calc/funding-estimate`, form);
        setEstimate(data.estimate);
      } catch (e) {/* silent */}
    }, 200);
    return () => clearTimeout(t);
  }, [form.monthly_revenue, form.industry, form.time_in_business, form.credit_score, form.existing_positions]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.first_name) {
      toast.error("Please provide First Name and Email.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/leads/funding-calculator`, form);
      toast.success("Submitted. A specialist will reach out within 24 hours.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="estimator-page">
      <section className="relative overflow-hidden">
        <img src="/images/funding_prism.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-12">
          <div className="eyebrow">Revenue-Based Funding Estimator</div>
          <h1 className="h1 mt-5 max-w-4xl">How much funding <span className="gradient-text">can you get?</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            Enter your business details to see estimated funding ranges, factor rates, and daily payments based on your revenue profile.
          </p>
        </div>
      </section>

      <section className="container-x pb-12">
        <form onSubmit={submit} data-testid="estimator-form" className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-strong rounded-2xl p-7 md:p-9">
            <h3 className="h3">Your Business Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
              <Field label="First Name"><Input data-testid="est-first" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} /></Field>
              <Field label="Last Name"><Input data-testid="est-last" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} /></Field>
              <Field full label="Business Name"><Input data-testid="est-business" value={form.business_name} onChange={(e) => update("business_name", e.target.value)} /></Field>

              <Field full label={`Monthly Revenue — ${fmt(form.monthly_revenue)}`}>
                <Slider data-testid="est-revenue" value={[form.monthly_revenue]} min={10000} max={10000000} step={5000} onValueChange={(v) => update("monthly_revenue", v[0])} className="mt-3" />
                <div className="flex justify-between text-[0.7rem] text-zinc-500 mt-2 font-mono"><span>$10K</span><span>$10M</span></div>
              </Field>

              <Field label="Industry"><SelectField testid="est-industry" value={form.industry} onChange={(v) => update("industry", v)} options={INDUSTRIES} placeholder="Select your industry" /></Field>
              <Field label="Time in Business"><SelectField testid="est-tib" value={form.time_in_business} onChange={(v) => update("time_in_business", v)} options={TIBS} placeholder="Select time" /></Field>
              <Field label="Credit Score Range"><SelectField testid="est-credit" value={form.credit_score} onChange={(v) => update("credit_score", v)} options={SCORES} placeholder="Select credit score" /></Field>
              <Field label="Existing MCA Positions"><SelectField testid="est-positions" value={form.existing_positions} onChange={(v) => update("existing_positions", v)} options={POSITIONS} placeholder="Select positions" /></Field>
            </div>

            <div className="hr-line my-8" />
            <h3 className="h3">Contact & Submit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
              <Field label="Desired Funding Amount" full>
                <Input data-testid="est-desired" type="number" value={form.desired_amount} onChange={(e) => update("desired_amount", Number(e.target.value))} />
              </Field>
              <Field label="Phone Number"><Input data-testid="est-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
              <Field label="Email Address"><Input data-testid="est-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field label="Additional Notes" full>
                <textarea data-testid="est-notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition" />
              </Field>
            </div>
            <button data-testid="est-submit" type="submit" disabled={submitting} className="btn-accent mt-7 disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit & Get Connected"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="glass-strong rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <h3 className="h3">Estimated Funding Range</h3>
                <div className="mt-6 grid grid-cols-3 gap-3" data-testid="est-results">
                  {[
                    { k: "conservative", l: "Conservative", s: "Lower amount, best rates" },
                    { k: "average", l: "Average", s: "Most likely scenario" },
                    { k: "aggressive", l: "Aggressive", s: "Max funding, higher cost" },
                  ].map((s) => (
                    <div key={s.k} className="card-surface p-4 text-center">
                      <div className="eyebrow text-zinc-500">{s.l}</div>
                      <div className="font-mono text-lg text-white mt-2">{estimate ? fmt(estimate[s.k]) : "—"}</div>
                      <div className="text-[0.7rem] text-zinc-500 mt-1">{s.s}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-5"><span className="text-zinc-300">These are estimates only.</span> Actual funding amounts, factor rates, and terms depend on your bank statement health, specific business metrics, and funder criteria.</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="eyebrow">Products You May Qualify For</div>
              <div className="mt-4 space-y-3">
                {PRODUCTS.map((p, i) => (
                  <div key={i} className="card-surface p-5" data-testid={`est-product-${i}`}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="text-white font-medium tracking-tight">{p.t}</h4>
                      <span className="font-mono text-[0.72rem] text-emerald-400 uppercase tracking-[0.18em]">{p.range}</span>
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
        </form>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Methodology" title="How MCA funding amounts are determined." />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {[
            { v: "75–150%", l: "1st Position Advance" },
            { v: "$5K–$500K", l: "MCA Funding Range" },
            { v: "500+", l: "Min Credit Accepted" },
            { v: "3–6 mo", l: "Statements Needed" },
          ].map((s, i) => (
            <div key={i} className="bg-[#0b0b0d] p-7 md:p-8" data-testid={`est-method-${i}`}>
              <div className="font-mono text-2xl text-white tracking-tight">{s.v}</div>
              <div className="eyebrow text-zinc-500 mt-3">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="mt-12"><FAQ items={FAQS} testIdPrefix="est-faq" /></div>
      </section>
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-xs uppercase tracking-[0.16em] text-zinc-500 mb-2 font-mono">{label}</label>
      {children}
    </div>
  );
}
