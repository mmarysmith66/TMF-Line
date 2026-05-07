import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { ArrowUpRight } from "lucide-react";

const cols = [
  {
    title: "Products",
    links: [
      { to: "/long-term-loans", label: "Long-Term Loans" },
      { to: "/mca", label: "Cash Injection (MCA)" },
      { to: "/heloc-calculator", label: "HELOC Calculator" },
      { to: "/funding-estimator", label: "Funding Estimator" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/contact", label: "Apply Now" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] mt-24" data-testid="site-footer">
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: 'url(/images/topography_lines.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
        }}
      />
      <div className="container-x relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-5 text-zinc-400 text-sm max-w-sm leading-relaxed">
              TMF Line — strategic capital aligned to how modern businesses actually grow.
              Fast decisions. Transparent terms. Tailored structure.
            </p>
            <Link to="/contact" data-testid="footer-cta-button" className="btn-accent mt-7 text-sm">
              Start application <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-3">
              <div className="eyebrow mb-5">{c.title}</div>
              <ul className="space-y-3">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      data-testid={`footer-link-${l.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="text-zinc-300 hover:text-emerald-400 text-[0.95rem] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1">
            <div className="eyebrow mb-5">Hours</div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Mon–Fri<br />
              9am–6pm EST
            </p>
            <p className="text-sm text-zinc-500 mt-3">tmfline.online</p>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} TMF Line. All rights reserved.</p>
          <p>Strategic business funding solutions — Fast decisions, flexible terms.</p>
        </div>
      </div>
    </footer>
  );
}
