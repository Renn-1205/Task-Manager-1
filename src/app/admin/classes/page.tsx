'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Users,
  Copy,
  Trash2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classesApi, Class } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import NotificationBell from '@/components/NotificationBell';

export default function AdminClasses() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();

  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingClass, setViewingClass] = useState<Class | null>(null);

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

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await classesApi.getAll();
      let allClasses: Class[] = data.classes as unknown as Class[] || [];
      // Client-side search since the API may not support it
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        allClasses = allClasses.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.invite_code.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
        );
      }
      setClasses(allClasses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (authUser?.role === 'admin') fetchClasses();
  }, [authUser, fetchClasses]);

  const handleDelete = async (id: string) => {
    try {
      await classesApi.delete(id);
      setSuccessMsg('Class deleted successfully');
      setDeleteConfirm(null);
      fetchClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccessMsg('Invite code copied to clipboard');
  };

  const handleViewDetails = async (cls: Class) => {
    try {
      const data = await classesApi.getOne(cls.id);
      setViewingClass(data.class as unknown as Class || cls);
    } catch {
      setViewingClass(cls);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
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
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex-1 relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes by name or invite code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          {/* Table body */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">CLASS NAME</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">INVITE CODE</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">MEMBERS</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">CREATED</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100 animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-6 bg-gray-200 rounded w-20 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-10 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-200 rounded w-24 mx-auto" /></td>
                      <td className="px-6 py-4 text-center"><div className="h-8 bg-gray-200 rounded w-16 mx-auto" /></td>
                    </tr>
                  ))
                ) : classes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-400">No classes found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                ) : (
                  classes.map((cls, idx) => (
                    <tr key={cls.id} className={`hover:bg-gray-50/50 transition-colors ${idx !== classes.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{cls.name}</p>
                          {cls.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cls.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700">{cls.invite_code}</code>
                          <button
                            onClick={() => handleCopyCode(cls.invite_code)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy invite code"
                          >
                            <Copy className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Users className="w-3.5 h-3.5 text-gray-400" />
                          {cls.memberCount ?? '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">{formatDate(cls.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleViewDetails(cls)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          {deleteConfirm === cls.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(cls.id)}
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
                              onClick={() => setDeleteConfirm(cls.id)}
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
        </div>

        {/* Class Detail Modal */}
        {viewingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{viewingClass.name}</h2>
                <button onClick={() => setViewingClass(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-gray-500 text-lg">&times;</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {viewingClass.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-700">{viewingClass.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Invite Code</p>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{viewingClass.invite_code}</code>
                      <button onClick={() => handleCopyCode(viewingClass.invite_code)} className="p-1 hover:bg-gray-100 rounded">
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Members</p>
                    <p className="text-sm text-gray-700">{viewingClass.memberCount ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Created</p>
                    <p className="text-sm text-gray-700">{formatDate(viewingClass.created_at)}</p>
                  </div>
                </div>

                {/* Member list if available */}
                {viewingClass.members && viewingClass.members.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Members</p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {viewingClass.members.map((m) => (
                        <div key={m.user_id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold">
                            {m.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{m.user.name}</p>
                            <p className="text-xs text-gray-500">{m.user.email}</p>
                          </div>
                          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">{m.user.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setViewingClass(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
