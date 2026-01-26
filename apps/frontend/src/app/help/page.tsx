'use client';

import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';
import Link from 'next/link';

const faqs = [
  {
    question: '게시글을 작성하려면 어떻게 하나요?',
    answer: '게시글 목록 페이지에서 "게시글 작성" 버튼을 클릭하거나, 대시보드의 빠른 작업에서 "게시글 작성"을 선택하세요.',
  },
  {
    question: '비밀번호를 변경하려면?',
    answer: '설정 페이지에서 계정 설정을 통해 비밀번호를 변경할 수 있습니다.',
  },
  {
    question: '알림을 받지 않으려면?',
    answer: '설정 > 알림 설정에서 원하는 알림 유형을 끄거나 켤 수 있습니다.',
  },
  {
    question: '계정을 삭제하려면?',
    answer: '설정 > 계정 설정에서 계정 삭제를 진행할 수 있습니다. 계정 삭제는 되돌릴 수 없으니 주의하세요.',
  },
];

const guides = [
  { title: '시작하기', href: '/help/getting-started', icon: '🚀' },
  { title: '게시글 작성 가이드', href: '/help/posts', icon: '📝' },
  { title: '프로필 관리', href: '/help/profile', icon: '👤' },
  { title: '알림 설정', href: '/help/notifications', icon: '🔔' },
];

export default function HelpPage() {
  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">도움말</h1>

          {/* Quick Guides */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">빠른 가이드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{guide.icon}</span>
                    <span className="font-medium text-gray-900">{guide.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">자주 묻는 질문</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">추가 도움이 필요하신가요?</h2>
            <p className="text-gray-600 mb-4">
              문의사항이 있으시면 언제든지 연락주세요.
            </p>
            <a
              href="mailto:support@example.com"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              문의하기
            </a>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
