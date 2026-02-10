const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  user?: T;
  task?: T;
  tasks?: T[];
  class?: T;
  classes?: T[];
  notifications?: T[];
  unreadCount?: number;
  stats?: TaskStats;
  students?: StudentOption[];
  pagination?: Pagination;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  created_by: string;
  assignee_id: string | null;
  class_id: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { id: string; name: string; email: string } | null;
  creator?: { id: string; name: string; email: string } | null;
}

export interface TaskStats {
  totalActive: number;
  pendingReview: number;
  todo: number;
  completed: number;
  totalTasks: number;
  totalStudents: number;
}

export interface StudentOption {
  id: string;
  name: string;
  email: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  assignee_id?: string;
  class_id?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'completed';
  assignee_id?: string | null;
  class_id?: string | null;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  search?: string;
  class_id?: string;
  page?: number;
  limit?: number;
}

// ─── Class Types ─────────────────────────────────────────────

export interface ClassMember {
  user_id: string;
  joined_at: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface Class {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  memberCount?: number;
  members?: ClassMember[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // send cookies (JWT)
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running.');
  }

  const text = await res.text();
  let data: ApiResponse<T>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Server returned an unexpected response. Is the backend running on the correct port?');
  }

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ─── Auth API ────────────────────────────────────────────────

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request<User>('/auth/me'),

  verifyEmail: (code: string) =>
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// ─── Tasks API ───────────────────────────────────────────────

export const tasksApi = {
  create: (data: CreateTaskData) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.class_id) params.append('class_id', filters.class_id);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    const qs = params.toString();
    return request<Task>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  getOne: (id: string) =>
    request<Task>(`/tasks/${id}`),

  update: (id: string, data: UpdateTaskData) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  getStats: () =>
    request<TaskStats>('/tasks/stats'),

  getStudents: () =>
    request<StudentOption>('/tasks/students'),
};

// ─── Classes API ─────────────────────────────────────────────

export const classesApi = {
  create: (name: string, description?: string) =>
    request<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  getAll: () =>
    request<Class>('/classes'),

  getOne: (id: string) =>
    request<Class>(`/classes/${id}`),

  update: (id: string, data: { name?: string; description?: string }) =>
    request<Class>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/classes/${id}`, {
      method: 'DELETE',
    }),

  join: (invite_code: string) =>
    request<Class>('/classes/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code }),
    }),

  getMembers: (classId: string) =>
    request<StudentOption>(`/classes/${classId}/members`),

  removeMember: (classId: string, userId: string) =>
    request(`/classes/${classId}/members/${userId}`, {
      method: 'DELETE',
    }),
};

// ─── Notification Types ──────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'class_joined';
  title: string;
  message: string;
  task_id: string | null;
  class_id: string | null;
  is_read: boolean;
  created_at: string;
}

// ─── Admin Types ─────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  isVerified: boolean;
  status: 'active' | 'offline';
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  activeStudents: number;
  instructors: number;
  admins: number;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
  newUsersThisMonth: number;
}

export interface AdminUserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'teacher' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'teacher' | 'admin';
}

// ─── Notifications API ───────────────────────────────────────

export const notificationsApi = {
  getAll: (params: { page?: number; limit?: number; unread_only?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.append('page', String(params.page));
    if (params.limit) qs.append('limit', String(params.limit));
    if (params.unread_only) qs.append('unread_only', 'true');
    const q = qs.toString();
    return request<Notification>(`/notifications${q ? `?${q}` : ''}`);
  },

  getUnreadCount: () =>
    request<never>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: () =>
    request('/notifications/read-all', { method: 'PUT' }),

  checkOverdue: () =>
    request('/notifications/check-overdue', { method: 'POST' }),
};

// ─── Admin API ───────────────────────────────────────────────

export const adminApi = {
  getStats: () =>
    request<AdminStats>('/admin/stats'),

  getUsers: (filters: AdminUserFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);
    const qs = params.toString();
    return request<AdminUser>(`/admin/users${qs ? `?${qs}` : ''}`);
  },

  getUser: (id: string) =>
    request<AdminUser>(`/admin/users/${id}`),

  createUser: (data: CreateUserData) =>
    request<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUser: (id: string, data: UpdateUserData) =>
    request<AdminUser>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    request(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  changeUserRole: (id: string, role: 'student' | 'teacher' | 'admin') =>
    request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
