import { Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
          <Image src="/logo.png" alt="Academic Growth" width={52} height={52} className="object-contain" />
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
