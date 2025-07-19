import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from '@mui/material';
import { useRUMMonitor } from '../monitoring/rum';
import { useErrorTracker } from '../monitoring/errorTracking';

export const MonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const rumMonitor = useRUMMonitor();
  const errorTracker = useErrorTracker();

  useEffect(() => {
    const fetchMetrics = () => {
      const rumMetrics = rumMonitor.getMetrics();
      const errors = errorTracker.getErrors();
      
      setMetrics({
        vitals: rumMetrics.vitals,
        custom: rumMetrics.custom,
        errors
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <LinearProgress />;
  }

  const recentErrors = metrics.errors.slice(-10);
  const apiCalls = metrics.custom.filter((m: any) => m.name === 'api_call');
  const userActions = metrics.custom.filter((m: any) => m.name === 'user_action');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Production Monitoring Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Core Web Vitals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Core Web Vitals</Typography>
              {metrics.vitals.map((vital: any) => (
                <Box key={vital.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{vital.name}</Typography>
                    <Chip 
                      label={`${Math.round(vital.value)}ms`}
                      color={vital.rating === 'good' ? 'success' : vital.rating === 'needs-improvement' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Error Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Error Summary</Typography>
              <Typography variant="h3" color="error">{metrics.errors.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Errors</Typography>
              
              <Box sx={{ mt: 2 }}>
                {['critical', 'high', 'medium', 'low'].map(severity => {
                  const count = metrics.errors.filter((e: any) => e.severity === severity).length;
                  return (
                    <Box key={severity} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption">{severity}</Typography>
                      <Chip label={count} size="small" />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* API Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>API Performance</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Duration (ms)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {apiCalls.slice(-10).map((call: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{call.attributes?.endpoint}</TableCell>
                        <TableCell>{call.attributes?.method}</TableCell>
                        <TableCell>{Math.round(call.value)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={call.attributes?.status}
                            color={call.attributes?.success ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(call.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Errors */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Errors</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Message</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentErrors.map((error: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {error.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={error.severity}
                            color={error.severity === 'critical' ? 'error' : error.severity === 'high' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{error.filename || 'Unknown'}</TableCell>
                        <TableCell>
                          {new Date(error.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};