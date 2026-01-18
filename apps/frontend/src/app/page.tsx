'use client';

import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const authenticated = isAuthenticated();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to Web Service</h1>
        <p className="text-lg mb-8">Next.js Frontend is running!</p>
        <div className="flex gap-4 justify-center">
          {authenticated ? (
            <>
              <Link
                href="/posts"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                게시글 목록 보기
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/posts"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                게시글 목록 보기
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
