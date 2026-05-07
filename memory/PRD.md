# TMF Line — Product Requirements

## Original Problem Statement
Clone tmfcapital.online's structure, content logic, pages, forms, flow, and functionality, but completely redesign as a premium ultra-modern fintech site for new brand "TMF Line" at tmfline.online. Dark-first, emerald-blue accent, custom generated imagery, multi-page React app preserving all forms, calculators, and conversion flow.

## Stack
- Frontend: React 19 (CRA + craco), Tailwind CSS, shadcn/ui, react-router-dom v7
- Backend: FastAPI + Motor (MongoDB)
- Image gen: Gemini Nano Banana via emergentintegrations + EMERGENT_LLM_KEY

## User Personas
1. **Small business owner** seeking working capital — uses funding calculator to see options
2. **Established business operator** needing structured long-term loan — applies via /contact
3. **Homeowner with equity** exploring HELOC for business — uses /heloc-calculator

## Pages (all preserved from original)
- `/` Home (hero + funding calculator + why + product grid + how + CTA)
- `/mca` Cash Injection / MCA (process + remittance + ideal-for + FAQ)
- `/heloc-calculator` HELOC Calculator (live calc with property/finances form)
- `/long-term-loans` Long-Term Loans (use cases + benefits + qualification + FAQ)
- `/funding-estimator` Revenue-based estimator (full form + product matches)
- `/about` About TMF Line (mission + approach + segments)
- `/contact` Apply form (full lead capture + steps + privacy)

## Implemented (Feb 2026)
- ✅ All 7 pages with full content parity to original
- ✅ Premium dark-first design system (Zinc neutrals + emerald-blue accents, Geist font)
- ✅ Custom SVG logo for TMF Line
- ✅ 9 generated custom fintech images via Gemini Nano Banana
- ✅ Live funding calculator (homepage + /funding-estimator) with conservative/average/aggressive estimate
- ✅ Live HELOC calculator with available credit, equity, DTI, qualification
- ✅ All forms POST to MongoDB (`leads` collection)
- ✅ Backend endpoints: `/api/leads/funding-calculator`, `/api/leads/contact`, `/api/calc/funding-estimate`, `/api/calc/heloc`, `/api/leads`
- ✅ Sticky glassmorphic nav, premium footer, responsive layout, FAQ accordions, stat strips
- ✅ All interactive elements have data-testid

## Backlog (P1/P2)
- P1: Admin panel UI for viewing leads (currently only via GET /api/leads JSON)
- P1: AI assistant chat widget (referenced in original "Talk to AI Assistant" step)
- P2: Email notifications for new leads (Resend/SendGrid)
- P2: SEO meta tags per page + sitemap.xml + favicon variations
- P2: Real-time form validation with Zod + react-hook-form
- P2: Animated scroll reveals via Framer Motion

## Next Tasks
- Run testing_agent_v3 for end-to-end verification
- Address any issues from test report
