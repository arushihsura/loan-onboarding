const kpis = [
  { label: 'Applications Today', value: '148', change: '+18%' },
  { label: 'Approvals %', value: '71%', change: '+4.2%' },
  { label: 'Avg Risk Score', value: '36', change: '-6 pts' },
  { label: 'Fraud Attempts', value: '9', change: '-22%' }
];

const sessions = [
  { name: 'Aman S.', risk: 18, decision: 'Approved', timestamp: '03:12 PM' },
  { name: 'Neha R.', risk: 62, decision: 'Manual Review', timestamp: '03:05 PM' },
  { name: 'Rahul M.', risk: 84, decision: 'Rejected', timestamp: '02:47 PM' },
  { name: 'Sara P.', risk: 27, decision: 'Approved', timestamp: '02:31 PM' },
  { name: 'Irfan K.', risk: 51, decision: 'Manual Review', timestamp: '02:09 PM' },
  { name: 'Pooja D.', risk: 11, decision: 'Approved', timestamp: '01:52 PM' }
];

const riskDistribution = [
  { label: 'Low', value: 68, color: '#0f7b8f' },
  { label: 'Medium', value: 21, color: '#d64545' },
  { label: 'High', value: 11, color: '#ff9f1c' }
];

const dailyTrend = [24, 31, 28, 41, 35, 49, 45, 52, 58, 63, 61, 70];

function badgeClass(decision) {
  if (decision === 'Approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (decision === 'Rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function riskBarClass(risk) {
  if (risk <= 30) return 'bg-emerald-500';
  if (risk <= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

function ChartCard({ title, subtitle, children, accent = false }) {
  return (
    <section className="rounded-[1.6rem] border border-[#20467f]/10 bg-white p-5 shadow-[0_20px_40px_rgba(31,67,120,0.08)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4a7be0]">{subtitle}</p>
          <h2 className="mt-2 text-xl font-extrabold text-[#1b3155]">{title}</h2>
        </div>
        {accent ? <span className="rounded-full bg-[#1f4378] px-3 py-1 text-xs font-bold text-white">Live</span> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="blue-gradient rounded-[1.9rem] p-6 text-white shadow-[0_24px_52px_rgba(28,64,121,0.32)] sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">Admin Dashboard</p>
              <h1 className="title-font mt-2 text-3xl font-bold sm:text-4xl">Enterprise Readiness Console</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                Monitor applications, fraud pressure, approval trends, and live operational health from one clean control panel.
              </p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/70">System Health</p>
              <p className="mt-1 text-lg font-extrabold text-white">Healthy • 99.97% uptime</p>
            </div>
          </div>
        </header>

        <div className="rounded-[1.6rem] border border-[#20467f]/10 bg-white p-4 shadow-[0_16px_34px_rgba(31,67,120,0.08)] sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => (
              <article key={item.label} className="rounded-2xl bg-[#f4f8ff] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#667c9e]">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-extrabold text-[#1b3155]">{item.value}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#2f66c9]">{item.change}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ChartCard title="Applications vs Approvals" subtitle="Daily volume" accent>
            <div className="rounded-[1.5rem] bg-[#f6f9ff] p-4">
              <svg viewBox="0 0 720 240" className="h-64 w-full">
                <defs>
                  <linearGradient id="trendFill" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#2f66c9" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#2f66c9" stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                <line x1="40" y1="200" x2="680" y2="200" stroke="#d9e2ec" strokeWidth="2" />
                <polyline
                  fill="none"
                  stroke="#2f66c9"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={dailyTrend.map((value, index) => `${40 + index * 55},${200 - value * 2}`).join(' ')}
                />
                <polygon
                  fill="url(#trendFill)"
                  points={`40,200 ${dailyTrend.map((value, index) => `${40 + index * 55},${200 - value * 2}`).join(' ')} 680,200`}
                />
                {dailyTrend.map((value, index) => (
                  <circle key={index} cx={40 + index * 55} cy={200 - value * 2} r="5" fill="#ff8a39" />
                ))}
              </svg>
              <div className="mt-2 flex justify-between text-xs font-semibold text-[#667c9e]">
                <span>8 AM</span>
                <span>Noon</span>
                <span>8 PM</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Risk Mix" subtitle="Portfolio split">
            <div className="space-y-4">
              {riskDistribution.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#1b3155]">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#edf2f7]">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[#20467f]/10 bg-[#f6f9ff] p-4 text-sm text-[#5f7393]">
              Fraud attempts remain low, while low-risk applications continue to convert strongly.
            </div>
          </ChartCard>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-[#20467f]/10 bg-white shadow-[0_18px_40px_rgba(31,67,120,0.08)]">
          <div className="border-b border-[#20467f]/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#4a7be0]">Sessions Table</p>
            <h2 className="mt-2 text-xl font-extrabold text-[#1b3155]">Recent Application Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#edf2f7]">
              <thead className="bg-[#f6f9ff] text-left text-xs uppercase tracking-[0.12em] text-[#667c9e]">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Risk</th>
                  <th className="px-5 py-4">Decision</th>
                  <th className="px-5 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f7] bg-white">
                {sessions.map((session) => (
                  <tr key={`${session.name}-${session.timestamp}`} className="hover:bg-[#fbfdff]">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#1b3155]">{session.name}</div>
                      <div className="text-xs text-[#6b7f9f]">Enterprise onboarding</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-full max-w-[180px]">
                        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-[#1b3155]">
                          <span>{session.risk}</span>
                          <span>{session.risk <= 30 ? 'Low' : session.risk <= 60 ? 'Medium' : 'High'}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#edf2f7]">
                          <div className={`h-full rounded-full ${riskBarClass(session.risk)}`} style={{ width: `${session.risk}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badgeClass(session.decision)}`}>
                        {session.decision}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#1b3155]">{session.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
