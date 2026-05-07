import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles, Shield } from "lucide-react";
import SectionEyebrow from "@/components/SectionEyebrow";

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="relative overflow-hidden">
        <img src="/images/about_executives.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="container-x relative pt-12 md:pt-20 pb-12">
          <div className="eyebrow">About TMF Line</div>
          <h1 className="h1 mt-5 max-w-4xl">Smart funding for <span className="gradient-text">modern businesses.</span></h1>
          <p className="body-lg mt-6 max-w-2xl">
            TMF Line is a modern funding advisory connecting growing businesses with the right capital solutions.
            We combine speed with strategic thinking to deliver funding that actually fits.
          </p>
        </div>
      </section>

      <section className="container-x section-y">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="eyebrow">Our Mission</div>
            <h2 className="h2 mt-4">Capital, simplified.</h2>
          </div>
          <div className="lg:col-span-7 space-y-5 body-lg">
            <p>
              We believe that access to the right capital at the right time is what separates businesses that survive from
              businesses that thrive. Our mission is to simplify that access.
            </p>
            <p>
              Too many business owners waste weeks navigating confusing lending landscapes. We cut through complexity by
              understanding your business first, then matching you with funding products that align with your goals,
              timeline, and financial profile.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Our Approach" title="Three principles, one outcome." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {[
            { icon: Sparkles, t: "Speed & Precision", b: "Fast decisions backed by thorough analysis. We respect your time while protecting your interests." },
            { icon: Shield, t: "Transparency", b: "Clear terms, honest communication, and no hidden surprises. You always know where you stand." },
            { icon: Compass, t: "Tailored Solutions", b: "No cookie-cutter products. Every recommendation is shaped by your specific business reality." },
          ].map((p, i) => (
            <div key={i} className="bg-[#0b0b0d] p-8 md:p-10" data-testid={`about-pillar-${i}`}>
              <div className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-emerald-400">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="h3 mt-5">{p.t}</h3>
              <p className="body mt-3 text-[0.97rem]">{p.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x section-y">
        <SectionEyebrow label="Who We Help" title="Built for serious operators." description="Our solutions serve a range of business profiles across industries." />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { t: "Established Businesses", b: "Companies with 2+ years of history seeking growth or restructuring capital." },
            { t: "Growing Merchants", b: "Revenue-generating businesses needing fast working capital to capture opportunities." },
            { t: "Scaling Companies", b: "Businesses at inflection points needing strategic financing to reach the next level." },
          ].map((x, i) => (
            <div key={i} className="card-surface p-7" data-testid={`about-segment-${i}`}>
              <h3 className="h3">{x.t}</h3>
              <p className="body mt-3 text-[0.95rem]">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="card-surface p-10 md:p-14 text-center">
          <h2 className="h2">Let's discuss your funding needs.</h2>
          <p className="body-lg mt-4 max-w-xl mx-auto">Start with a conversation. No obligation, no pressure — just a clear path forward.</p>
          <Link to="/contact" data-testid="about-bottom-cta" className="btn-accent mt-7">Get in touch <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
