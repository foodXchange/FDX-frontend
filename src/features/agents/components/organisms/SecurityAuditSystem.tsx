import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Switch,
  Grid,
  LinearProgress,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Security,
  ExpandMore,
  Shield,
  Visibility,
  Warning,
  History,
  Person,
  Computer,
  Download,
  Upload,
  Delete,
  Edit,
  Add,
  Refresh,
  VerifiedUser,
  Logout,
  Login,
  PhoneAndroid,
  Laptop,
  DesktopWindows,
  Smartphone,
  Key,
  PolicySharp,
} from '@mui/icons-material';
import { useAgentStore } from '../../store';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failed' | 'blocked';
}

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  ipAddress: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  mitigationActions: string[];
}

interface LoginSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: {
    country: string;
    city: string;
  };
  startTime: string;
  lastActivity: string;
  isActive: boolean;
  riskScore: number;
  authMethod: 'password' | 'mfa' | 'sso' | 'biometric';
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  deviceId: string;
  isTrusted: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: SecurityRule[];
  lastUpdated: string;
  createdBy: string;
}

interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'block' | 'warn' | 'require_mfa';
  parameters: Record<string, any>;
}

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedAttempts: number;
  activeSessionsCount: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  complianceScore: number;
}

type AuditAction = 
  | 'login' | 'logout' | 'password_change' | 'mfa_setup' | 'mfa_disable'
  | 'lead_view' | 'lead_edit' | 'lead_delete' | 'lead_export'
  | 'commission_view' | 'report_generate' | 'settings_change'
  | 'file_upload' | 'file_download' | 'api_access'
  | 'user_create' | 'user_edit' | 'user_delete'
  | 'permission_change' | 'role_assign';

type SecurityEventType = 
  | 'failed_login' | 'suspicious_location' | 'unusual_activity'
  | 'data_access_violation' | 'permission_escalation'
  | 'unauthorized_api_access' | 'malware_detected'
  | 'brute_force_attempt' | 'session_hijacking';

