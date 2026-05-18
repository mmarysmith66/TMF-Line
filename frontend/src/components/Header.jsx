import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/mca", label: "Cash Injection" },
  { to: "/long-term-loans", label: "Long-Term Loans" },
  { to: "/heloc-calculator", label: "HELOC" },
  { to: "/funding-estimator", label: "Funding Calculator" },
  { to: "/apply", label: "Apply" },
  { to: "/about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#09090b]/85 backdrop-blur-xl border-b border-white/[0.06]" : "bg-transparent"
      }`}
    >
      <div className="container-x h-20 flex items-center justify-between">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2.5 group">
          <Logo />
        </Link>

        <nav className="hidden lg:flex items-center gap-1" data-testid="primary-nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-link`}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-md text-[0.86rem] tracking-tight transition-colors ${
                  isActive
                    ? "text-white bg-white/[0.05]"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                }`
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/apply" data-testid="header-cta-button" className="btn-accent text-[0.88rem] py-2.5 px-4">
            Apply Now <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          data-testid="mobile-menu-toggle"
          className="lg:hidden p-2 rounded-md text-zinc-300 hover:bg-white/[0.04]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl" data-testid="mobile-menu">
          <div className="container-x py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-link`}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-[0.95rem] ${
                    isActive ? "bg-white/[0.06] text-white" : "text-zinc-300"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link to="/apply" data-testid="mobile-cta-button" className="btn-accent mt-3 justify-center">
              Apply Now <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
