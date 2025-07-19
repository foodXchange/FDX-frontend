import { renderHook, act } from '@testing-library/react';
import { usePerformanceOptimization } from '../usePerformanceOptimization';

describe('usePerformanceOptimization', () => {
  it('should initialize with default device capabilities', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    expect(result.current.deviceCapabilities).toBeDefined();
    expect(result.current.deviceCapabilities.memory).toBeGreaterThan(0);
  });

  it('should track performance metrics', () => {
    const { result } = renderHook(() => usePerformanceOptimization());
    
    act(() => {
      result.current.trackMetric('test-metric', 100);
    });
    
    expect(result.current.metrics).toHaveProperty('test-metric');
  });
});
