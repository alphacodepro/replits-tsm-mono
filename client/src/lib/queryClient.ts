import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Get token from sessionStorage (session ends when window closes)
const getToken = () => sessionStorage.getItem('auth_token');

function handleSessionExpiry() {
  // Only redirect if there was an active token — a 401 without a token
  // is just a normal unauthenticated request, not a session expiry.
  const token = sessionStorage.getItem("auth_token");
  if (!token) return;
  sessionStorage.removeItem("auth_token");
  window.location.href = "/?reason=session_expired";
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      handleSessionExpiry();
      return; // redirect in flight — do not throw or parse body
    }

    let errorMessage = res.statusText;
    
    try {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await res.json();
        
        if (Array.isArray(errorData.error)) {
          errorMessage = errorData.error.map((e: any) => e.message).join(", ");
        } else if (typeof errorData.error === "string") {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else {
        errorMessage = await res.text() || res.statusText;
      }
    } catch (e) {
      errorMessage = res.statusText;
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = `${API_BASE_URL}${url}`;
  const token = getToken();
  
  const res = await fetch(fullUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export function getQueryFn<T>({ on401: unauthorizedBehavior }: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  return async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const fullUrl = `${API_BASE_URL}${url}`;
    const token = getToken();

    const res = await fetch(fullUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      // Session expired — clear token, redirect, stop processing
      handleSessionExpiry();
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
