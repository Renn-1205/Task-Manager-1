'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  GraduationCap,
  Settings, 
  HelpCircle,
  LogOut,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle2,
  UsersRound
} from 'lucide-react';

// User data
const users = [
  {
    id: 1,
    name: 'Soeng senghorng',
    email: 'horng12@uni.com',
    role: 'student',
    status: 'active',
    joinedDate: 'Dec 10, 2025',
  },
  {
    id: 2,
    name: 'Hahaah San',
    email: 'hhahaha12@.com',
    role: 'teacher',
    status: 'offline',
    joinedDate: 'Dec 10, 2025',
  },
  {
    id: 3,
    name: 'Noona san',
    email: 'noona12@.com',
    role: 'admin',
    status: 'active',
    joinedDate: 'Dec 10, 2025',
  },
  {
    id: 4,
    name: 'Ly Sombo',
    email: 'sombo12@.com',
    role: 'student',
    status: 'active',
    joinedDate: 'Dec 10, 2025',
  },
];

// Sidebar navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin', active: true },
  { id: 'users', label: 'User Management', icon: Users, href: '/admin/users' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, href: '/admin/assignments' },
  { id: 'classes', label: 'Classes', icon: GraduationCap, href: '/admin/classes' },
];

const systemItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  { id: 'help', label: 'Help Center', icon: HelpCircle, href: '/admin/help' },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const adminName = 'Noona San';
  const adminRole = 'System Admin';

  // Stats
  const stats = {
    totalUsers: { value: 2845, change: 12, trend: 'down' },
    activeStudents: { value: 1420, change: 8, trend: 'up' },
    completionRate: { value: '88%', change: 24, trend: 'down' },
    instructors: { value: 124, trend: 'stable' },
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-green-100 text-green-700';
      case 'teacher':
        return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'admin':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
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

        {/* Main Menu */}
        <nav className="flex-1 px-4">
          <p className="px-4 text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Main menu</p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'text-white bg-green-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* System Section */}
          <p className="px-4 text-xs font-semibold text-green-600 uppercase tracking-wider mt-8 mb-2">System</p>
          <ul className="space-y-1">
            {systemItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-green-600">{adminRole}</p>
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-full">
              ADMIN
            </span>
          </div>
          <button className="relative p-2 hover:bg-white rounded-full transition-colors">
            <Bell className="w-6 h-6 text-green-600" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UsersRound className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalUsers.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <TrendingDown className="w-3 h-3" />
                <span>{stats.totalUsers.change}%</span>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Students</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeStudents.value.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-xs">
                <TrendingUp className="w-3 h-3" />
                <span>{stats.activeStudents.change}%</span>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                  <p className="text-xl font-bold text-gray-900">{stats.completionRate.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-red-500 text-xs">
                <TrendingDown className="w-3 h-3" />
                <span>{stats.completionRate.change}%</span>
              </div>
            </div>
          </div>

          {/* Instructors */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Instructors</p>
                  <p className="text-xl font-bold text-gray-900">{stats.instructors.value}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">Stable</span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Filters Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>

                {/* Add User Button */}
                <button className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
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
                {users.map((user, index) => (
                  <tr key={user.id} className={index !== users.length - 1 ? 'border-b border-gray-100' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex px-4 py-1.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeStyles(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-sm ${getStatusStyles(user.status)}`}>
                        <span className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {user.status === 'active' ? 'Active' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-600">{user.joinedDate}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-green-600">Showing 1 to 4 of 30users</p>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 bg-green-500 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                2
              </button>
              <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600">
                3
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
