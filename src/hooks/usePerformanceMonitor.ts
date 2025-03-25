
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to monitor page performance metrics with optimization
 * @returns Object containing loading time and latency information
 */
export const usePerformanceMonitor = () => {
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [renderLatency, setRenderLatency] = useState<number | null>(null);
  const location = useLocation();
  const startTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    // Reset metrics when location changes
    setPageLoadTime(null);
    setRenderLatency(null);
    
    // Start timing immediately when component mounts
    startTimeRef.current = performance.now();
    let frameId: number;
    
    const checkRender = () => {
      if (!isMountedRef.current) return;
      
      // Check if document is ready to be interacted with
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        const currentTime = performance.now();
        const latency = Math.round(currentTime - startTimeRef.current);
        
        // Only set state if component is still mounted and we haven't already measured
        if (isMountedRef.current && !renderLatency) {
          setRenderLatency(latency);
          
          // Log render latency immediately for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log(`Render Latency [${location.pathname}]: ${latency}ms`);
          }
        }
      } else {
        // Continue checking for render completion
        frameId = requestAnimationFrame(checkRender);
      }
    };

    // Start checking for render completion
    frameId = requestAnimationFrame(checkRender);

    // Use the Performance API for more accurate measurements when available
    const observer = typeof PerformanceObserver !== 'undefined' 
      ? new PerformanceObserver((list) => {
          const perfEntries = list.getEntries();
          const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
          
          if (navigationEntry && isMountedRef.current) {
            // Use more accurate navigation timing if available
            const loadTime = Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart);
            setPageLoadTime(loadTime);
          }
        })
      : null;
      
    if (observer) {
      observer.observe({ type: 'navigation', buffered: true });
    }

    // Fallback measurement for total page load
    const handleLoad = () => {
      if (!isMountedRef.current) return;
      
      const loadTime = Math.round(performance.now() - startTimeRef.current);
      if (!pageLoadTime) {
        setPageLoadTime(loadTime);
      }
      
      // Log complete performance data
      if (process.env.NODE_ENV === 'development') {
        console.log(`Page Performance [${location.pathname}]:`, {
          renderLatency: renderLatency || 'measuring...',
          totalLoadTime: loadTime
        });
      }
    };

    // Set a shorter timeout to force a measurement if load event doesn't fire
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !pageLoadTime) {
        handleLoad();
      }
    }, 3000); // Reduced from 5000ms to 3000ms

    window.addEventListener('load', handleLoad);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('load', handleLoad);
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [location.pathname]);

  return { pageLoadTime, renderLatency };
};
