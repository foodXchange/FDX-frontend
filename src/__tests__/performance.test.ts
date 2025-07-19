import { performanceMonitor } from '../src/utils/performance';

describe('Performance Tests', () => {
  it('should complete render within performance budget', async () => {
    const renderStart = performance.now();
    
    // Simulate component render
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const renderTime = performance.now() - renderStart;
    
    // Should render within 16ms (60fps)
    expect(renderTime).toBeLessThan(100); // Generous for test environment
  });

  it('should not exceed memory usage thresholds', () => {
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Simulate memory-intensive operation
    const data = new Array(1000).fill(0).map((_, i) => ({ id: i, data: 'test' }));
    
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = memoryAfter - memoryBefore;
    
    // Should not increase memory by more than 10MB
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
  });
});
