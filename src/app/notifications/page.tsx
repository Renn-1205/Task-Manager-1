'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ClipboardCheck } from 'lucide-react';

// Notification data
const notifications = [
  {
    id: 1,
    type: 'assignment',
    title: 'New Assignment Posted',
    description: 'Upload a new assignment',
    sender: 'Prof.Mil',
    time: '2minutes ago',
  },
  {
    id: 2,
    type: 'assignment',
    title: 'New Assignment Posted',
    description: 'Upload a new assignment',
    sender: 'Prof.Mil',
    time: '1hour ago',
  },
];

// Tab options
const tabs = [
  { id: 'all', label: 'All' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'grade', label: 'Grade' },
  { id: 'discussion', label: 'Discussion' },
];

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  const fullName = 'soeng senghorng';
  const classInfo = 'Class SE B 12';

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>

          {/* Right side - notification & user */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-green-600" />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{fullName}</p>
                <p className="text-xs text-gray-500">{classInfo}</p>
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
                <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
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
              {notifications.map((notification) => (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-100">
                      <ClipboardCheck className="w-6 h-6 text-green-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        <span className="font-medium">{notification.sender}</span> {notification.description}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <button className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-md transition-colors">
                          View Details
                        </button>
                        <button className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-md transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0">
                      <span className="text-sm text-green-600">{notification.time}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state if no notifications */}
              {notifications.length === 0 && (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                  <p className="text-sm text-gray-500">You&apos;re all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
