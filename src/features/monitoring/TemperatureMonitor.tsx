import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Thermometer,
  AlertTriangle,
  Activity,
  RefreshCw,
  Settings,
  MoreHorizontal,
  MapPin,
  Clock,
  Shield,
  Zap,
  Snowflake,
  Flame,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { format, subHours } from 'date-fns';

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

const sensorTypeConfig = {
  cold_storage: {
    label: 'Cold Storage',
    color: 'bg-blue-100 text-blue-700',
    icon: Snowflake,
    defaultRange: { min: 2, max: 8 },
  },
  transport: {
    label: 'Transport',
    color: 'bg-green-100 text-green-700',
    icon: Activity,
    defaultRange: { min: 0, max: 4 },
  },
  ambient: {
    label: 'Ambient',
    color: 'bg-yellow-100 text-yellow-700',
    icon: Thermometer,
    defaultRange: { min: 18, max: 25 },
  },
  freezer: {
    label: 'Freezer',
    color: 'bg-purple-100 text-purple-700',
    icon: Snowflake,
    defaultRange: { min: -25, max: -18 },
  },
};

const statusConfig = {
  online: { label: 'Online', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-700', icon: Clock },
  warning: { label: 'Warning', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const alertTypeConfig = {
  high_temp: { label: 'High Temperature', icon: Flame, color: 'text-red-600' },
  low_temp: { label: 'Low Temperature', icon: Snowflake, color: 'text-blue-600' },
  sensor_offline: { label: 'Sensor Offline', icon: Zap, color: 'text-gray-600' },
  battery_low: { label: 'Low Battery', icon: Zap, color: 'text-yellow-600' },
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

  const getStatusBadge = (status: TemperatureSensor['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: TemperatureSensor['type']) => {
    const config = sensorTypeConfig[type];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTemperatureColor = (temp: number, range: { min: number; max: number }) => {
    const status = getTemperatureStatus(temp, range);
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getAlertIcon = (alertType: TemperatureAlert['alertType']) => {
    const config = alertTypeConfig[alertType];
    const Icon = config.icon;
    return <Icon className={cn("h-4 w-4", config.color)} />;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading temperature data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Temperature Monitor</h1>
          <p className="text-muted-foreground">
            Real-time cold chain monitoring and compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
            <Thermometer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSensors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSensors} currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgTemperature}°C</div>
            <p className="text-xs text-muted-foreground">Across all sensors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">Within target range</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sensors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="readings">Recent Readings</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="sensors">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Sensors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor all temperature sensors across your facilities
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sensor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Temp</TableHead>
                    <TableHead>Target Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{sensor.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {sensor.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(sensor.type)}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-lg font-bold",
                          getTemperatureColor(sensor.currentTemp, sensor.targetRange)
                        )}>
                          {sensor.currentTemp}°C
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {sensor.targetRange.min}°C to {sensor.targetRange.max}°C
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(sensor.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm",
                            sensor.batteryLevel > 50 ? "text-green-600" :
                            sensor.batteryLevel > 20 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {sensor.batteryLevel}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(sensor.lastReading, 'MMM dd, HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleSensorAction('view', sensor.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleSensorAction('configure', sensor.id)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleSensorAction('calibrate', sensor.id)}
                            >
                              <Activity className="h-4 w-4 mr-2" />
                              Calibrate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Alerts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Active alerts and notifications requiring attention
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border",
                      alert.acknowledged ? "bg-muted/30" : "bg-muted/50",
                      alert.severity === 'high' && !alert.acknowledged && "border-red-200 bg-red-50"
                    )}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alertTypeConfig[alert.alertType].label}</h4>
                          <p className="text-sm text-muted-foreground">{alert.sensorName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            className={cn(
                              alert.severity === 'high' ? "bg-red-100 text-red-700" :
                              alert.severity === 'medium' ? "bg-yellow-100 text-yellow-700" :
                              "bg-blue-100 text-blue-700"
                            )}
                          >
                            {alert.severity}
                          </Badge>
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAlertAction('acknowledge', alert.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mt-2">{alert.message}</p>
                      {alert.currentTemp && alert.thresholdTemp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {alert.currentTemp}°C | Threshold: {alert.thresholdTemp}°C
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(alert.timestamp, 'MMM dd, yyyy HH:mm')}
                        {alert.acknowledged && (
                          <span className="ml-2 text-green-600">• Acknowledged</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-xs">All temperature sensors are operating normally</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>Recent Temperature Readings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest temperature and humidity readings from all sensors
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sensor</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Humidity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Battery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readings.slice(0, 20).map((reading) => (
                    <TableRow key={reading.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{reading.sensorName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {reading.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-bold",
                          reading.status === 'critical' ? "text-red-600" :
                          reading.status === 'warning' ? "text-yellow-600" : "text-green-600"
                        )}>
                          {reading.temperature}°C
                        </span>
                      </TableCell>
                      <TableCell>
                        {reading.humidity ? `${reading.humidity}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          reading.status === 'critical' ? "bg-red-100 text-red-700" :
                          reading.status === 'warning' ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        )}>
                          {reading.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {format(reading.timestamp, 'MMM dd, HH:mm:ss')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {reading.batteryLevel ? `${reading.batteryLevel}%` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Temperature charts would be displayed here</p>
                <p className="text-xs">Integrates with charting library for historical data visualization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};