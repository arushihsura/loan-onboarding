import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Clock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#d7e3f8] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <h1 className="title-font text-2xl font-bold text-[#1b3155]">LoanVideo</h1>
            <Link href="/login" className="rounded-lg bg-[#2f66c9] px-4 py-2 text-sm font-bold text-white hover:bg-[#224f9f]">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="max-w-2xl">
          <h2 className="title-font text-5xl font-bold text-[#1b3155] sm:text-6xl">
            Get Your Loan in 2 Minutes
          </h2>
          <p className="mt-4 text-xl text-[#5f7393]">
            No paperwork. No waiting. Just video verification and instant approval.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/signup" className="rounded-lg bg-[#2f66c9] px-6 py-3 font-bold text-white hover:bg-[#224f9f]">
              Get Started
              <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link href="/showcase" className="rounded-lg border border-[#2f66c9] px-6 py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc]">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8 lg:px-12">
        <h3 className="title-font text-3xl font-bold text-[#1b3155]">Why Choose Us?</h3>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#d7e3f8] bg-white p-6">
            <Zap className="h-8 w-8 text-[#2f66c9]" />
            <h4 className="mt-4 font-bold text-[#1b3155]">Lightning Fast</h4>
            <p className="mt-2 text-sm text-[#5f7393]">Get approved in minutes, not days</p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f8] bg-white p-6">
            <CheckCircle className="h-8 w-8 text-[#2f66c9]" />
            <h4 className="mt-4 font-bold text-[#1b3155]">100% Digital</h4>
            <p className="mt-2 text-sm text-[#5f7393]">Complete everything on your phone</p>
          </div>
          <div className="rounded-2xl border border-[#d7e3f8] bg-white p-6">
            <Clock className="h-8 w-8 text-[#2f66c9]" />
            <h4 className="mt-4 font-bold text-[#1b3155]">24/7 Support</h4>
            <p className="mt-2 text-sm text-[#5f7393]">We're here whenever you need help</p>
          </div>
        </div>
      </section>
    </main>
  );
}
