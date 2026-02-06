'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  Trash2,
  FileText,
  Clock,
  FileEdit,
  UsersRound
} from 'lucide-react';
import CreateTaskModal from '@/components/CreateTaskModal';

const assignments = [
  {
    id: 1,
    title: 'Mathematics',
    status: 'published',
    submissions: { current: 36, total: 40 },
    dueDate: 'Dec 10, 2025',
  },
  {
    id: 2,
    title: 'Database',
    status: 'draft',
    submissions: null,
    dueDate: 'Dec 10, 2025',
  },
  {
    id: 3,
    title: 'Cloud Computing',
    status: 'published',
    submissions: { current: 40, total: 40, allTurnedIn: true },
    dueDate: 'Dec 10, 2025',
  },
  {
    id: 4,
    title: 'Public Speaking',
    status: 'published',
    submissions: { current: 32, total: 40 },
    dueDate: 'Dec 10, 2025',
  },
];

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/teacher' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, href: '/teacher', active: true },
  { id: 'students', label: 'Students', icon: Users, href: '/teacher/students' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/teacher/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/teacher/settings' },
];

export default function TeacherDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortOrder, setSortOrder] = useState('Latest First');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const teacherName = 'Ms, Hhaha';
  const teacherRole = 'Professor';

  const handleCreateTask = (taskData: { title: string; description: string; status: string; dueDate: string }) => {
    console.log('New task created:', taskData);
  
  };

  
  const stats = {
    totalActive: 24,
    pendingReview: 128,
    drafts: 7,
    totalStudents: 452,
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
            <p className="text-gray-600">Manage, filter and track student submissions.</p>
          </div>
          <button 
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="btn-primary px-6 py-3 text-white font-medium rounded-lg"
          >
            Create New Assignment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Active */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Active</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalActive}</p>
              </div>
            </div>
          </div>

          {/* Pending Review */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Review</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingReview}</p>
              </div>
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileEdit className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Drafts</p>
                <p className="text-xl font-bold text-gray-900">{stats.drafts}</p>
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersRound className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Students</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments by title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50">
                  {statusFilter}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Order */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50">
                  {sortOrder}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">ASSIGNMENT TITLE</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">STATUS</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">SUBMISSIONS</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-green-700">DUE DATE</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-green-700">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={assignment.id} className={index !== assignments.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{assignment.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          assignment.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {assignment.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {assignment.submissions ? (
                        <div className="flex flex-col gap-1">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(assignment.submissions.current / assignment.submissions.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {assignment.submissions.allTurnedIn
                              ? 'All Turned In'
                              : `${assignment.submissions.current}/${assignment.submissions.total} students`}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{assignment.dueDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </button>
                        {assignment.status === 'published' ? (
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                        ) : (
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-green-600">Showing 1 of 2 assignments</p>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-8 h-8 bg-green-500 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                2
              </button>
              <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                3
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
}
