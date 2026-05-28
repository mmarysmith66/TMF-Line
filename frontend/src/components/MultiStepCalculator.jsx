import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, MessageSquare, Mail, Utensils, ShoppingBag, HardHat, Truck, HeartPulse, Package, Scissors, MoreHorizontal } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const INDUSTRY_OPTIONS = [
  { value: "Restaurant / Food Service", label: "Restaurant", icon: Utensils },
  { value: "Retail", label: "Retail", icon: ShoppingBag },
  { value: "Construction", label: "Construction", icon: HardHat },
  { value: "Transportation", label: "Trucking", icon: Truck },
  { value: "Healthcare", label: "Healthcare", icon: HeartPulse },
  { value: "Wholesale", label: "Wholesale", icon: Package },
  { value: "Beauty / Salon", label: "Salon/Spa", icon: Scissors },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];
const TIBS = ["Under 6 months", "6 – 12 months", "1 – 2 years", "2 – 5 years", "5+ years"];
const SCORES = ["500 – 549", "550 – 599", "600 – 649", "650 – 699", "700 – 749", "750+"];
const POSITIONS = ["None", "1 position", "2 positions", "3+ positions"];

const fmt = (n) => "$" + (Math.round(n) || 0).toLocaleString("en-US");

// Currency input — typed as digits, stored as integer, displayed with commas + $ prefix
function CurrencyInput({ value, onChange, placeholder = "0", testid }) {
  const display = useMemo(() => (!value ? "" : Number(value).toLocaleString("en-US")), [value]);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    const n = digits === "" ? 0 : parseInt(digits, 10);
    onChange(n);
  };

  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500 font-mono text-sm pointer-events-none">$</span>
      <input
        data-testid={testid}
        inputMode="numeric"
        autoComplete="off"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg pl-7 pr-3.5 py-2.5 text-zinc-100 font-mono placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
      />
    </div>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition"
    />
  );
}

