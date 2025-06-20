import { trackPerformance } from '@/utils/analytics';
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime?: number;
}

export const usePerformanceMonitor = (
  pageName: string,
  targetLoadTime: number = 2000
) => {
  const startTimeRef = useRef<number>(performance.now());
  const renderTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Mark render complete
    renderTimeRef.current = performance.now();

    const loadTime = renderTimeRef.current - startTimeRef.current;

    // Track performance metrics
    trackPerformance(`${pageName}_load`, loadTime, {
      page: pageName,
      meets_target: loadTime < targetLoadTime,
      target_ms: targetLoadTime,
    });

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${pageName} loaded in ${loadTime.toFixed(2)}ms`
      );

      if (loadTime > targetLoadTime) {
        console.warn(
          `[Performance] ${pageName} exceeded ${targetLoadTime}ms target`
        );
      }
    }

    return () => {
      const startTime = startTimeRef.current;
      const renderTime = renderTimeRef.current;
      if (startTime) {
        const timeOnPage = performance.now() - startTime;
        trackPerformance(`${pageName}_engagement`, timeOnPage, {
          page: pageName,
          engagement_level: timeOnPage > 10000 ? 'high' : timeOnPage > 3000 ? 'medium' : 'low',
        });
      }
    };
  }, [pageName, targetLoadTime]);

  const trackInteraction = (interactionName: string) => {
    const interactionTime =
      performance.now() - (renderTimeRef.current || startTimeRef.current);

    trackPerformance(`${pageName}_interaction`, interactionTime, {
      page: pageName,
      interaction: interactionName,
      time_to_interaction: interactionTime,
    });
  };

  return { trackInteraction };
};
