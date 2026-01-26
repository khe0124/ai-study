'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export interface NavItem {
  name: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
}

interface NavigationProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

const mainNavItems: NavItem[] = [
  {
    name: '대시보드',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: '게시글',
    href: '/posts',
    icon: '📝',
  },
  {
    name: '검색',
    href: '/search',
    icon: '🔍',
  },
];

const userNavItems: NavItem[] = [
  {
    name: '프로필',
    href: '/profile',
    icon: '👤',
  },
  {
    name: '설정',
    href: '/settings',
    icon: '⚙️',
  },
  {
    name: '도움말',
    href: '/help',
    icon: '❓',
  },
];

export default function Navigation({ variant = 'horizontal', className = '' }: NavigationProps) {
  const pathname = usePathname();
  const authenticated = isAuthenticated();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  if (!authenticated) {
    return null;
  }

  if (variant === 'vertical') {
    return (
      <nav className={`flex flex-col space-y-1 ${className}`}>
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon && <span className="text-xl">{item.icon}</span>}
            <span>{item.name}</span>
            {item.badge && item.badge > 0 && (
              <span className="ml-auto px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
        <div className="border-t border-gray-200 my-2"></div>
        {userNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon && <span className="text-xl">{item.icon}</span>}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {mainNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive(item.href)
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.icon && <span>{item.icon}</span>}
          <span>{item.name}</span>
          {item.badge && item.badge > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
