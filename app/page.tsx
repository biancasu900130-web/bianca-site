"use client";

import { useState, useEffect, useRef } from "react";

/* ───────────────────────── data ───────────────────────── */

interface Project {
  id: string;
  status: "production" | "development";
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  metrics: { label: string; value: string }[];
  tags: string[];
}

const PLATFORM: Project = {
  id: "work-hub",
  status: "production",
  title: "Work Hub",
  subtitle: "The control center that runs every automation below on one click",
  description:
    "A single dashboard that turns each tool here into a click-to-run module, organized by cadence: daily, weekly, monthly, and project work. Every module exposes its own inputs, streams live progress as it runs, surfaces the headline results, and opens the output folder when it finishes. It is the layer that lets the finance team operate the automations without ever touching a terminal.",
  highlights: [
    "Modules are auto-discovered, so adding a new automation is dropping in one file with no rewiring",
    "Long-running jobs stream output line by line into the UI instead of blocking silently",
    "Results render as metrics, tables, and one-click downloads, with no digging through folders",
    "Credentials live entirely outside the synced workspace, never alongside the code",
  ],
  metrics: [
    { label: "Cadences", value: "4" },
    { label: "Modules", value: "10+" },
    { label: "Setup", value: "None" },
  ],
  tags: ["Dashboard", "Orchestration", "Streamlit", "AI-assisted"],
};

interface Group {
  num: string;
  title: string;
  blurb: string;
  items: Project[];
}

