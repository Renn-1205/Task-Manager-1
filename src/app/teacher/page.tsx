'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  LogOut,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  UsersRound,
  Plus,
  AlertTriangle,
  TrendingUp,
  CalendarDays,
  X,
  Copy,
  MoreVertical,
} from 'lucide-react';
import CreateTaskModal from '@/components/CreateTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import CreateClassModal from '@/components/CreateClassModal';
import EditClassModal from '@/components/EditClassModal';
import NotificationBell from '@/components/NotificationBell';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, classesApi, notificationsApi, Task, TaskStats, TaskFilters, Pagination, Notification, Class, ClassMember } from '@/lib/api';

type TabId = 'dashboard' | 'assignments' | 'classes' | 'students';

const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'classes', label: 'Classes', icon: GraduationCap },
  { id: 'students', label: 'Students', icon: Users },
];

const ITEMS_PER_PAGE = 8;

export default function TeacherDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // ── UI state (assignments tab) ──
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isClassFilterDropdownOpen, setIsClassFilterDropdownOpen] = useState(false);

  // ── Data state ──
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]); // for dashboard overview
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // ── Notification state ──
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Modal state ──
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Students tab state ──
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classMembers, setClassMembers] = useState<ClassMember[]>([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  // ── Classes tab state ──
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [classDeleteLoading, setClassDeleteLoading] = useState(false);
  const [classActionMenuId, setClassActionMenuId] = useState<string | null>(null);
  const [classSearchQuery, setClassSearchQuery] = useState('');

  // ── Auth guard ──
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'teacher' && user.role !== 'admin') {
        // Students cannot access the teacher dashboard
        router.replace('/student-dashboard');
      }
    }
  }, [user, loading, router]);

  // ── Fetch tasks (filtered – for Assignments tab) ──
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const filters: TaskFilters = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (classFilter !== 'all') filters.class_id = classFilter;
      if (searchQuery.trim()) filters.search = searchQuery.trim();

      const res = await tasksApi.getAll(filters);
      setTasks((res.tasks as Task[]) ?? []);
      setPagination((res.pagination as Pagination) ?? null);
    } catch {
      // silently fail
    } finally {
      setDataLoading(false);
    }
  }, [user, currentPage, statusFilter, priorityFilter, classFilter, searchQuery]);

  // ── Fetch all tasks (unfiltered – for Dashboard overview) ──
  const fetchAllTasks = useCallback(async () => {
    if (!user) return;
    try {
      const res = await tasksApi.getAll({ limit: 100 });
      setAllTasks((res.tasks as Task[]) ?? []);
    } catch {
      // silently fail
    }
  }, [user]);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await tasksApi.getStats();
      setStats((res.stats as TaskStats) ?? null);
    } catch {
      // silently fail
    }
  }, [user]);

  // ── Fetch notifications ──
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getAll({ limit: 10 });
      setNotifications((res.notifications as Notification[]) ?? []);
    } catch {
      // silently fail
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationsApi.getUnreadCount();
      setUnreadCount(res.unreadCount ?? 0);
    } catch {
      // silently fail
    }
  }, [user]);

  // ── Fetch teacher's classes (for Students tab) ──
  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setClassesLoading(true);
    try {
      const res = await classesApi.getAll();
      const cls = (res.classes as Class[]) ?? [];
      setClasses(cls);
      // Auto-select first class if none selected
      if (cls.length > 0 && !selectedClassId) {
        setSelectedClassId(cls[0].id);
      }
    } catch {
      // silently fail
    } finally {
      setClassesLoading(false);
    }
  }, [user, selectedClassId]);

  // ── Fetch members of selected class ──
  const fetchClassMembers = useCallback(async () => {
    if (!selectedClassId) {
      setClassMembers([]);
      return;
    }
    setMembersLoading(true);
    try {
      const res = await classesApi.getOne(selectedClassId);
      const cls = res.class as Class | undefined;
      setClassMembers(cls?.members ?? []);
    } catch {
      setClassMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
    fetchAllTasks();
    fetchNotifications();
    fetchUnreadCount();
    fetchClasses();
  }, [fetchStats, fetchAllTasks, fetchNotifications, fetchUnreadCount, fetchClasses]);

  // Fetch class members when selected class changes
  useEffect(() => {
    fetchClassMembers();
  }, [fetchClassMembers]);

  // Poll for new notifications every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchNotifications]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, priorityFilter, classFilter, searchQuery]);

  // ── Handlers ──
  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = () => {
    fetchTasks();
    fetchStats();
    fetchAllTasks();
    fetchNotifications();
    fetchUnreadCount();
    fetchClasses();
    fetchClassMembers();
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setDeleteLoading(true);
    try {
      await tasksApi.delete(deletingTask.id);
      setDeletingTask(null);
      handleRefresh();
    } catch {
      // silently fail
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleNavClick = (tabId: TabId) => {
    setActiveTab(tabId);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedClassId) return;
    setRemovingMemberId(memberId);
    try {
      await classesApi.removeMember(selectedClassId, memberId);
      fetchClassMembers();
      fetchClasses(); // refresh member count
    } catch {
      // silently fail
    } finally {
      setRemovingMemberId(null);
    }
  };

  // ── Class CRUD handlers ──
  const handleCreateClass = async (data: { name: string; description: string }) => {
    await classesApi.create(data.name, data.description);
    fetchClasses();
  };

  const handleUpdateClass = async (data: { name?: string; description?: string }) => {
    if (!editingClass) return;
    await classesApi.update(editingClass.id, data);
    setEditingClass(null);
    fetchClasses();
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    setClassDeleteLoading(true);
    try {
      await classesApi.delete(deletingClass.id);
      setDeletingClass(null);
      // If we deleted the selected class, reset selection
      if (selectedClassId === deletingClass.id) {
        setSelectedClassId(null);
      }
      fetchClasses();
    } catch {
      // silently fail
    } finally {
      setClassDeleteLoading(false);
    }
  };

  const filteredClasses = classes.filter((cls) => {
    if (!classSearchQuery.trim()) return true;
    const q = classSearchQuery.toLowerCase();
    return cls.name.toLowerCase().includes(q) || (cls.description ?? '').toLowerCase().includes(q);
  });

  // ── Dashboard computed data ──
  const recentTasks = useMemo(() => {
    return [...allTasks]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [allTasks]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return allTasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    });
  }, [allTasks]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return allTasks.filter((t) => {
      if (!t.due_date || t.status === 'completed') return false;
      const d = new Date(t.due_date);
      return d >= now && d <= nextWeek;
    });
  }, [allTasks]);

  // ── Loading / Auth ──
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const teacherName = user.name ?? 'Teacher';
  const teacherRole = user.role === 'teacher' ? 'Professor' : user.role;

  // ── Helpers ──
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const priorityBadge = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'To Do';
    }
  };

  const totalPages = pagination?.totalPages ?? 1;

  // ── Completion rate ──
  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.completed / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                {teacherName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{teacherName}</p>
                <p className="text-xs text-gray-500">{teacherRole}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* ════════════════════════════════════════════════════════ */}
        {/* ══  DASHBOARD TAB  ════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {teacherName}!</h1>
                <p className="text-gray-600">Here&apos;s an overview of your tasks and student progress.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab('assignments'); setIsCreateModalOpen(true); }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>

            {/* Notification Activity Feed */}
            {notifications.filter((n) => !n.is_read && n.type === 'task_completed').length > 0 && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-green-800">Recent Completions</h3>
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                      {notifications.filter((n) => !n.is_read && n.type === 'task_completed').length}
                    </span>
                  </div>
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    Dismiss all
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications
                    .filter((n) => !n.is_read && n.type === 'task_completed')
                    .slice(0, 5)
                    .map((n) => (
                      <div key={n.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-green-100">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="shrink-0 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.pendingReview ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completed ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 rounded-lg">
                    <UsersRound className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Grid: Completion + Overdue / Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Completion Rate Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Completion Rate</h3>
                </div>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                      <circle
                        cx="60" cy="60" r="52" fill="none"
                        stroke="#22C55E" strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${completionRate * 3.27} 327`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-500 mt-2">
                  {stats?.completed ?? 0} of {stats?.totalTasks ?? 0} tasks completed
                </p>
              </div>

              {/* Overdue Tasks */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Overdue Tasks</h3>
                  {overdueTasks.length > 0 && (
                    <span className="ml-auto text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {overdueTasks.length}
                    </span>
                  )}
                </div>
                {overdueTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No overdue tasks!</p>
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {overdueTasks.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                          <p className="text-xs text-red-500">Due {formatDate(t.due_date)}</p>
                        </div>
                        <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Upcoming This Week */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-900">Due This Week</h3>
                  {upcomingTasks.length > 0 && (
                    <span className="ml-auto text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {upcomingTasks.length}
                    </span>
                  )}
                </div>
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-6">
                    <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No tasks due this week.</p>
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {upcomingTasks.slice(0, 5).map((t) => (
                      <li key={t.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                          <p className="text-xs text-gray-500">Due {formatDate(t.due_date)}</p>
                        </div>
                        <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(t.status)}`}>
                          {statusLabel(t.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recent Tasks Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors"
                >
                  View All Tasks &rarr;
                </button>
              </div>
              <div className="overflow-x-auto">
                {recentTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No tasks yet. Create your first task!</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Task</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Assignee</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTasks.map((task, i) => (
                        <tr key={task.id} className={i !== recentTasks.length - 1 ? 'border-b border-gray-50' : ''}>
                          <td className="px-6 py-3">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          </td>
                          <td className="px-6 py-3">
                            <p className="text-sm text-gray-600">{task.assignee?.name ?? 'Unassigned'}</p>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${priorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                              {statusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-sm text-gray-500">{formatDate(task.due_date)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* ══  ASSIGNMENTS TAB  ══════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'assignments' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                <p className="text-gray-600">Create, edit, and manage student tasks.</p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell iconClass="text-gray-600" />
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Task
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><FileText className="w-5 h-5 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Total Active</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.totalActive ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><Clock className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">In Progress</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.pendingReview ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.completed ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><UsersRound className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <p className="text-xs text-gray-500">Students Assigned</p>
                    <p className="text-xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <button
                      onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsPriorityDropdownOpen(false); setIsClassFilterDropdownOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                        statusFilter !== 'all'
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {statusFilter === 'all' ? 'All Status' : statusLabel(statusFilter)}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isStatusDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                        {[{ value: 'all', label: 'All Status' }, { value: 'todo', label: 'To Do' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setStatusFilter(opt.value); setIsStatusDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              statusFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Priority filter */}
                  <div className="relative">
                    <button
                      onClick={() => { setIsPriorityDropdownOpen(!isPriorityDropdownOpen); setIsStatusDropdownOpen(false); setIsClassFilterDropdownOpen(false); }}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                        priorityFilter !== 'all'
                          ? 'border-green-300 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {priorityFilter === 'all' ? 'All Priority' : priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isPriorityDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                        {[{ value: 'all', label: 'All Priority' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setPriorityFilter(opt.value); setIsPriorityDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              priorityFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Class filter */}
                  {classes.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => { setIsClassFilterDropdownOpen(!isClassFilterDropdownOpen); setIsStatusDropdownOpen(false); setIsPriorityDropdownOpen(false); }}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                          classFilter !== 'all'
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {classFilter === 'all' ? 'All Classes' : classes.find(c => c.id === classFilter)?.name ?? 'Class'}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {isClassFilterDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px] max-h-60 overflow-y-auto">
                          <button
                            onClick={() => { setClassFilter('all'); setIsClassFilterDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg ${
                              classFilter === 'all' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            All Classes
                          </button>
                          {classes.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => { setClassFilter(c.id); setIsClassFilterDropdownOpen(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors last:rounded-b-lg ${
                                classFilter === c.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                              }`}
                            >
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Active filter chips */}
                {(statusFilter !== 'all' || priorityFilter !== 'all' || classFilter !== 'all' || searchQuery) && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-gray-500">Active filters:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        Search: &quot;{searchQuery}&quot;
                        <button onClick={() => setSearchQuery('')} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {statusLabel(statusFilter)}
                        <button onClick={() => setStatusFilter('all')} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {priorityFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700 capitalize">
                        {priorityFilter}
                        <button onClick={() => setPriorityFilter('all')} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {classFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {classes.find(c => c.id === classFilter)?.name ?? 'Class'}
                        <button onClick={() => setClassFilter('all')} className="hover:text-green-900"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button
                      onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all'); setClassFilter('all'); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium ml-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {dataLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-16">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-1">
                      {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || classFilter !== 'all'
                        ? 'No tasks match your filters.'
                        : 'No tasks found. Create your first task!'}
                    </p>
                    {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || classFilter !== 'all') && (
                      <button
                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); setPriorityFilter('all'); setClassFilter('all'); }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-green-50">
                        <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">TITLE</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">CLASS</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">ASSIGNEE</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">PRIORITY</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">STATUS</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">DUE DATE</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, index) => (
                        <tr key={task.id} className={`hover:bg-gray-50 transition-colors ${index !== tasks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {task.class_id ? (
                              <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {classes.find(c => c.id === task.class_id)?.name ?? 'Unknown'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {task.assignee ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{task.assignee.name}</p>
                                  <p className="text-xs text-gray-500">{task.assignee.email}</p>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${priorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                              {statusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{formatDate(task.due_date)}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setEditingTask(task)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit task"
                              >
                                <Pencil className="w-4 h-4 text-gray-500" />
                              </button>
                              <button
                                onClick={() => setDeletingTask(task)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-green-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} tasks
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage ? 'bg-green-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* ══  CLASSES TAB  ══════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'classes' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                <p className="text-gray-600">Create and manage your classes.</p>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Class
              </button>
            </div>

            {classesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">No classes yet.</p>
                <p className="text-sm text-gray-400 mb-4">Create your first class to get started.</p>
                <button
                  onClick={() => setIsCreateClassModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Class
                </button>
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative mb-6 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={classSearchQuery}
                    onChange={(e) => setClassSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                  />
                  {classSearchQuery && (
                    <button onClick={() => setClassSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Class Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClasses.map((cls) => (
                    <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                            <p className="text-xs text-gray-500">{cls.memberCount ?? 0} students</p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            onClick={() => setClassActionMenuId(classActionMenuId === cls.id ? null : cls.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {classActionMenuId === cls.id && (
                            <>
                              <div className="fixed inset-0 z-[49]" onClick={() => setClassActionMenuId(null)} />
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[140px]">
                                <button
                                  onClick={() => { setEditingClass(cls); setClassActionMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                >
                                  <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={() => { setDeletingClass(cls); setClassActionMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {cls.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.description}</p>
                      )}
                      {!cls.description && <div className="mb-4" />}

                      {/* Invite Code */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-1">Invite Code</p>
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-sm font-mono font-bold text-green-800">{cls.invite_code}</code>
                          <button
                            onClick={() => navigator.clipboard.writeText(cls.invite_code)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                            title="Copy invite code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>Created {new Date(cls.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredClasses.length === 0 && classSearchQuery && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No classes match &quot;{classSearchQuery}&quot;</p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* ══  STUDENTS TAB  ═════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <p className="text-gray-600">Manage students in your classes.</p>
              </div>
            </div>

            {/* Class Selector */}
            {classesLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center py-16">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1">No classes yet.</p>
                <p className="text-sm text-gray-400">Create a class first to manage students.</p>
              </div>
            ) : (
              <>
                {/* Class Tabs */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                        selectedClassId === cls.id
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cls.name}
                      <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                        selectedClassId === cls.id ? 'bg-white/20' : 'bg-gray-100'
                      }`}>
                        {cls.memberCount ?? 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Invite Code */}
                {selectedClassId && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Class Invite Code</p>
                      <p className="text-xs text-green-600 mt-0.5">Share this code with students so they can join the class.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="px-4 py-2 bg-white rounded-lg text-sm font-mono font-bold text-green-700 border border-green-200">
                        {classes.find((c) => c.id === selectedClassId)?.invite_code ?? '—'}
                      </code>
                      <button
                        onClick={() => {
                          const code = classes.find((c) => c.id === selectedClassId)?.invite_code;
                          if (code) navigator.clipboard.writeText(code);
                        }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Student Search */}
                <div className="relative mb-4 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="overflow-x-auto">
                    {membersLoading ? (
                      <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (() => {
                      const filtered = classMembers.filter((m) => {
                        if (!studentSearch.trim()) return true;
                        const q = studentSearch.toLowerCase();
                        return m.user.name.toLowerCase().includes(q) || m.user.email.toLowerCase().includes(q);
                      });
                      return filtered.length === 0 ? (
                        <div className="text-center py-16">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            {studentSearch ? 'No students match your search.' : 'No students in this class yet.'}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">Share the invite code above for students to join.</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-green-50">
                              <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">STUDENT</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">EMAIL</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">ROLE</th>
                              <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">JOINED</th>
                              <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((member, idx) => (
                              <tr key={member.user_id} className={`hover:bg-gray-50 transition-colors ${idx !== filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                                      {member.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{member.user.name}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-gray-600">{member.user.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700">
                                    {member.user.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-sm text-gray-500">
                                    {new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button
                                    onClick={() => handleRemoveMember(member.user_id)}
                                    disabled={removingMemberId === member.user_id}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                  >
                                    {removingMemberId === member.user_id ? 'Removing...' : 'Remove'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleRefresh}
        classes={classes}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdated={handleRefresh}
        classes={classes}
      />

      {/* Delete confirmation */}
      {deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-700">&quot;{deletingTask.title}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeletingTask(null)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Class Modals ── */}
      <CreateClassModal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        onSubmit={handleCreateClass}
      />

      <EditClassModal
        isOpen={!!editingClass}
        classData={editingClass}
        onClose={() => setEditingClass(null)}
        onSubmit={handleUpdateClass}
      />

      {/* Delete class confirmation */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Class</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-700">&quot;{deletingClass.name}&quot;</span>? All members will be removed and this action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeletingClass(null)}
                  disabled={classDeleteLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClass}
                  disabled={classDeleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {classDeleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
