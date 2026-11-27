import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Reusable hook for managing temporary toast message state.
 */
export function useToastMessage(defaultDurationMs = 3000) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToastMessage(null);
  }, []);

  const showToast = useCallback(
    (message: string, durationMs = defaultDurationMs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToastMessage(message);
      timeoutRef.current = setTimeout(() => {
        setToastMessage(null);
        timeoutRef.current = null;
      }, durationMs);
    },
    [defaultDurationMs]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    toastMessage,
    showToast,
    clearToast,
  };
}
