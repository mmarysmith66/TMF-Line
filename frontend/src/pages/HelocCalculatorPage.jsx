import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { Input, SelectField } from "@/components/FundingCalculator";
import SectionEyebrow from "@/components/SectionEyebrow";
import FAQ from "@/components/FAQ";
import { ArrowRight, Home as HomeIcon } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SCORES = [
  { v: "excellent", label: "Excellent (740+)" },
  { v: "good", label: "Good (700-739)" },
  { v: "fair", label: "Fair (660-699)" },
  { v: "below", label: "Below 660" },
];

const FAQS = [
  { q: "How does a HELOC work?", a: "A Home Equity Line of Credit lets you borrow against the equity in your home. You draw funds during a draw period (often 5–10 years) and repay during a repayment period (often 10–20 years). You only pay interest on what you actually use." },
  { q: "How does LTV work?", a: "Loan-to-Value (LTV) is the ratio of total debt secured against your home divided by your home's appraised value. Max LTV up to 95% is available when TMF Line is the 1st lien (no other mortgage). Max LTV up to 85% is available when we are the 2nd lien (behind an existing mortgage). Stronger credit and lower debt-to-income typically unlock the upper LTV tiers." },
  { q: "Draw period vs. repayment period", a: "During the draw period, you can withdraw up to your credit limit and typically make interest-only payments. After the draw period closes, you enter the repayment period and start paying back principal and interest in fixed installments." },
  { q: "Common qualification factors", a: "Lenders typically review your home equity (home value minus mortgage), credit score, debt-to-income ratio, and stable income. Combined loan-to-value (CLTV) maximums depend on lien position — see the LTV breakdown above." },
  { q: "HELOC vs. Home Equity Loan", a: "A HELOC is a revolving credit line — flexible draws, variable rate. A home equity loan is a one-time lump sum at a fixed rate. HELOCs are better for ongoing needs; equity loans for a single defined purpose." },
];

