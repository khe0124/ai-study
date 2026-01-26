'use client';

import LayoutWithSidebar from '@/components/layout/LayoutWithSidebar';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  // 실제로는 API에서 가져와야 함
  const notifications: Notification[] = [];

  const markAsRead = (id: string) => {
    // 알림 읽음 처리 로직 (추후 구현)
    console.log('Mark as read:', id);
  };

  const deleteNotification = (id: string) => {
    // 알림 삭제 로직 (추후 구현)
    console.log('Delete notification:', id);
  };

  return (
    <LayoutWithSidebar>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">알림</h1>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              모두 읽음 처리
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">알림이 없습니다</h2>
              <p className="text-gray-600">새로운 알림이 오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                    !notification.read ? 'border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`text-sm font-medium ${
                            notification.type === 'error'
                              ? 'text-red-600'
                              : notification.type === 'warning'
                              ? 'text-yellow-600'
                              : notification.type === 'success'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {notification.type === 'error'
                            ? '⚠️'
                            : notification.type === 'warning'
                            ? '⚠️'
                            : notification.type === 'success'
                            ? '✅'
                            : 'ℹ️'}
                        </span>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                            새
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-sm text-gray-500">{notification.time}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          읽음
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
