'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8001';

export default function EligibilityPage() {
  const { user, getUserTimeline } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    income: '',
    employment: 'salaried',
    emi: '0',
    city: 'Bangalore',
    loanNeeded: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phone,
          monthly_income: parseInt(formData.income),
          employment_type: formData.employment,
          existing_emi: parseInt(formData.emi),
          city: formData.city,
          loan_amount_needed: parseInt(formData.loanNeeded)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const data = await response.json();
      if (data.ok) {
        // Fetch updated user timeline to show eligibility_status
        await getUserTimeline(user.phone);
        
        setResult({
          eligible: data.eligible,
          amount: data.eligible_amount,
          message: data.message,
          applicationId: data.application_id,
          nextStep: data.eligible ? 'Complete video verification to unlock your final offer' : null
        });
      } else {
        setError(data.error || 'Failed to check eligibility');
      }
    } catch (err) {
      console.error('Eligibility check error:', err);
      setError(err.message || 'Error checking eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-2xl space-y-8">
        {!result ? (
          <>
            {/* Header */}
            <div className="text-center">
              <h1 className="title-font text-4xl font-bold text-[#1b3155]">Check Your Eligibility</h1>
              <p className="mt-2 text-[#5f7393]">Quick pre-screening in less than a minute</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)] space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Monthly Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  placeholder="30000"
                  required
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
                <p className="mt-1 text-xs text-[#7f8fa3]">Your net monthly salary/income</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Employment Type</label>
                <select
                  value={formData.employment}
                  onChange={(e) => setFormData({ ...formData, employment: e.target.value })}
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                >
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self-Employed</option>
                  <option value="business">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Existing Monthly EMI (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.emi}
                  onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
                <p className="mt-1 text-xs text-[#7f8fa3]">From car, home, or other loans</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">City</label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Loan Amount Needed (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.loanNeeded}
                  onChange={(e) => setFormData({ ...formData, loanNeeded: e.target.value })}
                  placeholder="300000"
                  required
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
                <p className="mt-1 text-xs text-[#7f8fa3]">Between ₹50,000 and ₹25,00,000</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#2f66c9] py-3 font-bold text-white hover:bg-[#224f9f] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking Eligibility...' : 'Check Eligibility'}
              </button>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
                  <p className="text-sm font-semibold">{error}</p>
                </div>
              )}
            </form>
          </>
        ) : (
          <>
            {/* Result */}
            <div className={`rounded-2xl p-8 text-center space-y-4 ${
              result.eligible 
                ? 'border border-green-200 bg-green-50' 
                : 'border border-red-200 bg-red-50'
            }`}>
              <div>
                {result.eligible ? (
                  <CheckCircle size={64} className="text-green-600" />
                ) : (
                  <XCircle size={64} className="text-red-600" />
                )}
              </div>
              <h2 className={`title-font text-3xl font-bold ${
                result.eligible ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.eligible ? 'You are Pre-Approved!' : 'Not Eligible Yet'}
              </h2>
              <p className={`text-lg ${
                result.eligible ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.message}
              </p>
              {result.amount && (
                <p className="text-5xl font-bold text-green-700">
                  ₹{result.amount.toLocaleString()}
                </p>
              )}
              {result.nextStep && (
                <p className="text-[#5f7393] mt-4">{result.nextStep}</p>
              )}
            </div>

            {/* Next Steps */}
            {result.eligible ? (
              <div className="space-y-4">
                <Link
                  href="/video-onboarding"
                  className="block rounded-lg bg-[#2f66c9] py-3 text-center font-bold text-white hover:bg-[#224f9f] transition"
                >
                  Start Video Verification →
                </Link>
                <button
                  onClick={() => setResult(null)}
                  className="block w-full rounded-lg border border-[#d7e3f8] py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition"
                >
                  Modify Answers
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={() => setResult(null)}
                  className="block w-full rounded-lg border border-[#d7e3f8] py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition"
                >
                  Try Again
                </button>
                <Link
                  href="/dashboard"
                  className="block rounded-lg bg-[#f5f8fc] py-3 text-center font-bold text-[#2f66c9] hover:bg-[#e8eef9] transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
