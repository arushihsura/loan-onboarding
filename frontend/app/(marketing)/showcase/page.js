import Link from 'next/link';

export default function ShowcasePage() {
  return (
    <main className="px-4 py-12 sm:px-8 lg:px-12">
      <section className="mx-auto max-w-4xl">
        <h1 className="title-font text-4xl font-bold text-[#1b3155]">How It Works</h1>
        <p className="mt-4 text-[#5f7393]">Get your loan in 4 simple steps</p>
        
        <div className="mt-12 space-y-8">
          {[
            { num: '1', title: 'Sign Up', desc: 'Create account with basic details' },
            { num: '2', title: 'Check Eligibility', desc: 'Tell us about your income and employment' },
            { num: '3', title: 'Video Verification', desc: '2-minute video KYC process' },
            { num: '4', title: 'Get Offer', desc: 'Receive and accept your personalized offer' }
          ].map((step) => (
            <div key={step.num} className="flex gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2f66c9] text-2xl font-bold text-white">
                {step.num}
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-[#1b3155]">{step.title}</h3>
                <p className="mt-1 text-[#5f7393]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/signup" className="rounded-lg bg-[#2f66c9] px-6 py-3 font-bold text-white hover:bg-[#224f9f]">
            Get Started Now
          </Link>
        </div>
      </section>
    </main>
  );
}
