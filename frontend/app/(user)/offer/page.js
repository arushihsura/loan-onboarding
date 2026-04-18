'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function OfferPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-2xl">
        <h1 className="title-font text-4xl font-bold text-[#1b3155]">Your Loan Offer</h1>
        
        <div className="mt-8 rounded-2xl blue-gradient p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={32} />
            <h2 className="text-2xl font-bold">Pre-Approved Offer</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-white/80 text-sm">Loan Amount</p>
              <p className="text-4xl font-bold mt-2">₹3,00,000</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Interest Rate</p>
              <p className="text-4xl font-bold mt-2">10.5%</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Tenure</p>
              <p className="text-3xl font-bold mt-2">36 Months</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Monthly EMI</p>
              <p className="text-3xl font-bold mt-2">₹9,350</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <button className="w-full rounded-lg bg-[#2f66c9] px-6 py-3 font-bold text-white hover:bg-[#224f9f]">
            Accept Offer
          </button>
          <Link href="/dashboard" className="block text-center rounded-lg border border-[#d7e3f8] px-6 py-3 font-bold text-[#2f66c9] hover:bg-[#f5f8fc]">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
