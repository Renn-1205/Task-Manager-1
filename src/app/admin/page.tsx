'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  GraduationCap,
  LogOut,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  TrendingUp,
  CheckCircle2,
  UsersRound,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, tasksApi, classesApi, AdminUser, AdminStats, AdminUserFilters, Pagination, Task, TaskFilters, Class } from '@/lib/api';
import AddEditUserModal from '@/components/AddEditUserModal';
import CreateTaskModal from '@/components/CreateTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import NotificationBell from '@/components/NotificationBell';
import CreateClassModal from '@/components/CreateClassModal';
import EditClassModal from '@/components/EditClassModal';

type TabId = 'dashboard' | 'users' | 'assignments' | 'classes';

const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'classes', label: 'Classes', icon: GraduationCap },
];

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // User management state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Action menu
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  // ── Assignments tab state ──
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [adminTaskPagination, setAdminTaskPagination] = useState<Pagination | null>(null);
  const [adminTaskLoading, setAdminTaskLoading] = useState(false);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [taskDebouncedSearch, setTaskDebouncedSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('');
  const [taskClassFilter, setTaskClassFilter] = useState('');
  const [taskCurrentPage, setTaskCurrentPage] = useState(1);
  const [isTaskStatusDropdownOpen, setIsTaskStatusDropdownOpen] = useState(false);
  const [isTaskPriorityDropdownOpen, setIsTaskPriorityDropdownOpen] = useState(false);
  const [isTaskClassDropdownOpen, setIsTaskClassDropdownOpen] = useState(false);
  const [adminClasses, setAdminClasses] = useState<Class[]>([]);

  // Task modal state
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [taskDeleteLoading, setTaskDeleteLoading] = useState(false);

  // Task action menu
  const [taskActionMenuId, setTaskActionMenuId] = useState<string | null>(null);

  // ── Classes tab state ──
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [classDeleteLoading, setClassDeleteLoading] = useState(false);
  const [classActionMenuId, setClassActionMenuId] = useState<string | null>(null);
  const [classSearchQuery, setClassSearchQuery] = useState('');

  // Auth guard
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role !== 'admin') {
        if (user.role === 'teacher') router.replace('/teacher');
        else router.replace('/student-dashboard');
      }
    }
  }, [user, loading, router]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getStats();
      if (res.stats) setStats(res.stats as unknown as AdminStats);
    } catch { /* silently fail */ }
  }, []);

  // Debounce search input (300ms) and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setDataLoading(true);
    try {
      const filters: AdminUserFilters = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();
      if (roleFilter) filters.role = roleFilter;
      if (statusFilter) filters.status = statusFilter;

      const res = await adminApi.getUsers(filters);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = res as any;
      setUsers(data.users ?? []);
      setPagination(data.pagination ?? null);
    } catch { /* silently fail */ }
    finally { setDataLoading(false); }
  }, [currentPage, debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Assignments tab: Debounce task search ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setTaskDebouncedSearch(taskSearchQuery);
      setTaskCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [taskSearchQuery]);

  // ── Fetch all classes (for assignments tab) ──
  const fetchAdminClasses = useCallback(async () => {
    try {
      const res = await classesApi.getAll();
      setAdminClasses((res.classes as Class[]) ?? []);
    } catch { /* silently fail */ }
  }, []);

  // ── Fetch tasks (for assignments tab) ──
  const fetchAdminTasks = useCallback(async () => {
    setAdminTaskLoading(true);
    try {
      const filters: TaskFilters = {
        page: taskCurrentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (taskDebouncedSearch.trim()) filters.search = taskDebouncedSearch.trim();
      if (taskStatusFilter) filters.status = taskStatusFilter;
      if (taskPriorityFilter) filters.priority = taskPriorityFilter;
      if (taskClassFilter) filters.class_id = taskClassFilter;

      const res = await tasksApi.getAll(filters);
      setAdminTasks((res.tasks as Task[]) ?? []);
      setAdminTaskPagination((res.pagination as Pagination) ?? null);
    } catch { /* silently fail */ }
    finally { setAdminTaskLoading(false); }
  }, [taskCurrentPage, taskDebouncedSearch, taskStatusFilter, taskPriorityFilter, taskClassFilter]);

  // Reset task page when filters change
  useEffect(() => {
    setTaskCurrentPage(1);
  }, [taskStatusFilter, taskPriorityFilter, taskClassFilter]);

  // Fetch tasks when assignments tab is active
  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAdminTasks();
      fetchAdminClasses();
    }
  }, [activeTab, fetchAdminTasks, fetchAdminClasses]);

  // Fetch classes when classes tab is active
  useEffect(() => {
    if (activeTab === 'classes') {
      fetchAdminClasses();
    }
  }, [activeTab, fetchAdminClasses]);

  // Helper to close all dropdowns
  const closeAllDropdowns = () => {
    setIsRoleDropdownOpen(false);
    setIsStatusDropdownOpen(false);
    setActionMenuUserId(null);
    setIsTaskStatusDropdownOpen(false);
    setIsTaskPriorityDropdownOpen(false);
    setIsTaskClassDropdownOpen(false);
    setTaskActionMenuId(null);
    setClassActionMenuId(null);
  };

  const isAnyDropdownOpen = isRoleDropdownOpen || isStatusDropdownOpen || !!actionMenuUserId || isTaskStatusDropdownOpen || isTaskPriorityDropdownOpen || isTaskClassDropdownOpen || !!taskActionMenuId || !!classActionMenuId;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const adminName = user.name ?? 'Admin';
  const adminRole = 'System Admin';

  const handleLogout = async () => { await logout(); };

  const handleRefresh = () => { fetchStats(); fetchUsers(); fetchAdminTasks(); fetchAdminClasses(); };

  // ── Task CRUD handlers ──
  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setTaskDeleteLoading(true);
    try {
      await tasksApi.delete(deletingTask.id);
      setDeletingTask(null);
      fetchAdminTasks();
      fetchStats();
    } catch { /* silently fail */ }
    finally { setTaskDeleteLoading(false); }
  };

  // ── Class CRUD handlers ──
  const handleCreateClass = async (data: { name: string; description: string }) => {
    await classesApi.create(data);
    setIsCreateClassModalOpen(false);
    fetchAdminClasses();
    fetchStats();
  };

  const handleUpdateClass = async (data: { name?: string; description?: string }) => {
    if (!editingClass) return;
    await classesApi.update(editingClass.id, data);
    setEditingClass(null);
    fetchAdminClasses();
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    setClassDeleteLoading(true);
    try {
      await classesApi.delete(deletingClass.id);
      setDeletingClass(null);
      fetchAdminClasses();
      fetchStats();
    } catch { /* silently fail */ }
    finally { setClassDeleteLoading(false); }
  };

  const filteredAdminClasses = adminClasses.filter((c) => {
    if (!classSearchQuery.trim()) return true;
    const q = classSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false);
  });

  const taskStatusLabel = (s: string) => {
    switch (s) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return s;
    }
  };

  const taskStatusBadge = (s: string) => {
    switch (s) {
      case 'todo': return 'bg-gray-100 text-gray-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const taskPriorityBadge = (p: string) => {
    switch (p) {
      case 'low': return 'bg-blue-100 text-blue-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const taskTotalPages = adminTaskPagination?.totalPages ?? 1;

  // ── CRUD handlers ──
  const handleCreateUser = async (data: unknown) => {
    setModalLoading(true);
    try {
      await adminApi.createUser(data as { name: string; email: string; password: string; role?: 'student' | 'teacher' | 'admin' });
      setIsAddModalOpen(false);
      handleRefresh();
    } catch (err) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateUser = async (data: unknown) => {
    if (!editingUser) return;
    setModalLoading(true);
    try {
      await adminApi.updateUser(editingUser.id, data as { name?: string; email?: string; password?: string; role?: 'student' | 'teacher' | 'admin' });
      setEditingUser(null);
      handleRefresh();
    } catch (err) {
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deletingUser.id);
      setDeletingUser(null);
      handleRefresh();
    } catch { /* silently fail */ }
    finally { setDeleteLoading(false); }
  };

  // ── Helpers ──
  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'student': return 'bg-green-100 text-green-700';
      case 'teacher': return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'admin': return 'bg-green-500 text-white';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusStyles = (status: string) => {
    return status === 'active' ? 'text-green-600' : 'text-gray-500';
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalPages = pagination?.totalPages ?? 1;

  // ── Reusable users table ──
  const renderUsersTable = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name, email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Role filter */}
          <div className="relative">
            <button
              onClick={() => { setIsRoleDropdownOpen((prev) => !prev); setIsStatusDropdownOpen(false); setActionMenuUserId(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                roleFilter ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : 'Role'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {isRoleDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[140px]">
                {[{ value: '', label: 'All Roles' }, { value: 'student', label: 'Student' }, { value: 'teacher', label: 'Teacher' }, { value: 'admin', label: 'Admin' }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setRoleFilter(opt.value); setCurrentPage(1); setIsRoleDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${roleFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => { setIsStatusDropdownOpen((prev) => !prev); setIsRoleDropdownOpen(false); setActionMenuUserId(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                statusFilter ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'Status'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[140px]">
                {[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'offline', label: 'Offline' }].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setCurrentPage(1); setIsStatusDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${statusFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {(roleFilter || statusFilter || searchQuery) && (
        <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
              &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {roleFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700 capitalize">
              {roleFilter}
              <button onClick={() => { setRoleFilter(''); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          {statusFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700 capitalize">
              {statusFilter}
              <button onClick={() => { setStatusFilter(''); setCurrentPage(1); }}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={() => { setSearchQuery(''); setDebouncedSearch(''); setRoleFilter(''); setStatusFilter(''); setCurrentPage(1); }} className="text-xs text-red-500 hover:text-red-700 font-medium ml-1">Clear all</button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto overflow-y-visible relative">
        {dataLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{searchQuery || roleFilter || statusFilter ? 'No users match your filters.' : 'No users found.'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-green-50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">USER</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ROLE</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">STATUS</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">JOINED DATE</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${index !== users.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeStyles(u.role)}`}>
                      {u.role === 'teacher' ? 'Teacher' : u.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${getStatusStyles(u.status)}`}>
                      <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {u.status === 'active' ? 'Active' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-600">{formatDate(u.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={() => { setActionMenuUserId(actionMenuUserId === u.id ? null : u.id); setIsRoleDropdownOpen(false); setIsStatusDropdownOpen(false); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {actionMenuUserId === u.id && (
                        <div className={`absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[140px] ${index >= users.length - 2 ? 'bottom-full mb-1' : 'top-full'}`}>
                          <button
                            onClick={() => { setEditingUser(u); setActionMenuUserId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeletingUser(u); setActionMenuUserId(null); }}
                            className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm rounded-b-lg ${u.id === user.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                            disabled={u.id === user.id}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-green-600">
            Showing {users.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} users
          </p>
          {pagination.totalPages > 1 && (
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
                if (totalPages <= 5) { page = i + 1; }
                else if (currentPage <= 3) { page = i + 1; }
                else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                else { page = currentPage - 2 + i; }
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
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex">
      {/* Invisible backdrop to close any open dropdown */}
      {isAnyDropdownOpen && (
        <div className="fixed inset-0 z-[49]" onClick={closeAllDropdowns} />
      )}

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
            <span className="text-sm font-semibold text-green-700">Academic Growth</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4">
          <p className="px-4 text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Main menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'text-white bg-green-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-green-600">{adminRole}</p>
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

        {/* ════ DASHBOARD TAB ════ */}
        {activeTab === 'dashboard' && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">ADMIN</span>
              </div>
              <NotificationBell iconClass="text-green-600" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><UsersRound className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Total Users</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.totalUsers?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><GraduationCap className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Active Students</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.activeStudents?.toLocaleString() ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.completionRate ?? 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Instructors</p>
                      <p className="text-xl font-bold text-gray-900">{stats?.instructors ?? 0}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">Stable</span>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {renderUsersTable()}
          </>
        )}

        {/* ════ USER MANAGEMENT TAB ════ */}
        {activeTab === 'users' && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-500 mt-1">Create, edit, and manage user accounts.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><UsersRound className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-xs text-gray-500">Total Users</p><p className="text-xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg"><GraduationCap className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-xs text-gray-500">Students</p><p className="text-xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-xs text-gray-500">Teachers</p><p className="text-xl font-bold text-gray-900">{stats?.instructors ?? 0}</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
                  <div><p className="text-xs text-gray-500">Admins</p><p className="text-xl font-bold text-gray-900">{stats?.admins ?? 0}</p></div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {renderUsersTable()}
          </>
        )}

        {/* ════ ASSIGNMENTS TAB ════ */}
        {activeTab === 'assignments' && (
          <>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                <p className="text-gray-500 mt-1">Manage all tasks across classes.</p>
              </div>
              <button
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={taskSearchQuery}
                      onChange={(e) => setTaskSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                    />
                    {taskSearchQuery && (
                      <button onClick={() => setTaskSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Status filter */}
                  <div className="relative">
                    <button
                      onClick={() => { setIsTaskStatusDropdownOpen(!isTaskStatusDropdownOpen); setIsTaskPriorityDropdownOpen(false); setIsTaskClassDropdownOpen(false); setTaskActionMenuId(null); }}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                        taskStatusFilter ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {taskStatusFilter ? taskStatusLabel(taskStatusFilter) : 'Status'}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {isTaskStatusDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[160px]">
                        {[{ value: '', label: 'All Status' }, { value: 'todo', label: 'To Do' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setTaskStatusFilter(opt.value); setIsTaskStatusDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              taskStatusFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
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
                      onClick={() => { setIsTaskPriorityDropdownOpen(!isTaskPriorityDropdownOpen); setIsTaskStatusDropdownOpen(false); setIsTaskClassDropdownOpen(false); setTaskActionMenuId(null); }}
                      className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                        taskPriorityFilter ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {taskPriorityFilter ? taskPriorityFilter.charAt(0).toUpperCase() + taskPriorityFilter.slice(1) : 'Priority'}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {isTaskPriorityDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[140px]">
                        {[{ value: '', label: 'All Priority' }, { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setTaskPriorityFilter(opt.value); setIsTaskPriorityDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                              taskPriorityFilter === opt.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Class filter */}
                  {adminClasses.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => { setIsTaskClassDropdownOpen(!isTaskClassDropdownOpen); setIsTaskStatusDropdownOpen(false); setIsTaskPriorityDropdownOpen(false); setTaskActionMenuId(null); }}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm transition-colors ${
                          taskClassFilter ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {taskClassFilter ? adminClasses.find(c => c.id === taskClassFilter)?.name ?? 'Class' : 'Class'}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {isTaskClassDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] min-w-[180px] max-h-60 overflow-y-auto">
                          <button
                            onClick={() => { setTaskClassFilter(''); setIsTaskClassDropdownOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 first:rounded-t-lg ${
                              !taskClassFilter ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
                            }`}
                          >
                            All Classes
                          </button>
                          {adminClasses.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => { setTaskClassFilter(c.id); setIsTaskClassDropdownOpen(false); }}
                              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 last:rounded-b-lg ${
                                taskClassFilter === c.id ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'
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
                {(taskStatusFilter || taskPriorityFilter || taskClassFilter || taskSearchQuery) && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-gray-500">Filters:</span>
                    {taskSearchQuery && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        &quot;{taskSearchQuery}&quot;
                        <button onClick={() => setTaskSearchQuery('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {taskStatusFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {taskStatusLabel(taskStatusFilter)}
                        <button onClick={() => setTaskStatusFilter('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {taskPriorityFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700 capitalize">
                        {taskPriorityFilter}
                        <button onClick={() => setTaskPriorityFilter('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    {taskClassFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full text-xs text-green-700">
                        {adminClasses.find(c => c.id === taskClassFilter)?.name ?? 'Class'}
                        <button onClick={() => setTaskClassFilter('')}><X className="w-3 h-3" /></button>
                      </span>
                    )}
                    <button onClick={() => { setTaskSearchQuery(''); setTaskStatusFilter(''); setTaskPriorityFilter(''); setTaskClassFilter(''); }} className="text-xs text-red-500 hover:text-red-700 font-medium ml-1">Clear all</button>
                  </div>
                )}
              </div>

              {/* Task Table */}
              <div className="overflow-x-auto overflow-y-visible relative">
                {adminTaskLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : adminTasks.length === 0 ? (
                  <div className="text-center py-16">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      {taskSearchQuery || taskStatusFilter || taskPriorityFilter || taskClassFilter
                        ? 'No tasks match your filters.'
                        : 'No tasks found.'}
                    </p>
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
                      {adminTasks.map((task, index) => (
                        <tr key={task.id} className={`hover:bg-gray-50 transition-colors ${index !== adminTasks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">{task.title}</p>
                            {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                          </td>
                          <td className="px-6 py-4">
                            {task.class_id ? (
                              <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {adminClasses.find(c => c.id === task.class_id)?.name ?? 'Unknown'}
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
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${taskPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${taskStatusBadge(task.status)}`}>
                              {taskStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{formatDate(task.due_date)}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="relative inline-block">
                              <button
                                onClick={() => { setTaskActionMenuId(taskActionMenuId === task.id ? null : task.id); setIsTaskStatusDropdownOpen(false); setIsTaskPriorityDropdownOpen(false); setIsTaskClassDropdownOpen(false); }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                              {taskActionMenuId === task.id && (
                                <div className={`absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[100] min-w-[140px] ${index >= adminTasks.length - 2 ? 'bottom-full mb-1' : 'top-full'}`}>
                                  <button
                                    onClick={() => { setEditingTask(task); setTaskActionMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                  >
                                    <Pencil className="w-4 h-4" /> Edit
                                  </button>
                                  <button
                                    onClick={() => { setDeletingTask(task); setTaskActionMenuId(null); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {adminTaskPagination && adminTaskPagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-green-600">
                    Showing {(taskCurrentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(taskCurrentPage * ITEMS_PER_PAGE, adminTaskPagination.total)} of {adminTaskPagination.total} tasks
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTaskCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={taskCurrentPage === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    {Array.from({ length: Math.min(taskTotalPages, 5) }, (_, i) => {
                      let page: number;
                      if (taskTotalPages <= 5) { page = i + 1; }
                      else if (taskCurrentPage <= 3) { page = i + 1; }
                      else if (taskCurrentPage >= taskTotalPages - 2) { page = taskTotalPages - 4 + i; }
                      else { page = taskCurrentPage - 2 + i; }
                      return (
                        <button
                          key={page}
                          onClick={() => setTaskCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === taskCurrentPage ? 'bg-green-500 text-white' : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setTaskCurrentPage((p) => Math.min(taskTotalPages, p + 1))}
                      disabled={taskCurrentPage === taskTotalPages}
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

        {/* ════ CLASSES TAB ════ */}
        {activeTab === 'classes' && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                <p className="text-gray-500 mt-1">Manage all classes across the platform</p>
              </div>
              <button
                onClick={() => setIsCreateClassModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Class
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={classSearchQuery}
                onChange={(e) => setClassSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Class Cards Grid */}
            {filteredAdminClasses.length === 0 ? (
              <div className="text-center py-20">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {classSearchQuery ? 'No classes match your search' : 'No Classes Yet'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {classSearchQuery ? 'Try a different search term.' : 'Create your first class to get started.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAdminClasses.map((cls) => (
                  <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative">
                    {/* Action menu */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setClassActionMenuId(classActionMenuId === cls.id ? null : cls.id); }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {classActionMenuId === cls.id && (
                        <div className="absolute right-0 top-8 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
                          <button
                            onClick={() => { setEditingClass(cls); setClassActionMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => { setDeletingClass(cls); setClassActionMenuId(null); }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Class info */}
                    <div className="flex items-start gap-3 mb-4 pr-8">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{cls.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{cls.description || 'No description'}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{cls.memberCount ?? 0} members</span>
                      </div>
                    </div>

                    {/* Invite code */}
                    {cls.invite_code && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500">Invite Code:</span>
                        <code className="text-sm font-mono font-semibold text-green-700 flex-1">{cls.invite_code}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(cls.invite_code)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy invite code"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Modals ── */}
      <AddEditUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateUser}
        loading={modalLoading}
      />

      <AddEditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
        user={editingUser}
        loading={modalLoading}
      />

      {/* Delete user confirmation */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-700">&quot;{deletingUser.name}&quot;</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
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

      {/* ── Task Modals ── */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreated={() => { fetchAdminTasks(); fetchStats(); }}
        classes={adminClasses}
      />

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdated={() => { fetchAdminTasks(); fetchStats(); }}
        classes={adminClasses}
      />

      {/* Delete task confirmation */}
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
                  disabled={taskDeleteLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={taskDeleteLoading}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {taskDeleteLoading ? 'Deleting...' : 'Delete'}
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
