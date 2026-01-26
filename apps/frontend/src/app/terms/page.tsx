'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 prose max-w-none">
            <p className="text-gray-600">
              이용약관 내용은 여기에 작성됩니다. 실제 서비스에서는 법무팀과 협의하여 작성하세요.
            </p>
            <h2>제1조 (목적)</h2>
            <p>이 약관은...</p>
            {/* 실제 약관 내용 추가 */}
          </div>
          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700"
            >
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
