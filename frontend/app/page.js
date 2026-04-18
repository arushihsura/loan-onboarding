'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, Clipboard, Video, DollarSign, Zap, Lock, Cpu, Smartphone, CreditCard, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff]">
      <section className="relative isolate px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto w-full max-w-6xl space-y-16">
          {/* Hero */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="title-font text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-[#1b3155]">
                Instant Loans in <span className="text-[#2f66c9]">2 Minutes</span>
              </h1>
              <p className="text-xl text-[#5f7393] max-w-2xl mx-auto">
                AI-powered video verification. No paperwork. No waiting. Just you, your camera, and instant approval.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="rounded-xl bg-[#2f66c9] px-8 py-4 text-lg font-bold text-white hover:bg-[#224f9f] transition shadow-lg"
              >
                Apply Now →
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-[#d7e3f8] bg-white px-8 py-4 text-lg font-bold text-[#2f66c9] hover:border-[#2f66c9] transition"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <h2 className="title-font text-3xl font-bold text-center text-[#1b3155]">How It Works</h2>
            <div className="grid gap-6 lg:grid-cols-4">
              {[
                { icon: FileText, title: 'Sign Up', desc: 'Quick registration with OTP' },
                { icon: Clipboard, title: 'Check Eligibility', desc: 'Instant pre-approval' },
                { icon: Video, title: 'Video Verification', desc: '2-minute AI verification' },
                { icon: DollarSign, title: 'Get Approved', desc: 'Instant loan offer' }
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} className="rounded-2xl border border-[#d7e3f8] bg-white p-6 text-center hover:shadow-lg transition">
                    <div className="flex justify-center mb-3">
                      <IconComponent size={40} className="text-[#2f66c9]" />
                    </div>
                    <h3 className="title-font font-bold text-[#1b3155]">{item.title}</h3>
                    <p className="text-sm text-[#5f7393] mt-2">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <h2 className="title-font text-3xl font-bold text-center text-[#1b3155]">Why CrediVision AI?</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Zap, title: 'Lightning Fast', desc: '2-minute instant approval' },
                { icon: Lock, title: 'Secure & Private', desc: 'Bank-level encryption' },
                { icon: Cpu, title: 'AI-Powered', desc: 'Advanced fraud detection' },
                { icon: Smartphone, title: 'Mobile First', desc: 'Apply from anywhere' },
                { icon: CreditCard, title: 'Flexible Terms', desc: 'Up to ₹25,00,000' },
                { icon: CheckCircle, title: 'RBI-Compliant', desc: 'Fully regulated' }
              ].map((item, i) => {
                const IconComponent = item.icon;
                return (
                  <div key={i} className="rounded-lg border border-[#e4edf9] bg-[#f7faff] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent size={24} className="text-[#2f66c9]" />
                      <h3 className="font-bold text-[#1b3155]">{item.title}</h3>
                    </div>
                    <p className="text-sm text-[#5f7393]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center space-y-6">
            <p className="text-[#5f7393]">Trusted by leading financial institutions</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              {['ICICI Bank', 'VISA', 'MasterCard', 'RBI'].map((partner, i) => (
                <div key={i} className="px-6 py-3 rounded-lg bg-white border border-[#d7e3f8] font-semibold text-[#1b3155]">
                  {partner}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl blue-gradient p-8 text-center text-white shadow-lg">
            <h3 className="title-font text-2xl font-bold mb-2">Ready to get your loan?</h3>
            <p className="mb-6 text-white/90">Start your application now and get approved in 2 minutes</p>
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-white px-8 py-3 font-bold text-[#2f66c9] hover:bg-gray-100 transition"
            >
              Start Free Application →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
