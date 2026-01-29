export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-sm font-medium tracking-tight text-neutral-900">
            ZHAOYA SU
          </a>
          <div className="flex gap-6 text-sm">
            <a href="#overview" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Overview
            </a>
            <a href="#what-i-do" className="text-neutral-600 transition-colors hover:text-neutral-900">
              What I Do
            </a>
            <a href="#experience" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Experience
            </a>
            <a href="#background" className="text-neutral-600 transition-colors hover:text-neutral-900">
              Background
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="top" className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
            <h1 className="mb-4 text-5xl font-light tracking-tight text-neutral-900 md:text-6xl">
              Zhaoya (Bianca) Su, CPA
            </h1>
            <p className="mb-8 text-lg text-neutral-600">Chicago, IL</p>
            
            <div className="mb-12 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:bsuzhaoya@gmail.com"
                className="rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                Email
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                LinkedIn
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-700 transition-all hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                Download Resume
              </a>
            </div>
            
            <p className="mx-auto max-w-2xl text-xl leading-relaxed text-neutral-700">
              Finance leadership across audit, accounting, and advisory — establishing scalable finance systems that connect technical rigor with operational judgment.
            </p>
          </div>
        </section>

        {/* Overview Section */}
        <section id="overview" className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <h2 className="mb-10 text-3xl font-light tracking-tight">Overview</h2>
            <div className="space-y-7 text-lg leading-relaxed text-neutral-700">
              <p>
                I'm a CPA with seven years of experience establishing finance functions, shaping business decisions, and designing controls that scale. My work spans US GAAP accounting, financial modeling, and cross-functional advisory in fintech and professional services environments.
              </p>
              <p>
                I typically operate at the intersection of accounting execution, analytical modeling, and decision support — ensuring leadership operates with structured financial information that accounts for operational constraints and uncertainty.
              </p>
              <p>
                My approach combines accounting foundation with automation and systems thinking, creating capacity for judgment where it matters most.
              </p>
            </div>
          </div>
        </section>

        {/* What I Do Section */}
        <section id="what-i-do" className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
            <h2 className="mb-12 text-center text-3xl font-light tracking-tight">What I Do</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-4 text-xl font-medium text-neutral-900">
                  Financial Operating Design
                </h3>
                <p className="text-base leading-relaxed text-neutral-700">
                  Establishing ownership, decision rights, and financial governance across finance, operations, and product teams. Defining how financial information flows, where judgment is required, and how analytical frameworks support scalable decision-making.
                </p>
              </div>
              
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-4 text-xl font-medium text-neutral-900">
                  Decision Support & Advisory
                </h3>
                <p className="text-base leading-relaxed text-neutral-700">
                  Shaping the financial assessment of product changes, policy shifts, and resource allocation. Structuring analysis that exposes assumptions, clarifies trade-offs, and aligns financial constraints with execution realities to support decision-making under uncertainty.
                </p>
              </div>
              
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-4 text-xl font-medium text-neutral-900">
                  Accounting Foundation & Controls
                </h3>
                <p className="text-base leading-relaxed text-neutral-700">
                  Governing US GAAP compliance, substantiating balance sheet positions, and maintaining audit-ready documentation. Designing processes that ensure both internal rigor and external auditability without creating operational friction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Experience Section */}
        <section id="experience" className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <h2 className="mb-12 text-3xl font-light tracking-tight">Selected Experience</h2>
            <div className="space-y-12">
              <div>
                <h3 className="mb-1 text-xl font-medium text-neutral-900">
                  Finance Manager
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Kora Financial (formerly Westbon) | Dec 2021 – Present
                </p>
                <p className="text-base leading-relaxed text-neutral-700">
                  Established the finance operating framework for a fintech managing multiple products and data sources. Shaped financial assessment processes for product and policy changes, and defined analytical structures governing performance evaluation, cash management, and resource planning. Served as primary finance advisor to cross-functional leadership.
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 text-xl font-medium text-neutral-900">
                  Senior Accountant
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Westbon Inc. | Jul 2019 – Dec 2021
                </p>
                <p className="text-base leading-relaxed text-neutral-700">
                  Executed period-end accounting under US GAAP, maintained balance sheet integrity, and supported internal and external audits. Ensured alignment between general ledger, operational systems, and cash movements.
                </p>
              </div>
              
              <div>
                <h3 className="mb-1 text-xl font-medium text-neutral-900">
                  Staff Auditor
                </h3>
                <p className="mb-4 text-sm text-neutral-600">
                  KPMG LLP | Oct 2015 – Nov 2017
                </p>
                <p className="text-base leading-relaxed text-neutral-700">
                  Performed SOX 404 audits and US GAAP audits for public companies under PCAOB standards. Contributed to complex investigations, including identification of material misclassifications and fraud detection in government-funded programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <h2 className="mb-10 text-3xl font-light tracking-tight">Approach</h2>
            <div className="space-y-7 text-lg leading-relaxed text-neutral-700">
              <p>
                Financial work in dynamic environments requires more than technical accuracy. It requires understanding how decisions propagate through systems, how uncertainty compounds, and where judgment matters most.
              </p>
              <p>
                I approach problems by first clarifying what question we're actually trying to answer — then building the analytical structure to support it. That often means designing models that expose assumptions rather than hide them, or establishing processes that scale without creating fragility.
              </p>
              <p>
                I use automation and AI-assisted analysis where it improves speed and consistency, but always with human oversight on interpretation and judgment. The goal is to create capacity for higher-order thinking, not to automate thinking itself.
              </p>
            </div>
          </div>
        </section>

        {/* Background Section */}
        <section id="background" className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
            <h2 className="mb-10 text-3xl font-light tracking-tight">Background</h2>
            <div className="space-y-7 text-lg leading-relaxed text-neutral-700">
              <p>
                CPA | Master of Science in Accounting, University of Illinois at Chicago
              </p>
              <p>
                Prior experience includes Big 4 audit, fintech accounting and FP&A, and budget management for peer-to-peer lending operations.
              </p>
              <p>
                Technical foundation includes US GAAP reporting, financial modeling, advanced data manipulation, and analytical automation — applied to support faster, well-governed decision-making.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <p className="mb-3 text-xl font-light tracking-tight">
              Zhaoya (Bianca) Su, CPA
            </p>
            <p className="mb-8 text-base text-neutral-600">
              bsuzhaoya@gmail.com
            </p>
            <div className="mb-8 flex flex-wrap justify-center gap-6">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-500"
              >
                Download Resume
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-500"
              >
                View LinkedIn
              </a>
            </div>
            <p className="text-sm text-neutral-500">Based in Chicago, IL</p>
          </div>
        </footer>
      </main>
    </div>
  );
}