"use client";

import { useState, useEffect, useRef } from "react";

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

const PROJECTS: Project[] = [
  {
    id: "bank-recon",
    status: "production",
    title: "Bank reconciliation automation",
    subtitle: "Matches QBO transactions against bank statements automatically",
    description:
      "Automatically reconciles QuickBooks Online transaction data against bank statement CSV exports across 10+ accounts. Uses a 5-pass matching algorithm to achieve ~98% match rates — validated against 8+ months of real transaction data across 4 major US bank institutions. Generates credit card journal entries and produces a clear exception report for anything that needs human review.",
    highlights: [
      "Three data source fallbacks: manually imported Excel → QBO TransactionList API (chunked monthly) → JournalReport API",
      "Reference-number matching runs before fuzzy text matching to avoid false positives",
      "Transfer transactions require exact account number match — prevents cross-account misallocation",
      "Credit card auto-payments are never mistakenly recorded as expense journal entries",
      "Combine-lock uses exact date + amount + memo — prevents the wrong transaction from being consumed",
    ],
    metrics: [
      { label: "Match rate", value: "~98%" },
      { label: "Matching passes", value: "5" },
      { label: "Bank institutions", value: "4" },
      { label: "Bank accounts", value: "10+" },
    ],
    tags: ["Python", "QBO API", "openpyxl", "SequenceMatcher", "OAuth2", "pandas"],
  },
  {
    id: "loan-repayment-je",
    status: "production",
    title: "Loan repayment JE automation",
    subtitle: "Converts payment reports into QBO-ready journal entries",
    description:
      "Reads multi-tab Excel payment reports and generates correctly structured journal entries for QuickBooks Online. Handles the full range of loan repayment scenarios — regular repayments, charged-off loan recoveries, chargebacks, and refunds — with color-coded exception flagging for anything that needs manual review.",
    highlights: [
      "Rounding differences are absorbed into the principal balance (Notes Receivable) — never recorded against the bank account",
      "Intercompany payments are automatically routed to the correct AR Intercompany accounts",
      "Charged-off loan recoveries are mapped to the loan loss reserve at the individual product level",
      "Six exception categories, each color-coded: chargeback (red), recovery (orange), refund (yellow), hosted payment page mismatches (blue/purple), pending bank settlement (green)",
      "Hosted payment page daily net amounts are reconciled to bank deposits accounting for ~3 business day settlement lag",
    ],
    metrics: [
      { label: "Exception categories", value: "6" },
      { label: "Rounding handling", value: "Auto" },
      { label: "Output", value: "QBO-ready" },
    ],
    tags: ["Python", "Excel automation", "JE generation", "Waterfall logic", "openpyxl"],
  },
  {
    id: "qbo-uploader",
    status: "production",
    title: "QuickBooks Online JE uploader",
    subtitle: "Uploads journal entries to QBO via API with full audit trail",
    description:
      "A two-step pipeline that cleans a standardized journal entry CSV file and then uploads it directly to QuickBooks Online through the REST API. Automatically handles OAuth2 token refresh, checks for duplicates before uploading, and produces three separate output reports so you always know exactly what was uploaded, skipped, or failed.",
    highlights: [
      "OAuth2 Refresh Token rotation is fully automatic — no manual re-authentication required",
      "Every journal entry is checked against existing QBO entries before upload to prevent duplicates",
      "Three output reports after every run: upload_success.csv, upload_duplicates.csv, upload_failed.csv",
      "Bank and cash accounts are locked from any rounding adjustments during the cleaning step",
      "Runs via a double-click .command file on macOS — no Terminal or Python setup needed",
      "Account names are matched exactly (case-sensitive) to prevent silent upload failures in QBO",
    ],
    metrics: [
      { label: "Output reports", value: "3" },
      { label: "Token refresh", value: "Auto" },
      { label: "Upload error rate", value: "~0%" },
    ],
    tags: ["Intuit OAuth2", "REST API", "Duplicate detection", "macOS .command", "Python"],
  },
  {
    id: "consolidation-je",
    status: "development",
    title: "Consolidation JE generator",
    subtitle: "Automates multi-entity intercompany journal entries",
    description:
      "Generates QBO import-ready Excel workbooks for intercompany transactions where one entity pays expenses on behalf of another — a common need in multi-entity consolidations. Produces three output tabs (JE Import, Monthly Summary, Account Mapping) with sequential numbering that carries forward across accounting periods.",
    highlights: [
      "Expenses paid by the subsidiary are recorded on the parent entity's books as intercompany payables",
      "Statement credits are handled as Dr Intercompany / Cr Expense reversals",
      "Journal entry numbering continues sequentially from the prior period — no gaps or duplicates across months",
      "Every journal entry passes a mandatory Debits = Credits check before any output file is produced",
      "Output follows QBO's 11-column import format for direct paste-and-upload",
      "The Name column is populated for all Receivable and Payable lines as required by QBO for proper posting",
    ],
    metrics: [
      { label: "Balance validation", value: "100%" },
      { label: "Output tabs", value: "3" },
      { label: "JE numbering", value: "Auto" },
    ],
    tags: ["Multi-entity consolidation", "Intercompany accounting", "QBO import", "openpyxl"],
  },
  {
    id: "noncash-je",
    status: "production",
    title: "Non-cash loan JE automation",
    subtitle: "Automates write-offs, insurance refunds, and recoveries",
    description:
      "Handles journal entries for loan-related non-cash transactions that don't involve a bank movement: loan write-offs, force-place insurance refunds applied as loan repayments, and direct insurance refunds to customers. Built to mirror the structure of the loan repayment automation for consistency across the accounting workflow.",
    highlights: [
      "Loan write-offs: principal and interest are charged off to the loan loss reserve at the individual product level",
      "Force-place insurance refunds used as repayment: waterfall applies amount to outstanding interest first, then principal",
      "Direct insurance refunds to customers: recorded as a reduction in the insurance liability",
      "Sequential JE numbering continues automatically from the prior period end — no manual tracking needed",
      "Debits = Credits validation runs before any output is generated — unbalanced entries are flagged and blocked",
    ],
    metrics: [
      { label: "Transaction types", value: "3" },
      { label: "JE numbering", value: "Sequential" },
      { label: "Validation", value: "Pre-output" },
    ],
    tags: ["Loan write-offs", "FPI refunds", "Non-cash JEs", "Sequential numbering", "Python"],
  },
  {
    id: "work-hub",
    status: "production",
    title: "Work Hub — automation control center",
    subtitle: "One dashboard that runs every finance automation on click",
    description:
      "A local web dashboard that turns every script below into a click-to-run module, organized by cadence — daily, weekly, monthly, and project work. Each module exposes its own inputs, streams live log output as it runs, surfaces headline results, and opens the output folder when finished. It's the layer that lets the finance function operate the automations without ever touching a terminal.",
    highlights: [
      "Modules are auto-discovered — adding a new automation is dropping in one file, with no rewiring",
      "Long-running jobs stream output line-by-line into the UI instead of blocking silently",
      "Results render as metrics, tables, and one-click downloads — no digging through folders",
      "Credentials live entirely outside the synced workspace, never alongside the code",
      "Organized Daily / Weekly / Monthly / Projects so every recurring task has an obvious home",
    ],
    metrics: [
      { label: "Cadences", value: "4" },
      { label: "Modules", value: "10+" },
      { label: "Setup needed", value: "None" },
    ],
    tags: ["Streamlit", "Python", "Process orchestration", "Live log streaming"],
  },
  {
    id: "saas-invoicing",
    status: "production",
    title: "SaaS usage billing engine",
    subtitle: "Turns monthly usage data into client invoices, pushed to QBO",
    description:
      "Generates monthly invoices for a B2B SaaS product billed on usage. It reads each client's usage across multiple billable event types, applies that client's contracted per-unit rates, tiered monthly minimums, and negotiated discounts, then pushes finished invoices into QuickBooks Online as reviewable drafts. A companion analytics view tracks recurring-revenue trends across months.",
    highlights: [
      "Per-client rate cards live in one master config — pricing is data, not code",
      "Monthly minimums are step functions anchored to each client's contract start date, with first-month proration",
      "Every invoice is created as an unsent draft for human review before it goes out",
      "Zero-activity clients are suppressed from the main view but still surfaced for audit",
      "Cross-month analytics separate recurring revenue from one-off project fees",
    ],
    metrics: [
      { label: "Billable event types", value: "6" },
      { label: "Clients billed", value: "9+" },
      { label: "QBO push", value: "Auto" },
    ],
    tags: ["Python", "QBO API", "Config-driven pricing", "OAuth2", "Streamlit"],
  },
  {
    id: "investor-weekly",
    status: "production",
    title: "Investor weekly reporting automation",
    subtitle: "Builds the weekly funding & position package from raw exports",
    description:
      "Produces the weekly investor reporting package from raw loan position and transaction exports. It scaffolds the week's folder structure, refreshes each report tab, appends the new daily time-series rows with their formulas, recalculates, and produces a final distribution-ready workbook — then drafts the funding-request email for review.",
    highlights: [
      "Drives Excel natively for the large workbooks rather than rebuilding them in Python — preserves formulas, named ranges, and formatting",
      "Time-series tabs are extended by carrying prior-row formulas forward, with sum-check ranges kept in sync",
      "A final pass converts cells that reference soon-to-be-dropped tabs into static values, then trims the working tabs",
      "Built-in self-verification rules confirm row counts and that all balance checks net to zero",
      "The outbound email is created as a draft only — never sent automatically",
    ],
    metrics: [
      { label: "Cadence", value: "Weekly" },
      { label: "Final workbook", value: "8 sheets" },
      { label: "Email", value: "Draft only" },
    ],
    tags: ["Python", "Excel via AppleScript", "openpyxl", "Time-series", "Email draft"],
  },
  {
    id: "investor-monthly-payable",
    status: "production",
    title: "Investor monthly payable reports",
    subtitle: "Transforms monthly originals into entity-specific payable files",
    description:
      "Each month, converts the raw investor report files into the payable workbooks the fund administrator tracks — one per investing entity. It adds the supporting reference, repayment, and funding tabs, derives the extra position columns, and builds the entity-specific summary payable block including the prior-month rollforward, then drafts the reply email with the period's charge-off summary.",
    highlights: [
      "The entity split lives entirely in the summary formulas — the supporting data tabs are identical across entities",
      "Charge-off figures are derived as the month-over-month delta of the investor-portion charge-off column",
      "The prior-month payable balance rolls forward automatically into the current month's summary",
      "Cross-workbook styles are copied attribute-by-attribute to avoid corrupting the file on save",
      "The reply email is drafted as a reply-all to the standing thread — never sent automatically",
    ],
    metrics: [
      { label: "Entities", value: "2" },
      { label: "Cadence", value: "Monthly" },
      { label: "Rollforward", value: "Auto" },
    ],
    tags: ["Python", "openpyxl", "Multi-entity", "Rollforward logic"],
  },
  {
    id: "vendor-bill-uploader",
    status: "production",
    title: "Vendor bill automation",
    subtitle: "Drop an invoice PDF → posted as a QBO bill with the PDF attached",
    description:
      "Takes a vendor invoice PDF, parses the amount, dates, and document number, infers the right GL account and class from how that vendor's bills were coded historically, then posts a Bill to QuickBooks Online through the accounting REST API and attaches the original PDF. A tiered vendor model keeps recurring vendors fully hands-off while new ones are learned on first use.",
    highlights: [
      "Three-tier vendor model: precise parsers for known vendors, learned mappings for repeat vendors, guided entry for new ones",
      "New vendors are reviewed once, then their mapping is remembered for every future bill",
      "GL account and class are inferred from the vendor's most recent prior bills",
      "Duplicate document numbers are detected before posting to prevent double-entry",
      "A bill-vs-expense rule routes recurring invoices to Bills and small one-offs to Expenses",
    ],
    metrics: [
      { label: "Vendor tiers", value: "3" },
      { label: "PDF → Bill", value: "Auto" },
      { label: "GL inference", value: "From history" },
    ],
    tags: ["Intuit REST API", "OAuth2", "PDF parsing", "Idempotent posting", "Streamlit"],
  },
  {
    id: "lms-export",
    status: "production",
    title: "Loan data export pipeline",
    subtitle: "Pulls monthly loan interest & fee data from the LMS API",
    description:
      "Pulls period interest and fee activity from the loan management system's API each month and shapes it into the pivots needed for balance-sheet reconciliation. Because daily interest is accrued just-in-time rather than stored, the pipeline computes it per loan and sums it for the period, then enriches every loan with its funding source.",
    highlights: [
      "Filters tens of thousands of historical loans down to the few hundred active in the period before making any per-loan calls",
      "Computes just-in-time interest accrual per loan from day-level data the transaction stream doesn't carry",
      "Tuned concurrency with exponential backoff holds the API's rate limit at a ~0% failure rate",
      "Each loan is joined to its funding source so output carries an investor dimension",
      "Outputs portfolio pivots plus per-loan detail, archived by month",
    ],
    metrics: [
      { label: "Interest", value: "JIT calc" },
      { label: "API failures", value: "~0%" },
      { label: "Cadence", value: "Monthly" },
    ],
    tags: ["Python", "REST API", "Rate-limit backoff", "pandas"],
  },
  {
    id: "month-end-orchestration",
    status: "development",
    title: "Month-end close orchestration framework",
    subtitle: "Drop in raw data → every close module runs end to end",
    description:
      "The framework that ties the individual tools into one close. The target workflow: drop raw bank, loan, and investor data into an input folder, run once, and every module — bank classification, repayment, revenue and funding cost, charge-off, loss provisions, accruals, intercompany, bank reconciliation, and consolidation — produces a standardized, validated journal-entry file ready to upload.",
    highlights: [
      "A shared module contract: inputs → working-paper calc → standardized JE CSV → validation → upload → tie-out",
      "A common config layer holds the chart of accounts and account/entity mappings so modules stay consistent",
      "Inputs can be pooled together; outputs are split by category for clean review",
      "Multi-entity by design — intercompany and clearing accounts net out on consolidation",
      "Each module is independently runnable and surfaced as its own dashboard page",
    ],
    metrics: [
      { label: "Close phases", value: "8" },
      { label: "Modules mapped", value: "12" },
      { label: "Per module", value: "WP → JE" },
    ],
    tags: ["Pipeline architecture", "Multi-entity", "JE automation", "Validation-first"],
  },
];

