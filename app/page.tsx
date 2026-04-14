"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: "bank-recon",
    status: "production",
    title: "Bank reconciliation automation",
    subtitle: "5-pass intelligent matching engine",
    description:
      "Reconciles QBO transaction data against bank statement CSVs across 10+ accounts using a layered matching algorithm. Auto-generates credit card journal entries, flags mismatches with explainable reasons, and falls back gracefully across three data sources.",
    highlights: [
      "Priority data fetch: manual Excel → TransactionList API (chunked by month) → JournalReport API fallback",
      "Reference-number matching checked before fuzzy SequenceMatcher to prevent false positives",
      "Transfer patterns require exact account number match — no cross-account confusion",
      "CC auto-pay transactions never generate expense JEs — hard-coded accounting guard",
      "Combine-lock uses exact date + amount + memo — prevents wrong-entry consumption",
    ],
    metrics: [
      { label: "Match rate", value: "~98%" },
      { label: "Algorithm", value: "5-pass" },
      { label: "Data fallbacks", value: "3" },
      { label: "Bank accounts", value: "10+" },
    ],
    tags: ["Python", "QBO API", "openpyxl", "SequenceMatcher", "OAuth2", "pandas"],
  },
  {
    id: "payment-je",
    status: "production",
    title: "Cash payment JE automation",
    subtitle: "Multi-product journal entry generator",
    description:
      "Processes multi-tab Excel payment reports into QBO-ready journal entries. Handles consumer loan repayments, charged-off recoveries, chargebacks, refunds, and hosted payment page reconciliation — with color-coded exception case management.",
    highlights: [
      "Rounding differences absorbed into principal (Notes Receivable) — never the bank side",
      "Intercompany transactions auto-routed to AR Intercompany accounts",
      "Recovery transactions mapped to loan loss reserve at product level",
      "Exception cases color-coded: red=chargeback, orange=recovery, yellow=refund, blue/purple=HPP mismatch, green=pending settlement",
      "HPP daily net lump sums reconciled to bank deposits with ~3 business day lag logic",
    ],
    metrics: [
      { label: "Exception categories", value: "6" },
      { label: "Rounding logic", value: "Auto" },
      { label: "Output format", value: "QBO-ready" },
    ],
    tags: ["Python", "Excel automation", "JE generation", "Waterfall logic"],
  },
  {
    id: "qbo-uploader",
    status: "production",
    title: "QBO journal entry uploader",
    subtitle: "Two-step API pipeline with audit trail",
    description:
      "Cleans a standardized JE CSV then uploads directly to QuickBooks Online via REST API. Handles OAuth2 token rotation automatically, deduplicates against existing QBO entries, and generates three output audit reports.",
    highlights: [
      "Automatic Refresh Token rotation — no manual re-auth needed",
      "Duplicate detection against existing QBO journal entries before upload",
      "Three output CSVs: upload_success, upload_duplicates, upload_failed",
      "Bank/cash accounts locked from rounding modification",
      "Double-click .command launcher — no Terminal needed for end users",
      "Exact QBO account name matching enforced — case-sensitive guard against silent failures",
    ],
    metrics: [
      { label: "Output reports", value: "3" },
      { label: "Token refresh", value: "Auto" },
      { label: "Upload errors", value: "~0%" },
    ],
    tags: ["Intuit OAuth2", "REST API", "Dedup logic", "macOS .command"],
  },
  {
    id: "intercompany-je",
    status: "development",
    title: "Intercompany JE generator",
    subtitle: "Subsidiary expense automation",
    description:
      "Generates QBO import-ready Excel workbooks for expenses paid by a subsidiary on behalf of the parent entity. Produces JE Import, Summary by Month, and Account Mapping tabs with sequential numbering and statement credit reversal logic.",
    highlights: [
      "Subsidiary-paid expenses recorded on parent entity books as intercompany payables",
      "Statement credits recorded as Dr Intercompany / Cr Expense reversals",
      "Sequential JE numbering continues from prior period — no gaps or duplicates",
      "Mandatory Dr = Cr balance check on every JE before any output is generated",
      "QBO 11-column import format — direct paste-and-upload workflow",
      "Name column populated for all Receivable/Payable lines per QBO posting requirements",
    ],
    metrics: [
      { label: "Balance validation", value: "100%" },
      { label: "Output tabs", value: "3" },
      { label: "JE numbering", value: "Auto" },
    ],
    tags: ["Intercompany", "QBO import format", "Sequential numbering", "openpyxl"],
  },
  {
    id: "noncash-je",
    status: "development",
    title: "Non-cash JE automation",
    subtitle: "Write-offs, FPI refunds & recoveries",
    description:
      "Automates journal entries for non-cash transactions: loan write-offs, force-place insurance refunds applied to loan repayment, and direct FPI refunds to customers. Mirrors the structure of the cash payment automation for consistency.",
    highlights: [
      "Write-off Regular: loan principal and interest charged off to loss reserve at product level",
      "Force-Place Insurance refund used as loan repayment — waterfall applied to interest then principal",
      "FPI refund direct to customer — recorded as liability reduction",
      "Sequential NCJE numbering continues from prior period end",
      "Balance validation mandatory before output — flags and blocks unbalanced JEs",
    ],
    metrics: [
      { label: "Transaction types", value: "3" },
      { label: "Sequence", value: "Auto-continues" },
      { label: "Validation", value: "Pre-output" },
    ],
    tags: ["Write-off logic", "FPI refunds", "NCJE numbering", "Working paper"],
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
    body: "All JE generators run a mandatory Dr = Cr balance check across every journal number before producing any output file. Unique JE numbering is enforced. Silent failures — like QBO account name case mismatches — are caught proactively.",
  },
  {
    num: "03",
    title: "Built for real users, not developers",
    body: "Tools run via double-click .command files on macOS. No Terminal, no Python environment setup for the end user. Output files mirror input filenames. Exception cases are color-coded for immediate visual triage. Automation should disappear into the workflow.",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Components ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
      letterSpacing: "0.04em", textTransform: "uppercase" as const,
      background: status === "production" ? "#E6F4ED" : "#FEF3E2",
      color: status === "production" ? "#1E7C52" : "#B07D1A",
    }}>
      {status === "production" ? "Production" : "In development"}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView();
  const isFeatured = index === 0;

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(28px)",
        transition: `opacity 0.55s ${index * 0.08}s, transform 0.55s ${index * 0.08}s`,
        background: "#fff",
        border: isFeatured ? "2px solid #2D5BE3" : "1px solid #E8E6E0",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <StatusBadge status={project.status} />
          {isFeatured && (
            <span style={{ fontSize: 11, color: "#2D5BE3", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              Featured
            </span>
          )}
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 600, color: "#1A1814", margin: "0 0 4px", fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
          {project.title}
        </h3>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px", fontStyle: "italic" }}>{project.subtitle}</p>
        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: "0 0 18px" }}>{project.description}</p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 20 }}>
          {project.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", background: "#F4F2EC", color: "#666", padding: "3px 9px", borderRadius: 4, border: "1px solid #E8E6E0" }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", gap: 24, borderTop: "1px solid #F0EEE8", paddingTop: 16, marginBottom: 0 }}>
          {project.metrics.map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#1A1814", fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "14px 28px", background: "none", border: "none",
          borderTop: "1px solid #F0EEE8", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 13, color: "#2D5BE3", fontWeight: 600,
          transition: "background 0.15s",
          marginTop: 16,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#F7F9FF")}
        onMouseLeave={e => (e.currentTarget.style.background = "none")}
      >
        <span>{open ? "Hide details" : "Technical details"}</span>
        <span style={{ fontSize: 18, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>

      {/* Highlights panel */}
      {open && (
        <div style={{ padding: "20px 28px 24px", background: "#FAFAF7", borderTop: "1px solid #F0EEE8" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>
            Key design decisions
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {project.highlights.map((h, i) => (
              <li key={i} style={{ fontSize: 13, color: "#555", lineHeight: 1.6, paddingLeft: 18, position: "relative" as const }}>
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

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeNav, setActiveNav] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = ["portfolio", "approach", "about"];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const { top } = el.getBoundingClientRect();
          if (top < 120) setActiveNav(id);
        }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #F7F5F0; color: #1A1814; -webkit-font-smoothing: antialiased; }
        ::selection { background: #2D5BE3; color: #fff; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? "rgba(247,245,240,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(26,24,20,0.08)" : "none",
        transition: "all 0.25s",
        padding: "0 2rem", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: "#1B3A6B" }}>
          Bianca Su
        </span>
        <div style={{ display: "flex", gap: "2rem" }}>
          {[["portfolio", "Portfolio"], ["approach", "Approach"], ["about", "About"]].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 500,
              color: activeNav === id ? "#2D5BE3" : "#666",
              transition: "color 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </nav>

      {/* full-page wrapper */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>

        {/* ── HERO ── */}
        <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column" as const, justifyContent: "center", paddingTop: 80, paddingBottom: 60 }}>
          <div style={{ maxWidth: 720 }}>
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#2D5BE3",
              letterSpacing: "0.12em", textTransform: "uppercase" as const,
              marginBottom: 20,
              animation: "fadeUp 0.6s 0.1s both",
            }}>
              Finance Automation Portfolio
            </p>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(40px, 6vw, 68px)",
              lineHeight: 1.06, color: "#1A1814",
              marginBottom: 24,
              animation: "fadeUp 0.6s 0.2s both",
            }}>
              Where accounting<br />expertise meets{" "}
              <em style={{ color: "#2D5BE3" }}>intelligent</em>{" "}automation
            </h1>
            <p style={{
              fontSize: 17, color: "#666", lineHeight: 1.75, maxWidth: 560,
              marginBottom: 36,
              animation: "fadeUp 0.6s 0.3s both",
            }}>
              CPA with 7+ years in fintech lending — building Python-based automation systems
              that compress month-end close from weeks to days, without sacrificing accounting rigor.
            </p>
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap" as const,
              animation: "fadeUp 0.6s 0.4s both",
            }}>
              {["CPA Licensed", "7+ Years Fintech", "QuickBooks Online API", "KPMG Alumni"].map(c => (
                <span key={c} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: "#fff", border: "1px solid #E8E6E0",
                  borderRadius: 20, padding: "6px 14px",
                  fontSize: 12, fontWeight: 500, color: "#555",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2D5BE3", flexShrink: 0 }} />
                  {c}
                </span>
              ))}
            </div>
            <div style={{
              display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" as const,
              animation: "fadeUp 0.6s 0.5s both",
            }}>
              <button onClick={() => scrollTo("portfolio")} style={{
                padding: "12px 28px", background: "#1B3A6B", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "opacity 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                View projects →
              </button>
              <button onClick={() => scrollTo("about")} style={{
                padding: "12px 28px", background: "transparent", color: "#1B3A6B",
                border: "1.5px solid #1B3A6B", borderRadius: 8, fontSize: 14, fontWeight: 600,
                cursor: "pointer", transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(27,58,107,0.06)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                About me
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 20, marginTop: 64, flexWrap: "wrap" as const,
            animation: "fadeUp 0.7s 0.6s both",
          }}>
            {[
              { num: "~98%", label: "Reconciliation match rate" },
              { num: "4+", label: "Tools in production" },
              { num: "15→3", label: "Days for month-end close" },
              { num: "10+", label: "Bank accounts automated" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#fff", border: "1px solid #E8E6E0",
                borderRadius: 12, padding: "20px 24px", flex: "0 0 auto",
              }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#1A1814", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PORTFOLIO ── */}
        <section id="portfolio" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>01 / Projects</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#1A1814", lineHeight: 1.15 }}>
              Automation <em style={{ color: "#2D5BE3" }}>tools</em> built
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </section>

        {/* ── APPROACH ── */}
        <section id="approach" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>02 / Approach</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#1A1814", lineHeight: 1.15 }}>
              How I <em style={{ color: "#2D5BE3" }}>build</em>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {APPROACH.map((a, i) => {
              const { ref, inView } = useInView();
              return (
                <div key={a.num} ref={ref} style={{
                  background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16,
                  padding: 28,
                  opacity: inView ? 1 : 0,
                  transform: inView ? "none" : "translateY(24px)",
                  transition: `opacity 0.5s ${i * 0.1}s, transform 0.5s ${i * 0.1}s`,
                }}>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 52, color: "#E8E6E0", lineHeight: 1, marginBottom: 14 }}>{a.num}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1A1814", marginBottom: 10 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{a.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" style={{ paddingTop: 60, paddingBottom: 80 }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 10 }}>03 / About</p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 4vw, 42px)", color: "#1A1814", lineHeight: 1.15 }}>
              About <em style={{ color: "#2D5BE3" }}>Bianca</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            {/* Bio card */}
            <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16, padding: 32 }}>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 20 }}>
                CPA with 7+ years of experience across audit, accounting, advisory, and financial
                planning within fintech and professional services. I work at the intersection of
                accounting execution, analytical modeling, and automation — building systems that
                scale financial operations without scaling headcount.
              </p>
              <p style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 24 }}>
                My background spans Big 4 audit at KPMG, financial planning for P2P lending,
                senior accounting for a fintech startup, and Finance Manager for a consumer
                lending company navigating investor due diligence and multi-product operations.
              </p>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {[
                  { label: "Location", value: "Chicago, IL" },
                  { label: "Credentials", value: "CPA · M.S. Accounting, UIC" },
                  { label: "Background", value: "KPMG · Fintech · Consumer Lending" },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                    <span style={{ fontSize: 12, color: "#999", fontWeight: 600, minWidth: 90, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{row.label}</span>
                    <span style={{ fontSize: 14, color: "#444" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills + contact */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 20 }}>
              {/* Skills */}
              <div style={{ background: "#fff", border: "1px solid #E8E6E0", borderRadius: 16, padding: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 18 }}>Technical skills</p>
                {[
                  { cat: "AI & Automation", items: ["AI-assisted accounting automation", "Cloud API integration (QBO / OAuth2)", "LLM-enabled workflow design"] },
                  { cat: "Systems", items: ["QuickBooks Online", "NetSuite · Oracle", "Advanced Excel · SQL · Alteryx"] },
                  { cat: "Finance domain", items: ["US GAAP · Intercompany accounting", "SaaS metrics (ARR/MRR, CAC)", "Consumer lending · SOX 404 / PCAOB"] },
                ].map(g => (
                  <div key={g.cat} style={{ marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#1B3A6B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{g.cat}</p>
                    {g.items.map(item => (
                      <p key={item} style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{item}</p>
                    ))}
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div style={{ background: "#1B3A6B", borderRadius: 16, padding: 28 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Open to new opportunities</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 20, lineHeight: 1.6 }}>
                  Finance Manager, Controller, Finance Systems, or Accounting Automation roles at fintech companies.
                </p>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                  <a href="mailto:bsuzhaoya@gmail.com" style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#fff",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", minWidth: 60 }}>Email</span>
                    bsuzhaoya@gmail.com
                  </a>
                  <a href="https://bianca-site-peach.vercel.app/resume.pdf" style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#fff",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  >
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", minWidth: 60 }}>Resume</span>
                    Download PDF ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid #E8E6E0", padding: "28px 2rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1200, margin: "0 auto",
        fontSize: 13, color: "#999",
      }}>
        <span style={{ fontFamily: "'DM Serif Display', serif", color: "#1B3A6B" }}>Bianca Su, CPA</span>
        <span>Finance Automation Portfolio · Chicago, IL</span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 680px) {
          nav div { display: none; }
        }
      `}</style>
    </>
  );
}
