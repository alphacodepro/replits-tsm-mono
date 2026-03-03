import { useState, useEffect } from "react";

export function useDelayedLoading(isLoading: boolean, delay: number = 250): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return showSkeleton;
}
