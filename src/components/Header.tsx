import { Bell } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  userName: string;
  fullName: string;
  classInfo: string;
}

export default function Header({ userName, fullName, classInfo }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
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
  );
}
