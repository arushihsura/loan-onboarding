'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Smile, Clipboard, Video, BarChart3, Check } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const progressItems = [
    { label: 'Account Created', status: 'completed' },
    { label: 'Eligibility Check', status: (user.eligibility_status || user.verification_status) !== 'pending' ? 'completed' : 'pending' },
    { label: 'Video Verification', status: (user.kyc_status || 'pending') !== 'pending' ? 'completed' : 'pending' },
    { label: 'Loan Offer', status: (user.offer_status || 'pending') !== 'pending' ? 'completed' : 'pending' },
  ];

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Section */}
        <div className="rounded-2xl blue-gradient p-8 text-white shadow-[0_16px_34px_rgba(30,65,120,0.15)]">
          <div className="flex items-center gap-3">
            <Smile size={32} className="text-white" />
            <h1 className="title-font text-4xl font-bold">Welcome, {user.name || 'User'}!</h1>
          </div>
          <p className="mt-2 text-lg text-white/90">Your credit score: <span className="font-bold">{user.credit_score || '750'}</span></p>
          <p className="mt-1 text-white/80">Pre-approved limit: <span className="font-bold text-xl">₹{(user.pre_approved_limit || 300000).toLocaleString()}</span></p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/check-eligibility"
            className="group rounded-2xl border border-[#d7e3f8] bg-white p-6 hover:shadow-lg hover:border-[#2f66c9] transition"
          >
            <Clipboard size={32} className="text-[#2f66c9] mb-3" />
            <h3 className="title-font font-bold text-[#1b3155] group-hover:text-[#2f66c9]">Check Eligibility</h3>
            <p className="mt-1 text-sm text-[#5f7393]">See your pre-approved amount</p>
            <div className="mt-3 text-xs font-bold text-[#2f66c9]">Start →</div>
          </Link>

          <Link
            href="/video-onboarding"
            className="group rounded-2xl border border-[#d7e3f8] bg-white p-6 hover:shadow-lg hover:border-[#2f66c9] transition"
          >
            <Video size={32} className="text-[#2f66c9] mb-3" />
            <h3 className="title-font font-bold text-[#1b3155] group-hover:text-[#2f66c9]">Start Verification</h3>
            <p className="mt-1 text-sm text-[#5f7393]">2-minute video KYC</p>
            <div className="mt-3 text-xs font-bold text-[#2f66c9]">Verify →</div>
          </Link>

          <Link
            href="/application-status"
            className="group rounded-2xl border border-[#d7e3f8] bg-white p-6 hover:shadow-lg hover:border-[#2f66c9] transition"
          >
            <BarChart3 size={32} className="text-[#2f66c9] mb-3" />
            <h3 className="title-font font-bold text-[#1b3155] group-hover:text-[#2f66c9]">Check Status</h3>
            <p className="mt-1 text-sm text-[#5f7393]">Track your application</p>
            <div className="mt-3 text-xs font-bold text-[#2f66c9]">View →</div>
          </Link>
        </div>

        {/* Progress Tracker */}
        <div className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)]">
          <h2 className="title-font text-2xl font-bold text-[#1b3155] mb-6">Application Progress</h2>
          
          <div className="space-y-4">
            {progressItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                  item.status === 'completed' ? 'bg-green-500' : 'bg-[#d7e3f8]'
                }`}>
                  {item.status === 'completed' ? <Check size={20} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${
                    item.status === 'completed' ? 'text-green-600' : 'text-[#4f6384]'
                  }`}>
                    {item.label}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  item.status === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {item.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#d7e3f8] bg-white p-6">
            <p className="text-xs font-bold uppercase text-[#7f8fa3]">Credit Score</p>
            <p className="mt-2 text-3xl font-bold text-[#1b3155]">{user.credit_score}</p>
          </div>
          <div className="rounded-xl border border-[#d7e3f8] bg-white p-6">
            <p className="text-xs font-bold uppercase text-[#7f8fa3]">Pre-Approved</p>
            <p className="mt-2 text-3xl font-bold text-[#1b3155]">₹{(user.pre_approved_limit / 100000).toFixed(1)}L</p>
          </div>
          <div className="rounded-xl border border-[#d7e3f8] bg-white p-6">
            <p className="text-xs font-bold uppercase text-[#7f8fa3]">Interest Rate</p>
            <p className="mt-2 text-3xl font-bold text-[#1b3155]">10.5%</p>
          </div>
          <div className="rounded-xl border border-[#d7e3f8] bg-white p-6">
            <p className="text-xs font-bold uppercase text-[#7f8fa3]">Approval Time</p>
            <p className="mt-2 text-3xl font-bold text-[#1b3155]">2 min</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-2xl border border-[#2f66c9] bg-gradient-to-r from-[#2f66c9]/5 to-[#4a7be0]/5 p-8 text-center">
          <h3 className="title-font text-2xl font-bold text-[#1b3155]">Ready to Get Your Loan?</h3>
          <p className="mt-2 text-[#5f7393]">Complete your verification and get your offer instantly</p>
          <Link
            href="/check-eligibility"
            className="mt-4 inline-block rounded-lg bg-[#2f66c9] px-6 py-3 font-bold text-white hover:bg-[#224f9f] transition"
          >
            Continue Application →
          </Link>
        </div>
      </section>
    </main>
  );
}
