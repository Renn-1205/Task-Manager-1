'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, href: '/admin/assignments' },
  { id: 'classes', label: 'Classes', icon: GraduationCap, href: '/admin/classes' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const adminName = user?.name || 'Admin';

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
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
                  isActive(item.href)
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
              <p className="text-xs text-green-600">System Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </aside>
  );
}
