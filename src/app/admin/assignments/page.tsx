'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar,
  AlertCircle,
  Trash2,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tasksApi, Task, Pagination } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import NotificationBell from '@/components/NotificationBell';

export default function AdminAssignments() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (!authLoading && (!authUser || authUser.role !== 'admin')) {
      router.push('/login');
    }
  }, [authUser, authLoading, router]);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await tasksApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(data.tasks || []);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    if (authUser?.role === 'admin') fetchTasks(1);
  }, [authUser, fetchTasks]);

  const handleDelete = async (id: string) => {
    try {
      await tasksApi.delete(id);
      setSuccessMsg('Assignment deleted successfully');
      setDeleteConfirm(null);
      fetchTasks(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handlePageChange = (page: number) => fetchTasks(page);

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'todo': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    const total = pagination.totalPages;
    const current = pagination.page;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      pages.push(1, 2, 3, 4, 5);
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total);
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2);
    }
    return pages;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser || authUser.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">ADMIN</span>
          </div>
          <NotificationBell iconClass="text-green-600" />
        </div>

        {/* Toasts */}
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2 admin-fade-in">
            <AlertCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Search & Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">TITLE</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">STATUS</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">PRIORITY</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ASSIGNEE</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">DUE DATE</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded-full w-20 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded-full w-16 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-24 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-24 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-16 mx-auto" /></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No assignments found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task, idx) => (
                    <tr key={task.id} className={`hover:bg-gray-50/50 transition-colors ${idx !== tasks.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityStyles(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">{task.assignee?.name || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(task.due_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {/* Could navigate to detail */}}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {deleteConfirm === task.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-md hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(task.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-green-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} assignments
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map((page) => (
                  <button key={page} onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.page ? 'bg-green-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
