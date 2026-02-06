'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskData) => void;
}

interface TaskData {
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

const statusOptions = [
  { value: 'all', label: 'all status' },
  { value: 'todo', label: 'to do' },
  { value: 'in-progress', label: 'in progress' },
  { value: 'completed', label: 'completed' },
];

export default function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      status,
      dueDate,
    });
    // Reset form
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueDate('');
    onClose();
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setStatus('todo');
    setDueDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-8">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-green-600">Create New Task</h2>
          <p className="text-gray-400">Fill in the details for your new task</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 placeholder-green-600/60 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 placeholder-green-600/60 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Status and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-left text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
                >
                  <span>{statusOptions.find(s => s.value === status)?.label || 'To Do'}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>

                {/* Dropdown */}
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setStatus(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left bg-green-500 text-white hover:bg-green-600 transition-colors border-b border-green-400 last:border-b-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
