'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAuthenticated, getAuthUser, clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const mainNavItems = [
  { name: '대시보드', href: '/dashboard', icon: '📊' },
  { name: '게시글', href: '/posts', icon: '📝' },
  { name: '검색', href: '/search', icon: '🔍' },
];

const userNavItems = [
  { name: '프로필', href: '/profile', icon: '👤' },
  { name: '설정', href: '/settings', icon: '⚙️' },
  { name: '도움말', href: '/help', icon: '❓' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string; provider: string } | null>(null);
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (authenticated) {
      setUser(getAuthUser());
    }
  }, [authenticated, pathname]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
    router.refresh();
  };

  if (!authenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 lg:z-auto transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600">WebService</span>
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.provider === 'email' ? '이메일' : user.provider}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1 mb-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                메인
              </div>
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                계정
              </div>
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="text-sm font-medium">로그아웃</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
