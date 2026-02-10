'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Edit, Trash2, UserCog, Shield, GraduationCap, Users as UsersIcon } from 'lucide-react';
import { AdminUser } from '@/lib/api';

interface UserActionMenuProps {
  user: AdminUser;
  currentUserId?: string;
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser, role: 'student' | 'teacher' | 'admin') => void;
}

export default function UserActionMenu({ user, currentUserId, onEdit, onDelete, onChangeRole }: UserActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSelf = user.id === currentUserId;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { value: 'student' | 'teacher' | 'admin'; label: string; icon: typeof Shield }[] = [
    { value: 'student', label: 'Student', icon: GraduationCap },
    { value: 'teacher', label: 'Teacher', icon: UsersIcon },
    { value: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setShowRoleMenu(false); }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 overflow-hidden">
          {/* Edit */}
          <button
            onClick={() => { onEdit(user); setIsOpen(false); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-400" />
            Edit User
          </button>

          {/* Change Role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              disabled={isSelf}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                isSelf ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCog className="w-4 h-4 text-gray-400" />
              Change Role
            </button>

            {showRoleMenu && !isSelf && (
              <div className="absolute left-full top-0 ml-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => {
                      if (r.value !== user.role) {
                        onChangeRole(user, r.value);
                      }
                      setIsOpen(false);
                      setShowRoleMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                      r.value === user.role
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <r.icon className="w-4 h-4" />
                    {r.label}
                    {r.value === user.role && (
                      <span className="ml-auto text-xs text-green-500">Current</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Delete */}
          <button
            onClick={() => { onDelete(user); setIsOpen(false); }}
            disabled={isSelf}
            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
              isSelf ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete User
          </button>
        </div>
      )}
    </div>
  );
}
