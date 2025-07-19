import React, { useEffect, useState } from 'react';
import { Box, Typography, Chip, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMoreIcon } from '@mui/icons-material';
import { useRUMMonitor } from '../monitoring/rum';
import { useErrorTracker } from '../monitoring/errorTracking';
import { metricsConfig } from '../config/monitoring.config';

interface PerformanceStats {
  vitals: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
  };
  errors: number;
  apiCalls: number;
  avgResponseTime: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const rumMonitor = useRUMMonitor();
  const errorTracker = useErrorTracker();

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showMonitor = process.env.NODE_ENV === 'development' || 
                       localStorage.getItem('show-perf-monitor') === 'true';
    setIsVisible(showMonitor);

    if (showMonitor) {
      const interval = setInterval(() => {
        const metrics = rumMonitor.getMetrics();
        const errors = errorTracker.getErrors();
        
        const vitals = metrics.vitals.reduce((acc, vital) => ({
          ...acc,
          [vital.name.toLowerCase()]: vital.value
        }), { fcp: 0, lcp: 0, fid: 0, cls: 0 });

        const apiCalls = metrics.custom.filter(m => m.name === 'api_call');
        const avgResponseTime = apiCalls.length > 0 
          ? apiCalls.reduce((sum, call) => sum + call.value, 0) / apiCalls.length 
          : 0;

        setStats({
          vitals,
          errors: errors.length,
          apiCalls: apiCalls.length,
          avgResponseTime
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!isVisible || !stats) return null;

  const getVitalStatus = (vital: keyof typeof stats.vitals, value: number) => {
    const thresholds = {
      fcp: metricsConfig.FCP_THRESHOLD,
      lcp: metricsConfig.LCP_THRESHOLD,
      fid: metricsConfig.FID_THRESHOLD,
      cls: metricsConfig.CLS_THRESHOLD
    };

    const threshold = thresholds[vital];
    if (vital === 'cls') {
      return value <= threshold ? 'good' : value <= threshold * 2 ? 'needs-improvement' : 'poor';
    }
    return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'needs-improvement': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        maxWidth: 400,
        bgcolor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        zIndex: 9999
      }}
    >
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Performance Monitor</Typography>
          <Chip 
            label={`${stats.errors} errors`} 
            size="small" 
            color={stats.errors > 0 ? 'error' : 'success'}
            sx={{ ml: 1 }}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Core Web Vitals</Typography>
            
            {Object.entries(stats.vitals).map(([vital, value]) => {
              const status = getVitalStatus(vital as keyof typeof stats.vitals, value);
              return (
                <Box key={vital} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption">{vital.toUpperCase()}</Typography>
                    <Chip 
                      label={`${Math.round(value)}ms`}
                      size="small"
                      color={getStatusColor(status) as any}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((value / (vital === 'cls' ? 0.25 : 3000)) * 100, 100)}
                    color={getStatusColor(status) as any}
                  />
                </Box>
              );
            })}

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>API Performance</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">Calls: {stats.apiCalls}</Typography>
                <Typography variant="caption">
                  Avg: {Math.round(stats.avgResponseTime)}ms
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};