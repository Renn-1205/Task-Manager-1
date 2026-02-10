'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, ClipboardCheck, CheckCircle2, AlertTriangle, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, Notification } from '@/lib/api';

// Tab options
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'grade', label: 'Grade' },
  { id: 'discussion', label: 'Discussion' },
];

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const res = await notificationsApi.getAll({ limit: 50 });
      setNotifications((res.notifications as Notification[]) ?? []);
    } catch {
      // silently fail
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single notification as read (Dismiss)
  const handleDismiss = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch { /* silently fail */ }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* silently fail */ }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filter by tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'assignments') return n.type === 'task_assigned' || n.type === 'task_completed';
    if (activeTab === 'grade') return n.type === 'task_overdue';
    if (activeTab === 'discussion') return n.type === 'class_joined';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Time ago helper
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Icon per notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <ClipboardCheck className="w-6 h-6 text-green-600" />;
      case 'task_completed': return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'task_overdue': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'class_joined': return <GraduationCap className="w-6 h-6 text-purple-600" />;
      default: return <Bell className="w-6 h-6 text-green-600" />;
    }
  };

  const fullName = user.name ?? 'User';
  const roleLabel = user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Teacher' : 'Admin';

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-6">
            <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-green-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Notifications Card */}
          <div className="bg-white rounded-2xl shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-sm text-green-600">stay updated with latest academic activities</p>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  disabled={unreadCount === 0}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="divide-y divide-gray-100">
              {dataLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                  <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 transition-colors ${notification.is_read ? 'bg-white' : 'bg-green-50/50'} hover:bg-gray-50`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${
                        notification.is_read ? 'bg-gray-50 border-gray-100' : 'bg-green-50 border-green-100'
                      }`}>
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${notification.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-3">
                          {notification.task_id && (
                            <button
                              onClick={() => {
                                // Navigate to appropriate dashboard
                                if (user.role === 'student') router.push('/student-dashboard');
                                else router.push('/teacher');
                              }}
                              className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors"
                            >
                              View Details
                            </button>
                          )}
                          {!notification.is_read && (
                            <button
                              onClick={() => handleDismiss(notification.id)}
                              className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-md transition-colors"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0">
                        <span className={`text-sm ${notification.is_read ? 'text-gray-400' : 'text-green-600'}`}>
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
