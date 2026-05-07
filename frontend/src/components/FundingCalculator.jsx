import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Sparkles } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const INDUSTRIES = ["Restaurant / Food Service", "Retail", "E-Commerce", "Construction", "Healthcare", "Transportation", "Professional Services", "Auto Repair", "Beauty / Salon", "Manufacturing", "Real Estate", "Technology", "Other"];
const TIBS = ["Under 6 months", "6 – 12 months", "1 – 2 years", "2 – 5 years", "5+ years"];
const SCORES = ["500 – 549", "550 – 599", "600 – 649", "650 – 699", "700 – 749", "750+"];
const POSITIONS = ["None", "1 position", "2 positions", "3+ positions"];

const formatCurrency = (n) => "$" + (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function FundingCalculator({ compact = false }) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", business_name: "",
    monthly_revenue: 50000, industry: "", time_in_business: "", credit_score: "",
    existing_positions: "", email: "", phone: "",
  });
  const [estimate, setEstimate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Live estimate
  useEffect(() => {
    if (!form.monthly_revenue) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${API}/calc/funding-estimate`, form);
        setEstimate(data.estimate);
      } catch (e) { /* silent */ }
    }, 250);
    return () => clearTimeout(t);
  }, [form.monthly_revenue, form.industry, form.time_in_business, form.credit_score, form.existing_positions]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.first_name) {
      toast.error("Please fill required fields (Name, Email).");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/leads/funding-calculator`, form);
      setEstimate(data.estimate);
      toast.success("Submitted. A specialist will reach out within 24 hours.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} data-testid="funding-calculator-form" className="glass-strong rounded-2xl p-7 md:p-9 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span className="eyebrow">Funding Calculator</span>
        </div>
        <h3 className="h3 mt-1">See how much you can get — instantly.</h3>
        <p className="text-zinc-400 text-sm mt-2">Fill in your details to get matched with the right products.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
          <Field label="First Name *">
            <Input data-testid="fc-first-name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
          </Field>
          <Field label="Last Name *">
            <Input data-testid="fc-last-name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
          </Field>
          <Field label="Business Name *" full>
            <Input data-testid="fc-business" value={form.business_name} onChange={(e) => update("business_name", e.target.value)} />
          </Field>

          <Field label={`Monthly Revenue — ${formatCurrency(form.monthly_revenue)}`} full>
            <Slider
              data-testid="fc-revenue-slider"
              value={[form.monthly_revenue]}
              min={10000} max={10000000} step={5000}
              onValueChange={(v) => update("monthly_revenue", v[0])}
              className="mt-3"
            />
            <div className="flex justify-between text-[0.7rem] text-zinc-500 mt-2 font-mono">
              <span>$10K</span><span>$10M</span>
            </div>
          </Field>

          <Field label="Industry">
            <SelectField testid="fc-industry" value={form.industry} onChange={(v) => update("industry", v)} options={INDUSTRIES} placeholder="Select your industry" />
          </Field>
          <Field label="Time in Business">
            <SelectField testid="fc-tib" value={form.time_in_business} onChange={(v) => update("time_in_business", v)} options={TIBS} placeholder="Select time in business" />
          </Field>
          <Field label="Credit Score">
            <SelectField testid="fc-credit" value={form.credit_score} onChange={(v) => update("credit_score", v)} options={SCORES} placeholder="Select credit score range" />
          </Field>
          <Field label="Existing MCA Positions">
            <SelectField testid="fc-positions" value={form.existing_positions} onChange={(v) => update("existing_positions", v)} options={POSITIONS} placeholder="Select existing positions" />
          </Field>

          <Field label="Email Address">
            <Input data-testid="fc-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <Input data-testid="fc-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
        </div>

        {estimate && (
          <div className="mt-7 grid grid-cols-3 gap-3" data-testid="fc-estimate-box">
            {[
              { k: "conservative", label: "Conservative", sub: "Best rates" },
              { k: "average", label: "Average", sub: "Most likely" },
              { k: "aggressive", label: "Aggressive", sub: "Max funding" },
            ].map((s) => (
              <div key={s.k} className="card-surface p-4 text-center">
                <div className="eyebrow text-zinc-500">{s.label}</div>
                <div className="font-mono text-xl text-white mt-2">{formatCurrency(estimate[s.k])}</div>
                <div className="text-[0.72rem] text-zinc-500 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        <button data-testid="fc-submit" type="submit" disabled={submitting} className="btn-accent w-full mt-7 disabled:opacity-60">
          {submitting ? "Submitting..." : "See my options"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
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

export function Input(props) {
  return (
    <input
      {...props}
      className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
    />
  );
}

export function SelectField({ value, onChange, options, placeholder, testid }) {
  // options can be string[] or {value,label}[]
  const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testid} className="bg-[#0c0c0e] border-white/[0.08] text-zinc-100 h-11 rounded-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#121214] border-white/10 text-zinc-100">
        {normalized.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
