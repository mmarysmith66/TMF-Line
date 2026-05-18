import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, FileText, ShieldCheck, PenLine, Building2, User as UserIcon, CheckCircle2 } from "lucide-react";
import { Input, SelectField } from "@/components/FundingCalculator";
import SignaturePad from "@/components/SignaturePad";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BUSINESS_TYPES = ["LLC", "S-Corporation", "C-Corporation", "Sole Proprietorship", "Partnership", "Non-Profit", "Other"];
const INDUSTRIES = ["Restaurant / Food Service", "Retail", "E-Commerce", "Construction", "Healthcare", "Transportation / Trucking", "Professional Services", "Auto Repair", "Beauty / Salon / Spa", "Wholesale", "Manufacturing", "Real Estate", "Technology", "Other"];
const TIBS = ["Under 6 months", "6 – 12 months", "1 – 2 years", "2 – 5 years", "5+ years"];
const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC","PR"];
const EMPLOYEES = ["1–4", "5–9", "10–24", "25–49", "50–99", "100+"];

const STEPS = [
  { n: 1, t: "Contact", icon: UserIcon },
  { n: 2, t: "Business", icon: Building2 },
  { n: 3, t: "Documents", icon: FileText },
  { n: 4, t: "Signature", icon: PenLine },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

function formatPhone(raw) {
  const d = (raw || "").replace(/[^\d]/g, "").slice(0, 10);
  if (!d) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const cleanPhone = (v) => (v || "").replace(/[^\d]/g, "").slice(0, 10);
const isValidPhone = (v) => /^\d{10}$/.test(cleanPhone(v));
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [attempted, setAttempted] = useState({});
  const formRef = useRef(null);

  const [form, setForm] = useState({
    // 1
    first_name: "", last_name: "", date_of_birth: "", ssn: "",
    email: "", mobile_phone: "", legal_company_name: "",
    // 2
    dba_name: "",
    business_street: "", business_city: "", business_state: "", business_zip: "",
    business_phone: "", ein: "", business_type: "", industry: "",
    date_business_started: "", employees: "",
    annual_revenue: 0, monthly_revenue: 0, time_in_business: "",
    // 3
    docs_acknowledged: false,
    // 4
    consent_communications: false, consent_credit_check: false, consent_accuracy: false,
    signature_image_base64: "", signature_typed_name: "", signature_date: todayISO(),
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const errs = useMemo(() => {
    const e = {};
    if (step === 1) {
      if (!form.first_name.trim()) e.first_name = "Required";
      if (!form.last_name.trim()) e.last_name = "Required";
      if (!form.date_of_birth) e.date_of_birth = "Required";
      if (!form.ssn || form.ssn.replace(/[^\d]/g, "").length < 4) e.ssn = "Enter SSN/NIN";
      if (!isValidEmail(form.email)) e.email = "Enter a valid email";
      if (!isValidPhone(form.mobile_phone)) e.mobile_phone = "Enter a 10-digit US phone";
      if (!form.legal_company_name.trim()) e.legal_company_name = "Required";
    }
    if (step === 2) {
      if (!form.business_street.trim()) e.business_street = "Required";
      if (!form.business_city.trim()) e.business_city = "Required";
      if (!form.business_state) e.business_state = "Required";
      if (!form.business_zip.trim()) e.business_zip = "Required";
      if (!form.ein.trim()) e.ein = "Required";
      if (!form.business_type) e.business_type = "Required";
      if (!form.industry) e.industry = "Required";
      if (!form.date_business_started) e.date_business_started = "Required";
      if (!form.monthly_revenue || form.monthly_revenue < 1000) e.monthly_revenue = "Enter your monthly revenue";
      if (!form.time_in_business) e.time_in_business = "Required";
    }
    if (step === 3) {
      if (!form.docs_acknowledged) e.docs_acknowledged = "Please confirm";
    }
    if (step === 4) {
      if (!form.consent_communications) e.consent_communications = "Required";
      if (!form.consent_credit_check) e.consent_credit_check = "Required";
      if (!form.consent_accuracy) e.consent_accuracy = "Required";
      if (!form.signature_image_base64) e.signature_image_base64 = "Please sign";
      if (!form.signature_typed_name.trim()) e.signature_typed_name = "Type your full name";
    }
    return e;
  }, [form, step]);
  const valid = Object.keys(errs).length === 0;
  const showErr = (k) => attempted[step] && errs[k];

  const next = () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (!valid) { toast.error("Please complete the highlighted fields."); return; }
    setStep((s) => Math.min(4, s + 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (!valid) { toast.error("Please complete all fields and sign."); return; }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/applications/submit`, form);
      setDone(data.id);
      toast.success("Application submitted.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="apply-page">
      <section className="relative overflow-hidden">
        <img src="/images/contact_atmosphere.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-8 md:pt-20 pb-8 md:pb-10">
          <div className="eyebrow">Apply for Funding</div>
          <h1 className="h1 mt-4 md:mt-5 max-w-4xl">Four steps to <span className="gradient-text">your funding match.</span></h1>
          <p className="body-lg mt-5 md:mt-6 max-w-2xl text-[0.95rem] sm:text-base md:text-lg">
            Thank you for placing your trust in us. Please take a few minutes to complete the form — we'll process your application right away.
          </p>
        </div>
      </section>

      <section ref={formRef} className="container-x pb-16 md:pb-20">
        {done ? (
          <div className="glass-strong rounded-2xl p-10 md:p-14 text-center" data-testid="apply-success">
            <div className="mx-auto h-14 w-14 rounded-full border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center text-emerald-300">
              <Check className="h-6 w-6" />
            </div>
            <h2 className="h2 mt-6">Application received.</h2>
            <p className="body-lg mt-4 max-w-xl mx-auto">
              Thanks, {form.first_name}. Your application reference is{" "}
              <span className="font-mono text-emerald-300">#{done.slice(0, 8)}</span>. A funding specialist will reach out to you within 24-48 hours to request supporting documents and discuss next steps.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 justify-center">
              <Link to="/" className="btn-ghost">Back to home</Link>
              <Link to="/funding-estimator" className="btn-accent">Run another estimate <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Step rail */}
            <aside className="lg:col-span-3" data-testid="apply-rail">
              <ol className="flex lg:flex-col gap-2 lg:gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 lg:mx-0 px-1 lg:px-0 snap-x">
                {STEPS.map((s) => {
                  const Icon = s.icon;
                  const active = step === s.n;
                  const completed = step > s.n;
                  return (
                    <li key={s.n} className="shrink-0 lg:shrink snap-start min-w-[42%] sm:min-w-[28%] lg:min-w-0">
                      <button
                        type="button"
                        onClick={() => completed && setStep(s.n)}
                        className={`w-full flex items-center gap-2.5 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl border transition text-left ${
                          active
                            ? "border-emerald-400/40 bg-emerald-500/[0.06] text-white"
                            : completed
                              ? "border-white/[0.08] bg-white/[0.02] text-zinc-200 hover:border-white/[0.16] cursor-pointer"
                              : "border-white/[0.06] bg-transparent text-zinc-500"
                        }`}
                        data-testid={`apply-rail-${s.n}`}
                      >
                        <span className={`h-6 w-6 lg:h-7 lg:w-7 rounded-full shrink-0 flex items-center justify-center text-[0.7rem] lg:text-xs font-mono ${
                          completed ? "bg-emerald-500 text-[#03110b]" : active ? "bg-white/[0.06] text-emerald-300" : "bg-white/[0.04] text-zinc-500"
                        }`}>
                          {completed ? <Check className="h-3.5 w-3.5" /> : s.n}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-mono uppercase tracking-[0.16em] text-[0.58rem] lg:text-[0.62rem] text-zinc-500">Step {s.n}</span>
                          <span className="text-[0.82rem] lg:text-sm tracking-tight truncate">
                            <Icon className="inline h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1 lg:mr-1.5 align-baseline" />{s.t}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <div className="lg:col-span-9 glass-strong rounded-2xl p-5 sm:p-6 md:p-10">
              {/* STEP 1 - CONTACT */}
              {step === 1 && (
                <div data-testid="apply-step-1">
                  <span className="eyebrow">Contact Information</span>
                  <h3 className="h3 sm:h2 mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Let's start with the basics.</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-6 md:mt-7">
                    <Field label="First Name *" err={showErr("first_name") && errs.first_name}>
                      <Input data-testid="apply-first" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} />
                    </Field>
                    <Field label="Last Name *" err={showErr("last_name") && errs.last_name}>
                      <Input data-testid="apply-last" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} />
                    </Field>
                    <Field label="Date of Birth *" err={showErr("date_of_birth") && errs.date_of_birth}>
                      <Input data-testid="apply-dob" type="date" value={form.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
                    </Field>
                    <Field label="SSN / NIN *" hint="Encrypted & never shared without authorization." err={showErr("ssn") && errs.ssn}>
                      <Input data-testid="apply-ssn" inputMode="numeric" maxLength={11} value={form.ssn} onChange={(e) => update("ssn", e.target.value)} placeholder="XXX-XX-XXXX" />
                    </Field>
                    <Field label="Email *" err={showErr("email") && errs.email}>
                      <Input data-testid="apply-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                    </Field>
                    <Field label="Mobile Phone *" err={showErr("mobile_phone") && errs.mobile_phone}>
                      <Input data-testid="apply-phone" inputMode="tel" value={formatPhone(form.mobile_phone)} onChange={(e) => update("mobile_phone", cleanPhone(e.target.value))} placeholder="(555) 123-4567" />
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="Legal Company Name *" err={showErr("legal_company_name") && errs.legal_company_name}>
                        <Input data-testid="apply-company" value={form.legal_company_name} onChange={(e) => update("legal_company_name", e.target.value)} />
                      </Field>
                    </div>
                  </div>

                  {/* Consent block — informational; final agreement is on Step 4 */}
                  <div className="mt-7 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5" data-testid="apply-step1-consent">
                    <div className="font-mono uppercase tracking-[0.16em] text-[0.62rem] text-emerald-400 mb-3">Consent to Communications</div>
                    <div className="text-zinc-400 text-[0.82rem] sm:text-sm leading-relaxed max-h-44 sm:max-h-56 overflow-y-auto pr-2">
                      <p>
                        By providing your contact information and signing on the final step, you authorize{" "}
                        <span className="text-zinc-200">TMF Line</span> and its representatives, successors, assigns, and designees to
                        communicate with you via phone calls, text messages, and emails — including automated technology and pre-recorded
                        messages — for informational, marketing, or transactional purposes. Standard message and data rates may apply.
                        Message frequency may vary. You may opt out at any time by replying "STOP" to text messages, unsubscribing from
                        emails, or contacting us directly. For help, reply "HELP" or contact{" "}
                        <span className="text-emerald-300 font-mono">support@tmfline.online</span>.
                      </p>
                      <p className="mt-3">
                        You further authorize TMF Line and its designees to obtain consumer, personal, business, and investigative reports
                        about you from consumer reporting agencies (including TransUnion, Experian, Equifax, and Identity IQ), banks,
                        creditors, government agencies, and other third parties for purposes related to commercial loans or purchases of
                        future receivables. Your information will be handled per our{" "}
                        <Link to="/" className="text-emerald-300 underline">Terms of Use and Privacy Policy</Link>. You will sign and
                        confirm these authorizations on Step 4.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 - BUSINESS */}
              {step === 2 && (
                <div data-testid="apply-step-2">
                  <span className="eyebrow">Business Details</span>
                  <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Tell us about {form.legal_company_name || "your business"}.</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-6 md:mt-7">
                    <div className="md:col-span-2">
                      <Field label="DBA / Trade Name (if different)">
                        <Input data-testid="apply-dba" value={form.dba_name} onChange={(e) => update("dba_name", e.target.value)} />
                      </Field>
                    </div>
                    <div className="md:col-span-2">
                      <Field label="Business Street Address *" err={showErr("business_street") && errs.business_street}>
                        <Input data-testid="apply-street" value={form.business_street} onChange={(e) => update("business_street", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="City *" err={showErr("business_city") && errs.business_city}>
                      <Input data-testid="apply-city" value={form.business_city} onChange={(e) => update("business_city", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="State *" err={showErr("business_state") && errs.business_state}>
                        <SelectField testid="apply-state" value={form.business_state} onChange={(v) => update("business_state", v)} options={STATES} placeholder="State" />
                      </Field>
                      <Field label="ZIP *" err={showErr("business_zip") && errs.business_zip}>
                        <Input data-testid="apply-zip" maxLength={10} value={form.business_zip} onChange={(e) => update("business_zip", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Business Phone">
                      <Input data-testid="apply-bphone" inputMode="tel" value={formatPhone(form.business_phone)} onChange={(e) => update("business_phone", cleanPhone(e.target.value))} placeholder="(555) 123-4567" />
                    </Field>
                    <Field label="EIN / Tax ID *" err={showErr("ein") && errs.ein}>
                      <Input data-testid="apply-ein" value={form.ein} onChange={(e) => update("ein", e.target.value)} placeholder="XX-XXXXXXX" />
                    </Field>
                    <Field label="Business Type *" err={showErr("business_type") && errs.business_type}>
                      <SelectField testid="apply-btype" value={form.business_type} onChange={(v) => update("business_type", v)} options={BUSINESS_TYPES} placeholder="Select" />
                    </Field>
                    <Field label="Industry *" err={showErr("industry") && errs.industry}>
                      <SelectField testid="apply-industry" value={form.industry} onChange={(v) => update("industry", v)} options={INDUSTRIES} placeholder="Select" />
                    </Field>
                    <Field label="Date Business Started *" err={showErr("date_business_started") && errs.date_business_started}>
                      <Input data-testid="apply-bstart" type="date" value={form.date_business_started} onChange={(e) => update("date_business_started", e.target.value)} />
                    </Field>
                    <Field label="Number of Employees">
                      <SelectField testid="apply-employees" value={form.employees} onChange={(v) => update("employees", v)} options={EMPLOYEES} placeholder="Select" />
                    </Field>
                    <Field label="Time in Business *" err={showErr("time_in_business") && errs.time_in_business}>
                      <SelectField testid="apply-tib" value={form.time_in_business} onChange={(v) => update("time_in_business", v)} options={TIBS} placeholder="Select" />
                    </Field>
                    <Field label="Annual Revenue (USD)">
                      <Input data-testid="apply-annual" inputMode="numeric" value={form.annual_revenue || ""} onChange={(e) => update("annual_revenue", Number((e.target.value || "0").replace(/[^\d]/g, "")))} placeholder="500000" />
                    </Field>
                    <Field label="Average Monthly Revenue *" err={showErr("monthly_revenue") && errs.monthly_revenue}>
                      <Input data-testid="apply-monthly" inputMode="numeric" value={form.monthly_revenue || ""} onChange={(e) => update("monthly_revenue", Number((e.target.value || "0").replace(/[^\d]/g, "")))} placeholder="50000" />
                    </Field>
                  </div>
                </div>
              )}

              {/* STEP 3 - DOCUMENTS */}
              {step === 3 && (
                <div data-testid="apply-step-3">
                  <span className="eyebrow">Basic Documents</span>
                  <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">We'll request these by email.</h3>
                  <p className="body mt-4">
                    To process your application, our team will reach out to request the following. No upload is required right now —
                    a funding specialist will send you a secure document link within 24 hours.
                  </p>
                  <div className="mt-6 md:mt-7 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { t: "3 Months of Business Bank Statements", b: "Most recent statements for your business operating account." },
                      { t: "Driver's License (Front & Back)", b: "Government-issued photo ID for the business principal." },
                      { t: "Voided Business Check", b: "For account verification — voided is fine." },
                      { t: "Articles of Incorporation / Business License", b: "Proof of legal business formation." },
                    ].map((d, i) => (
                      <div key={i} className="card-surface p-5 flex items-start gap-3" data-testid={`apply-doc-${i}`}>
                        <FileText className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-white tracking-tight text-[0.97rem]">{d.t}</div>
                          <div className="body text-sm mt-1.5">{d.b}</div>
                          <div className="mt-3 inline-flex items-center gap-1.5 text-[0.7rem] font-mono uppercase tracking-[0.16em] text-zinc-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Requested by email
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label
                    data-testid="apply-docs-ack"
                    className={`mt-7 flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                      form.docs_acknowledged ? "border-emerald-400/30 bg-emerald-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.docs_acknowledged}
                      onChange={(e) => update("docs_acknowledged", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
                    />
                    <div className="text-sm">
                      <div className="text-zinc-100 font-medium">I understand — I'll provide the documents above when requested.</div>
                      <div className="text-zinc-500 text-xs mt-1">Our team will send you a secure upload link via email within 24 hours.</div>
                    </div>
                  </label>
                  {showErr("docs_acknowledged") && <p className="text-[0.7rem] text-rose-400 mt-2">{errs.docs_acknowledged}</p>}
                </div>
              )}

              {/* STEP 4 - SIGNATURE */}
              {step === 4 && (
                <div data-testid="apply-step-4">
                  <span className="eyebrow">Signature & Consent</span>
                  <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">Authorize and sign.</h3>

                  <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-zinc-400 leading-relaxed max-h-72 overflow-y-auto" data-testid="apply-consent-text">
                    <p>
                      <span className="text-zinc-200 font-medium">Consent to Communications.</span> By providing your contact information and signing
                      below, you authorize <span className="text-zinc-200">TMF Line</span> and its representatives, successors, assigns, and designees
                      to communicate with you via phone calls, text messages, and emails, including automated technology and pre-recorded messages,
                      for informational, marketing, or transactional purposes. Standard message and data rates may apply. Message frequency may vary.
                      You may opt out at any time by replying "STOP" to text messages, unsubscribing from emails, or contacting us directly. For help,
                      reply "HELP" at any time or contact us at <span className="text-emerald-300 font-mono">support@tmfline.online</span>.
                    </p>
                    <p className="mt-3">
                      You further authorize TMF Line and its designees to obtain consumer, personal, business, and investigative reports about you
                      from consumer reporting agencies (including TransUnion, Experian, Equifax, and Identity IQ), banks, creditors, government
                      agencies, and other third parties (collectively, the "Recipients"). TMF Line may transmit this application, along with any
                      information obtained in connection with it, to any or all Recipients for purposes related to commercial loans or purchases of
                      future receivables (collectively, "Transactions"). You also consent to the release, by any creditor or financial institution,
                      of any information relating to you, to TMF Line and each of the Recipients. TMF Line is authorized to communicate with the
                      Recipients on your behalf and represent you in matters related to the Transactions.
                    </p>
                    <p className="mt-3">
                      Your information will be handled in accordance with our <Link to="/" className="text-emerald-300 underline">Terms of Use and Privacy Policy</Link>.
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      { k: "consent_communications", t: "I agree to the Consent to Communications above." },
                      { k: "consent_credit_check", t: "I authorize TMF Line to obtain consumer and business credit reports from the listed agencies and third parties." },
                      { k: "consent_accuracy", t: "I confirm the information provided is accurate to the best of my knowledge." },
                    ].map((c) => (
                      <label
                        key={c.k}
                        data-testid={`apply-${c.k}`}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                          form[c.k] ? "border-emerald-400/30 bg-emerald-500/[0.06]" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form[c.k]}
                          onChange={(e) => update(c.k, e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded accent-emerald-500"
                        />
                        <span className="text-sm text-zinc-100">{c.t}</span>
                      </label>
                    ))}
                  </div>
                  {(showErr("consent_communications") || showErr("consent_credit_check") || showErr("consent_accuracy")) && (
                    <p className="text-[0.7rem] text-rose-400 mt-2">All three consent boxes must be checked.</p>
                  )}

                  <div className="mt-6 md:mt-7 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                    <div className="md:col-span-2">
                      <Field label="Signature *" err={showErr("signature_image_base64") && errs.signature_image_base64}>
                        <SignaturePad value={form.signature_image_base64} onChange={(v) => update("signature_image_base64", v)} testid="apply-signature" />
                      </Field>
                    </div>
                    <div className="space-y-5">
                      <Field label="Typed Full Name *" err={showErr("signature_typed_name") && errs.signature_typed_name}>
                        <Input data-testid="apply-sig-name" value={form.signature_typed_name} onChange={(e) => update("signature_typed_name", e.target.value)} placeholder="Jane Doe" />
                      </Field>
                      <Field label="Date">
                        <Input data-testid="apply-sig-date" type="date" value={form.signature_date} onChange={(e) => update("signature_date", e.target.value)} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* NAV */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/[0.06]">
                {step > 1 ? (
                  <button type="button" onClick={back} data-testid="apply-back" className="btn-ghost text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : <span />}
                {step < 4 ? (
                  <button type="button" onClick={next} data-testid="apply-next" className="btn-accent">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={submitting} data-testid="apply-submit" className="btn-accent disabled:opacity-60">
                    {submitting ? "Submitting…" : (<>Submit Application <ArrowRight className="h-4 w-4" /></>)}
                  </button>
                )}
              </div>

              <div className="mt-5 flex items-center gap-2 text-[0.7rem] text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                Your data is encrypted in transit and at rest. We never sell your information.
              </div>
            </div>
          </div>
        )}
      </section>

      {!done && (
        <section className="container-x pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-testid="apply-trust">
            {[
              { t: "1–24h decisions", b: "Average turnaround on application review." },
              { t: "Transparent terms", b: "Clear documentation, zero hidden fees." },
              { t: "Dedicated advisor", b: "A funding specialist guides your file end-to-end." },
            ].map((t, i) => (
              <div key={i} className="card-surface p-5 flex items-start gap-3 w-full h-full min-h-[112px]">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-white tracking-tight text-sm">{t.t}</div>
                  <div className="text-zinc-500 text-[0.85rem] mt-1 leading-relaxed">{t.b}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, hint, err, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.16em] text-zinc-500 mb-2 font-mono">{label}</label>
      {children}
      {hint && !err && <p className="text-[0.7rem] text-zinc-600 mt-1.5">{hint}</p>}
      {err && <p className="text-[0.7rem] text-rose-400 mt-1.5">{err}</p>}
    </div>
  );
}
