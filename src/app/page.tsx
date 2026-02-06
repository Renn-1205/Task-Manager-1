'use client';

import Link from 'next/link';
import { Bell, BookOpen, Calendar, Star, ChevronRight } from 'lucide-react';

// Course/Class card data
const classCards = [
  {
    id: 1,
    title: 'Mathematic: Algebra',
    icon: 'π',
    iconType: 'text',
  },
  {
    id: 2,
    title: 'Database: Schema',
    icon: 'database',
    iconType: 'svg',
  },
  {
    id: 3,
    title: 'Data Structure & Algorithms',
    icon: 'algorithm',
    iconType: 'svg',
  },
  {
    id: 4,
    title: 'Data Sciences',
    icon: 'datascience',
    iconType: 'svg',
  },
];

// Icon components for class cards
function ClassIcon({ type }: { type: string }) {
  switch (type) {
    case 'database':
      return (
        <svg className="w-16 h-16 text-gray-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="32" cy="16" rx="20" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 16v32c0 4.4 9 8 20 8s20-3.6 20-8V16" stroke="currentColor" strokeWidth="2" fill="none" />
          <ellipse cx="32" cy="32" rx="20" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <ellipse cx="32" cy="48" rx="20" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'algorithm':
      return (
        <svg className="w-16 h-16 text-gray-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="40" y="8" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="8" y="40" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <rect x="40" y="40" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M24 16h16M24 48h16M16 24v16M48 24v16" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'datascience':
      return (
        <svg className="w-16 h-16 text-gray-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="8" width="48" height="40" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M8 16h48" stroke="currentColor" strokeWidth="2" />
          <circle cx="14" cy="12" r="2" fill="currentColor" />
          <circle cx="22" cy="12" r="2" fill="currentColor" />
          <path d="M16 28l8 8 8-12 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="30" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M20 52h24M28 52v4M36 52v4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Home() {
  const userName = 'Horng';
  const fullName = 'soeng senghorng';
  const classInfo = 'Class SE B 12';
  const learningStreak = 12;
  const completedGoals = 85;
  const completedCourses = 12;
  const pendingCourses = 3;
  const activeCourses = 5;
  const assignmentsDue = 2;

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
          </div>

          {/* Right side - notification & user */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
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
        <div className="max-w-7xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">
                  Welcome back , {userName} !
                </h1>
                <p className="text-gray-600">
                  you&apos;re on {learningStreak}-day learning streak . you&apos;ve completed {completedGoals}% of your weekly goals . Keep up the amazing work !
                </p>
              </div>
              
              {/* Course Progress Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[280px] shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Course Progress</h3>
                <p className="text-xs text-gray-500 mb-3">Monthly Target</p>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(completedCourses / (completedCourses + pendingCourses)) * 100}%` }}
                  ></div>
                </div>
                
                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-50 rounded-lg py-2 px-3 text-center border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Completed</p>
                    <p className="text-xl font-bold text-green-600">{completedCourses}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 text-center border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Pending</p>
                    <p className="text-xl font-bold text-gray-600">{String(pendingCourses).padStart(2, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* My Courses */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Courses</h3>
                  <p className="text-sm text-gray-500">You have {activeCourses} active courses this semester.</p>
                  <div className="flex items-center gap-1 mt-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                    <div className="w-6 h-6 rounded-full bg-green-500 -ml-2"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 -ml-2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Assignments */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upcoming Assignments</h3>
                  <p className="text-sm text-gray-500">{assignmentsDue} assignments due this week.</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    DUE IN 2 DAYS
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Grades */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Recent Grades</h3>
                  <p className="text-sm text-gray-500">View your latest performance feedback.</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-2xl font-bold text-green-600">A+</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                      <span className="text-xs text-blue-600">Latest: UI Design Concepts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Join Classes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Join Classes</h2>
              <Link href="/classes" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
                See all classes
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {classCards.map((card) => (
                <div key={card.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                  <div className="flex justify-center mb-4 h-20 items-center">
                    {card.iconType === 'text' ? (
                      <span className="text-6xl font-serif text-gray-700">{card.icon}</span>
                    ) : (
                      <ClassIcon type={card.icon} />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-4 min-h-[48px] flex items-center justify-center">
                    {card.title}
                  </h3>
                  <button className="btn-primary w-full py-2.5 px-4 text-white font-medium rounded-lg text-sm">
                    Join class
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">help Center</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/teams" className="text-gray-600 hover:text-gray-900 transition-colors">Teams</Link>
          </div>
          <p className="text-center text-sm text-gray-500">
            © 2026 Academic Growth Platform . All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