const GROUPS: Group[] = [
  {
    num: "01",
    title: "Month-end close & journal entries",
    blurb: "The tools that take raw bank and loan data through to posted journal entries, each one validated before it is allowed to produce output.",
    items: [
      {
        id: "bank-recon",
        status: "production",
        title: "Bank reconciliation automation",
        subtitle: "Matches accounting records against bank statements automatically",
        description:
          "Reconciles QuickBooks Online transaction data against bank statement exports across 10+ accounts. A five-pass matching algorithm reaches roughly 98% match rates, validated against months of real data across four major US banks. It generates credit-card journal entries and a clear exception report for anything that needs human review.",
        highlights: [
          "Reference-number matching runs before fuzzy text matching to avoid false positives",
          "Transfers require an exact account-number match, preventing cross-account misallocation",
          "Credit-card auto-payments are never mistakenly booked as expense entries",
          "Three data-source fallbacks keep it working when one export is unavailable",
        ],
        metrics: [
          { label: "Match rate", value: "~98%" },
          { label: "Passes", value: "5" },
          { label: "Banks", value: "4" },
          { label: "Accounts", value: "10+" },
        ],
        tags: ["AI-assisted", "QBO API", "Fuzzy matching", "OAuth2"],
      },
      {
        id: "loan-repayment-je",
        status: "production",
        title: "Loan repayment JE automation",
        subtitle: "Converts payment reports into QBO-ready journal entries",
        description:
          "Reads multi-tab payment reports and generates correctly structured journal entries for QuickBooks Online. It handles the full range of repayment scenarios, regular repayments, charged-off recoveries, chargebacks, and refunds, with color-coded exception flagging for anything that needs manual review.",
        highlights: [
          "Rounding differences are absorbed into the principal balance, never the bank account",
          "Intercompany payments are routed automatically to the correct intercompany accounts",
          "Recoveries are mapped to the loan loss reserve at the individual product level",
          "Six color-coded exception categories make manual review fast",
        ],
        metrics: [
          { label: "Exceptions", value: "6" },
          { label: "Rounding", value: "Auto" },
          { label: "Output", value: "QBO-ready" },
        ],
        tags: ["AI-assisted", "Excel automation", "JE generation", "Waterfall logic"],
      },
      {
        id: "noncash-je",
        status: "production",
        title: "Non-cash loan JE automation",
        subtitle: "Handles write-offs, insurance refunds, and recoveries",
        description:
          "Generates journal entries for loan-related transactions that never touch a bank account: write-offs, force-place insurance refunds applied as repayment, and direct refunds to customers. Built to mirror the repayment automation for consistency across the workflow.",
        highlights: [
          "Write-offs charge principal and interest to the loan loss reserve by product",
          "Insurance refunds used as repayment apply to interest first, then principal",
          "Sequential JE numbering continues automatically from the prior period",
          "A Debits = Credits check blocks any unbalanced entry before output",
        ],
        metrics: [
          { label: "Txn types", value: "3" },
          { label: "Numbering", value: "Sequential" },
          { label: "Validation", value: "Pre-output" },
        ],
        tags: ["AI-assisted", "Non-cash JEs", "Sequential numbering"],
      },
      {
        id: "consolidation-je",
        status: "development",
        title: "Consolidation JE generator",
        subtitle: "Automates multi-entity intercompany journal entries",
        description:
          "Generates import-ready workbooks for intercompany transactions where one entity pays expenses on behalf of another. It produces JE import, monthly summary, and account mapping tabs, with sequential numbering that carries forward across periods.",
        highlights: [
          "Expenses paid by a subsidiary are booked as intercompany payables on the parent",
          "Numbering continues sequentially across months with no gaps or duplicates",
          "Every entry passes a mandatory Debits = Credits check before any file is produced",
          "Output follows the QBO import format for direct paste-and-upload",
        ],
        metrics: [
          { label: "Balance check", value: "100%" },
          { label: "Output tabs", value: "3" },
          { label: "Numbering", value: "Auto" },
        ],
        tags: ["Multi-entity", "Intercompany", "QBO import"],
      },
      {
        id: "qbo-uploader",
        status: "production",
        title: "QuickBooks Online JE uploader",
        subtitle: "Posts journal entries to QBO via API with a full audit trail",
        description:
          "A two-step pipeline that cleans a standardized journal-entry file and uploads it directly to QuickBooks Online through the REST API. It handles OAuth2 token refresh on its own, checks for duplicates before posting, and produces three reports so you always know what was uploaded, skipped, or failed.",
        highlights: [
          "OAuth2 refresh-token rotation is fully automatic, with no manual re-authentication",
          "Every entry is checked against existing QBO entries to prevent duplicates",
          "Three reports after each run: success, duplicates, and failures",
          "Runs from a double-click file, with no terminal or setup required",
        ],
        metrics: [
          { label: "Reports", value: "3" },
          { label: "Token refresh", value: "Auto" },
          { label: "Error rate", value: "~0%" },
        ],
        tags: ["REST API", "OAuth2", "Duplicate detection", "One-click run"],
      },
      {
        id: "month-end-orchestration",
        status: "development",
        title: "Close orchestration framework",
        subtitle: "Drop in raw data, run once, every close module fires end to end",
        description:
          "The framework that ties the individual tools into one close. The target: drop raw bank, loan, and investor data into an input folder, run once, and every module, from bank classification through repayment, revenue, charge-off, provisions, accruals, intercompany, reconciliation, and consolidation, produces a standardized, validated journal-entry file ready to upload.",
        highlights: [
          "A shared module contract: inputs, working-paper calc, standardized JE, validation, upload, tie-out",
          "A common config layer holds the chart of accounts and account/entity mappings",
          "Inputs pool together; outputs are split by category for clean review",
          "Multi-entity by design, so intercompany and clearing accounts net out on consolidation",
        ],
        metrics: [
          { label: "Phases", value: "8" },
          { label: "Modules", value: "12" },
          { label: "Per module", value: "WP → JE" },
        ],
        tags: ["Pipeline", "Multi-entity", "Validation-first"],
      },
    ],
  },
  {
    num: "02",
    title: "Billing & investor reporting",
    blurb: "Recurring outbound reporting, from monthly usage invoices to the weekly and monthly packages that go to investors and fund administrators.",
    items: [
      {
        id: "saas-invoicing",
        status: "production",
        title: "SaaS usage billing engine",
        subtitle: "Turns monthly usage into client invoices, pushed to QBO",
        description:
          "Generates monthly invoices for a usage-billed product. It reads each client's usage across multiple event types, applies their contracted rates, tiered minimums, and discounts, then pushes finished invoices into QuickBooks Online as reviewable drafts. A companion view tracks recurring-revenue trends across months.",
        highlights: [
          "Per-client rate cards live in one config, so pricing is data, not code",
          "Monthly minimums are step functions anchored to each contract start date",
          "Every invoice is created as an unsent draft for review before it goes out",
          "Analytics separate recurring revenue from one-off project fees",
        ],
        metrics: [
          { label: "Event types", value: "6" },
          { label: "Clients", value: "9+" },
          { label: "QBO push", value: "Auto" },
        ],
        tags: ["AI-assisted", "QBO API", "Config-driven pricing", "Streamlit"],
      },
      {
        id: "investor-weekly",
        status: "production",
        title: "Investor weekly reporting",
        subtitle: "Builds the weekly funding & position package from raw exports",
        description:
          "Produces the weekly investor package from raw position and transaction exports. It scaffolds the week's folders, refreshes each tab, appends the new daily time-series rows with their formulas, recalculates, and produces a final distribution-ready workbook, then drafts the funding-request email for review.",
        highlights: [
          "Drives the large workbooks natively, preserving formulas, named ranges, and formatting",
          "Time-series tabs extend by carrying prior-row formulas forward, with sum-checks kept in sync",
          "A final pass freezes cells that reference dropped tabs, then trims the working tabs",
          "Self-verification confirms row counts and that every balance check nets to zero",
        ],
        metrics: [
          { label: "Cadence", value: "Weekly" },
          { label: "Final book", value: "8 sheets" },
          { label: "Email", value: "Draft only" },
        ],
        tags: ["Excel automation", "Time-series", "Email draft"],
      },
      {
        id: "investor-monthly-payable",
        status: "production",
        title: "Investor monthly payable reports",
        subtitle: "Transforms monthly originals into entity-specific payable files",
        description:
          "Each month, converts the raw investor files into the payable workbooks the fund administrator tracks, one per entity. It adds the supporting reference, repayment, and funding tabs, derives the extra position columns, and builds the entity-specific summary including the prior-month rollforward, then drafts the reply email with the period's charge-off summary.",
        highlights: [
          "The entity split lives entirely in the summary formulas; supporting tabs are identical",
          "Charge-off figures are the month-over-month delta of the investor-portion column",
          "The prior-month payable balance rolls forward automatically into the current month",
          "The reply email is drafted as a reply-all, never sent automatically",
        ],
        metrics: [
          { label: "Entities", value: "2" },
          { label: "Cadence", value: "Monthly" },
          { label: "Rollforward", value: "Auto" },
        ],
        tags: ["Excel automation", "Multi-entity", "Rollforward"],
      },
    ],
  },
  {
    num: "03",
    title: "Payables & data",
    blurb: "The supporting layer: turning vendor invoices into posted bills, and pulling clean source data out of the loan system for reconciliation.",
    items: [
      {
        id: "vendor-bill-uploader",
        status: "production",
        title: "Vendor bill automation",
        subtitle: "Drop an invoice PDF, get a posted QBO bill with the PDF attached",
        description:
          "Takes a vendor invoice PDF, reads the amount, dates, and document number, infers the right GL account and class from how that vendor's bills were coded before, then posts a bill to QuickBooks Online through the accounting API and attaches the original PDF. A tiered model keeps recurring vendors hands-off while new ones are learned on first use.",
        highlights: [
          "Three vendor tiers: exact parsers for known vendors, learned mappings, guided entry for new",
          "New vendors are reviewed once, then remembered for every future bill",
          "GL account and class are inferred from the vendor's most recent prior bills",
          "Duplicate document numbers are caught before posting to prevent double-entry",
        ],
        metrics: [
          { label: "Vendor tiers", value: "3" },
          { label: "PDF → Bill", value: "Auto" },
          { label: "GL", value: "From history" },
        ],
        tags: ["REST API", "PDF parsing", "GL inference"],
      },
      {
        id: "lms-export",
        status: "production",
        title: "Loan data export pipeline",
        subtitle: "Pulls monthly interest & fee data from the loan system API",
        description:
          "Pulls period interest and fee activity from the loan management system's API each month and shapes it into the pivots needed for balance-sheet reconciliation. Because daily interest accrues just in time rather than being stored, the pipeline computes it per loan and sums it for the period, then enriches every loan with its funding source.",
        highlights: [
          "Filters tens of thousands of historical loans down to the few hundred active first",
          "Computes just-in-time interest per loan from day-level data the stream does not carry",
          "Tuned concurrency with backoff holds the API rate limit at a ~0% failure rate",
          "Outputs portfolio pivots plus per-loan detail, archived by month",
        ],
        metrics: [
          { label: "Interest", value: "JIT calc" },
          { label: "API fails", value: "~0%" },
          { label: "Cadence", value: "Monthly" },
        ],
        tags: ["REST API", "Rate-limit backoff", "Data pipeline"],
      },
    ],
  },
];

