'use client';

import Link from 'next/link';
import { Post } from '@/types/post';
import { getImageUrl } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const commentCount = post.comments?.length || 0;
  const truncatedContent = post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content;

  return (
    <Link href={`/posts/${post.id}`}>
      <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white">
        {/* 썸네일 이미지 */}
        {post.thumbnailImage && (
          <div className="relative w-full h-48 bg-gray-100">
            <img
              src={getImageUrl(post.thumbnailImage)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          {/* 제목 */}
          <h2 className="text-xl font-bold mb-2 text-gray-900 line-clamp-2">
            {post.title}
          </h2>
          
          {/* 내용 */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {truncatedContent}
          </p>
          
          {/* 메타 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              {post.authorEmail && (
                <span>{post.authorEmail}</span>
              )}
              <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
              <span>{commentCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
