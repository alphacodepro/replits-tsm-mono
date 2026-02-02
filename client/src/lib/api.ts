const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Token storage utilities - using sessionStorage for temporary sessions
// Session persists through refreshes but clears when window closes
export const tokenStorage = {
  get: () => sessionStorage.getItem('auth_token'),
  set: (token: string) => sessionStorage.setItem('auth_token', token),
  remove: () => sessionStorage.removeItem('auth_token'),
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`;
  const token = tokenStorage.get();
  
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export interface User {
  id: string;
  username: string;
  role: string;
  fullName: string;
  instituteName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  hasAcceptedTerms: boolean;
  acceptedAt?: string | null;
  acceptedVersion?: string | null;
}

export interface Batch {
  id: string;
  teacherId: string;
  name: string;
  subject?: string;
  standard: string;
  fee: number;
  feePeriod: string;
  registrationToken: string;
  registrationEnabled: boolean;
  createdAt?: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  batchId: string;
  fullName: string;
  phone: string;
  email?: string;
  standard: string;
  customFee?: number | null;
  joinDate: string;
  totalPaid?: number;
  totalDue?: number;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  paymentMethod: string | null;
  paidAt: string;
  modifiedAt: string | null;
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
  login: async (username: string, password: string) => {
    const response = await apiRequest<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    // Store the JWT token
    tokenStorage.set(response.token);
    return response;
  },

  logout: async () => {
    const response = await apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    // Remove the JWT token
    tokenStorage.remove();
    return response;
  },

  me: () => apiRequest<{ user: User }>("/api/auth/me"),

  acceptTerms: async (version: string) => {
    const response = await apiRequest<{ user: User }>("/api/auth/accept-terms", {
      method: "POST",
      body: JSON.stringify({ version }),
    });
    return response;
  },

  updateCredentials: async (data: { username: string; password: string; currentPassword: string }) => {
    const response = await apiRequest<{ success: boolean; message: string }>("/api/profile/credentials", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    // Remove the JWT token since credentials changed - user needs to login again
    tokenStorage.remove();
    return response;
  },
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

  get: (id: string) =>
    apiRequest<{ teacher: User; batches: Batch[]; stats: { batchCount: number; studentCount: number } }>(`/api/teachers/${id}`),

  resetPassword: (id: string) =>
    apiRequest<{ success: boolean; newPassword: string; username: string }>(`/api/teachers/${id}/reset-password`, {
      method: "POST",
    }),

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

  toggleRegistration: (id: string, enabled: boolean) =>
    apiRequest<{ batch: Batch }>(`/api/batches/${id}/toggle-registration`, {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    }),

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
    guardianName?: string | null;
    guardianPhone?: string | null;
    schoolName?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
    notes?: string | null;
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

  update: (id: string, data: {
    fullName: string;
    phone: string;
    email: string;
    standard: string;
    joinDate: string;
    guardianName?: string | null;
    guardianPhone?: string | null;
    schoolName?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
    notes?: string | null;
  }) =>
    apiRequest<{ student: Student }>(`/api/students/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateFee: (id: string, customFee: number | null) =>
    apiRequest<{ student: Student }>(`/api/students/${id}/fee`, {
      method: "PATCH",
      body: JSON.stringify({ customFee }),
    }),

  register: (token: string, data: {
    fullName: string;
    phone: string;
    email?: string;
    standard: string;
    guardianName?: string | null;
    guardianPhone?: string | null;
    schoolName?: string | null;
    city?: string | null;
    dateOfBirth?: string | null;
  }) =>
    apiRequest<{ student: Student; batchName: string }>(`/api/register/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getRegistrationInfo: (token: string) => apiRequest<{ batch: Batch; instituteName: string }>(`/api/register/${token}`),
};

// Payment API
export const paymentApi = {
  create: (data: { 
    studentId: string; 
    amount: number; 
    paymentMethod?: string | null;
    paidAt?: string;
  }) =>
    apiRequest<{ payment: Payment; emailSent: boolean | null }>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (paymentId: string, data: { amount: number; paymentMethod?: string | null }) =>
    apiRequest<{ payment: Payment }>(`/api/payments/${paymentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// Stats API
export const statsApi = {
  teacher: () => apiRequest<TeacherStats>("/api/stats/teacher"),

  system: () => apiRequest<SystemStats>("/api/stats/system"),
};

// Dashboard API (optimized)
export interface DashboardSummary {
  batchCount: number;
  studentCount: number;
  totalCollected: number;
  totalPending: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedStudentsResponse extends PaginatedResponse<Student> {
  batch: Batch;
  batchTotals: {
    studentCount: number;
    totalCollected: number;
    totalPending: number;
    paidCount: number;
    pendingCount: number;
  };
}

export const dashboardApi = {
  summary: () => apiRequest<DashboardSummary>("/api/dashboard/summary"),

  studentsPaginated: (batchId: string, page: number = 1, limit: number = 25) =>
    apiRequest<PaginatedStudentsResponse>(
      `/api/batches/${batchId}/students/paginated?page=${page}&limit=${limit}`
    ),
};
