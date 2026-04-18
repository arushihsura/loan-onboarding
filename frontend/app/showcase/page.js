import Link from 'next/link';

function ScreenShell({ children, className = '' }) {
  return (
    <article className={`rounded-[1.6rem] border border-[#d6e3f8] bg-white p-5 shadow-[0_16px_34px_rgba(30,65,120,0.09)] ${className}`}>
      {children}
    </article>
  );
}

export default function ShowcasePage() {
  return (
    <main className="campaign-shell relative isolate min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <section className="relative z-10 mx-auto w-full max-w-[1400px] space-y-6">
        <header className="rounded-[1.8rem] border border-white/65 bg-white/65 px-6 py-4 backdrop-blur-xl shadow-[0_20px_56px_rgba(30,65,120,0.14)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#4a7be0]">Hackathon Showcase</p>
              <h1 className="title-font mt-1 text-2xl font-bold text-[#1b3155] sm:text-3xl">CrediVision AI - Product Demo</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-[#1f4378]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#1f4378] transition hover:border-[#1f4378]/40"
              >
                Back to Home
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center justify-center rounded-xl bg-[#2f66c9] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#224f9f]"
              >
                Try Live Demo
              </Link>
            </div>
          </div>
        </header>

        <div className="rounded-[2rem] border border-[#d7e3f8] bg-[linear-gradient(160deg,rgba(255,255,255,0.88)_0%,rgba(241,247,255,0.9)_100%)] p-4 sm:p-6 lg:p-7 shadow-[0_34px_70px_rgba(30,65,120,0.18)]">
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Screen 1: Landing Page */}
            <ScreenShell>
              <p className="text-sm font-bold text-[#2f66c9]">CrediVision AI</p>
              <h2 className="title-font mt-3 text-3xl font-bold leading-tight text-[#1b3155]">Get Instant Loans with Smart Video Verification</h2>
              <button className="mt-5 rounded-xl bg-[#2f66c9] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(38,91,179,0.3)]">
                Start Your Application
              </button>

              <div className="mt-5 space-y-2 text-sm font-semibold text-[#4f6384]">
                <p>✓ Fast Approval</p>
                <p>✓ AI Verification</p>
                <p>✓ Personalized Offers</p>
              </div>

              <div className="mt-5 rounded-xl border border-[#e4edf9] bg-[#f7faff] px-3 py-2 text-xs font-semibold text-[#6a7fa2]">
                Trusted by VISA • ICICI Bank • MasterCard
              </div>

              <div className="mt-5 flex items-end gap-3 rounded-2xl bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff] p-4">
                <div className="h-16 w-9 rounded-md bg-[#20447a]" />
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3a6dce] text-white">🛡</div>
                <div className="flex gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-[#f4b942]" />
                  <span className="h-4 w-4 rounded-full bg-[#f0a82d]" />
                  <span className="h-3 w-3 rounded-full bg-[#e49318]" />
                </div>
              </div>
            </ScreenShell>

            {/* Screen 2: Live Video Verification */}
            <ScreenShell className="blue-gradient text-white shadow-[0_22px_46px_rgba(25,63,124,0.34)]">
              <h3 className="title-font text-center text-2xl font-semibold">Live Video Verification</h3>
              <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-3">
                <div className="h-56 rounded-xl bg-[linear-gradient(135deg,#c7d4ea_0%,#eff4fc_52%,#d6e2f4_100%)]" />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-white/90">Please confirm your income and consent</p>
              <div className="mt-4 flex gap-3">
                <button className="flex-1 rounded-lg bg-[#e44949] px-4 py-2.5 text-sm font-bold text-white">End Call</button>
                <button className="flex-1 rounded-lg bg-[#2f66c9] px-4 py-2.5 text-sm font-bold text-white">Next</button>
              </div>
            </ScreenShell>

            {/* Screen 3: Loan Offer */}
            <ScreenShell>
              <h3 className="title-font text-2xl font-bold text-[#1b3155]">Congratulations, Rahul!</h3>
              <p className="mt-2 text-sm text-[#5f7393]">You are eligible for a personalized loan offer:</p>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#326fdd] to-[#224f9f] p-4 text-white shadow-[0_16px_30px_rgba(35,76,146,0.3)]">
                <p className="text-xs font-semibold uppercase tracking-[0.09em] text-white/80">Loan Amount</p>
                <p className="mt-1 text-3xl font-extrabold">₹3,00,000</p>
                <div className="mt-4 flex justify-between border-t border-white/20 pt-3 text-sm font-semibold">
                  <span>Interest Rate</span>
                  <span>10.5%</span>
                </div>
                <div className="mt-2 flex justify-between text-sm font-semibold text-white/90">
                  <span>EMI</span>
                  <span>₹9,875/month</span>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button className="flex-1 rounded-xl bg-[#2f66c9] px-4 py-2.5 text-sm font-bold text-white">Accept Offer</button>
                <button className="flex-1 rounded-xl border border-[#2f66c9]/30 px-4 py-2.5 text-sm font-bold text-[#2f66c9]">View Details</button>
              </div>
            </ScreenShell>

            {/* Screen 4: Success */}
            <ScreenShell>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#46a669] text-5xl font-bold text-white">✓</div>
              <h4 className="title-font mt-5 text-center text-2xl font-bold text-[#1b3155]">Application Submitted Successfully</h4>
              <p className="mt-3 text-center text-sm font-semibold text-[#5f7393]">We will notify you shortly with the next steps.</p>
            </ScreenShell>

            {/* Screen 5: Admin Dashboard */}
            <ScreenShell className="lg:col-span-2">
              <div className="rounded-xl blue-gradient px-4 py-2.5 text-sm font-bold text-white">Admin Analytics Dashboard</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f4f8ff] p-3">
                  <p className="text-xs font-semibold text-[#6d82a4]">Sessions Today</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1b3155]">25</p>
                </div>
                <div className="rounded-xl bg-[#f4f8ff] p-3">
                  <p className="text-xs font-semibold text-[#6d82a4]">Approval Rate</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#1b3155]">68%</p>
                </div>
                <div className="rounded-xl bg-[#fff2f2] p-3">
                  <p className="text-xs font-semibold text-[#b66868]">Fraud Alerts</p>
                  <p className="mt-1 text-2xl font-extrabold text-[#d94a4a]">02</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-xl border border-[#e0eaf9] bg-[#f7faff] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6f84a6]">Risk Distribution</p>
                  <div className="mx-auto mt-3 h-28 w-28 rounded-full bg-[conic-gradient(#2f66c9_0_45%,#f0a636_45%_75%,#e35555_75%_100%)] p-5">
                    <div className="h-full w-full rounded-full bg-white" />
                  </div>
                </div>
                <div className="rounded-xl border border-[#e0eaf9] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#6f84a6]">Applicants</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="grid grid-cols-4 gap-2 rounded-lg bg-[#f5f9ff] px-3 py-2 font-bold text-[#46608a]"><span>Name</span><span>Risk</span><span>Status</span><span>Decision</span></div>
                    <div className="grid grid-cols-4 gap-2 px-3 py-1.5 font-semibold text-[#1b3155]"><span>Rahul S.</span><span>90</span><span>Approved</span><span>Approved</span></div>
                    <div className="grid grid-cols-4 gap-2 px-3 py-1.5 font-semibold text-[#1b3155]"><span>Diya P.</span><span>70</span><span>Pending</span><span>Approve</span></div>
                    <div className="grid grid-cols-4 gap-2 px-3 py-1.5 font-semibold text-[#1b3155]"><span>Amit J.</span><span>80</span><span>Approved</span><span>Rejected</span></div>
                  </div>
                </div>
              </div>
            </ScreenShell>

            {/* Screen 6: Mobile Mockup */}
            <ScreenShell className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4a7be0]">Mobile Responsive View</p>
              <div className="mt-3 flex justify-center">
                <div className="w-[235px] rounded-[2.4rem] border-[8px] border-[#123768] bg-[#0f2f59] p-2.5 shadow-[0_16px_32px_rgba(15,46,89,0.35)]">
                  <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,#f7faff_0%,#edf3ff_100%)] p-3">
                    <p className="text-center text-[11px] font-bold uppercase tracking-[0.08em] text-[#5a77a8]">CrediVision AI</p>
                    <div className="mt-3 rounded-2xl blue-gradient p-3 text-white">
                      <p className="text-xs font-bold">Live Verification</p>
                      <div className="mt-2 h-20 rounded-xl bg-white/20" />
                      <p className="mt-2 text-[11px] font-semibold text-white/85">Confirm income and consent</p>
                    </div>
                    <div className="mt-3 rounded-xl bg-white p-3 shadow-[0_10px_24px_rgba(30,65,120,0.12)]">
                      <p className="text-[11px] font-bold text-[#61789f]">Offer</p>
                      <p className="mt-1 text-xl font-extrabold text-[#1b3155]">₹3,00,000</p>
                      <button className="mt-2 w-full rounded-lg bg-[#2f66c9] px-3 py-1.5 text-xs font-bold text-white">Accept Offer</button>
                    </div>
                  </div>
                </div>
              </div>
            </ScreenShell>
          </div>
        </div>
      </section>
    </main>
  );
}
