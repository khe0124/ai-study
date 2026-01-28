'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { postAPI } from '@/lib/api';
import { Post } from '@/types/post';
import { getImageUrl } from '@/lib/utils';
import { CommentForm } from '@/components/CommentForm';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await postAPI.getPost(postId);
        setPost(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded">
          {error || '게시글을 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href="/posts"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로 돌아가기
        </a>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 썸네일 이미지 */}
          {post.thumbnailImage && (
            <div className="w-full h-96 bg-gray-100">
              <img
                src={getImageUrl(post.thumbnailImage)}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* 제목 */}
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              {post.title}
            </h1>

            {/* 메타 정보 */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              {post.authorEmail && (
                <span>작성자: {post.authorEmail}</span>
              )}
              <span>작성일: {new Date(post.createdAt).toLocaleString('ko-KR')}</span>
              {post.updatedAt !== post.createdAt && (
                <span>수정일: {new Date(post.updatedAt).toLocaleString('ko-KR')}</span>
              )}
            </div>

            {/* 내용 */}
            <div className="prose max-w-none mb-8">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* 첨부파일 */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mb-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">첨부파일</h3>
                <ul className="space-y-2">
                  {post.attachments.map((attachment, index) => (
                    <li key={index}>
                      <a
                        href={getImageUrl(attachment)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {attachment.split('/').pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 댓글 섹션 */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                댓글 ({post.comments?.length || 0})
              </h2>

              <CommentForm
                postId={post.id}
                onSuccess={(comment) => {
                  setPost((prev) =>
                    prev
                      ? {
                          ...prev,
                          comments: [...(prev.comments || []), comment],
                        }
                      : prev
                  );
                }}
              />

              {post.comments && post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {comment.authorEmail && (
                            <span className="font-semibold text-gray-900">
                              {comment.authorEmail}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  댓글이 없습니다.
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
