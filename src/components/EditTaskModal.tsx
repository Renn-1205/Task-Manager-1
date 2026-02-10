'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { tasksApi, classesApi, Task, UpdateTaskData, StudentOption, Class } from '@/lib/api';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdated: () => void;
  classes?: Class[];
}

const priorityOptions: { value: 'low' | 'medium' | 'high'; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
];

const statusOptions: { value: 'todo' | 'in-progress' | 'completed'; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function EditTaskModal({ isOpen, task, onClose, onUpdated, classes = [] }: EditTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo');
  const [classId, setClassId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
      setPriority(task.priority);
      setStatus(task.status);
      setClassId(task.class_id ?? '');
      setAssigneeId(task.assignee_id ?? '');
      setError(null);
    }
  }, [task]);

  // Fetch students — if a class is selected, fetch class members; otherwise all students
  useEffect(() => {
    if (!isOpen) return;
    const fetchStudents = async () => {
      try {
        if (classId) {
          const res = await classesApi.getOne(classId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cls = (res as any).class;
          if (cls?.members) {
            const memberStudents: StudentOption[] = cls.members
              .filter((m: { user: { role: string } }) => m.user.role === 'student')
              .map((m: { user: { id: string; name: string; email: string } }) => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
              }));
            setStudents(memberStudents);
          } else {
            setStudents([]);
          }
        } else {
          const res = await tasksApi.getStudents();
          setStudents((res.students as StudentOption[]) ?? []);
        }
      } catch {
        // silently fail
      }
    };
    fetchStudents();
  }, [isOpen, classId]);

  const closeAllDropdowns = () => {
    setIsPriorityOpen(false);
    setIsStatusOpen(false);
    setIsClassOpen(false);
    setIsAssigneeOpen(false);
  };

  const handleSubmit = async () => {
    if (!task) return;
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const data: UpdateTaskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate || undefined,
        priority,
        status,
        assignee_id: assigneeId || null,
        class_id: classId || null,
      };
      await tasksApi.update(task.id, data);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  const selectedClass = classes.find((c) => c.id === classId);
  const selectedStudent = students.find((s) => s.id === assigneeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-green-600">Edit Task</h2>
          <p className="text-gray-400">Update the task details</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Title */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 placeholder-green-600/60 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {/* Priority + Status row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsPriorityOpen(!isPriorityOpen); setIsStatusOpen(false); setIsClassOpen(false); setIsAssigneeOpen(false); }}
                  className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-left text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
                >
                  <span className="capitalize">{priority}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {isPriorityOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {priorityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setPriority(opt.value); setIsPriorityOpen(false); }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${priority === opt.value ? 'bg-green-50 font-medium' : ''}`}
                      >
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${opt.color}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsStatusOpen(!isStatusOpen); setIsPriorityOpen(false); setIsClassOpen(false); setIsAssigneeOpen(false); }}
                  className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-left text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
                >
                  <span>{statusOptions.find((s) => s.value === status)?.label}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {isStatusOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setStatus(opt.value); setIsStatusOpen(false); }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${status === opt.value ? 'bg-green-50 font-medium' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Class */}
          {classes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Class</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setIsClassOpen(!isClassOpen); setIsPriorityOpen(false); setIsStatusOpen(false); setIsAssigneeOpen(false); }}
                  className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-left text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
                >
                  <span>{selectedClass ? selectedClass.name : 'No class'}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>
                {isClassOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { setClassId(''); setAssigneeId(''); setIsClassOpen(false); }}
                      className="w-full px-4 py-3 text-left text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                    >
                      No class
                    </button>
                    {classes.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setClassId(c.id); setAssigneeId(''); setIsClassOpen(false); }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${classId === c.id ? 'bg-green-50 font-medium' : ''}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{c.name}</p>
                        {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Assignee</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { const next = !isAssigneeOpen; closeAllDropdowns(); setIsAssigneeOpen(next); }}
                className="w-full px-4 py-3 bg-green-50 border-0 rounded-lg text-left text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between"
              >
                <span>{selectedStudent ? `${selectedStudent.name} (${selectedStudent.email})` : 'No assignee'}</span>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              {isAssigneeOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setAssigneeId(''); setIsAssigneeOpen(false); }}
                    className="w-full px-4 py-3 text-left text-gray-500 hover:bg-gray-50 border-b border-gray-100"
                  >
                    No assignee
                  </button>
                  {students.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setAssigneeId(s.id); setIsAssigneeOpen(false); }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${assigneeId === s.id ? 'bg-green-50 font-medium' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </button>
                  ))}
                  {students.length === 0 && (
                    <p className="px-4 py-3 text-sm text-gray-400">No students found</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full py-3 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
