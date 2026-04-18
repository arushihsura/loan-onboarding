'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // phone, otp, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      // In demo mode, just move to OTP screen
      setError('');
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otp.length !== 4) {
        throw new Error('OTP must be 4 digits');
      }

      await login(phone, otp);
      setStep('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf4ff] via-[#f9fbff] to-[#e6efff] px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        {/* Card */}
        <div className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)]">
          <div className="space-y-2 text-center mb-8">
            <h1 className="title-font text-3xl font-bold text-[#1b3155]">Welcome Back</h1>
            <p className="text-[#5f7393]">Get your instant loan in 2 minutes</p>
          </div>

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-lg border border-[#d7e3f8] bg-[#f5f8fc] font-semibold text-[#4f6384]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 rounded-lg border border-[#d7e3f8] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2f66c9]"
                  />
                </div>
                <p className="mt-2 text-xs text-[#7f8fa3]">Enter your 10-digit number without country code</p>
              </div>

              <button
                type="submit"
                disabled={phone.length !== 10}
                className="w-full rounded-lg bg-[#2f66c9] py-2.5 text-sm font-bold text-white hover:bg-[#224f9f] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send OTP
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                OTP sent to +91 {phone}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1b3155] mb-2">Enter OTP</label>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  disabled={loading}
                  className="w-full text-center text-2xl font-bold rounded-lg border border-[#d7e3f8] px-4 py-3 tracking-widest focus:outline-none focus:ring-2 focus:ring-[#2f66c9] disabled:opacity-60"
                />
                <p className="mt-2 text-xs text-[#7f8fa3] text-center">Demo: Enter any 4 digits</p>
              </div>

              <button
                type="submit"
                disabled={otp.length !== 4 || loading}
                className="w-full rounded-lg bg-[#2f66c9] py-2.5 text-sm font-bold text-white hover:bg-[#224f9f] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                }}
                className="w-full text-sm font-semibold text-[#2f66c9] hover:underline"
              >
                Change Number
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1b3155]">Login Successful!</h2>
              <p className="text-[#5f7393]">Redirecting to dashboard...</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d7e3f8]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#7f8fa3]">Don't have an account?</span>
            </div>
          </div>

          <Link
            href="/signup"
            className="block w-full text-center rounded-lg border border-[#d7e3f8] py-2.5 text-sm font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition"
          >
            Sign Up Instead
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#7f8fa3]">
          By logging in, you agree to our{' '}
          <button className="text-[#2f66c9] hover:underline">Terms of Service</button>
        </p>
      </div>
    </main>
  );
}
