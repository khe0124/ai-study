'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">WebService</h3>
            <p className="text-sm text-gray-600">
              현대적인 웹 서비스를 위한 템플릿
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                  대시보드
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">
                  게시글
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
                  검색
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">지원</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">
                  설정
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">법적 고지</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © {currentYear} WebService. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
