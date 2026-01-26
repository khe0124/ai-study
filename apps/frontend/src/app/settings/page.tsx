'use client';

import { useState } from 'react';
import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('ko');

  const handleSave = () => {
    // 설정 저장 로직 (추후 구현)
    alert('설정이 저장되었습니다.');
  };

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">설정</h1>

          <div className="space-y-6">
            {/* 알림 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">알림 설정</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">이메일 알림</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) =>
                      setNotifications({ ...notifications, email: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">푸시 알림</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) =>
                      setNotifications({ ...notifications, push: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">SMS 알림</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) =>
                      setNotifications({ ...notifications, sms: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* 테마 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">테마 설정</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === 'light'}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">라이트 모드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === 'dark'}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">다크 모드</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="theme"
                    value="auto"
                    checked={theme === 'auto'}
                    onChange={(e) => setTheme(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">시스템 설정 따르기</span>
                </label>
              </div>
            </div>

            {/* 언어 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">언어 설정</h2>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            {/* 계정 설정 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">계정 설정</h2>
              <div className="space-y-4">
                <a
                  href="/profile"
                  className="block text-blue-600 hover:text-blue-700"
                >
                  프로필 수정 →
                </a>
                <button className="text-red-600 hover:text-red-700">
                  계정 삭제
                </button>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
