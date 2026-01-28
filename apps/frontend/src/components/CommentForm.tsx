'use client';

import { useState } from 'react';
import Link from 'next/link';
import { postAPI } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import type { Comment } from '@/types/post';

interface CommentFormProps {
  postId: string;
  onSuccess: (comment: Comment) => void;
}

export function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  const isLoggedIn = !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !content.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const response = await postAPI.createComment(postId, content.trim(), token);
      if (response.success && response.data) {
        onSuccess(response.data);
        setContent('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 text-center text-gray-600">
        <p className="mb-2">로그인 후 댓글을 남길 수 있습니다.</p>
        <Link
          href="/login"
          className="inline-block text-blue-600 hover:text-blue-800 font-medium"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700">
          댓글 작성
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="댓글을 입력하세요 (최대 1000자)"
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {content.length} / 1000자
          </span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '등록 중...' : '등록'}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