const SecurityAuditSystem: React.FC = () => {
  const theme = useTheme();
  const { } = useAgentStore();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, [dateRange]);

  const loadSecurityData = () => {
    // Mock data - would come from API
    const mockAuditLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        userId: 'agent-1',
        userName: 'John Doe',
        action: 'login',
        resource: 'dashboard',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: { country: 'USA', city: 'New York', coordinates: [40.7128, -74.0060] },
        riskLevel: 'low',
        status: 'success',
        details: { method: 'password', mfa: true },
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'agent-1',
        userName: 'John Doe',
        action: 'lead_export',
        resource: 'leads',
        resourceId: 'lead-123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        riskLevel: 'medium',
        status: 'success',
        details: { format: 'csv', recordCount: 150 },
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: 'unknown',
        userName: 'Unknown User',
        action: 'login',
        resource: 'authentication',
        ipAddress: '185.220.101.182',
        userAgent: 'curl/7.68.0',
        location: { country: 'Russia', city: 'Moscow', coordinates: [55.7558, 37.6176] },
        riskLevel: 'critical',
        status: 'blocked',
        details: { reason: 'suspicious_location', attempts: 5 },
      },
    ];

    const mockSecurityEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'failed_login',
        severity: 'medium',
        title: 'Multiple Failed Login Attempts',
        description: '5 failed login attempts from IP 185.220.101.182 in the last 10 minutes',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        ipAddress: '185.220.101.182',
        resolved: true,
        resolvedAt: new Date(Date.now() - 300000).toISOString(),
        resolvedBy: 'system',
        mitigationActions: ['IP blocked', 'Account temporarily locked'],
      },
      {
        id: '2',
        type: 'suspicious_location',
        severity: 'high',
        title: 'Login from Unusual Location',
        description: 'User logged in from a new country (Russia) without prior travel notification',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        userId: 'agent-1',
        ipAddress: '185.220.101.182',
        resolved: false,
        mitigationActions: ['MFA required', 'Location flagged'],
      },
      {
        id: '3',
        type: 'data_access_violation',
        severity: 'critical',
        title: 'Unauthorized Data Export Attempt',
        description: 'Attempt to export sensitive customer data without proper authorization',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        userId: 'agent-2',
        ipAddress: '192.168.1.150',
        resolved: true,
        resolvedAt: new Date(Date.now() - 10200000).toISOString(),
        resolvedBy: 'admin-1',
        mitigationActions: ['Export blocked', 'User notified', 'Manager alerted'],
      },
    ];

    const mockLoginSessions: LoginSession[] = [
      {
        id: '1',
        userId: 'agent-1',
        deviceInfo: {
          type: 'desktop',
          os: 'Windows 10',
          browser: 'Chrome 96.0',
          deviceId: 'device-123',
          isTrusted: true,
        },
        ipAddress: '192.168.1.100',
        location: { country: 'USA', city: 'New York' },
        startTime: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date(Date.now() - 300000).toISOString(),
        isActive: true,
        riskScore: 15,
        authMethod: 'mfa',
      },
      {
        id: '2',
        userId: 'agent-1',
        deviceInfo: {
          type: 'mobile',
          os: 'iOS 15.0',
          browser: 'Safari 15.0',
          deviceId: 'device-456',
          isTrusted: true,
        },
        ipAddress: '192.168.1.101',
        location: { country: 'USA', city: 'New York' },
        startTime: new Date(Date.now() - 86400000).toISOString(),
        lastActivity: new Date(Date.now() - 7200000).toISOString(),
        isActive: false,
        riskScore: 25,
        authMethod: 'password',
      },
    ];

    const mockSecurityPolicies: SecurityPolicy[] = [
      {
        id: '1',
        name: 'Multi-Factor Authentication Policy',
        description: 'Requires MFA for all users accessing sensitive data',
        enabled: true,
        rules: [
          {
            id: '1',
            condition: 'accessing_sensitive_data',
            action: 'require_mfa',
            parameters: { dataTypes: ['leads', 'commissions', 'reports'] },
          },
        ],
        lastUpdated: new Date().toISOString(),
        createdBy: 'admin-1',
      },
      {
        id: '2',
        name: 'Geographic Access Control',
        description: 'Blocks access from high-risk countries',
        enabled: true,
        rules: [
          {
            id: '2',
            condition: 'location_risk_high',
            action: 'block',
            parameters: { countries: ['CN', 'RU', 'IR'], riskThreshold: 80 },
          },
        ],
        lastUpdated: new Date(Date.now() - 86400000).toISOString(),
        createdBy: 'admin-1',
      },
    ];

    const mockMetrics: SecurityMetrics = {
      totalLogins: 1247,
      failedLogins: 23,
      suspiciousActivities: 5,
      blockedAttempts: 12,
      activeSessionsCount: 8,
      riskDistribution: {
        low: 1180,
        medium: 52,
        high: 13,
        critical: 2,
      },
      complianceScore: 94,
    };

    setAuditLogs(mockAuditLogs);
    setSecurityEvents(mockSecurityEvents);
    setLoginSessions(mockLoginSessions);
    setSecurityPolicies(mockSecurityPolicies);
    setSecurityMetrics(mockMetrics);
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'login': return <Login />;
      case 'logout': return <Logout />;
      case 'lead_view': case 'lead_edit': return <Visibility />;
      case 'lead_delete': return <Delete />;
      case 'lead_export': case 'file_download': return <Download />;
      case 'file_upload': return <Upload />;
      case 'settings_change': return <Edit />;
      case 'password_change': return <Key />;
      case 'mfa_setup': return <Shield />;
      default: return <History />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone />;
      case 'tablet': return <PhoneAndroid />;
      case 'desktop': return <DesktopWindows />;
      default: return <Laptop />;
    }
  };

  const SecurityOverview = () => (
    <Grid container spacing={3}>
      {/* Metrics Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, mr: 2 }}>
                <VerifiedUser />
              </Avatar>
              <Typography variant="h6">Compliance Score</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              {securityMetrics?.complianceScore}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={securityMetrics?.complianceScore || 0}
              sx={{ mt: 1, height: 6, borderRadius: 3 }}
            />
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.info.light, mr: 2 }}>
                <Computer />
              </Avatar>
              <Typography variant="h6">Active Sessions</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {securityMetrics?.activeSessionsCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current user sessions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                <Warning />
              </Avatar>
              <Typography variant="h6">Security Events</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {securityEvents.filter(e => !e.resolved).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unresolved events
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: theme.palette.error.light, mr: 2 }}>
                <Shield />
              </Avatar>
              <Typography variant="h6">Failed Logins</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {securityMetrics?.failedLogins}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last 24 hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Distribution */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Risk Distribution</Typography>
            {securityMetrics && Object.entries(securityMetrics.riskDistribution).map(([level, count]) => (
              <Box key={level} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {level} Risk
                  </Typography>
                  <Typography variant="body2">{count}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(count / securityMetrics.totalLogins) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(getRiskColor(level), 0.2),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getRiskColor(level),
                    },
                  }}
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Security Events */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Security Events</Typography>
            <List>
              {securityEvents.slice(0, 3).map((event) => (
                <ListItem key={event.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getRiskColor(event.severity) }}>
                      <Warning />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {event.description}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(event.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={event.resolved ? 'Resolved' : 'Active'}
                      color={event.resolved ? 'success' : 'error'}
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const AuditLogsTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Timestamp</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Resource</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Risk Level</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Typography variant="body2">
                  {new Date(log.timestamp).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24 }}>
                    <Person />
                  </Avatar>
                  {log.userName}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getActionIcon(log.action)}
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {log.action.replace('_', ' ')}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {log.resource}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {log.ipAddress}
                </Typography>
                {log.location && (
                  <Typography variant="caption" color="text.secondary">
                    {log.location.city}, {log.location.country}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={log.riskLevel}
                  size="small"
                  sx={{
                    bgcolor: alpha(getRiskColor(log.riskLevel), 0.1),
                    color: getRiskColor(log.riskLevel),
                    textTransform: 'capitalize',
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={log.status}
                  size="small"
                  color={
                    log.status === 'success' ? 'success' :
                    log.status === 'failed' ? 'warning' : 'error'
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const SecurityEventsTab = () => (
    <List>
      {securityEvents.map((event) => (
        <ListItem
          key={event.id}
          sx={{
            mb: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            backgroundColor: event.resolved ? 'transparent' : alpha(getRiskColor(event.severity), 0.05),
          }}
        >
          <ListItemAvatar>
            <Badge variant="dot" color={event.resolved ? 'success' : 'error'}>
              <Avatar sx={{ bgcolor: getRiskColor(event.severity) }}>
                <Warning />
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">{event.title}</Typography>
                <Chip
                  label={event.severity}
                  size="small"
                  sx={{
                    bgcolor: alpha(getRiskColor(event.severity), 0.1),
                    color: getRiskColor(event.severity),
                  }}
                />
                <Chip
                  label={event.type.replace('_', ' ')}
                  size="small"
                  variant="outlined"
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {event.description}
                </Typography>
                <Typography variant="caption">
                  {new Date(event.timestamp).toLocaleString()} • IP: {event.ipAddress}
                </Typography>
                {event.mitigationActions.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Mitigation Actions:
                    </Typography>
                    {event.mitigationActions.map((action, index) => (
                      <Chip
                        key={index}
                        label={action}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 0.5, mt: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={event.resolved ? 'outlined' : 'contained'}
                color={event.resolved ? 'success' : 'primary'}
                onClick={() => {
                  setSelectedEvent(event);
                  setShowEventDialog(true);
                }}
              >
                {event.resolved ? 'View' : 'Resolve'}
              </Button>
            </Box>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  const ActiveSessionsTab = () => (
    <List>
      {loginSessions.map((session) => (
        <ListItem
          key={session.id}
          sx={{
            mb: 1,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            backgroundColor: session.isActive ? alpha(theme.palette.success.main, 0.05) : 'transparent',
          }}
        >
          <ListItemAvatar>
            <Badge
              variant="dot"
              color={session.isActive ? 'success' : 'default'}
            >
              <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                {getDeviceIcon(session.deviceInfo.type)}
              </Avatar>
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">
                  {session.deviceInfo.os} • {session.deviceInfo.browser}
                </Typography>
                <Chip
                  label={session.authMethod.toUpperCase()}
                  size="small"
                  color={session.authMethod === 'mfa' ? 'success' : 'default'}
                />
                <Chip
                  label={session.deviceInfo.isTrusted ? 'Trusted' : 'Untrusted'}
                  size="small"
                  color={session.deviceInfo.isTrusted ? 'success' : 'warning'}
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  IP: {session.ipAddress} • {session.location?.city}, {session.location?.country}
                </Typography>
                <Typography variant="caption">
                  Started: {new Date(session.startTime).toLocaleString()} • 
                  Last Activity: {new Date(session.lastActivity).toLocaleString()}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption">Risk Score:</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={session.riskScore}
                    sx={{
                      width: 100,
                      height: 4,
                      backgroundColor: alpha(getRiskColor(session.riskScore > 70 ? 'high' : session.riskScore > 40 ? 'medium' : 'low'), 0.2),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskColor(session.riskScore > 70 ? 'high' : session.riskScore > 40 ? 'medium' : 'low'),
                      },
                    }}
                  />
                  <Typography variant="caption">{session.riskScore}%</Typography>
                </Box>
              </Box>
            }
          />
          <ListItemSecondaryAction>
            {session.isActive && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                startIcon={<Logout />}
              >
                Terminate
              </Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  const SecurityPoliciesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Security Policies</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowPolicyDialog(true)}
        >
          Create Policy
        </Button>
      </Box>
      
      {securityPolicies.map((policy) => (
        <Accordion key={policy.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Avatar sx={{ bgcolor: policy.enabled ? theme.palette.success.light : theme.palette.grey[400] }}>
                <PolicySharp />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1">{policy.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {policy.description}
                </Typography>
              </Box>
              <Switch
                checked={policy.enabled}
                onChange={(e) => {
                  setSecurityPolicies(prev => prev.map(p => 
                    p.id === policy.id ? { ...p, enabled: e.target.checked } : p
                  ));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Rules:</Typography>
            {policy.rules.map((rule) => (
              <Box key={rule.id} sx={{ mb: 1, p: 1, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Condition:</strong> {rule.condition}
                </Typography>
                <Typography variant="body2">
                  <strong>Action:</strong> {rule.action}
                </Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(policy.lastUpdated).toLocaleString()} by {policy.createdBy}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Security />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Security & Audit
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor security events, audit logs, and manage access policies
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="1d">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <IconButton onClick={loadSecurityData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Security Overview */}
      <Box sx={{ mb: 4 }}>
        <SecurityOverview />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Audit Logs" />
          <Tab 
            label={
              <Badge badgeContent={securityEvents.filter(e => !e.resolved).length} color="error">
                Security Events
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={loginSessions.filter(s => s.isActive).length} color="success">
                Active Sessions
              </Badge>
            } 
          />
          <Tab label="Security Policies" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && <AuditLogsTab />}
      {selectedTab === 1 && <SecurityEventsTab />}
      {selectedTab === 2 && <ActiveSessionsTab />}
      {selectedTab === 3 && <SecurityPoliciesTab />}

      {/* Security Event Dialog */}
      <Dialog open={showEventDialog} onClose={() => setShowEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Security Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Alert severity={selectedEvent.severity === 'critical' ? 'error' : selectedEvent.severity === 'high' ? 'warning' : 'info'}>
                {selectedEvent.title}
              </Alert>
              <Typography variant="body2">{selectedEvent.description}</Typography>
              <Typography variant="caption">
                Timestamp: {new Date(selectedEvent.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="caption">
                IP Address: {selectedEvent.ipAddress}
              </Typography>
              {selectedEvent.userId && (
                <Typography variant="caption">
                  User ID: {selectedEvent.userId}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEventDialog(false)}>Close</Button>
          {selectedEvent && !selectedEvent.resolved && (
            <Button variant="contained" color="primary">
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create Policy Dialog */}
      <Dialog open={showPolicyDialog} onClose={() => setShowPolicyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Security Policy</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Advanced policy builder coming soon. Create custom security rules and automated responses.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPolicyDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Policy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityAuditSystem;