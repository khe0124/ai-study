'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'users'>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // 검색 로직 (추후 구현)
    // 현재는 게시글 페이지로 리다이렉트
    router.push(`/posts?search=${encodeURIComponent(query)}`);
  };

  const recentSearches = [
    'React',
    'Next.js',
    'TypeScript',
  ];

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">검색</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="검색어를 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                검색
              </button>
            </div>

            {/* Search Type */}
            <div className="mt-4 flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="all"
                  checked={searchType === 'all'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-gray-700">전체</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="posts"
                  checked={searchType === 'posts'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-gray-700">게시글</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="searchType"
                  value="users"
                  checked={searchType === 'users'}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="mr-2"
                />
                <span className="text-gray-700">사용자</span>
              </label>
            </div>
          </form>

          {/* Recent Searches */}
          {!query && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 검색어</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors text-sm"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                검색 결과: "{query}"
              </h2>
              <div className="text-center py-12 text-gray-500">
                <p>검색 기능은 추후 구현 예정입니다.</p>
                <a
                  href="/posts"
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  게시글 목록 보기 →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
