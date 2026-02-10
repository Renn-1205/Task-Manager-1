'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, BookOpen, Calendar, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classesApi, tasksApi, Class, TaskStats } from '@/lib/api';
import ProfileDropdown from '@/components/ProfileDropdown';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Fetch dashboard data once authenticated
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [classRes, statsRes] = await Promise.all([
          classesApi.getAll(),
          tasksApi.getStats(),
        ]);
        setClasses((classRes.classes as Class[]) ?? []);
        setStats((statsRes.stats as TaskStats) ?? null);
      } catch {
        // Silently handle — data just won't appear
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Loading spinner while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = user.name?.split(' ')[0] ?? 'Student';
  const totalTasks = stats?.totalTasks ?? 0;
  const completedTasks = stats?.completed ?? 0;
  const todoTasks = stats?.todo ?? 0;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </div>

          {/* Right side - notification & user */}
          <div className="flex items-center gap-6">
            <Link href="/notifications" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <ProfileDropdown />
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
                  Welcome back, {firstName}!
                </h1>
                <p className="text-gray-600">
                  {totalTasks > 0
                    ? `You've completed ${completionPct}% of your tasks. Keep up the amazing work!`
                    : 'You have no tasks yet. Join a class or create a task to get started!'}
                </p>
              </div>

              {/* Task Progress Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 min-w-[280px] shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Task Progress</h3>
                <p className="text-xs text-gray-500 mb-3">Overall</p>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-50 rounded-lg py-2 px-3 text-center border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Completed</p>
                    <p className="text-xl font-bold text-green-600">{completedTasks}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 text-center border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">To-do</p>
                    <p className="text-xl font-bold text-gray-600">{todoTasks}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* My Classes */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Classes</h3>
                  <p className="text-sm text-gray-500">
                    {classes.length > 0
                      ? `You have ${classes.length} class${classes.length !== 1 ? 'es' : ''}.`
                      : 'No classes yet. Join one to get started.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Pending Tasks</h3>
                  <p className="text-sm text-gray-500">
                    {todoTasks > 0
                      ? `${todoTasks} task${todoTasks !== 1 ? 's' : ''} still to-do.`
                      : 'All caught up!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Star className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Total Tasks</h3>
                  <p className="text-sm text-gray-500">
                    {totalTasks > 0
                      ? `${completedTasks} of ${totalTasks} tasks completed.`
                      : 'No tasks assigned yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Classes Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Classes</h2>
              <Link href="/student-dashboard" className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm transition-colors">
                View dashboard
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {dataLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : classes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {classes.slice(0, 4).map((cls) => (
                  <div key={cls.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                    <div className="flex justify-center mb-4 h-20 items-center">
                      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 min-h-[48px] flex items-center justify-center">
                      {cls.name}
                    </h3>
                    {cls.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cls.description}</p>
                    )}
                    {cls.memberCount !== undefined && (
                      <p className="text-xs text-gray-400">{cls.memberCount} member{cls.memberCount !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No classes yet. Ask your teacher for an invite code!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">Help Center</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/teams" className="text-gray-600 hover:text-gray-900 transition-colors">Teams</Link>
          </div>
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Academic Growth Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
