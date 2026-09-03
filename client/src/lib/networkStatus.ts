export const NETWORK_ERROR_EVENT = "tms:network-error";

const NETWORK_ERROR_MESSAGE =
  "No internet connection. Please check your connection and try again.";

export function createNetworkError(): Error & { errorCode: string } {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NETWORK_ERROR_EVENT));
  }

  const error = new Error(NETWORK_ERROR_MESSAGE) as Error & {
    errorCode: string;
  };
  error.name = "NetworkError";
  error.errorCode = "NETWORK_ERROR";
  return error;
}