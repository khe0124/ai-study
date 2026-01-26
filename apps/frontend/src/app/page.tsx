'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const authenticated = isAuthenticated();

  useEffect(() => {
    // 로그인된 사용자는 대시보드로 리다이렉트
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  if (authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리다이렉트 중...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: '🚀',
      title: '빠른 시작',
      description: '즉시 사용 가능한 인증, 게시글, 사용자 관리 기능으로 빠르게 시작하세요.',
    },
    {
      icon: '🔒',
      title: '완벽한 보안',
      description: 'JWT 인증, Rate Limiting, 입력 검증 등 엔터프라이즈급 보안 기능을 제공합니다.',
    },
    {
      icon: '📦',
      title: 'Monorepo 구조',
      description: 'Turbo를 사용한 효율적인 빌드 캐싱과 병렬 실행으로 개발 속도를 높입니다.',
    },
    {
      icon: '🎨',
      title: '현대적인 UI',
      description: 'Tailwind CSS로 구현된 반응형 디자인과 직관적인 사용자 인터페이스.',
    },
    {
      icon: '⚡',
      title: '높은 성능',
      description: 'Next.js SSR/SSG와 최적화된 API로 빠른 로딩 속도를 보장합니다.',
    },
    {
      icon: '🔧',
      title: '쉬운 커스터마이징',
      description: '모듈화된 구조로 필요한 기능만 선택하여 쉽게 확장할 수 있습니다.',
    },
  ];

  const stats = [
    { label: '빠른 개발', value: '50%', description: '개발 시간 단축' },
    { label: '보안 기능', value: '10+', description: '내장 보안 기능' },
    { label: '페이지', value: '15+', description: '기본 제공 페이지' },
    { label: '컴포넌트', value: '20+', description: '재사용 가능 컴포넌트' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              현대적인 웹 서비스를
              <br />
              <span className="text-blue-200">즉시 시작하세요</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              완전한 인증 시스템, 게시글 관리, 사용자 인터페이스를 포함한
              <br />
              프로덕션 준비가 된 웹 서비스 템플릿
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                무료로 시작하기
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                href="/posts"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all font-semibold text-lg border-2 border-blue-400"
              >
                둘러보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              모든 것이 준비되어 있습니다
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              개발에 집중할 수 있도록 필요한 모든 기능을 미리 구현했습니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">기술 스택</h2>
            <p className="text-xl text-gray-600">
              최신 기술로 구축된 안정적이고 확장 가능한 아키텍처
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: 'Next.js 14', icon: '⚛️' },
              { name: 'Express.js', icon: '🚀' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'Turbo', icon: '⚡' },
              { name: 'Tailwind CSS', icon: '🎨' },
              { name: 'PostgreSQL', icon: '🗄️' },
              { name: 'Docker', icon: '🐳' },
              { name: 'Nginx', icon: '🌐' },
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg text-center hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="text-4xl mb-3">{tech.icon}</div>
                <div className="font-semibold text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
          <p className="text-xl text-blue-100 mb-8">
            몇 분 안에 프로덕션 준비가 된 웹 서비스를 구축할 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold text-lg shadow-lg"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-all font-semibold text-lg border-2 border-blue-400"
            >
              문서 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

