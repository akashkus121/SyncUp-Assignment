import { useState, useEffect } from 'react';

/**
 * Custom TypeScript hook to debounce any value (e.g. search query input).
 * Ensures instant UI feedback without spamming state filters or API calls.
 * 
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 300ms)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