const APPROACH = [
  {
    num: "01",
    title: "Accounting logic first, code second",
    body: "Every automation starts with the accounting problem itself: the rules, the edge cases, the exception paths. The tooling is a translation of accounting judgment, never a replacement for it.",
  },
  {
    num: "02",
    title: "Validate before every output",
    body: "Each generator runs a mandatory Debits = Credits check across every entry before producing a file. Numbering is enforced across periods. Silent failures are caught up front, not discovered mid-close.",
  },
  {
    num: "03",
    title: "Built for accountants, not engineers",
    body: "Tools run from a double-click, with no terminal and no setup. Outputs mirror their inputs, exceptions are color-coded, and the automation disappears into the existing workflow instead of replacing it.",
  },
];

const SKILLS = [
  { cat: "AI & automation", items: ["AI-assisted accounting automation", "Cloud API integration (QBO, OAuth2)", "Workflow design & quality control"] },
  { cat: "Systems", items: ["QuickBooks Online", "NetSuite, Oracle", "Advanced Excel"] },
  { cat: "Finance domain", items: ["US GAAP, multi-entity close", "Consumer lending, SaaS metrics", "SOX 404 / PCAOB, financial modeling"] },
];

const STATS = [
  { num: "15 → 3", label: "Days for month-end close" },
  { num: "~98%", label: "Bank reconciliation match rate" },
  { num: "12", label: "Automations built" },
  { num: "10+", label: "Bank accounts automated" },
];

