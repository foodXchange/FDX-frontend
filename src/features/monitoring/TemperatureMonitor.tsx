import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tabs,
  Tab,
  Stack,
  Menu,
  MenuItem,
  Divider,
  LinearProgress,
  Alert,
  AlertTitle,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Thermostat,
  Warning,
  ShowChart,
  Refresh,
  Settings,
  MoreHoriz,
  LocationOn,
  Schedule,
  Shield,
  Bolt,
  AcUnit,
  LocalFireDepartment,
  Visibility,
  CheckCircle,
  Battery20,
  Battery50,
  Battery80,
  BatteryFull
} from '@mui/icons-material';
import { format, subHours } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface TemperatureReading {
  id: string;
  sensorId: string;
  sensorName: string;
  location: string;
  temperature: number;
  humidity?: number;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
  batteryLevel?: number;
  relatedShipment?: {
    id: string;
    name: string;
    trackingNumber: string;
  };
}

interface TemperatureSensor {
  id: string;
  name: string;
  location: string;
  type: 'cold_storage' | 'transport' | 'ambient' | 'freezer';
  currentTemp: number;
  targetRange: {
    min: number;
    max: number;
  };
  status: 'online' | 'offline' | 'warning' | 'critical';
  batteryLevel: number;
  lastReading: Date;
  alertsEnabled: boolean;
}

interface TemperatureAlert {
  id: string;
  sensorId: string;
  sensorName: string;
  alertType: 'high_temp' | 'low_temp' | 'sensor_offline' | 'battery_low';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  currentTemp?: number;
  thresholdTemp?: number;
}

interface TemperatureStats {
  totalSensors: number;
  activeSensors: number;
  activeAlerts: number;
  avgTemperature: number;
  complianceRate: number;
}

const sensorTypeConfig: Record<string, { label: string; color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'; icon: React.ReactElement; defaultRange?: { min: number; max: number } }> = {
  cold_storage: {
    label: 'Cold Storage',
    color: 'info',
    icon: <AcUnit />,
    defaultRange: { min: 2, max: 8 },
  },
  transport: {
    label: 'Transport',
    color: 'success',
    icon: <ShowChart />,
    defaultRange: { min: 0, max: 4 },
  },
  ambient: {
    label: 'Ambient',
    color: 'warning',
    icon: <Thermostat />,
    defaultRange: { min: 18, max: 25 },
  },
  freezer: {
    label: 'Freezer',
    color: 'secondary',
    icon: <AcUnit />,
    defaultRange: { min: -25, max: -18 },
  },
};

const statusConfig: Record<string, { label: string; color: 'success' | 'default' | 'warning' | 'error'; icon: React.ReactElement }> = {
  online: { label: 'Online', color: 'success', icon: <CheckCircle /> },
  offline: { label: 'Offline', color: 'default', icon: <Schedule /> },
  warning: { label: 'Warning', color: 'warning', icon: <Warning /> },
  critical: { label: 'Critical', color: 'error', icon: <Warning /> },
};

const alertTypeConfig: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
  high_temp: { label: 'High Temperature', icon: <LocalFireDepartment />, color: 'error.main' },
  low_temp: { label: 'Low Temperature', icon: <AcUnit />, color: 'info.main' },
  sensor_offline: { label: 'Sensor Offline', icon: <Bolt />, color: 'text.secondary' },
  battery_low: { label: 'Low Battery', icon: <Bolt />, color: 'warning.main' },
};

const getTemperatureStatus = (temp: number, range: { min: number; max: number }): 'normal' | 'warning' | 'critical' => {
  if (temp < range.min - 2 || temp > range.max + 2) return 'critical';
  if (temp < range.min || temp > range.max) return 'warning';
  return 'normal';
};

