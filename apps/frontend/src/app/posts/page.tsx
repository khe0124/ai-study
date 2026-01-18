'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { postAPI } from '@/lib/api';
import { PostsResponse, Post } from '@/types/post';
import PostCard from '@/components/PostCard';

const LIMIT = 10;

type PostsPageData = PostsResponse['data'];

export default function PostsPage() {
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await postAPI.getPosts(pageParam, LIMIT);
      return response.data;
    },
    getNextPageParam: (lastPage: PostsPageData, allPages: PostsPageData[]) => {
      const totalPages = Math.ceil(lastPage.total / LIMIT);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    // 에러 발생 시 자동 재시도 방지 (이미 QueryClient에서 설정했지만 명시적으로)
    retry: 2,
    retryDelay: 1000,
  });

  // 모든 페이지의 게시글을 평탄화
  const posts: Post[] = data?.pages.flatMap((page: PostsPageData) => page.posts) ?? [];

  // Intersection Observer로 인피니트 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // 에러가 없고, 다음 페이지가 있고, 현재 로딩 중이 아닐 때만 다음 페이지 로드
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isError
        ) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">게시글 목록</h1>

        {/* 에러 표시 */}
        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error instanceof Error
              ? error.message
              : '게시글을 불러오는데 실패했습니다.'}
          </div>
        )}

        {/* 초기 로딩 */}
        {isLoading && (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        )}

        {/* 게시글이 없을 때 */}
        {!isLoading && posts.length === 0 && !isError && (
          <div className="text-center py-12 text-gray-500">게시글이 없습니다.</div>
        )}

        {/* 게시글 그리드 */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* 인피니트 스크롤 트리거 */}
        <div ref={observerTarget} className="h-10" />

        {/* 다음 페이지 로딩 중 */}
        {isFetchingNextPage && (
          <div className="text-center py-8 text-gray-500">더 불러오는 중...</div>
        )}

        {/* 모든 게시글 로드 완료 */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            모든 게시글을 불러왔습니다.
          </div>
        )}
      </div>
    </div>
  );
}