const APPROACH = [
  {
    num: "01",
    title: "Accounting logic first, code second",
    body: "Every automation starts with understanding the accounting problem precisely — the rules, edge cases, and exception paths — before a single line of Python is written. The code is a translation of accounting judgment, not a replacement for it.",
  },
  {
    num: "02",
    title: "Validate before every output",
    body: "All journal entry generators run a mandatory Debits = Credits check across every journal number before producing any output file. Sequential numbering is enforced across periods. Silent failures — like QBO account name case mismatches — are caught proactively, not discovered during month-end close.",
  },
  {
    num: "03",
    title: "Built for accountants, not developers",
    body: "Tools run via double-click .command files on macOS — no Terminal, no Python setup. Output files mirror input filenames. Exception cases are color-coded for immediate triage. The goal is automation that disappears into the existing workflow rather than creating a new one.",
  },
];

function useInView(threshold = 0.1) {
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

function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      letterSpacing: "0.04em", textTransform: "uppercase" as const,
      background: status === "production" ? "#E6F4ED" : "#FEF3E2",
      color: status === "production" ? "#1E7C52" : "#B07D1A",
    }}>
      {status === "production" ? "Live" : "In development"}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(28px)",
        transition: `opacity 0.55s ${index * 0.07}s, transform 0.55s ${index * 0.07}s`,
        background: "#fff",
        border: index === 0 ? "2px solid #2D5BE3" : "1px solid #E8E6E0",
        borderRadius: 16,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column" as const,
      }}
    >
      <div style={{ padding: "26px 26px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <StatusBadge status={project.status} />
          {index === 0 && (
            <span style={{ fontSize: 11, color: "#2D5BE3", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              Featured
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: 18, fontWeight: 600, color: "#1A1814", margin: "0 0 5px",
          fontFamily: "'DM Serif Display', serif", lineHeight: 1.2,
        }}>
          {project.title}
        </h3>
        <p style={{ fontSize: 13, color: "#999", margin: "0 0 14px", fontStyle: "italic" }}>
          {project.subtitle}
        </p>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.72, margin: "0 0 18px" }}>
          {project.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 20 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontFamily: "'DM Mono', monospace",
              background: "#F4F2EC", color: "#666",
              padding: "3px 9px", borderRadius: 4, border: "1px solid #E8E6E0",
            }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, borderTop: "1px solid #F0EEE8", paddingTop: 16 }}>
          {project.metrics.map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#1A1814", fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        style={{
          marginTop: 16, width: "100%", padding: "13px 26px",
          background: "none", border: "none", borderTop: "1px solid #F0EEE8",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 13, color: "#2D5BE3", fontWeight: 600, transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F7F9FF")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <span>{open ? "Hide details" : "How it works"}</span>
        <span style={{ fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>+</span>
      </button>

      {open && (
        <div style={{ padding: "20px 26px 24px", background: "#FAFAF7", borderTop: "1px solid #F0EEE8" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
            Key design decisions
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {project.highlights.map((h, i) => (
              <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.65, paddingLeft: 18, position: "relative" as const }}>
                <span style={{ position: "absolute" as const, left: 0, color: "#2D5BE3", fontWeight: 700 }}>→</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      for (const id of ["portfolio", "approach", "about"]) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 120) setActiveNav(id);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #1A1814; -webkit-font-smoothing: antialiased; }
        ::selection { background: #2D5BE3; color: #fff; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 680px) { .hide-mobile { display: none !important; } }
        @media (max-width: 600px) { .two-col { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* NAV */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(247,245,240,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(26,24,20,0.08)" : "none",
        transition: "all 0.25s",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#1B3A6B" }}>Bianca Su, CPA</span>
          <div className="hide-mobile" style={{ display: "flex", gap: "2rem" }}>
            {[["portfolio", "Portfolio"], ["approach", "Approach"], ["about", "About"]].map(([id, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 500,
                color: activeNav === id ? "#2D5BE3" : "#666",
                transition: "color 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 2rem" }}>

        {/* HERO */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column" as const, justifyContent: "center", paddingTop: 80, paddingBottom: 60 }}>
          <div style={{ maxWidth: 700 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#2D5BE3", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 20, animation: "fadeUp 0.6s 0.1s both" }}>
              Finance Automation Portfolio
            </p>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(38px, 5.5vw, 64px)", lineHeight: 1.08, color: "#1A1814", marginBottom: 24, animation: "fadeUp 0.6s 0.2s both" }}>
              Accounting expertise,<br />automated with <em style={{ color: "#2D5BE3" }}>precision</em>
            </h1>
            <p style={{ fontSize: 16, color: "#666", lineHeight: 1.8, maxWidth: 540, marginBottom: 16, animation: "fadeUp 0.6s 0.3s both" }}>
              I'm a CPA who builds the automation tools my team actually uses — Python scripts that handle bank reconciliation, journal-entry generation, usage billing, investor reporting, and QuickBooks API uploads, so month-end close takes days instead of weeks.
            </p>
            <p style={{ fontSize: 16, color: "#666", lineHeight: 1.8, maxWidth: 540, marginBottom: 36, animation: "fadeUp 0.6s 0.35s both" }}>
              9+ years in fintech lending. Background in Big 4 audit (KPMG), financial planning, and finance operations leadership across consumer lending products.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 36, animation: "fadeUp 0.6s 0.4s both" }}>
              {["CPA Licensed", "9+ Years Fintech", "QuickBooks Online API", "KPMG Alumni"].map(c => (
                <span key={c} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#fff", border: "1px solid #E8E6E0", borderRadius: 20,
                  padding: "6px 14px", fontSize: 12, fontWeight: 500, color: "#555",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D5BE3", flexShrink: 0 }} />
                  {c}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" as const, animation: "fadeUp 0.6s 0.45s both" }}>
              <button onClick={() => scrollTo("portfolio")} style={{
                padding: "11px 26px", background: "#1B3A6B", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                See the projects →
              </button>
              <button onClick={() => scrollTo("about")} style={{
                padding: "11px 26px", background: "transparent", color: "#1B3A6B",
                border: "1.5px solid #1B3A6B", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                About me
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 16, marginTop: 60, flexWrap: "wrap" as const, animation: "fadeUp 0.7s 0.55s both" }}>
            {[
              { num: "~98%", label: "Bank reconciliation match rate" },
              { num: "15 → 3", label: "Days for month-end close" },
              { num: "12", label: "Automation tools built" },
              { num: "10+", label: "Bank accounts automated" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", border: "1px solid #E8E6E0", borderRadius: 12,
                padding: "18px 22px", flex: "0 0 auto",
              }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#1A1814", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 5, fontWeight: 500, maxWidth: 130 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PORTFOLIO */}
        <section id="portfolio" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>01 / Projects</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 40px)", color: "#1A1814", lineHeight: 1.15, marginBottom: 10 }}>
              Automation tools <em style={{ color: "#2D5BE3" }}>built & deployed</em>
            </h2>
            <p style={{ fontSize: 15, color: "#777", maxWidth: 560, lineHeight: 1.7 }}>
              Each tool solves a specific accounting workflow problem — designed with the accounting rules first, then automated. Click any card to see how it works.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </section>


        {/* PIPELINE */}
        <section id="pipeline" style={{ paddingTop: 40, paddingBottom: 60 }}>
          <div style={{ marginBottom: 36 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>02.5 / Integration</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 40px)", color: "#1A1814", lineHeight: 1.15, marginBottom: 10 }}>
              How the tools <em style={{ color: "#2D5BE3" }}>connect</em>
            </h2>
            <p style={{ fontSize: 15, color: "#777", maxWidth: 560, lineHeight: 1.7 }}>
              The five tools form a complete month-end close pipeline — each output feeds the next step.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
            {[
              { step: "01", tool: "Bank reconciliation", output: "Matched transactions + CC JE CSV", color: "#2D5BE3" },
              { step: "02", tool: "Loan repayment JE automation", output: "QBO-ready JE Excel (cash payments)", color: "#1E7C52" },
              { step: "03", tool: "Non-cash loan JE automation", output: "QBO-ready JE Excel (write-offs, FPI refunds)", color: "#1E7C52" },
              { step: "04", tool: "Consolidation JE generator", output: "QBO-ready JE Excel (intercompany entries)", color: "#B07D1A" },
              { step: "05", tool: "QBO journal entry uploader", output: "Posted to QuickBooks Online", color: "#1B3A6B" },
            ].map((item, i) => (
              <div key={item.step} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 48, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'DM Mono', monospace" }}>{item.step}</span>
                  </div>
                  {i < 4 && <div style={{ width: 2, flex: 1, background: "#E8E6E0", minHeight: 32 }} />}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 12, padding: "16px 20px", marginLeft: 16, marginBottom: i < 4 ? 8 : 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1814", marginBottom: 4 }}>{item.tool}</p>
                  <p style={{ fontSize: 12, color: "#999", fontFamily: "'DM Mono', monospace" }}>Output: {item.output}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* APPROACH */}
        <section id="approach" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>03 / Approach</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 40px)", color: "#1A1814", lineHeight: 1.15 }}>
              How I <em style={{ color: "#2D5BE3" }}>build</em>
            </h2>
          </div>
          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {APPROACH.map((a, i) => {
              const { ref, inView } = useInView();
              return (
                <div key={a.num} ref={ref} style={{
                  background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16, padding: 28,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "translateY(24px)",
                  transition: `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`,
                }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 48, color: "#EEE", lineHeight: 1, marginBottom: 14 }}>{a.num}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1814", marginBottom: 10, lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: 13, color: "#666", lineHeight: 1.72 }}>{a.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ marginBottom: 44 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#aaa", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>04 / About</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(26px, 4vw, 40px)", color: "#1A1814", lineHeight: 1.15 }}>
              About <em style={{ color: "#2D5BE3" }}>Bianca</em>
            </h2>
          </div>

          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16, padding: 32 }}>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 18 }}>
                I'm a CPA with 9+ years of experience in fintech lending — spanning Big 4 audit at KPMG, financial planning, senior accounting, and Finance Manager for a consumer lending company.
              </p>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 24 }}>
                I work at the intersection of accounting execution and automation — building Python tools that handle the repetitive parts of month-end close, so I can focus on the judgment-heavy work: cash management, investor due diligence support, and cross-functional finance leadership.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {[
                  { label: "Location", value: "Chicago, IL" },
                  { label: "Credentials", value: "CPA · M.S. Accounting, UIC" },
                  { label: "Open to", value: "Finance Manager, Controller, Finance Systems, Accounting Automation" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600, minWidth: 88, textTransform: "uppercase" as const, letterSpacing: "0.05em", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 18 }}>
              <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16, padding: 26 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 18 }}>Skills</p>
                {[
                  { cat: "AI & Automation", items: ["AI-assisted accounting automation", "Cloud API integration (QBO / OAuth2)", "LLM-enabled workflow design"] },
                  { cat: "Systems", items: ["QuickBooks Online (QBO)", "NetSuite · Oracle · Advanced Excel · SQL"] },
                  { cat: "Finance domain", items: ["US GAAP · Intercompany · Consumer lending", "SaaS metrics: ARR/MRR, CAC, churn", "SOX 404 / PCAOB · Financial modeling"] },
                ].map(g => (
                  <div key={g.cat} style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#1B3A6B", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{g.cat}</p>
                    {g.items.map(item => <p key={item} style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{item}</p>)}
                  </div>
                ))}
              </div>

              <div style={{ background: "#1B3A6B", borderRadius: 16, padding: 26 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Get in touch</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.6 }}>
                  Open to Finance Manager, Controller, Finance Systems, and Accounting Automation roles at fintech companies.
                </p>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  {[
                    { label: "Email", value: "bsuzhaoya@gmail.com", href: "mailto:bsuzhaoya@gmail.com" },
                    { label: "Resume", value: "General / Automation ↗", href: "/resume-general.pdf" },
                    { label: "Resume", value: "Accounting ↗", href: "/resume-accountant.pdf" },
                  ].map(item => (
                    <a key={item.href} href={item.href} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#fff",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 54 }}>{item.label}</span>
                      {item.value}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer style={{
        borderTop: "1px solid #E8E6E0", padding: "24px 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1160, margin: "0 auto", fontSize: 13, color: "#bbb",
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", color: "#1B3A6B", fontSize: 15 }}>Bianca Su, CPA</span>
        <span>Finance Automation Portfolio · Chicago, IL</span>
      </footer>
    </>
  );
}
