'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  CalendarDays,
  GraduationCap,
  LogIn,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import { tasksApi, classesApi, Task, Class } from '@/lib/api';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'done' | 'pending'>('pending');
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // ── Task state ──
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // ── Join class state ──
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── My classes state ──
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  // Redirect unauthenticated / unauthorized users
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'teacher') {
        router.replace('/teacher');
      } else if (user.role === 'admin') {
        router.replace('/admin');
      }
    }
  }, [user, loading, router]);

  // ── Fetch all tasks ──
  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const res = await tasksApi.getAll({ limit: 200 });
      setAllTasks((res.tasks as Task[]) ?? []);
    } catch {
      // silently fail
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // ── Fetch student's classes ──
  const fetchMyClasses = useCallback(async () => {
    if (!user) return;
    setClassesLoading(true);
    try {
      const res = await classesApi.getAll();
      setMyClasses((res.classes as Class[]) ?? []);
    } catch {
      // silently fail
    } finally {
      setClassesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAllTasks();
    fetchMyClasses();
  }, [fetchAllTasks, fetchMyClasses]);

  // ── Update task status ──
  const handleUpdateStatus = async (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    setUpdatingTaskId(taskId);
    try {
      await tasksApi.update(taskId, { status: newStatus });
      fetchAllTasks();
    } catch {
      // silently fail
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // ── Join class handler ──
  const handleJoinClass = async () => {
    if (!inviteCode.trim()) return;
    setJoinLoading(true);
    setJoinMessage(null);
    try {
      const res = await classesApi.join(inviteCode.trim());
      setJoinMessage({ type: 'success', text: res.message || 'Joined class successfully!' });
      setInviteCode('');
      fetchAllTasks(); // refresh tasks since new class may have assignments
      fetchMyClasses(); // refresh classes list
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Failed to join class';
      setJoinMessage({ type: 'error', text: message });
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ── Computed data ──
  const pendingTasks = allTasks.filter((t) => t.status === 'todo' || t.status === 'in-progress');
  const completedTasks = allTasks.filter((t) => t.status === 'completed');
  const displayedTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  const completedCount = completedTasks.length;
  const pendingCount = pendingTasks.length;
  const totalCount = allTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Upcoming tasks (due within next 7 days, not completed)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingTasks = allTasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    const d = new Date(t.due_date);
    return d >= now && d <= nextWeek;
  }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  // ── Helpers ──
  const formatDueDate = (d: string | null) => {
    if (!d) return 'No due date';
    const due = new Date(d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (due.toDateString() === today.toDateString()) return 'Today, 11:59 PM';
    if (due.toDateString() === tomorrow.toDateString()) return 'Tomorrow, 11:59 PM';
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDateBadge = (d: string) => {
    const date = new Date(d);
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = String(date.getDate()).padStart(2, '0');
    return { month, day };
  };

  const studentName = user.name ?? 'Student';

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <NotificationBell iconClass="text-gray-600" />
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{studentName}</p>
                <p className="text-xs text-gray-500">{user.role === 'student' ? 'Student' : user.role}</p>
              </div>
              <button
                onClick={() => logout()}
                className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold text-sm hover:bg-green-500 transition-colors"
              >
                {studentName.charAt(0).toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">
                welcome back! You have {pendingCount} assignments due this week.
              </p>
            </div>

            {/* Done/Pending Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('done')}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'done'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Done
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Active Assignments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Section Header */}
                <div className="flex items-center gap-2 mb-6">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    {activeTab === 'pending' ? 'Active Assignments' : 'Completed Assignments'}
                  </h2>
                </div>

                {/* Assignment List */}
                {dataLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : displayedTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {activeTab === 'pending'
                        ? 'No pending assignments. You\'re all caught up!'
                        : 'No completed assignments yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-1 h-12 rounded-full shrink-0 ${
                            task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                            <p className="text-sm text-gray-500">Due: {formatDueDate(task.due_date)}</p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {activeTab === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            {task.status === 'todo' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(task.id, 'in-progress')}
                                  disabled={updatingTaskId === task.id}
                                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                  {updatingTaskId === task.id ? '...' : 'Start Task'}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(task.id, 'completed')}
                                  disabled={updatingTaskId === task.id}
                                  className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  {updatingTaskId === task.id ? '...' : 'Complete'}
                                </button>
                              </>
                            )}
                            {task.status === 'in-progress' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'completed')}
                                disabled={updatingTaskId === task.id}
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {updatingTaskId === task.id ? 'Completing...' : 'Mark Complete'}
                              </button>
                            )}
                          </div>
                        )}
                        {activeTab === 'done' && (
                          <span className="flex items-center gap-1.5 px-4 py-2.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg shrink-0 ml-4">
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* View Archive Button */}
                {displayedTasks.length > 0 && activeTab === 'pending' && (
                  <button
                    onClick={() => setActiveTab('done')}
                    className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    View Archive
                  </button>
                )}
                {activeTab === 'done' && (
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="w-full mt-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                  >
                    Back to Pending
                  </button>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Course Progress Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">Course Progress</h3>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">Monthly Target</p>
                  <span className="text-sm font-semibold text-green-600">{progressPercentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-green-50 rounded-xl py-3 px-4 text-center border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-xl py-3 px-4 text-center border border-orange-200">
                    <p className="text-sm text-orange-500 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-500">{String(pendingCount).padStart(2, '0')}</p>
                  </div>
                </div>
              </div>

              {/* My Classes Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">My Classes</h3>
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{myClasses.length}</span>
                </div>

                {classesLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : myClasses.length === 0 ? (
                  <div className="text-center py-6">
                    <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">You haven&apos;t joined any classes yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Use an invite code below to join your first class!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4.5 h-4.5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{cls.name}</h4>
                          {cls.description && (
                            <p className="text-xs text-gray-500 truncate">{cls.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                          <Users className="w-3.5 h-3.5" />
                          <span>{cls.memberCount ?? 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Join Class Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">Join a Class</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Enter an invite code from your teacher to join a class.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setJoinMessage(null); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleJoinClass(); }}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
                  />
                  <button
                    onClick={handleJoinClass}
                    disabled={joinLoading || !inviteCode.trim()}
                    className="px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    {joinLoading ? 'Joining...' : 'Join'}
                  </button>
                </div>
                {joinMessage && (
                  <div className={`mt-3 text-sm font-medium px-3 py-2 rounded-lg ${
                    joinMessage.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {joinMessage.text}
                  </div>
                )}
              </div>

              {/* Upcoming Tasks Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Upcoming Tasks</h3>

                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No upcoming tasks this week.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingTasks.slice(0, 4).map((task) => {
                      const badge = task.due_date ? getDateBadge(task.due_date) : null;
                      return (
                        <div key={task.id} className="flex items-start gap-4">
                          {/* Date Badge */}
                          {badge && (
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg px-3 py-2 min-w-[50px] border border-gray-100">
                              <span className="text-xs font-medium text-green-600">{badge.month}</span>
                              <span className="text-lg font-bold text-gray-900">{badge.day}</span>
                            </div>
                          )}

                          {/* Task Details */}
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{task.title}</h4>
                            <p className="text-sm text-gray-500">
                              {task.due_date
                                ? new Date(task.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) === '12:00 AM'
                                  ? '11:59 PM'
                                  : new Date(task.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : ''
                              }
                              {task.creator ? ` - ${task.creator.name}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
