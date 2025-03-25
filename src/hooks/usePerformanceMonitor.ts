
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to monitor page performance metrics
 * @returns Object containing loading time and latency information
 */
export const usePerformanceMonitor = () => {
  const [pageLoadTime, setPageLoadTime] = useState<number | null>(null);
  const [renderLatency, setRenderLatency] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Reset metrics when location changes
    setPageLoadTime(null);
    setRenderLatency(null);
    
    const startTime = performance.now();
    let frameId: number;

    // Use requestAnimationFrame to measure when the page is visually rendered
    const checkRender = () => {
      if (document.readyState === 'complete') {
        const currentTime = performance.now();
        setRenderLatency(Math.round(currentTime - startTime));
      } else {
        frameId = requestAnimationFrame(checkRender);
      }
    };

    frameId = requestAnimationFrame(checkRender);

    // Measure total page load time
    const handleLoad = () => {
      const loadTime = Math.round(performance.now() - startTime);
      setPageLoadTime(loadTime);
      
      // Log performance data to help with debugging
      console.log(`Page Performance [${location.pathname}]:`, {
        renderLatency: renderLatency || 'measuring...',
        totalLoadTime: loadTime
      });
    };

    // Use a timeout to ensure we always get a measurement even if some resources are slow
    const timeoutId = setTimeout(() => {
      if (!pageLoadTime) {
        handleLoad();
      }
    }, 5000);

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  return { pageLoadTime, renderLatency };
};
