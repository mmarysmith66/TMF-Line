import { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Input, SelectField } from "@/components/FundingCalculator";
import { ArrowRight, Lock } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PRODUCTS = ["Long-Term Business Loan", "Merchant Cash Advance", "Line of Credit", "Equipment Financing", "HELOC", "Not Sure Yet"];

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => {
    const p = searchParams.get("product");
    return {
      full_name: "", company: "", email: "", phone: "",
      desired_amount: 0,
      product_interest: p && PRODUCTS.includes(p) ? p : "",
      notes: "",
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email) {
      toast.error("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/leads/contact`, form);
      toast.success("Application submitted. We'll be in touch within 24-48 hours.");
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="relative overflow-hidden">
        <img src="/images/contact_atmosphere.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-10">
          <div className="eyebrow">Apply Now</div>
          <h1 className="h1 mt-5 max-w-4xl">Start your funding <span className="gradient-text">application.</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            Complete the form below to begin. Our team will review your information and get back to you within 24-48 hours with next steps.
          </p>
        </div>
      </section>

      <section className="container-x pb-20">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass-strong rounded-2xl p-7 md:p-10" data-testid="contact-form-wrapper">
            {done ? (
              <div className="py-10 text-center" data-testid="contact-success">
                <div className="mx-auto h-12 w-12 rounded-full border border-emerald-400/30 bg-emerald-500/10 flex items-center justify-center text-emerald-300 text-xl font-mono">✓</div>
                <h3 className="h3 mt-5">Application received.</h3>
                <p className="body mt-3 max-w-md mx-auto">Thanks for applying. A funding specialist will be in touch within 24-48 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Full Name *"><Input data-testid="contact-name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required /></Field>
                  <Field label="Company Name"><Input data-testid="contact-company" value={form.company} onChange={(e) => update("company", e.target.value)} /></Field>
                  <Field label="Email *"><Input data-testid="contact-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></Field>
                  <Field label="Phone"><Input data-testid="contact-phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
                  <Field label="Desired Funding Amount"><Input data-testid="contact-amount" type="number" value={form.desired_amount} onChange={(e) => update("desired_amount", Number(e.target.value))} /></Field>
                  <Field label="Product Interest">
                    <SelectField testid="contact-product" value={form.product_interest} onChange={(v) => update("product_interest", v)} options={PRODUCTS} placeholder="Select a product" />
                  </Field>
                </div>
                <Field label="Additional Notes">
                  <textarea data-testid="contact-notes" rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 outline-none transition" />
                </Field>
                <button data-testid="contact-submit" type="submit" disabled={submitting} className="btn-accent w-full justify-center disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Application"} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  By submitting, you agree that we may contact you regarding your application. Your information is kept confidential and will not be shared with unauthorized third parties.
                </p>
              </form>
            )}
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="glass rounded-2xl p-7">
              <div className="eyebrow">What Happens Next</div>
              <ol className="mt-5 space-y-5">
                {[
                  { t: "Application Review", b: "Our team reviews your submission within 24-48 hours." },
                  { t: "Consultation Call", b: "A funding advisor discusses your needs and recommends options." },
                  { t: "Offer & Funding", b: "Receive a clear offer. Upon acceptance, funding follows promptly." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="font-mono text-emerald-400 text-sm shrink-0 w-6">0{i + 1}</span>
                    <div>
                      <h4 className="text-white tracking-tight">{s.t}</h4>
                      <p className="text-sm text-zinc-400 mt-1">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="glass rounded-2xl p-7">
              <div className="eyebrow">Alternative Contact</div>
              <p className="text-sm text-zinc-400 mt-4">Prefer to reach us directly?</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-zinc-300">Visit: <span className="text-emerald-300 font-mono">tmfline.online</span></p>
                <p className="text-zinc-400">Hours: Mon–Fri, 9am–6pm EST</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.04] p-6 flex gap-3">
              <Lock className="h-4 w-4 text-emerald-300 shrink-0 mt-1" />
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                <span className="text-emerald-200 font-medium">Privacy:</span> Your information is encrypted and handled securely. We do not sell or share your data with unauthorized parties. Submitting this form does not obligate you to any agreement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.16em] text-zinc-500 mb-2 font-mono">{label}</label>
      {children}
    </div>
  );
}
