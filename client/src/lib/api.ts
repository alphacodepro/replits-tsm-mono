// ---------------- BASE URL ----------------
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://tuition-management-system-03bs.onrender.com";

// ---------------- GENERIC API REQUEST ----------------
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: "include", // important for sending cookies cross-domain
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = "An error occurred";

    try {
      const errorData = JSON.parse(text);
      const rawError = errorData.error || errorData.message;
      errorMessage = rawError ? String(rawError) : errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }

    const lowerErrorMessage = String(errorMessage).toLowerCase();

    if (res.status === 401 && lowerErrorMessage.includes("invalid")) {
      errorMessage = "Invalid username or password";
    } else if (res.status === 401) {
      errorMessage = "Unauthorized access";
    } else if (res.status === 403) {
      errorMessage = "Access denied";
    } else if (res.status === 404) {
      errorMessage = "Resource not found";
    } else if (res.status >= 500) {
      errorMessage = "Server error. Please try again later";
    }

    throw new Error(errorMessage);
  }

  return await res.json();
}

// ---------------- INTERFACES ----------------
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

// ---------------- AUTH API ----------------
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () =>
    apiRequest<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
    }),

  me: () => apiRequest<{ user: User }>("/api/auth/me"),

  updateCredentials: (data: {
    username: string;
    password: string;
    currentPassword: string;
  }) =>
    apiRequest<{ success: boolean; message: string }>("/api/profile/credentials", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ---------------- TEACHER API ----------------
export const teacherApi = {
  create: (data: {
    fullName: string;
    username: string;
    password: string;
    instituteName?: string;
    email?: string;
    phone?: string;
  }) => apiRequest<{ teacher: User }>("/api/teachers", { method: "POST", body: JSON.stringify(data) }),

  list: () =>
    apiRequest<{ teachers: (User & { batchCount: number; studentCount: number })[] }>(
      "/api/teachers"
    ),

  get: (id: string) =>
    apiRequest<{ teacher: User; batches: Batch[]; stats: { batchCount: number; studentCount: number } }>(
      `/api/teachers/${id}`
    ),

  resetPassword: (id: string) =>
    apiRequest<{ success: boolean; newPassword: string; username: string }>(
      `/api/teachers/${id}/reset-password`,
      { method: "POST" }
    ),

  updateStatus: (id: string, isActive: boolean) =>
    apiRequest<{ success: boolean }>(`/api/teachers/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/teachers/${id}`, { method: "DELETE" }),
};

// ---------------- BATCH API ----------------
export const batchApi = {
  create: (data: { name: string; subject?: string; fee: number; feePeriod: string }) =>
    apiRequest<{ batch: Batch }>("/api/batches", { method: "POST", body: JSON.stringify(data) }),

  list: () => apiRequest<{ batches: Batch[] }>("/api/batches"),

  get: (id: string) => apiRequest<{ batch: Batch; students: Student[] }>(`/api/batches/${id}`),

  delete: (id: string) => apiRequest<{ success: boolean }>(`/api/batches/${id}`, {
    method: "DELETE",
  }),
};

// ---------------- STUDENT API ----------------
export const studentApi = {
  create: (data: {
    batchId: string;
    fullName: string;
    phone: string;
    email?: string;
    standard: string;
  }) => apiRequest<{ student: Student }>("/api/students", { method: "POST", body: JSON.stringify(data) }),

  get: (id: string) =>
    apiRequest<{ student: Student; payments: Payment[]; totalPaid: number }>(
      `/api/students/${id}`
    ),

  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/students/${id}`, { method: "DELETE" }),

  register: (token: string, data: { fullName: string; phone: string; email?: string; standard: string }) =>
    apiRequest<{ student: Student; batchName: string }>(`/api/register/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRegistrationInfo: (token: string) =>
    apiRequest<{ batch: Batch; instituteName: string }>(`/api/register/${token}`),
};

// ---------------- PAYMENT API ----------------
export const paymentApi = {
  create: (data: { studentId: string; amount: number }) =>
    apiRequest<{ payment: Payment }>("/api/payments", { method: "POST", body: JSON.stringify(data) }),
};

// ---------------- STATS API ----------------
export const statsApi = {
  teacher: () => apiRequest<TeacherStats>("/api/stats/teacher"),
  system: () => apiRequest<SystemStats>("/api/stats/system"),
};
