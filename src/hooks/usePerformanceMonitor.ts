
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Optimized hook to monitor page performance metrics
 * @returns Object containing loading time and latency information
 */
export const usePerformanceMonitor = () => {
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [renderLatency, setRenderLatency] = useState<number | null>(null);
  const location = useLocation();
  const startTimeRef = useRef<number>(performance.now());
  const isMountedRef = useRef<boolean>(true);
  const latencyMeasuredRef = useRef<boolean>(false);
  const loadTimeMeasuredRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset metrics and refs when location changes
    setPageLoadTime(null);
    setRenderLatency(null);
    startTimeRef.current = performance.now();
    latencyMeasuredRef.current = false;
    loadTimeMeasuredRef.current = false;
    
    // Use a single RAF call for initial render measurement
    // This helps reduce overhead from multiple RAF calls
    const frameId = requestAnimationFrame(() => {
      if (!isMountedRef.current || latencyMeasuredRef.current) return;
      
      const currentTime = performance.now();
      const latency = Math.round(currentTime - startTimeRef.current);
      
      setRenderLatency(latency);
      latencyMeasuredRef.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Render Latency [${location.pathname}]: ${latency}ms`);
      }
    });

    // Use only one observer to avoid performance overhead
    let observer: PerformanceObserver | null = null;
    
    if (typeof PerformanceObserver !== 'undefined') {
      observer = new PerformanceObserver((list) => {
        if (!isMountedRef.current || loadTimeMeasuredRef.current) return;
        
        const perfEntries = list.getEntries();
        const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
        
        if (navigationEntry) {
          const loadTime = Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart);
          setPageLoadTime(loadTime);
          loadTimeMeasuredRef.current = true;
        }
      });
      
      observer.observe({ type: 'navigation', buffered: true });
    }

    // Shorter timeout for force measurement (1500ms instead of 3000ms)
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current || loadTimeMeasuredRef.current) return;
      
      const loadTime = Math.round(performance.now() - startTimeRef.current);
      setPageLoadTime(loadTime);
      loadTimeMeasuredRef.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Page Performance [${location.pathname}]:`, {
          renderLatency: renderLatency || 'measuring...',
          totalLoadTime: loadTime
        });
      }
    }, 1500);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      observer?.disconnect();
    };
  }, [location.pathname]);

  return { pageLoadTime, renderLatency };
};
