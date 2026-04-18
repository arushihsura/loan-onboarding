'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (!user) {
    return router.push('/login');
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="title-font text-3xl font-bold text-[#1b3155]">My Profile</h1>
          <Link href="/dashboard" className="text-[#2f66c9] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)] space-y-6">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2f66c9] flex items-center justify-center text-2xl text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="title-font text-2xl font-bold text-[#1b3155]">{user.name}</h2>
              <p className="text-[#7f8fa3]">{user.email}</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="border-t border-[#d7e3f8] pt-6 space-y-4">
            <h3 className="title-font text-lg font-bold text-[#1b3155]">Personal Information</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">Full Name</p>
                <p className="mt-1 text-[#1b3155] font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">Email</p>
                <p className="mt-1 text-[#1b3155] font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">Phone</p>
                <p className="mt-1 text-[#1b3155] font-semibold">+91 {user.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">User ID</p>
                <p className="mt-1 text-[#1b3155] font-semibold font-mono">{user.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Credit Information */}
          <div className="border-t border-[#d7e3f8] pt-6 space-y-4">
            <h3 className="title-font text-lg font-bold text-[#1b3155]">Credit Information</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f5f8fc] p-4">
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">Credit Score</p>
                <p className="mt-2 text-3xl font-bold text-[#1b3155]">{user.credit_score}</p>
              </div>
              <div className="rounded-xl bg-[#f5f8fc] p-4">
                <p className="text-xs font-bold uppercase text-[#7f8fa3]">Pre-Approved Limit</p>
                <p className="mt-2 text-2xl font-bold text-[#1b3155]">₹{(user.pre_approved_limit / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-[#d7e3f8] pt-6 space-y-4">
            <h3 className="title-font text-lg font-bold text-[#1b3155]">Application Status</h3>
            
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={`rounded-lg p-3 text-center ${
                user.kyc_status !== 'pending' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="text-xs font-semibold text-gray-600">KYC Status</p>
                <p className={`mt-1 font-bold ${
                  user.kyc_status !== 'pending' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {user.kyc_status !== 'pending' ? 'Verified' : 'Pending'}
                </p>
              </div>
              <div className={`rounded-lg p-3 text-center ${
                user.verification_status !== 'pending' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="text-xs font-semibold text-gray-600">Verification</p>
                <p className={`mt-1 font-bold ${
                  user.verification_status !== 'pending' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {user.verification_status !== 'pending' ? 'Complete' : 'Pending'}
                </p>
              </div>
              <div className={`rounded-lg p-3 text-center ${
                user.offer_status !== 'pending' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className="text-xs font-semibold text-gray-600">Offer Status</p>
                <p className={`mt-1 font-bold ${
                  user.offer_status !== 'pending' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {user.offer_status !== 'pending' ? 'Available' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="border-t border-[#d7e3f8] pt-6">
            <p className="text-xs font-bold uppercase text-[#7f8fa3]">Member Since</p>
            <p className="mt-1 text-[#1b3155]">{new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="w-full rounded-lg border border-[#d7e3f8] py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition">
            Download Statements
          </button>
          <button className="w-full rounded-lg border border-[#d7e3f8] py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc] transition">
            Privacy Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-50 py-3 font-bold text-red-600 hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>

        {/* Support */}
        <div className="rounded-lg bg-[#f5f8fc] p-4 text-center">
          <p className="text-sm text-[#5f7393]">Need help? Contact us at <a href="tel:+919876543210" className="font-bold text-[#2f66c9]">+91-XXXX-XXXX</a></p>
        </div>
      </section>
    </main>
  );
}