/* ───────────────────────── helpers ───────────────────────── */

function useInView(threshold = 0.14) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(26px)",
        transition: `opacity 0.7s cubic-bezier(.2,.7,.2,1) ${delay}s, transform 0.7s cubic-bezier(.2,.7,.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  const live = status === "production";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 500,
      letterSpacing: "0.08em", textTransform: "uppercase",
      color: live ? "var(--accent-ink)" : "#8A5A12",
      background: live ? "var(--accent-bg)" : "#F4E9D2",
      borderRadius: 100, padding: "4px 11px",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: live ? "var(--accent)" : "#B5821E" }} />
      {live ? "Live" : "In progress"}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <StatusBadge status={project.status} />
        </div>
        <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 22, lineHeight: 1.12, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 7 }}>
          {project.title}
        </h3>
        <p style={{ fontSize: 13.5, color: "var(--accent-ink)", fontWeight: 500, marginBottom: 14, lineHeight: 1.4 }}>
          {project.subtitle}
        </p>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7, marginBottom: 18 }}>
          {project.description}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {project.tags.map(t => (
            <span key={t} style={{
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)",
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 5, padding: "3px 9px",
            }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          {project.metrics.map(m => (
            <div key={m.label}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 17, fontWeight: 500, color: "var(--ink)" }}>{m.value}</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-faint)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => setOpen(!open)} className="card-toggle">
        <span>{open ? "Hide detail" : "How it works"}</span>
        <span style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform .25s", fontSize: 17, lineHeight: 1 }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "18px 24px 24px", background: "var(--paper)", borderTop: "1px solid var(--line)" }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
            {project.highlights.map((h, i) => (
              <li key={i} style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.6, paddingLeft: 18, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, top: 1, color: "var(--accent)" }}>—</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Home() {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      for (const id of ["work", "approach", "about"]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) setActive(id);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Spline+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        :root {
          --serif: 'Fraunces', Georgia, serif;
          --sans: 'Spline Sans', system-ui, sans-serif;
          --mono: 'IBM Plex Mono', monospace;
          --paper: #F0ECE1;
          --paper-2: #E9E4D6;
          --card: #FBF9F3;
          --ink: #1C1A15;
          --ink-soft: #5C574C;
          --ink-faint: #9C9683;
          --line: #DAD3C2;
          --accent: #1C7A52;
          --accent-ink: #145C3D;
          --accent-bg: #DFEDE3;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: var(--sans); color: var(--ink); background: var(--paper);
          -webkit-font-smoothing: antialiased;
          background-image:
            radial-gradient(circle at 15% 12%, rgba(28,122,82,0.05), transparent 38%),
            radial-gradient(circle at 88% 8%, rgba(28,122,82,0.04), transparent 32%);
        }
        ::selection { background: var(--accent); color: #fff; }
        /* fine grain overlay */
        body::before {
          content: ""; position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0.5;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }
        .wrap { max-width: 1140px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 2; }
        .eyebrow { font-family: var(--mono); font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--accent-ink); }
        .card {
          background: var(--card); border: 1px solid var(--line); border-radius: 4px;
          transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s;
        }
        .card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: 0 18px 40px -22px rgba(28,26,21,0.4); }
        .card-toggle {
          margin-top: auto; width: 100%; padding: 13px 24px; background: none; cursor: pointer;
          border: none; border-top: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
          font-family: var(--mono); font-size: 12px; letter-spacing: 0.04em; color: var(--accent-ink);
          transition: background .18s;
        }
        .card-toggle:hover { background: var(--accent-bg); }
        .rule { height: 1px; background: var(--line); border: none; }
        .navlink { background: none; border: none; cursor: pointer; font-family: var(--mono); font-size: 12.5px; letter-spacing: 0.04em; transition: color .18s; }
        @keyframes rise { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 760px) { .nav-links { display: none !important; } .hero-stats { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 600px) { .wrap { padding: 0 1.3rem; } .about-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(240,236,225,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        transition: "all .3s",
      }}>
        <div className="wrap" style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}>
            Bianca Su<span style={{ color: "var(--accent)" }}>.</span>
          </span>
          <div className="nav-links" style={{ display: "flex", gap: "1.9rem", alignItems: "center" }}>
            {[["work", "Work"], ["approach", "Approach"], ["about", "About"]].map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="navlink"
                style={{ color: active === id ? "var(--accent)" : "var(--ink-soft)" }}>{label}</button>
            ))}
            <a href="/resume-general.pdf" target="_blank" rel="noopener noreferrer" style={{
              fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.04em", textDecoration: "none",
              color: "#fff", background: "var(--ink)", borderRadius: 3, padding: "7px 14px",
            }}>Résumé ↗</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="wrap" style={{ paddingTop: 150, paddingBottom: 90 }}>
        <p className="eyebrow" style={{ animation: "rise .7s .05s both" }}>Finance Automation Portfolio</p>
        <h1 style={{
          fontFamily: "var(--serif)", fontWeight: 400, letterSpacing: "-0.025em",
          fontSize: "clamp(44px, 7vw, 88px)", lineHeight: 1.02, margin: "22px 0 0", maxWidth: 980,
          animation: "rise .8s .12s both",
        }}>
          Accounting expertise,<br />
          <span style={{ fontStyle: "italic", color: "var(--accent)" }}>automated</span> with precision.
        </h1>
        <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.75, maxWidth: 600, marginTop: 30, animation: "rise .8s .22s both" }}>
          I&apos;m a CPA who builds the automation a finance team actually uses. AI-assisted tools that handle
          reconciliation, journal entries, billing, and investor reporting, so month-end close takes days
          instead of weeks.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28, animation: "rise .8s .3s both" }}>
          {["CPA", "9+ years in fintech lending", "Ex-KPMG", "QuickBooks Online API"].map(c => (
            <span key={c} style={{
              fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-soft)",
              border: "1px solid var(--line)", borderRadius: 100, padding: "6px 14px", background: "var(--card)",
            }}>{c}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", animation: "rise .8s .38s both" }}>
          <button onClick={() => go("work")} style={{
            fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.03em",
            background: "var(--accent)", color: "#fff", border: "none", borderRadius: 4,
            padding: "13px 24px", cursor: "pointer",
          }}>See the work →</button>
          <button onClick={() => go("about")} style={{
            fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.03em",
            background: "transparent", color: "var(--ink)", border: "1px solid var(--ink)", borderRadius: 4,
            padding: "13px 24px", cursor: "pointer",
          }}>About me</button>
        </div>

        {/* STATS */}
        <div className="hero-stats" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
          marginTop: 70, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden",
          background: "var(--card)", animation: "rise .9s .5s both",
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              padding: "26px 22px",
              borderRight: i < STATS.length - 1 ? "1px solid var(--line)" : "none",
              borderBottom: "none",
            }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 500, color: "var(--ink)", lineHeight: 1, letterSpacing: "-0.01em" }}>{s.num}</div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 9, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <hr className="rule" style={{ maxWidth: 1140, margin: "0 auto" }} />

      {/* WORK */}
      <section id="work" className="wrap" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <Reveal>
          <p className="eyebrow">01 / Work</p>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(30px, 4.5vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em", margin: "12px 0 14px", maxWidth: 760 }}>
            A connected system, <span style={{ fontStyle: "italic", color: "var(--accent)" }}>not</span> a pile of scripts.
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 620 }}>
            Each tool solves one accounting workflow. Together they run the close from raw data to posted
            entries. The accounting rules come first; the automation is built around them.
          </p>
        </Reveal>

        {/* PLATFORM feature card */}
        <Reveal delay={0.05}>
          <div className="card" style={{ marginTop: 44, borderColor: "var(--accent)", display: "grid", gridTemplateColumns: "1fr", overflow: "hidden" }}>
            <div style={{ padding: "30px 30px 28px", display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: 28, alignItems: "center" }} className="about-grid">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <StatusBadge status={PLATFORM.status} />
                  <span className="eyebrow" style={{ color: "var(--ink-faint)" }}>The platform</span>
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, letterSpacing: "-0.015em", marginBottom: 8 }}>{PLATFORM.title}</h3>
                <p style={{ fontSize: 14.5, color: "var(--accent-ink)", fontWeight: 500, marginBottom: 14 }}>{PLATFORM.subtitle}</p>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.72, marginBottom: 18 }}>{PLATFORM.description}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PLATFORM.tags.map(t => (
                    <span key={t} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-soft)", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 5, padding: "3px 9px" }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderLeft: "1px solid var(--line)", paddingLeft: 28 }}>
                {PLATFORM.metrics.map((m, i) => (
                  <div key={m.label} style={{ padding: "14px 0", borderBottom: i < PLATFORM.metrics.length - 1 ? "1px solid var(--line)" : "none", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, color: "var(--ink)" }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* GROUPS */}
        {GROUPS.map((g, gi) => (
          <div key={g.num} style={{ marginTop: gi === 0 ? 64 : 72 }}>
            <Reveal>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--accent)" }}>{g.num}</span>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: "clamp(22px, 3vw, 30px)", letterSpacing: "-0.015em" }}>{g.title}</h3>
              </div>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.65, maxWidth: 640, marginLeft: 29, marginBottom: 26 }}>{g.blurb}</p>
            </Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
              {g.items.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i * 0.05, 0.2)}><ProjectCard project={p} /></Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>

      <hr className="rule" style={{ maxWidth: 1140, margin: "60px auto 0" }} />

      {/* APPROACH */}
      <section id="approach" className="wrap" style={{ paddingTop: 80, paddingBottom: 40 }}>
        <Reveal>
          <p className="eyebrow">02 / Approach</p>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(30px, 4.5vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em", margin: "12px 0 40px", maxWidth: 720 }}>
            How I <span style={{ fontStyle: "italic", color: "var(--accent)" }}>build</span>.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 0, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", background: "var(--card)" }}>
          {APPROACH.map((a, i) => (
            <Reveal key={a.num} delay={i * 0.08}>
              <div style={{ padding: "32px 30px", borderRight: i < APPROACH.length - 1 ? "1px solid var(--line)" : "none", height: "100%" }}>
                <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 40, color: "var(--accent-bg)", lineHeight: 1, marginBottom: 16 }}>{a.num}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 19, letterSpacing: "-0.01em", marginBottom: 12, lineHeight: 1.25 }}>{a.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.7 }}>{a.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <hr className="rule" style={{ maxWidth: 1140, margin: "60px auto 0" }} />

      {/* ABOUT */}
      <section id="about" className="wrap" style={{ paddingTop: 80, paddingBottom: 90 }}>
        <Reveal>
          <p className="eyebrow">03 / About</p>
          <h2 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(30px, 4.5vw, 52px)", lineHeight: 1.06, letterSpacing: "-0.02em", margin: "12px 0 40px" }}>
            About <span style={{ fontStyle: "italic", color: "var(--accent)" }}>Bianca</span>.
          </h2>
        </Reveal>
        <div className="about-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22, alignItems: "start" }}>
          <Reveal>
            <div className="card" style={{ padding: 34 }}>
              <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.75, marginBottom: 18 }}>
                CPA with 9+ years across audit, accounting, and finance operations in fintech and professional
                services, including Big&nbsp;4 audit at KPMG and accounting leadership in a multi-entity fintech lender.
              </p>
              <p style={{ fontSize: 15, color: "var(--ink-soft)", lineHeight: 1.75, marginBottom: 24 }}>
                The work sits where accounting execution and automation meet: owning month-end close, multi-entity
                consolidation, and reconciliation, while building the AI-assisted tooling that makes them faster.
                That leaves room for the judgment-heavy work, cash management, investor due diligence, and
                cross-functional finance leadership.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 22 }}>
                {[
                  { label: "Location", value: "Chicago, IL" },
                  { label: "Credentials", value: "CPA · M.S. Accounting, UIC" },
                  { label: "Open to", value: "Finance Manager · Controller · Finance Systems · Accounting Automation" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--ink-faint)", minWidth: 92, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.5 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="card" style={{ padding: 28 }}>
                <p className="eyebrow" style={{ color: "var(--ink-faint)", marginBottom: 18 }}>Skills</p>
                {SKILLS.map(g => (
                  <div key={g.cat} style={{ marginBottom: 16 }}>
                    <p style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: "var(--accent-ink)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>{g.cat}</p>
                    {g.items.map(it => <p key={it} style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.65 }}>{it}</p>)}
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--ink)", borderRadius: 4, padding: 28 }}>
                <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 6 }}>Get in touch</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 20 }}>
                  Open to finance leadership and automation roles at fintech companies.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {[
                    { label: "Email", value: "bsuzhaoya@gmail.com", href: "mailto:bsuzhaoya@gmail.com" },
                    { label: "Résumé", value: "General / Automation ↗", href: "/resume-general.pdf" },
                    { label: "Résumé", value: "Accounting ↗", href: "/resume-accountant.pdf" },
                  ].map(item => (
                    <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 12, textDecoration: "none",
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                      borderRadius: 4, padding: "11px 15px", fontSize: 13, color: "#fff",
                      fontFamily: "var(--mono)", letterSpacing: "0.02em",
                    }}>
                      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", minWidth: 56, textTransform: "uppercase" }}>{item.label}</span>
                      {item.value}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--line)", background: "var(--paper-2)", position: "relative", zIndex: 2 }}>
        <div className="wrap" style={{ padding: "30px 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 500 }}>Bianca Su<span style={{ color: "var(--accent)" }}>.</span> CPA</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-faint)", letterSpacing: "0.04em" }}>Finance Automation Portfolio · Chicago, IL</span>
        </div>
      </footer>
    </>
  );
}
