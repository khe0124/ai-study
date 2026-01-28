"use client";

import { useEffect, useState, useMemo } from "react";
import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import LayoutWithSidebar from "@/components/layout/LayoutWithSidebar";
import { useQuery } from "@tanstack/react-query";
import { postAPI } from "@/lib/api";
import type { Post } from "@/types/post";

const MY_POSTS_LIMIT = 10;

export default function DashboardPage() {
  const [user, setUser] = useState<{
    id: string;
    email: string;
    provider: string;
  } | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["posts", "list"],
    queryFn: () => postAPI.getPosts(1, 50),
  });

  const myPosts = useMemo(() => {
    const posts = postsData?.data?.posts ?? [];
    if (!user?.id) return [];
    return posts
      .filter((p: Post) => p.authorId === user.id)
      .sort(
        (a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, MY_POSTS_LIMIT);
  }, [postsData, user?.id]);

  const myPostCount = useMemo(() => {
    const posts = postsData?.data?.posts ?? [];
    if (!user?.id) return 0;
    return posts.filter((p: Post) => p.authorId === user.id).length;
  }, [postsData, user?.id]);

  const stats = [
    { name: "게시글", value: String(myPostCount), href: "/posts", icon: "📝" },
    { name: "댓글", value: "0", href: "/posts", icon: "💬" },
    { name: "알림", value: "0", href: "/notifications", icon: "🔔" },
  ];

  const quickActions = [
    {
      name: "게시글 작성",
      href: "/posts/new",
      icon: "✏️",
      color: "bg-blue-600",
    },
    { name: "검색", href: "/search", icon: "🔍", color: "bg-green-600" },
    { name: "설정", href: "/settings", icon: "⚙️", color: "bg-gray-600" },
  ];

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              환영합니다, {user?.email || "사용자"}님!
            </h1>
            <p className="text-gray-600">
              대시보드에서 모든 활동을 관리하세요.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-4xl">{stat.icon}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              빠른 작업
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className={`${action.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{action.icon}</span>
                    <span className="font-medium">{action.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity - 내가 쓴 게시물 */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              최근 활동
            </h2>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p>불러오는 중...</p>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>아직 활동 내역이 없습니다.</p>
                <Link
                  href="/posts/new"
                  className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  게시글 작성하기 →
                </Link>
                <span className="mx-2">·</span>
                <Link
                  href="/posts"
                  className="text-blue-600 hover:text-blue-700 inline-block"
                >
                  게시글 보러가기 →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {myPosts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors"
                    >
                      <span className="font-medium text-gray-900 truncate flex-1 mr-4">
                        {post.title}
                      </span>
                      <span className="text-sm text-gray-500 shrink-0">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {myPosts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href="/posts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  전체 게시글 보기 →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
