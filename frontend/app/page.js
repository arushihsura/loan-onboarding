import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="campaign-shell relative isolate flex min-h-screen items-center px-6 py-12 sm:px-10">
      <section className="relative z-10 mx-auto w-full max-w-6xl rounded-[2.2rem] border border-white/60 bg-[color:var(--card)]/80 p-8 shadow-[0_25px_80px_rgba(16,42,67,0.14)] backdrop-blur-sm sm:p-12 lg:p-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-[#0f7b8f]/20 bg-[#0f7b8f]/8 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--accent)]">
              Fast Approval Journey
            </p>
            <h1 className="title-font text-4xl font-extrabold leading-tight text-[color:var(--text-strong)] sm:text-5xl lg:text-6xl">
              Get instant personal loan
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[color:var(--text-muted)]">
              Complete your secure verification in a few guided steps and unlock instant access to personal loan offers.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/verify"
                className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--brand)] px-8 py-4 text-base font-bold text-white shadow-[0_14px_26px_rgba(214,69,69,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--brand-deep)]"
              >
                Start Video Verification
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center rounded-2xl border border-[#102a43]/15 bg-white/85 px-8 py-4 text-base font-bold text-[#102a43] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
              >
                Open Admin Dashboard
              </Link>
              <span className="rounded-2xl border border-[#102a43]/10 bg-white/90 px-4 py-2 text-sm font-semibold text-[color:var(--text-muted)]">
                100% paperless process
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[1.75rem] border border-[#102a43]/10 bg-white p-5 shadow-[0_12px_30px_rgba(16,42,67,0.09)]">
              <div className="rounded-2xl bg-gradient-to-br from-[#f7fbff] via-[#fff4ed] to-[#f6fffd] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f7b8f]">Why it is quick</p>
                <ul className="mt-4 space-y-3 text-sm text-[#334e68]">
                  <li className="rounded-xl bg-white/80 p-3">AI-assisted identity checks</li>
                  <li className="rounded-xl bg-white/80 p-3">Live guidance while recording</li>
                  <li className="rounded-xl bg-white/80 p-3">Instant status on submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