const fmt = (n) => "$" + (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function HelocCalculatorPage() {
  const [form, setForm] = useState({
    home_value: 600000,
    mortgage_balance: 250000,
    ltv: 80,
    credit_score: "good",
    monthly_income: 12000,
    monthly_debt: 3000,
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${API}/calc/heloc`, form);
        setResult(data.result);
      } catch (e) { /* silent */ }
    }, 200);
    return () => clearTimeout(t);
  }, [form]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div data-testid="heloc-page">
      <section className="relative overflow-hidden">
        <img src="/images/heloc_house.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-10">
          <div className="eyebrow flex items-center gap-2"><HomeIcon className="h-3.5 w-3.5" /> HELOC Calculator</div>
          <h1 className="h1 mt-5 max-w-4xl">Estimate your home <span className="gradient-text">equity potential.</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            Use our interactive calculator to estimate how much you may be able to borrow through a Home Equity Line of Credit
            based on your property and financial profile.
          </p>
        </div>
      </section>

      <section className="container-x pb-12">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-strong rounded-2xl p-7 md:p-9">
            <h3 className="h3">Your Property & Finances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
              <Field label={`Current Home Value — ${fmt(form.home_value)}`} full>
                <Input data-testid="heloc-home-value" type="number" value={form.home_value} onChange={(e) => update("home_value", Number(e.target.value))} />
              </Field>
              <Field label={`Mortgage Balance — ${fmt(form.mortgage_balance)}`} full>
                <Input data-testid="heloc-mortgage" type="number" value={form.mortgage_balance} onChange={(e) => update("mortgage_balance", Number(e.target.value))} />
              </Field>
              <Field label={`Lender Max LTV — ${form.ltv}%`} full>
                <Slider data-testid="heloc-ltv" value={[form.ltv]} min={60} max={95} step={1} onValueChange={(v) => update("ltv", v[0])} className="mt-3" />
                <div className="flex justify-between text-[0.7rem] text-zinc-500 mt-2 font-mono">
                  <span>60%</span><span>95%</span>
                </div>
              </Field>
              <Field label="Credit Score Range">
                <SelectField testid="heloc-credit"
                  value={form.credit_score}
                  onChange={(v) => update("credit_score", v)}
                  options={SCORES.map((s) => ({ value: s.v, label: s.label }))}
                  placeholder="Select credit score"
                />
              </Field>
              <Field label={`Monthly Gross Income — ${fmt(form.monthly_income)}`}>
                <Input data-testid="heloc-income" type="number" value={form.monthly_income} onChange={(e) => update("monthly_income", Number(e.target.value))} />
              </Field>
              <Field label={`Monthly Debt Payments — ${fmt(form.monthly_debt)}`} full>
                <Input data-testid="heloc-debt" type="number" value={form.monthly_debt} onChange={(e) => update("monthly_debt", Number(e.target.value))} />
              </Field>
            </div>
          </div>

          <div className="lg:col-span-5 glass-strong rounded-2xl p-7 md:p-9 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <h3 className="h3">Estimate Results</h3>
              {result ? (
                <div className="mt-6 space-y-4" data-testid="heloc-results">
                  <ResultRow label="Available Credit" value={fmt(result.available_credit)} highlight />
                  <ResultRow label="Home Equity" value={fmt(result.equity)} />
                  <ResultRow label="Maximum Total Debt (LTV)" value={fmt(result.max_loan)} />
                  <ResultRow label="Debt-to-Income" value={`${result.dti}%`} />
                  <div className={`mt-4 rounded-lg px-4 py-3 text-sm border ${result.qualified ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200" : "border-amber-400/20 bg-amber-500/10 text-amber-200"}`}>
                    {result.qualified ? "Strong likelihood of qualifying — connect with our team to refine terms." : "Profile may face tighter underwriting. Talk with us about alternatives."}
                  </div>
                </div>
              ) : (
                <p className="body mt-4">Enter your home value to see estimates.</p>
              )}
              <p className="text-xs text-zinc-500 mt-6 leading-relaxed">
                <span className="text-zinc-300 font-medium">Disclaimer:</span> This calculator provides general estimates only and is not a commitment to lend.
                Terms, eligibility, and funding amounts are subject to underwriting and qualification.
              </p>
              <Link to="/contact" data-testid="heloc-cta" className="btn-accent w-full mt-6">Connect with our team <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="LTV Breakdown" title="How loan-to-value works." description="Your maximum Loan-to-Value depends on lien position. Stronger credit and lower debt-to-income unlock the upper end of each tier." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="heloc-ltv-breakdown">
          <div className="card-surface p-7 md:p-8 relative overflow-hidden" data-testid="heloc-ltv-1lien">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-emerald-400">1st Lien Position</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl md:text-5xl text-white tracking-tight">95%</span>
                <span className="text-zinc-500 text-sm">max LTV</span>
              </div>
              <p className="body mt-5 text-[0.95rem]">
                When TMF Line is in 1st lien position (no other mortgage on the property), you can borrow against up to <span className="text-zinc-200">95%</span> of the home's appraised value.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-emerald-400 mt-2 shrink-0" /> No existing mortgage required</li>
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-emerald-400 mt-2 shrink-0" /> Highest available borrowing capacity</li>
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-emerald-400 mt-2 shrink-0" /> Best rates typically reserved for this tier</li>
              </ul>
            </div>
          </div>

          <div className="card-surface p-7 md:p-8 relative overflow-hidden" data-testid="heloc-ltv-2lien">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="font-mono uppercase tracking-[0.18em] text-[0.7rem] text-cyan-300">2nd Lien Position</div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-4xl md:text-5xl text-white tracking-tight">85%</span>
                <span className="text-zinc-500 text-sm">max combined LTV</span>
              </div>
              <p className="body mt-5 text-[0.95rem]">
                When there's an existing mortgage and TMF Line sits in 2nd lien position, your combined loan-to-value (CLTV) is capped at <span className="text-zinc-200">85%</span> of the home's appraised value.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-cyan-300 mt-2 shrink-0" /> Sits behind your existing 1st mortgage</li>
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-cyan-300 mt-2 shrink-0" /> Works for borrowers who want to keep a low-rate 1st</li>
                <li className="flex items-start gap-2"><span className="h-1 w-1 rounded-full bg-cyan-300 mt-2 shrink-0" /> CLTV = (1st balance + new HELOC) ÷ appraised value</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-zinc-400 leading-relaxed" data-testid="heloc-ltv-example">
          <span className="font-mono uppercase tracking-[0.16em] text-[0.62rem] text-zinc-500">Quick example</span>
          <p className="mt-3">
            On a <span className="text-zinc-200">$600,000</span> home with an existing <span className="text-zinc-200">$300,000</span> mortgage:
          </p>
          <ul className="mt-3 space-y-1.5">
            <li>· <span className="text-emerald-300">1st lien</span> (no existing mortgage): up to <span className="font-mono text-white">$570,000</span> available <span className="text-zinc-600">($600K × 95%)</span></li>
            <li>· <span className="text-cyan-300">2nd lien</span> (behind the $300K 1st): up to <span className="font-mono text-white">$210,000</span> available <span className="text-zinc-600">($600K × 85% − $300K)</span></li>
          </ul>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Understanding HELOCs" title="What you should know." />
        <div className="mt-10"><FAQ items={FAQS} testIdPrefix="heloc-faq" /></div>
      </section>

      <section className="container-x pb-24">
        <div className="card-surface p-10 md:p-14 text-center">
          <h2 className="h2">Interested in exploring HELOC options?</h2>
          <p className="body-lg mt-4 max-w-xl mx-auto">Connect with our team to discuss your home equity and borrowing potential.</p>
          <Link to="/contact" data-testid="heloc-bottom-cta" className="btn-accent mt-7">Contact Us <ArrowRight className="h-4 w-4" /></Link>
        </div>
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

function ResultRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className={`font-mono text-lg ${highlight ? "text-emerald-300" : "text-white"}`}>{value}</span>
    </div>
  );
}
