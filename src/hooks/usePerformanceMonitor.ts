
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
  const locationKeyRef = useRef<string>(location.key || 'initial');

  useEffect(() => {
    // Reset metrics and refs when location changes or on initial load
    if (locationKeyRef.current !== location.key) {
      console.log(`Location changed: ${locationKeyRef.current} → ${location.key}`);
      
      // Reset all metrics
      setPageLoadTime(null);
      setRenderLatency(null);
      startTimeRef.current = performance.now();
      latencyMeasuredRef.current = false;
      loadTimeMeasuredRef.current = false;
      locationKeyRef.current = location.key || `${Date.now()}`;
      
      // Force immediate measurement of render latency
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        
        const currentTime = performance.now();
        const latency = Math.round(currentTime - startTimeRef.current);
        
        setRenderLatency(latency);
        latencyMeasuredRef.current = true;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`New Render Latency [${location.pathname}]: ${latency}ms`);
        }
      });

      // Set up performance observer for navigation timing
      if (typeof PerformanceObserver !== 'undefined') {
        const observer = new PerformanceObserver((list) => {
          if (!isMountedRef.current || loadTimeMeasuredRef.current) return;
          
          const perfEntries = list.getEntries();
          if (perfEntries.length > 0) {
            const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
            
            if (navigationEntry) {
              const loadTime = Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart);
              setPageLoadTime(loadTime);
              loadTimeMeasuredRef.current = true;
              
              if (process.env.NODE_ENV === 'development') {
                console.log(`Navigation Timing [${location.pathname}]:`, {
                  loadTime,
                  navigationEntry
                });
              }
            }
          }
        });
        
        observer.observe({ type: 'navigation', buffered: true });
        
        // Clean up observer
        return () => observer.disconnect();
      }
    }

    // Set a backup timeout to measure total page load time if the PerformanceObserver doesn't fire
    const timeoutId = setTimeout(() => {
      if (!isMountedRef.current || loadTimeMeasuredRef.current) return;
      
      const loadTime = Math.round(performance.now() - startTimeRef.current);
      setPageLoadTime(loadTime);
      loadTimeMeasuredRef.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fallback Page Load Time [${location.pathname}]: ${loadTime}ms`);
      }
    }, 1000); // Reduced to 1000ms for faster feedback

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [location]);

  // Add a second useEffect to measure component mount time
  useEffect(() => {
    const mountTime = performance.now() - startTimeRef.current;
    if (!latencyMeasuredRef.current) {
      setRenderLatency(Math.round(mountTime));
      latencyMeasuredRef.current = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Component Mount Time [${location.pathname}]: ${Math.round(mountTime)}ms`);
      }
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { pageLoadTime, renderLatency };
};
