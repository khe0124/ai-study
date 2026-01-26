"use client";

import { useEffect, useState } from "react";
import { getAuthUser, getAuthToken } from "@/lib/auth";
import { authAPI } from "@/lib/api";
import LayoutWithSidebar from "@/components/layout/LayoutWithSidebar";

interface UserProfile {
  id: string;
  email: string;
  provider: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setError("인증 토큰이 없습니다.");
          return;
        }

        const response = await authAPI.getProfile(token);
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "프로필을 불러오는데 실패했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const providerNames: Record<string, string> = {
    email: "이메일",
    google: "Google",
    kakao: "Kakao",
  };

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">프로필</h1>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {user && !loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-8">
                {/* Profile Header */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.email}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {providerNames[user.provider] || user.provider}로 가입
                    </p>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      사용자 ID
                    </label>
                    <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                      {user.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일
                    </label>
                    <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      로그인 방식
                    </label>
                    <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
                      {providerNames[user.provider] || user.provider}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <a
                    href="/settings"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    설정으로 이동
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
