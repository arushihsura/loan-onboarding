'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState('details'); // details, otp, success
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone.length === 10) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length === 4) {
      signup(formData.phone, formData.email, formData.name);
      setStep('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff] px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)]">
          <div className="space-y-2 text-center mb-8">
            <h1 className="title-font text-3xl font-bold text-[#1b3155]">Get Instant Loan</h1>
            <p className="text-[#5f7393]">Quick signup, get approved in 2 minutes</p>
          </div>

          {/* Progress */}
          <div className="mb-6 flex gap-2">
            <div className={`h-1 flex-1 rounded-full ${step !== 'details' ? 'bg-[#2f66c9]' : 'bg-[#d7e3f8]'}`}></div>
            <div className={`h-1 flex-1 rounded-full ${step === 'success' ? 'bg-[#2f66c9]' : 'bg-[#d7e3f8]'}`}></div>
          </div>

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rahul Kumar"
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul@email.com"
                  className="w-full rounded-lg border border-[#d7e3f8] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-[#d7e3f8] bg-[#f5f8fc] font-semibold text-[#4f6384]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength="10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="98765 43210"
                    className="flex-1 rounded-lg border border-[#d7e3f8] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!formData.name || !formData.email || formData.phone.length !== 10}
                className="w-full rounded-lg bg-[#2f66c9] py-2.5 text-sm font-bold text-white hover:bg-[#224f9f] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send OTP
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                OTP sent to +91 {formData.phone}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Enter OTP</label>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full text-center text-2xl font-bold rounded-lg border border-[#d7e3f8] px-4 py-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                />
                <p className="mt-2 text-xs text-[#7f8fa3] text-center">Demo: Enter any 4 digits</p>
              </div>

              <button
                type="submit"
                disabled={otp.length !== 4}
                className="w-full rounded-lg bg-[#2f66c9] py-2.5 text-sm font-bold text-white hover:bg-[#224f9f] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Create Account
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setOtp('');
                }}
                className="w-full text-sm font-semibold text-[#2f66c9] hover:underline"
              >
                Edit Details
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1b3155]">Account Created!</h2>
              <p className="text-[#5f7393]">Welcome, {formData.name}! Redirecting to dashboard...</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d7e3f8]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#7f8fa3]">Already have an account?</span>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full text-center rounded-lg border border-[#d7e3f8] py-2.5 text-sm font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition"
          >
            Login
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#7f8fa3]">
          By signing up, you agree to our{' '}
          <button className="text-[#2f66c9] hover:underline">Terms of Service</button>
        </p>
      </div>
    </main>
  );
}
