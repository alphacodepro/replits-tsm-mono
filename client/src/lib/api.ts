async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return await res.json();
}

export interface User {
  id: string;
  username: string;
  role: string;
  fullName: string;
  instituteName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
}

export interface Batch {
  id: string;
  teacherId: string;
  name: string;
  subject?: string;
  fee: number;
  feePeriod: string;
  registrationToken: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  batchId: string;
  fullName: string;
  phone: string;
  email?: string;
  standard: string;
  joinDate: string;
  totalPaid?: number;
  totalDue?: number;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paidAt: string;
}

export interface TeacherStats {
  batchCount: number;
  studentCount: number;
  feesCollected: number;
  pendingPayments: number;
}

export interface SystemStats {
  teacherCount: number;
  batchCount: number;
  studentCount: number;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  me: () => apiRequest<{ user: User }>("/api/auth/me"),
};

// Teacher API
export const teacherApi = {
  create: (data: {
    fullName: string;
    username: string;
    password: string;
    instituteName?: string;
    email?: string;
    phone?: string;
  }) =>
    apiRequest<{ teacher: User }>("/api/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => apiRequest<{ teachers: (User & { batchCount: number; studentCount: number })[] }>("/api/teachers"),

  updateStatus: (id: string, isActive: boolean) =>
    apiRequest<{ success: boolean }>(`/api/teachers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/teachers/${id}`, {
      method: "DELETE",
    }),
};

// Batch API
export const batchApi = {
  create: (data: { name: string; subject?: string; fee: number; feePeriod: string }) =>
    apiRequest<{ batch: Batch }>("/api/batches", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  list: () => apiRequest<{ batches: Batch[] }>("/api/batches"),

  get: (id: string) => apiRequest<{ batch: Batch; students: Student[] }>(`/api/batches/${id}`),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/batches/${id}`, {
      method: "DELETE",
    }),
};

// Student API
export const studentApi = {
  create: (data: {
    batchId: string;
    fullName: string;
    phone: string;
    email?: string;
    standard: string;
  }) =>
    apiRequest<{ student: Student }>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  get: (id: string) =>
    apiRequest<{ student: Student; payments: Payment[]; totalPaid: number }>(`/api/students/${id}`),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/students/${id}`, {
      method: "DELETE",
    }),

  register: (token: string, data: { fullName: string; phone: string; email?: string; standard: string }) =>
    apiRequest<{ student: Student; batchName: string }>(`/api/register/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRegistrationInfo: (token: string) => apiRequest<{ batch: Batch }>(`/api/register/${token}`),
};

// Payment API
export const paymentApi = {
  create: (data: { studentId: string; amount: number }) =>
    apiRequest<{ payment: Payment }>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Stats API
export const statsApi = {
  teacher: () => apiRequest<TeacherStats>("/api/stats/teacher"),

  system: () => apiRequest<SystemStats>("/api/stats/system"),
};
