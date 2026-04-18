'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Circle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiClient from '../../lib/api';

export default function ApplicationStatusPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch real timeline data from backend using centralized API client
    const fetchTimeline = async () => {
      try {
        const data = await apiClient.getApplicationTimeline(user.phone);
        if (data.ok && data.timeline) {
          // Map backend timeline to UI format
          const mappedTimeline = data.timeline.map((item) => ({
            step: item.step,
            date: item.date ? new Date(item.date).toLocaleDateString() : 'Pending',
            status: item.status,
            icon: item.status === 'completed' ? 'check' : item.status === 'in-progress' ? 'clock' : 'circle'
          }));
          setTimeline(mappedTimeline);
        }
      } catch (err) {
        console.error('Error fetching timeline:', err);
        // Fallback to mock data
        setTimeline([
          { step: 'Account Created', date: new Date(user.created_at).toLocaleDateString(), status: 'completed', icon: 'check' },
          { step: 'Eligibility Check', date: 'Pending', status: 'pending', icon: 'circle' },
          { step: 'KYC Verification', date: 'Pending', status: 'pending', icon: 'circle' },
          { step: 'Risk Assessment', date: 'Pending', status: 'pending', icon: 'circle' },
          { step: 'Offer Generated', date: 'Pending', status: 'pending', icon: 'circle' },
          { step: 'Disbursement', date: 'Pending', status: 'pending', icon: 'circle' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [user, router]);

  if (!user) {
    return (
      <main className="px-4 py-8 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <p className="text-[#5f7393]">Redirecting...</p>
          </div>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="px-4 py-8 sm:px-8 lg:px-12">
        <section className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <p className="text-[#5f7393]">Loading your application status...</p>
          </div>
        </section>
      </main>
    );
  }

  const getIcon = (iconType) => {
    switch(iconType) {
      case 'check':
        return <Check size={24} className="text-green-600" />;
      case 'circle':
        return <Circle size={24} className="text-gray-400" />;
      case 'clock':
        return <Clock size={24} className="text-blue-600" />;
      default:
        return <Circle size={24} className="text-gray-400" />;
    }
  };

  const getIconLarge = (iconType) => {
    switch(iconType) {
      case 'check':
        return <Check size={20} className="text-white" />;
      case 'circle':
        return <Circle size={20} className="text-white" />;
      case 'clock':
        return <Clock size={20} className="text-white" />;
      default:
        return <Circle size={20} className="text-white" />;
    }
  };

  return (
    <main className="px-4 py-8 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="title-font text-4xl font-bold text-[#1b3155]">Application Status</h1>
          <p className="mt-2 text-[#5f7393]">Application ID: <span className="font-mono font-bold">{user.id.slice(0, 8).toUpperCase()}</span></p>
        </div>

        {/* Status Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {timeline.map((item, idx) => (
            <div key={idx} className={`rounded-lg p-4 text-center ${
              item.status === 'completed' ? 'bg-green-50 border border-green-200' :
              item.status === 'in-progress' ? 'bg-blue-50 border border-blue-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex justify-center mb-2">
                {getIcon(item.icon)}
              </div>
              <p className="text-xs font-bold uppercase text-gray-600">{item.step}</p>
              <p className={`text-xs mt-1 ${
                item.status === 'completed' ? 'text-green-600' :
                item.status === 'in-progress' ? 'text-blue-600' :
                'text-gray-500'
              }`}>
                {item.status === 'completed' ? '[DONE]' :
                 item.status === 'in-progress' ? '[WAIT]' :
                 'Pending'}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-[#d7e3f8] bg-white p-8 shadow-[0_16px_34px_rgba(30,65,120,0.09)]">
          <h2 className="title-font text-2xl font-bold text-[#1b3155] mb-8">Application Timeline</h2>
          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex gap-6">
                {/* Timeline dot */}
                <div className="relative flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in-progress' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}>
                    {getIconLarge(item.icon)}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className={`w-1 h-12 mt-2 ${
                      item.status === 'completed' ? 'bg-green-500' :
                      item.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`}></div>
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 pb-6">
                  <h3 className="title-font text-lg font-bold text-[#1b3155]">{item.step}</h3>
                  <p className={`text-sm mt-1 ${
                    item.status === 'completed' ? 'text-green-600' :
                    item.status === 'in-progress' ? 'text-blue-600' :
                    'text-[#7f8fa3]'
                  }`}>
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="rounded-2xl border border-[#2f66c9] bg-gradient-to-r from-[#2f66c9]/5 to-[#4a7be0]/5 p-8">
          <h3 className="title-font text-xl font-bold text-[#1b3155] mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            {user.offer_status !== 'accepted' ? (
              <>
                <p className="text-[#5f7393]">✓ Complete your eligibility check if you haven't already</p>
                <p className="text-[#5f7393]">✓ Complete your video verification to unlock your offer</p>
                <p className="text-[#5f7393]">✓ Review and accept your personalized offer</p>
                <p className="text-[#5f7393]">✓ Funds will be disbursed within 24 hours</p>
                <Link href="/check-eligibility" className="inline-block mt-4 px-6 py-2 rounded-lg bg-[#2f66c9] text-white font-bold hover:bg-[#224f9f]">
                  Start Eligibility Check →
                </Link>
              </>
            ) : (
              <>
                <p className="text-[#5f7393]">✓ Your offer has been accepted!</p>
                <p className="text-[#5f7393]">✓ We're processing your request</p>
                <p className="text-[#5f7393]">✓ You'll receive the amount within 24 hours</p>
                <p className="text-sm text-[#2f66c9] font-semibold mt-4">Check your registered email and phone for updates</p>
              </>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/dashboard" className="text-[#2f66c9] font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