const generateMockData = () => {
  const sensors: TemperatureSensor[] = [
    {
      id: 'SENS-001',
      name: 'Cold Storage A',
      location: 'Warehouse Section A1',
      type: 'cold_storage',
      currentTemp: 4.2,
      targetRange: { min: 2, max: 8 },
      status: 'online',
      batteryLevel: 87,
      lastReading: new Date(),
      alertsEnabled: true,
    },
    {
      id: 'SENS-002',
      name: 'Transport Truck #1',
      location: 'Vehicle TRK-001',
      type: 'transport',
      currentTemp: -0.5,
      targetRange: { min: -2, max: 2 },
      status: 'warning',
      batteryLevel: 45,
      lastReading: subHours(new Date(), 1),
      alertsEnabled: true,
    },
    {
      id: 'SENS-003',
      name: 'Freezer Unit B',
      location: 'Warehouse Section B2',
      type: 'freezer',
      currentTemp: -22.1,
      targetRange: { min: -25, max: -18 },
      status: 'online',
      batteryLevel: 92,
      lastReading: new Date(),
      alertsEnabled: true,
    },
    {
      id: 'SENS-004',
      name: 'Loading Dock',
      location: 'Main Loading Area',
      type: 'ambient',
      currentTemp: 23.5,
      targetRange: { min: 18, max: 25 },
      status: 'online',
      batteryLevel: 78,
      lastReading: new Date(),
      alertsEnabled: true,
    },
    {
      id: 'SENS-005',
      name: 'Transport Truck #2',
      location: 'Vehicle TRK-002',
      type: 'transport',
      currentTemp: 8.7,
      targetRange: { min: 2, max: 8 },
      status: 'critical',
      batteryLevel: 15,
      lastReading: subHours(new Date(), 3),
      alertsEnabled: true,
    },
  ];

  const alerts: TemperatureAlert[] = [
    {
      id: 'ALERT-001',
      sensorId: 'SENS-005',
      sensorName: 'Transport Truck #2',
      alertType: 'high_temp',
      severity: 'high',
      message: 'Temperature exceeds acceptable range for cold chain transport',
      timestamp: subHours(new Date(), 2),
      acknowledged: false,
      currentTemp: 8.7,
      thresholdTemp: 8,
    },
    {
      id: 'ALERT-002',
      sensorId: 'SENS-002',
      sensorName: 'Transport Truck #1',
      alertType: 'battery_low',
      severity: 'medium',
      message: 'Sensor battery level below 50%',
      timestamp: subHours(new Date(), 6),
      acknowledged: false,
    },
    {
      id: 'ALERT-003',
      sensorId: 'SENS-005',
      sensorName: 'Transport Truck #2',
      alertType: 'battery_low',
      severity: 'high',
      message: 'Critical battery level - sensor may go offline soon',
      timestamp: subHours(new Date(), 12),
      acknowledged: true,
    },
  ];

  const readings: TemperatureReading[] = [];
  
  // Generate historical readings for each sensor
  sensors.forEach(sensor => {
    for (let i = 0; i < 24; i++) {
      const baseTemp = sensor.currentTemp;
      const variation = (Math.random() - 0.5) * 2; // ±1 degree variation
      const temp = baseTemp + variation;
      
      readings.push({
        id: `${sensor.id}-${i}`,
        sensorId: sensor.id,
        sensorName: sensor.name,
        location: sensor.location,
        temperature: Math.round(temp * 10) / 10,
        humidity: Math.round((50 + Math.random() * 30) * 10) / 10,
        timestamp: subHours(new Date(), 24 - i),
        status: getTemperatureStatus(temp, sensor.targetRange),
        batteryLevel: sensor.batteryLevel,
      });
    }
  });

  return { sensors, alerts, readings };
};

