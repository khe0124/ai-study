'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postAPI } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('인증이 필요합니다.');
        return;
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (thumbnail) {
        formData.append('thumbnailImage', thumbnail);
      }
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/posts/${data.data.id}`);
      } else {
        setError(data.message || '게시글 작성에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">게시글 작성</h1>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* 제목 */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="게시글 제목을 입력하세요"
                />
              </div>

              {/* 내용 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={10}
                  maxLength={10000}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="게시글 내용을 입력하세요"
                />
              </div>

              {/* 썸네일 이미지 */}
              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지
                </label>
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {thumbnail && (
                  <p className="mt-2 text-sm text-gray-600">선택된 파일: {thumbnail.name}</p>
                )}
              </div>

              {/* 첨부파일 */}
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                  첨부파일 (최대 10개)
                </label>
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setAttachments(files.slice(0, 10));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">선택된 파일:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {attachments.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '작성 중...' : '작성하기'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
