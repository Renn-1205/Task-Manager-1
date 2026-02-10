'use client';

import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterDropdownProps {
  roleFilter: string;
  statusFilter: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onClear: () => void;
}

export default function FilterDropdown({
  roleFilter,
  statusFilter,
  onRoleChange,
  onStatusChange,
  onClear,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasFilters = roleFilter || statusFilter;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
          hasFilters
            ? 'border-green-300 bg-green-50 text-green-700'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {hasFilters && (
          <span className="w-5 h-5 flex items-center justify-center bg-green-500 text-white text-xs rounded-full">
            {(roleFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            {hasFilters && (
              <button
                onClick={() => { onClear(); }}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => onRoleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