export const TemperatureMonitor: React.FC = () => {
  const [sensors, setSensors] = useState<TemperatureSensor[]>([]);
  const [alerts, setAlerts] = useState<TemperatureAlert[]>([]);
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TemperatureStats>({
    totalSensors: 0,
    activeSensors: 0,
    activeAlerts: 0,
    avgTemperature: 0,
    complianceRate: 0,
  });

  useEffect(() => {
    // Initialize with mock data
    const { sensors: mockSensors, alerts: mockAlerts, readings: mockReadings } = generateMockData();
    
    setSensors(mockSensors);
    setAlerts(mockAlerts);
    setReadings(mockReadings);

    // Calculate stats
    const activeSensors = mockSensors.filter(s => s.status === 'online').length;
    const activeAlerts = mockAlerts.filter(a => !a.acknowledged).length;
    const avgTemp = mockSensors.reduce((sum, s) => sum + s.currentTemp, 0) / mockSensors.length;
    const compliantSensors = mockSensors.filter(s => 
      getTemperatureStatus(s.currentTemp, s.targetRange) === 'normal'
    ).length;
    const complianceRate = (compliantSensors / mockSensors.length) * 100;

    setStats({
      totalSensors: mockSensors.length,
      activeSensors,
      activeAlerts,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      complianceRate: Math.round(complianceRate),
    });

    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setSensors(prevSensors => 
        prevSensors.map(sensor => ({
          ...sensor,
          currentTemp: Math.round((sensor.currentTemp + (Math.random() - 0.5) * 0.5) * 10) / 10,
          lastReading: new Date(),
        }))
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAlertAction = (action: string, alertId: string) => {
    if (action === 'acknowledge') {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    }
  };

  const handleSensorAction = (action: string, sensorId: string) => {
    console.log(`Action: ${action} for sensor ${sensorId}`);
    // TODO: Implement sensor actions
  };

  const getStatusChip = (status: TemperatureSensor['status']) => {
    const config = statusConfig[status];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getTypeChip = (type: TemperatureSensor['type']) => {
    const config = sensorTypeConfig[type];
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getTemperatureColor = (temp: number, range: { min: number; max: number }) => {
    const status = getTemperatureStatus(temp, range);
    switch (status) {
      case 'critical': return 'error.main';
      case 'warning': return 'warning.main';
      default: return 'success.main';
    }
  };

  const getAlertIcon = (alertType: TemperatureAlert['alertType']) => {
    const config = alertTypeConfig[alertType];
    return React.cloneElement(config.icon, { sx: { fontSize: 16, color: config.color } });
  };

  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sensorId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSensorId(sensorId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSensorId(null);
  };

  const getBatteryIcon = (level: number) => {
    if (level > 80) return <BatteryFull />;
    if (level > 50) return <Battery80 />;
    if (level > 20) return <Battery50 />;
    return <Battery20 />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Loading temperature data...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Temperature Monitor
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time cold chain monitoring and compliance
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" size="small" startIcon={<Refresh />}>
            Refresh
          </Button>
          <Button variant="outlined" size="small" startIcon={<Settings />}>
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Total Sensors"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<Thermostat color="primary" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.totalSensors}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.activeSensors} currently online
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Active Alerts"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<Warning color="error" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.activeAlerts}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Require attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Avg Temperature"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<ShowChart color="success" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.avgTemperature}°C
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all sensors
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              title="Compliance Rate"
              titleTypographyProps={{ variant: 'body2' }}
              avatar={<Shield color="success" />}
            />
            <CardContent>
              <Typography variant="h4" component="div">
                {stats.complianceRate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Within target range
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="temperature monitor tabs">
          <Tab label="Sensors" />
          <Tab label="Alerts" />
          <Tab label="Recent Readings" />
          <Tab label="Charts" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader
              title="Temperature Sensors"
              subheader="Monitor all temperature sensors across your facilities"
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sensor</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Current Temp</TableCell>
                      <TableCell>Target Range</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Battery</TableCell>
                      <TableCell>Last Reading</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sensors.map((sensor) => (
                      <TableRow key={sensor.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {sensor.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                {sensor.location}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{getTypeChip(sensor.type)}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={getTemperatureColor(sensor.currentTemp, sensor.targetRange)}
                          >
                            {sensor.currentTemp}°C
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {sensor.targetRange.min}°C to {sensor.targetRange.max}°C
                          </Typography>
                        </TableCell>
                        <TableCell>{getStatusChip(sensor.status)}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {React.cloneElement(getBatteryIcon(sensor.batteryLevel), {
                              sx: {
                                fontSize: 20,
                                color: sensor.batteryLevel > 50 ? 'success.main' :
                                       sensor.batteryLevel > 20 ? 'warning.main' : 'error.main'
                              }
                            })}
                            <Typography
                              variant="body2"
                              color={
                                sensor.batteryLevel > 50 ? 'success.main' :
                                sensor.batteryLevel > 20 ? 'warning.main' : 'error.main'
                              }
                            >
                              {sensor.batteryLevel}%
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {format(sensor.lastReading, 'MMM dd, HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, sensor.id)}
                          >
                            <MoreHoriz />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader
              title="Temperature Alerts"
              subheader="Active alerts and notifications requiring attention"
            />
            <CardContent>
              <Stack spacing={2}>
                {alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    severity={
                      alert.severity === 'high' ? 'error' :
                      alert.severity === 'medium' ? 'warning' : 'info'
                    }
                    icon={getAlertIcon(alert.alertType)}
                    sx={{
                      opacity: alert.acknowledged ? 0.7 : 1,
                      bgcolor: alert.acknowledged ? 'action.disabledBackground' : undefined
                    }}
                    action={
                      !alert.acknowledged && (
                        <Button
                          size="small"
                          onClick={() => handleAlertAction('acknowledge', alert.id)}
                          startIcon={<CheckCircle />}
                        >
                          Acknowledge
                        </Button>
                      )
                    }
                  >
                    <AlertTitle>
                      {alertTypeConfig[alert.alertType].label}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {alert.sensorName}
                      </Typography>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={
                          alert.severity === 'high' ? 'error' :
                          alert.severity === 'medium' ? 'warning' : 'info'
                        }
                        sx={{ ml: 2 }}
                      />
                    </AlertTitle>
                    <Typography variant="body2">
                      {alert.message}
                    </Typography>
                    {alert.currentTemp && alert.thresholdTemp && (
                      <Typography variant="caption" color="text.secondary">
                        Current: {alert.currentTemp}°C | Threshold: {alert.thresholdTemp}°C
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Schedule sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                      </Typography>
                      {alert.acknowledged && (
                        <Typography variant="caption" color="success.main">
                          • Acknowledged
                        </Typography>
                      )}
                    </Box>
                  </Alert>
                ))}
                {alerts.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CheckCircle sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      No active alerts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All temperature sensors are operating normally
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader
              title="Recent Temperature Readings"
              subheader="Latest temperature and humidity readings from all sensors"
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sensor</TableCell>
                      <TableCell>Temperature</TableCell>
                      <TableCell>Humidity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Battery</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {readings.slice(0, 20).map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {reading.sensorName}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn sx={{ fontSize: 14 }} />
                              <Typography variant="caption" color="text.secondary">
                                {reading.location}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={
                              reading.status === 'critical' ? 'error.main' :
                              reading.status === 'warning' ? 'warning.main' :
                              'success.main'
                            }
                          >
                            {reading.temperature}°C
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {reading.humidity ? `${reading.humidity}%` : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reading.status}
                            size="small"
                            color={
                              reading.status === 'critical' ? 'error' :
                              reading.status === 'warning' ? 'warning' :
                              'success'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {format(reading.timestamp, 'MMM dd, HH:mm:ss')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {reading.batteryLevel ? `${reading.batteryLevel}%` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader title="Temperature Charts" />
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <ShowChart sx={{ fontSize: 64, color: 'action.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  Temperature charts would be displayed here
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Integrates with charting library for historical data visualization
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Paper>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedSensorId) {
            handleSensorAction('view', selectedSensorId);
            handleMenuClose();
          }
        }}>
          <Visibility sx={{ mr: 1, fontSize: 18 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedSensorId) {
            handleSensorAction('configure', selectedSensorId);
            handleMenuClose();
          }
        }}>
          <Settings sx={{ mr: 1, fontSize: 18 }} />
          Configure
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedSensorId) {
            handleSensorAction('calibrate', selectedSensorId);
            handleMenuClose();
          }
        }}>
          <ShowChart sx={{ mr: 1, fontSize: 18 }} />
          Calibrate
        </MenuItem>
      </Menu>
    </Box>
  );
};