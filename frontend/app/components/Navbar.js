'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-[#d7e3f8] bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#2f66c9]" />
            <span className="title-font text-lg font-bold text-[#1b3155]">CrediVision AI</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden gap-6 md:flex">
            {user && (
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-[#4f6384] hover:text-[#2f66c9]">
                  Dashboard
                </Link>
                <Link href="/check-eligibility" className="text-sm font-semibold text-[#4f6384] hover:text-[#2f66c9]">
                  Apply
                </Link>
                <Link href="/application-status" className="text-sm font-semibold text-[#4f6384] hover:text-[#2f66c9]">
                  Status
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" className="text-sm font-semibold text-[#4f6384] hover:text-[#2f66c9]">
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-[#f5f8fc] px-4 py-2 text-sm font-bold text-[#2f66c9] hover:bg-[#e8eef9]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#4f6384] hover:text-[#2f66c9]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#2f66c9] px-4 py-2 text-sm font-bold text-white hover:bg-[#224f9f]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
