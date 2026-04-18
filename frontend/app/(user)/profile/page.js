'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
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
        <h1 className="title-font text-4xl font-bold text-[#1b3155]">My Profile</h1>
        
        <div className="mt-8 rounded-2xl border border-[#d7e3f8] bg-white p-8">
          <div className="flex gap-4">
            <div className="h-16 w-16 rounded-full bg-[#2f66c9] flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-[#5f7393]">Name</p>
              <p className="text-xl font-bold text-[#1b3155]">{user.name}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <p className="text-sm text-[#5f7393]">Phone</p>
              <p className="font-bold text-[#1b3155]">+91 {user.phone}</p>
            </div>
            <div>
              <p className="text-sm text-[#5f7393]">Email</p>
              <p className="font-bold text-[#1b3155]">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-[#5f7393]">Credit Score</p>
              <p className="font-bold text-[#1b3155]">{user.credit_score}</p>
            </div>
          </div>

          <Link href="/dashboard" className="mt-8 block rounded-lg bg-[#2f66c9] px-6 py-3 text-center font-bold text-white hover:bg-[#224f9f]">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