function SelectFld({ value, onChange, options, placeholder, testid }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger data-testid={testid} className="bg-[#0c0c0e] border-white/[0.08] text-zinc-100 h-11 rounded-lg">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#121214] border-white/10 text-zinc-100">
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Field({ label, hint, children, full = true }) {
  return (
    <div className={full ? "" : "min-w-0"}>
      <label className="block text-xs uppercase tracking-[0.16em] text-zinc-500 mb-2 font-mono">{label}</label>
      {children}
      {hint && <p className="text-[0.7rem] text-zinc-600 mt-1.5">{hint}</p>}
    </div>
  );
}

// US phone formatter
function formatPhone(raw) {
  const d = (raw || "").replace(/[^\d]/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const isValidUSPhone = (v) => /^\d{10}$/.test((v || "").replace(/[^\d]/g, ""));
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());

const TOTAL_STEPS = 3;

export default function MultiStepCalculator({ compact = false }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [submittedId, setSubmittedId] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [attempted, setAttempted] = useState({}); // step -> bool

  const [form, setForm] = useState({
    // Step 1
    monthly_revenue: 50000,
    credit_score: "",
    existing_positions: "",
    outstanding_balance: 0,
    // Step 2
    first_name: "",
    last_name: "",
    business_name: "",
    industry: "",
    time_in_business: "",
    // Step 3
    phone: "",
    email: "",
    text_opt_in: false,
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const cardRef = useRef(null);

  // Live preview estimate (only on/after step 1 has enough data)
  useEffect(() => {
    if (step === 4) return; // results step has its own
    if (!form.monthly_revenue) {
      setEstimate(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${API}/calc/funding-estimate`, form);
        setEstimate(data.estimate);
      } catch { /* silent */ }
    }, 250);
    return () => clearTimeout(t);
  }, [form.monthly_revenue, form.credit_score, form.existing_positions, form.outstanding_balance, form.time_in_business, form.industry, step]);

  // Validation per step
  const errs = useMemo(() => {
    const e = {};
    if (step === 1) {
      if (!form.monthly_revenue || form.monthly_revenue < 5000) e.monthly_revenue = "Enter at least $5,000";
      if (!form.credit_score) e.credit_score = "Select a range";
      if (!form.existing_positions) e.existing_positions = "Select an option";
    }
    if (step === 2) {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
      if (!form.business_name.trim()) e.business_name = "Required";
      if (!form.industry) e.industry = "Select industry";
      if (!form.time_in_business) e.time_in_business = "Select option";
    }
    if (step === 3) {
      if (!isValidUSPhone(form.phone)) e.phone = "Enter a valid 10-digit US phone";
      if (!isValidEmail(form.email)) e.email = "Enter a valid email";
    }
    return e;
  }, [form, step]);

  const valid = Object.keys(errs).length === 0;
  const showErr = (k) => attempted[step] && errs[k];

  const next = () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (!valid) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (!valid) {
      toast.error("Please complete the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/leads/funding-calculator`, form);
      setEstimate(data.estimate);
      setSubmittedId(data.id);
      setStep(4);
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={cardRef} className={`glass-strong rounded-2xl ${compact ? "p-6 md:p-7" : "p-7 md:p-9"} relative overflow-hidden`} data-testid="multistep-calculator">
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <span
            data-testid="ms-title"
            className="font-mono uppercase tracking-[0.22em] font-medium text-emerald-400 text-base sm:text-lg"
          >
            Funding Calculator
          </span>
          {step <= TOTAL_STEPS && (
            <span className="font-mono text-[0.7rem] text-zinc-500 tracking-[0.18em] uppercase" data-testid="step-indicator">
              Step {step} / {TOTAL_STEPS}
            </span>
          )}
        </div>
        <h3 className="h3 mt-1">
          {step === 1 && "How much can you get — instantly."}
          {step === 2 && "Tell us about your business."}
          {step === 3 && "Where should we send your match?"}
          {step === 4 && "Your funding match."}
        </h3>

        {/* Progress bar */}
        {step <= TOTAL_STEPS && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1 rounded-full transition-all ${
                  n < step ? "bg-emerald-400" : n === step ? "bg-gradient-to-r from-emerald-400 to-cyan-400" : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="mt-7 space-y-5" data-testid="step-1">
            <Field label="Monthly Revenue">
              <CurrencyInput testid="ms-revenue" value={form.monthly_revenue} onChange={(v) => update("monthly_revenue", v)} placeholder="50,000" />
              {showErr("monthly_revenue") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.monthly_revenue}</p>}
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Credit Score">
                <SelectFld testid="ms-credit" value={form.credit_score} onChange={(v) => update("credit_score", v)} options={SCORES} placeholder="Select range" />
                {showErr("credit_score") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.credit_score}</p>}
              </Field>
              <Field label="RBF Positions">
                <SelectFld testid="ms-positions" value={form.existing_positions} onChange={(v) => update("existing_positions", v)} options={POSITIONS} placeholder="Select positions" />
                {showErr("existing_positions") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.existing_positions}</p>}
              </Field>
            </div>
            {form.existing_positions && form.existing_positions !== "None" && (
              <Field label="Total Outstanding Balance" hint="Approximate combined balance across existing positions (optional).">
                <CurrencyInput testid="ms-outstanding" value={form.outstanding_balance} onChange={(v) => update("outstanding_balance", v)} placeholder="0" />
              </Field>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="step-2">
            <Field label="First Name *" full={false}>
              <TextInput data-testid="ms-first" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} placeholder="Jane" />
              {showErr("first_name") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.first_name}</p>}
            </Field>
            <Field label="Last Name *" full={false}>
              <TextInput data-testid="ms-last" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} placeholder="Doe" />
              {showErr("last_name") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.last_name}</p>}
            </Field>
            <div className="md:col-span-2">
              <Field label="Business Name *">
                <TextInput data-testid="ms-business" value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="Acme Co." />
                {showErr("business_name") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.business_name}</p>}
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Industry">
                <div className="flex flex-wrap gap-2" data-testid="ms-industry-chips">
                  {INDUSTRY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = form.industry === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        data-testid={`ms-industry-${opt.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        onClick={() => update("industry", opt.value)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition ${
                          active
                            ? "border-emerald-400/40 bg-emerald-500/[0.08] text-white"
                            : "border-white/[0.08] bg-white/[0.02] text-zinc-300 hover:border-white/[0.16] hover:text-white"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${active ? "text-emerald-300" : "text-zinc-500"}`} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {showErr("industry") && <p className="text-[0.7rem] text-rose-400 mt-2">{errs.industry}</p>}
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Time in Business">
                <SelectFld testid="ms-tib" value={form.time_in_business} onChange={(v) => update("time_in_business", v)} options={TIBS} placeholder="Select" />
                {showErr("time_in_business") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.time_in_business}</p>}
              </Field>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="mt-7 space-y-5" data-testid="step-3">
            <Field label="Phone Number *" hint="US format. We'll only contact you about your funding match.">
              <TextInput
                data-testid="ms-phone"
                inputMode="tel"
                value={formatPhone(form.phone)}
                onChange={(e) => update("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                placeholder="(555) 123-4567"
              />
              {showErr("phone") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.phone}</p>}
            </Field>
            <Field label="Email Address *">
              <TextInput
                data-testid="ms-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@business.com"
              />
              {showErr("email") && <p className="text-[0.7rem] text-rose-400 mt-1.5">{errs.email}</p>}
            </Field>
            <label
              data-testid="ms-text-optin"
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                form.text_opt_in
                  ? "border-emerald-400/30 bg-emerald-500/[0.06]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
              }`}
            >
              <input
                type="checkbox"
                checked={form.text_opt_in}
                onChange={(e) => update("text_opt_in", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
              />
              <div className="text-sm">
                <div className="text-zinc-100 font-medium flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-300" />
                  Yes, you can text me about my application
                </div>
                <div className="text-zinc-500 text-xs mt-1">
                  Faster updates straight to your phone. Reply STOP anytime to opt out.
                </div>
              </div>
            </label>
          </div>
        )}

        {/* STEP 4 - RESULTS */}
        {step === 4 && estimate && (
          <div className="mt-7 space-y-6" data-testid="step-results">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { k: "conservative", label: "Conservative", short: "Cons.", sub: "Best rates" },
                { k: "average", label: "Average", short: "Avg.", sub: "Most likely" },
                { k: "aggressive", label: "Aggressive", short: "Aggr.", sub: "Max funding" },
              ].map((s) => (
                <div key={s.k} className="card-surface p-3 sm:p-4 text-center min-w-0">
                  <div className="font-mono uppercase tracking-[0.08em] sm:tracking-[0.12em] text-[0.6rem] sm:text-[0.66rem] text-emerald-400/90 truncate">
                    <span className="sm:hidden">{s.short}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  <div className="font-mono text-base sm:text-xl text-white mt-1.5 sm:mt-2 truncate">{fmt(estimate[s.k])}</div>
                  <div className="text-[0.64rem] sm:text-[0.7rem] text-zinc-500 mt-1 truncate">{s.sub}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300 mt-0.5 shrink-0" />
              <div className="text-sm text-emerald-50/90 leading-relaxed">
                <span className="text-emerald-200 font-medium">You're matched.</span> A funding specialist will reach out within 24 hours
                {form.text_opt_in ? " by text + email" : " by email"}. Application reference{" "}
                <span className="font-mono text-emerald-300">#{(submittedId || "").slice(0, 8) || "—"}</span>.
              </div>
            </div>

            <Link
              to="/contact"
              data-testid="ms-result-apply"
              className="btn-accent w-full"
            >
              Continue your application <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <button
                onClick={() => setMoreOpen((v) => !v)}
                data-testid="ms-looking-more"
                className="w-full text-left px-4 py-3 flex items-center justify-between text-sm text-zinc-200 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Looking for more capital?
                </span>
                <span className="text-zinc-500 text-xs">{moreOpen ? "Hide" : "Show"} options</span>
              </button>
              {moreOpen && (
                <div className="px-2 pb-3 space-y-2" data-testid="ms-more-options">
                  <Link
                    to="/heloc-calculator"
                    data-testid="ms-more-heloc"
                    className="block px-3 py-3 rounded-lg hover:bg-white/[0.04] transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white tracking-tight">Tap into home equity (HELOC)</div>
                        <div className="text-xs text-zinc-500 mt-0.5">$25K – $500K · Lower cost · 10–30yr</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                  <Link
                    to="/contact?product=Long-Term+Business+Loan"
                    data-testid="ms-more-longterm"
                    className="block px-3 py-3 rounded-lg hover:bg-white/[0.04] transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white tracking-tight">Talk to a long-term loan specialist</div>
                        <div className="text-xs text-zinc-500 mt-0.5">$50K – $5M · Predictable monthly payments · 1–10yr</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <p className="text-[0.7rem] text-zinc-600 leading-relaxed">
              Estimates are based on the data provided and typical funder criteria. Actual offers depend on bank statement health and underwriting.
            </p>
          </div>
        )}

        {/* Live preview removed per request */}

        {/* Footer / Navigation */}
        {step <= TOTAL_STEPS && (
          <div className="mt-7 flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                data-testid="ms-back"
                className="btn-ghost px-4 py-2.5 text-sm"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            {step < TOTAL_STEPS && (
              <button
                type="button"
                onClick={next}
                data-testid="ms-next"
                className="btn-accent flex-1"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === TOTAL_STEPS && (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                data-testid="ms-submit"
                className="btn-accent flex-1 disabled:opacity-60"
              >
                {submitting ? "Calculating…" : (
                  <>Get my answer <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        )}

        {step <= TOTAL_STEPS && (
          <p className="text-[0.7rem] text-zinc-600 mt-4 flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> No spam. Your data is encrypted and never sold.
          </p>
        )}
      </div>
    </div>
  );
}
