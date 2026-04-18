'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function OfferPage() {
  const { user, updateUserStatus } = useAuth();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  if (!user) {
    return router.push('/login');
  }

  const loanAmount = 300000;
  const interestRate = 10.5;
  const tenure = 36; // months
  const monthlyRate = interestRate / 12 / 100;
  const emi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );

  const handleAccept = () => {
    updateUserStatus('offer_status', 'accepted');
    setAccepted(true);
    setTimeout(() => {
      router.push('/application-status');
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff] px-4 py-12">
      <section className="mx-auto max-w-2xl">
        {!accepted ? (
          <div className="rounded-3xl border border-[#d7e3f8] bg-white p-8 shadow-2xl space-y-8">
            {/* Congratulations */}
            <div className="text-center space-y-3">
              <div className="text-6xl">🎉</div>
              <h1 className="title-font text-4xl font-bold text-[#1b3155]">
                Congratulations, {user.name}!
              </h1>
              <p className="text-lg text-[#5f7393]">
                You've been approved for a personalized loan offer
              </p>
            </div>

            {/* Offer Card */}
            <div className="rounded-2xl blue-gradient text-white p-8 space-y-6 shadow-lg">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Your Loan Amount</p>
                <p className="mt-2 text-5xl font-bold">₹{loanAmount.toLocaleString()}</p>
              </div>

              <div className="border-t border-white/30 pt-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/80">Interest Rate</p>
                    <p className="mt-2 text-3xl font-bold">{interestRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/80">Tenure</p>
                    <p className="mt-2 text-3xl font-bold">{tenure} mo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white/80">Monthly EMI</p>
                    <p className="mt-2 text-3xl font-bold">₹{emi.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/30 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Total Interest</span>
                  <span className="font-semibold">₹{((emi * tenure) - loanAmount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Total Amount Payable</span>
                  <span className="font-semibold">₹{(emi * tenure).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#1b3155]">Why Choose CrediVision:</p>
              <div className="grid gap-2">
                {[
                  '✓ Instant Approval',
                  '✓ No Hidden Charges',
                  '✓ Flexible Payment Options',
                  '✓ Zero Prepayment Penalty'
                ].map((item, i) => (
                  <p key={i} className="text-sm text-[#4f6384]">{item}</p>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAccept}
                className="w-full rounded-xl bg-[#2f66c9] py-4 text-lg font-bold text-white hover:bg-[#224f9f] transition shadow-lg"
              >
                Accept Offer & Continue
              </button>
              <button className="w-full rounded-xl border border-[#2f66c9] bg-white py-4 text-lg font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition">
                Modify Amount
              </button>
            </div>

            {/* Terms */}
            <p className="text-center text-xs text-[#7f8fa3]">
              By accepting, you agree to our{' '}
              <button className="text-[#2f66c9] hover:underline">Terms of Service</button>
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center space-y-4">
            <div className="text-6xl animate-bounce">✓</div>
            <h2 className="title-font text-3xl font-bold text-green-700">Offer Accepted!</h2>
            <p className="text-green-600">Proceeding to final steps...</p>
            <p className="text-sm text-green-700">You'll receive the amount within 24 hours.</p>
          </div>
        )}
      </section>
    </main>
  );
}
