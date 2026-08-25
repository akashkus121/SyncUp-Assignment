import { useState, useEffect, useRef } from 'react';

/**
 * Custom TypeScript hook to throttle value updates.
 * Useful for rate-limiting frequent updates.
 * 
 * @param value The value to throttle
 * @param limit Throttle limit in milliseconds (default: 200ms)
 */
export function useThrottle<T>(value: T, limit: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Custom TypeScript hook for throttled scroll tracking.
 * Tracks window scrollY and showScrollTop state with high-performance throttling.
 * 
 * @param limit Throttle interval in ms (default 200ms)
 */
export function useThrottledScroll(limit: number = 200) {
  const [scrollData, setScrollData] = useState({ scrollY: 0, showScrollTop: false });
  const lastRan = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastRan.current >= limit) {
        setScrollData({
          scrollY: window.scrollY,
          showScrollTop: window.scrollY > 300,
        });
        lastRan.current = now;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [limit]);

  return scrollData;
}
