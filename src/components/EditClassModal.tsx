'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Class } from '@/lib/api';

interface EditClassModalProps {
  isOpen: boolean;
  classData: Class | null;
  onClose: () => void;
  onSubmit: (data: { name?: string; description?: string }) => Promise<void>;
}

export default function EditClassModal({ isOpen, classData, onClose, onSubmit }: EditClassModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classData) {
      setName(classData.name);
      setDescription(classData.description ?? '');
      setError('');
    }
  }, [classData]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Class name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({ name: name.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !classData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-6">
      <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-8 my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-green-600">Edit Class</h2>
          <p className="text-gray-400">Update class details</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics 101"
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 placeholder-green-600/60 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the class"
              rows={3}
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 placeholder-green-600/60 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
