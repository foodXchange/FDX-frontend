import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Button,
  Chip,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Tabs,
  Tab,
  Alert,
  useTheme,
  alpha,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Schedule,
  Settings,
  Clear,
  MarkEmailRead,
  FilterList,
  Tune,
  Add,
  Edit,
  Delete,
  Priority,
  EventAvailable,
  TrendingUp,
  AttachMoney,
  Assignment,
  Phone,
  WhatsApp,
  Email,
  PersonAdd,
  CheckCircle,
  Warning,
  Info,
  Error,
  Close,
  VolumeOff,
  VolumeUp,
  Vibration,
  SmartDisplay,
} from '@mui/icons-material';
import { useAgentStore } from '../../store';
import { AgentNotification, NotificationType } from '../../types';

interface NotificationRule {
  id: string;
  name: string;
  type: NotificationType;
  enabled: boolean;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  schedule: NotificationSchedule;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

interface NotificationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
}

interface NotificationAction {
  type: 'push' | 'email' | 'sms' | 'in_app' | 'webhook';
  enabled: boolean;
  settings: Record<string, any>;
}

interface NotificationSchedule {
  enabled: boolean;
  quietHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  timezone: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  variables: string[];
}

const AdvancedNotifications: React.FC = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markNotificationRead } = useAgentStore();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [globalSettings, setGlobalSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  });

  useEffect(() => {
    loadNotificationRules();
    loadTemplates();
  }, []);

  const loadNotificationRules = () => {
    // Mock notification rules
    const mockRules: NotificationRule[] = [
      {
        id: '1',
        name: 'High Priority Leads',
        type: 'new_lead',
        enabled: true,
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' },
          { field: 'estimatedRevenue', operator: 'greater_than', value: 10000 },
        ],
        actions: [
          { type: 'push', enabled: true, settings: { sound: 'urgent' } },
          { type: 'email', enabled: true, settings: { template: 'high_priority_lead' } },
          { type: 'sms', enabled: true, settings: {} },
        ],
        schedule: {
          enabled: true,
          quietHours: { start: '22:00', end: '08:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          timezone: 'America/New_York',
        },
        priority: 'urgent',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Commission Milestones',
        type: 'commission_earned',
        enabled: true,
        conditions: [
          { field: 'amount', operator: 'greater_than', value: 1000 },
        ],
        actions: [
          { type: 'push', enabled: true, settings: { sound: 'achievement' } },
          { type: 'in_app', enabled: true, settings: { showCelebration: true } },
        ],
        schedule: {
          enabled: false,
          quietHours: { start: '22:00', end: '08:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          timezone: 'America/New_York',
        },
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Follow-up Reminders',
        type: 'reminder',
        enabled: true,
        conditions: [
          { field: 'leadStatus', operator: 'equals', value: 'contacted' },
          { field: 'daysSinceContact', operator: 'greater_than', value: 3 },
        ],
        actions: [
          { type: 'push', enabled: true, settings: { sound: 'gentle' } },
          { type: 'in_app', enabled: true, settings: {} },
        ],
        schedule: {
          enabled: true,
          quietHours: { start: '19:00', end: '09:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          timezone: 'America/New_York',
        },
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
    ];
    
    setNotificationRules(mockRules);
  };

  const loadTemplates = () => {
    // Mock templates
    const mockTemplates: NotificationTemplate[] = [
      {
        id: '1',
        name: 'High Priority Lead',
        type: 'new_lead',
        title: 'New High Priority Lead: {{companyName}}',
        message: 'A high-value lead from {{companyName}} ({{estimatedRevenue}}) needs immediate attention.',
        variables: ['companyName', 'estimatedRevenue', 'contactPerson'],
      },
      {
        id: '2',
        name: 'Commission Earned',
        type: 'commission_earned',
        title: 'Commission Earned: {{amount}}',
        message: 'Congratulations! You earned {{amount}} commission from {{leadName}}.',
        variables: ['amount', 'leadName', 'dealSize'],
      },
    ];
    
    setTemplates(mockTemplates);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_lead': return <PersonAdd />;
      case 'lead_update': return <Assignment />;
      case 'commission_earned': return <AttachMoney />;
      case 'target_achieved': return <TrendingUp />;
      case 'reminder': return <Schedule />;
      case 'whatsapp_message': return <WhatsApp />;
      case 'system': return <Settings />;
      default: return <Notifications />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.grey[500];
      default: return theme.palette.grey[500];
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'new_lead': return <PersonAdd color="primary" />;
      case 'commission_earned': return <AttachMoney color="success" />;
      case 'reminder': return <Schedule color="warning" />;
      case 'whatsapp_message': return <WhatsApp color="success" />;
      default: return <Info color="info" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'high_priority') return notification.priority === 'high' || notification.priority === 'urgent';
    return true;
  });

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markNotificationRead(notification.id);
      }
    });
    setSnackbarMessage('All notifications marked as read');
    setSnackbarOpen(true);
  };

  const deleteNotification = (notificationId: string) => {
    // Implementation would remove notification from store
    setSnackbarMessage('Notification deleted');
    setSnackbarOpen(true);
  };

  const createNotificationRule = (rule: Partial<NotificationRule>) => {
    const newRule: NotificationRule = {
      id: Date.now().toString(),
      name: rule.name || 'New Rule',
      type: rule.type || 'new_lead',
      enabled: true,
      conditions: rule.conditions || [],
      actions: rule.actions || [],
      schedule: rule.schedule || {
        enabled: false,
        quietHours: { start: '22:00', end: '08:00' },
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'America/New_York',
      },
      priority: rule.priority || 'medium',
      createdAt: new Date().toISOString(),
    };
    
    setNotificationRules(prev => [...prev, newRule]);
    setShowRuleEditor(false);
    setEditingRule(null);
    setSnackbarMessage('Notification rule created');
    setSnackbarOpen(true);
  };

  const NotificationsList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'high_priority' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setFilter('high_priority')}
          >
            High Priority
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<MarkEmailRead />}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            size="small"
          >
            Mark All Read
          </Button>
          <Button
            startIcon={<Clear />}
            size="small"
            color="error"
          >
            Clear All
          </Button>
        </Box>
      </Box>

      <List>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Notifications sx={{ fontSize: 48, mb: 2 }} />
            <Typography>No notifications to show</Typography>
          </Box>
        ) : (
          filteredNotifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                mb: 1,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: notification.isRead 
                  ? 'transparent' 
                  : alpha(theme.palette.primary.main, 0.05),
              }}
            >
              <ListItemAvatar>
                <Badge
                  variant="dot"
                  color={notification.priority === 'urgent' ? 'error' : 'primary'}
                  invisible={notification.isRead}
                >
                  <Avatar sx={{ bgcolor: getPriorityColor(notification.priority) }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.type.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={
                        notification.priority === 'urgent' ? 'error' :
                        notification.priority === 'high' ? 'warning' :
                        notification.priority === 'medium' ? 'info' : 'default'
                      }
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {!notification.isRead && (
                    <IconButton
                      size="small"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => deleteNotification(notification.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  const NotificationRules = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Notification Rules</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowRuleEditor(true)}
        >
          Create Rule
        </Button>
      </Box>

      <List>
        {notificationRules.map((rule) => (
          <ListItem
            key={rule.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: rule.enabled ? theme.palette.success.main : theme.palette.grey[400] }}>
                {getTypeIcon(rule.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">{rule.name}</Typography>
                  <Switch
                    checked={rule.enabled}
                    onChange={(e) => {
                      setNotificationRules(prev => prev.map(r => 
                        r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                      ));
                    }}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {rule.conditions.length} condition(s) • {rule.actions.length} action(s)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {rule.actions.map((action, index) => (
                      <Chip
                        key={index}
                        label={action.type}
                        size="small"
                        color={action.enabled ? 'primary' : 'default'}
                        variant={action.enabled ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setEditingRule(rule);
                    setShowRuleEditor(true);
                  }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => {
                    setNotificationRules(prev => prev.filter(r => r.id !== rule.id));
                    setSnackbarMessage('Rule deleted');
                    setSnackbarOpen(true);
                  }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const GlobalSettings = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Global Settings</Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Notification Channels</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.pushEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                />
              }
              label="Push Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.emailEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                />
              }
              label="Email Notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.smsEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, smsEnabled: e.target.checked }))}
                />
              }
              label="SMS Notifications"
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Sound & Vibration</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.soundEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {globalSettings.soundEnabled ? <VolumeUp /> : <VolumeOff />}
                  Sound Alerts
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={globalSettings.vibrationEnabled}
                  onChange={(e) => setGlobalSettings(prev => ({ ...prev, vibrationEnabled: e.target.checked }))}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Vibration />
                  Vibration
                </Box>
              }
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Quiet Hours</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={globalSettings.quietHours.enabled}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, enabled: e.target.checked }
                }))}
              />
            }
            label="Enable Quiet Hours"
            sx={{ mb: 2 }}
          />
          {globalSettings.quietHours.enabled && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="time"
                label="Start Time"
                value={globalSettings.quietHours.start}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, start: e.target.value }
                }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="time"
                label="End Time"
                value={globalSettings.quietHours.end}
                onChange={(e) => setGlobalSettings(prev => ({
                  ...prev,
                  quietHours: { ...prev.quietHours, end: e.target.value }
                }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error">
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <NotificationsActive />
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Smart notification management and automation
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => setShowSettings(true)}
        >
          Settings
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={unreadCount} color="error">
                Notifications
              </Badge>
            } 
          />
          <Tab label="Rules" />
          <Tab label="Templates" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && <NotificationsList />}
      {selectedTab === 1 && <NotificationRules />}
      {selectedTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>Notification Templates</Typography>
          <Alert severity="info">
            Notification templates feature coming soon. Customize your notification messages with dynamic variables.
          </Alert>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <GlobalSettings />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button onClick={() => setShowSettings(false)} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rule Editor Dialog */}
      <Dialog open={showRuleEditor} onClose={() => setShowRuleEditor(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Edit Notification Rule' : 'Create Notification Rule'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Rule Name"
              defaultValue={editingRule?.name || ''}
              placeholder="e.g., High Priority Leads"
            />
            <FormControl fullWidth>
              <InputLabel>Notification Type</InputLabel>
              <Select
                defaultValue={editingRule?.type || 'new_lead'}
                label="Notification Type"
              >
                <MenuItem value="new_lead">New Lead</MenuItem>
                <MenuItem value="lead_update">Lead Update</MenuItem>
                <MenuItem value="commission_earned">Commission Earned</MenuItem>
                <MenuItem value="target_achieved">Target Achieved</MenuItem>
                <MenuItem value="reminder">Reminder</MenuItem>
                <MenuItem value="whatsapp_message">WhatsApp Message</MenuItem>
              </Select>
            </FormControl>
            <Alert severity="info">
              Advanced rule configuration with conditions and actions will be available in the full implementation.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRuleEditor(false)}>Cancel</Button>
          <Button onClick={() => createNotificationRule({})} variant="contained">
            {editingRule ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <Close />
          </IconButton>
        }
      />
    </Box>
  );
};

export default AdvancedNotifications;