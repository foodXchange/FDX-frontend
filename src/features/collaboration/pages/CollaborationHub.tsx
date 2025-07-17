import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Button, Stack, Chip, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Badge, Tabs, Tab, useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel,  } from '@mui/material';
import { Dashboard, Assignment, Group, Schedule, CheckCircle, Warning, Add, CalendarToday, Comment, Analytics, Settings, Notifications, Email, Message, VideoCall, Upload, TrendingUp, Save, Cancel, Timeline,  } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend,  } from 'recharts';

// Import the ProjectManagement component
import { ProjectManagement } from '../components/ProjectManagement';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Activity Feed Component
const ActivityFeed: React.FC = () => {
  const theme = useTheme();
  
  const activities = [
    {
      id: '1',
      type: 'project_created',
      user: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      action: 'created project',
      target: 'Food Safety Compliance Platform',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <Add />,
      color: theme.palette.success.main,
    },
    {
      id: '2',
      type: 'task_completed',
      user: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
      action: 'completed task',
      target: 'User Authentication System',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      id: '3',
      type: 'comment_added',
      user: 'Emily Rodriguez',
      avatar: '/avatars/emily.jpg',
      action: 'commented on',
      target: 'Dashboard Design Review',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: <Comment />,
      color: theme.palette.info.main,
    },
    {
      id: '4',
      type: 'file_uploaded',
      user: 'David Wilson',
      avatar: '/avatars/david.jpg',
      action: 'uploaded file to',
      target: 'API Documentation',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: <Upload />,
      color: theme.palette.warning.main,
    },
    {
      id: '5',
      type: 'deadline_approaching',
      user: 'System',
      avatar: '/avatars/system.jpg',
      action: 'deadline approaching for',
      target: 'Compliance Dashboard',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      icon: <Warning />,
      color: theme.palette.error.main,
    },
  ];

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM dd');
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Activity Feed
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={activity.id} alignItems="flex-start">
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: alpha(activity.color, 0.1),
                    color: activity.color,
                    width: 32,
                    height: 32,
                  }}
                >
                  {activity.icon}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={activity.avatar}
                      alt={activity.user}
                      sx={{ width: 24, height: 24 }}
                    >
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="body2">
                      <strong>{activity.user}</strong> {activity.action}{' '}
                      <strong>{activity.target}</strong>
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(activity.timestamp)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Team Performance Component
const TeamPerformance: React.FC = () => {
  const theme = useTheme();
  
  const teamData = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      avatar: '/avatars/sarah.jpg',
      tasksCompleted: 24,
      tasksInProgress: 3,
      efficiency: 92,
      status: 'online',
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: '/avatars/michael.jpg',
      tasksCompleted: 18,
      tasksInProgress: 5,
      efficiency: 87,
      status: 'away',
    },
    {
      name: 'Emily Rodriguez',
      role: 'UI/UX Designer',
      avatar: '/avatars/emily.jpg',
      tasksCompleted: 15,
      tasksInProgress: 2,
      efficiency: 95,
      status: 'online',
    },
    {
      name: 'David Wilson',
      role: 'QA Engineer',
      avatar: '/avatars/david.jpg',
      tasksCompleted: 21,
      tasksInProgress: 4,
      efficiency: 89,
      status: 'busy',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'away':
        return theme.palette.warning.main;
      case 'busy':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Team Performance
        </Typography>
        <List>
          {teamData.map((member, index) => (
            <ListItem key={index} divider={index < teamData.length - 1}>
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(member.status),
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    />
                  }
                >
                  <Avatar src={member.avatar} alt={member.name}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="bold">
                    {member.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {member.role}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={`${member.tasksCompleted} completed`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${member.tasksInProgress} in progress`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {member.efficiency}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Efficiency
                  </Typography>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const theme = useTheme();
  
  const quickActions = [
    {
      label: 'New Project',
      icon: <Add />,
      color: theme.palette.primary.main,
      action: () => console.log('New project'),
    },
    {
      label: 'Upload File',
      icon: <Upload />,
      color: theme.palette.secondary.main,
      action: () => console.log('Upload file'),
    },
    {
      label: 'Schedule Meeting',
      icon: <CalendarToday />,
      color: theme.palette.success.main,
      action: () => console.log('Schedule meeting'),
    },
    {
      label: 'Send Message',
      icon: <Message />,
      color: theme.palette.info.main,
      action: () => console.log('Send message'),
    },
    {
      label: 'Video Call',
      icon: <VideoCall />,
      color: theme.palette.warning.main,
      action: () => console.log('Video call'),
    },
    {
      label: 'Generate Report',
      icon: <Analytics />,
      color: theme.palette.error.main,
      action: () => console.log('Generate report'),
    },
  ];

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={action.action}
                sx={{
                  borderColor: alpha(action.color, 0.3),
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.1),
                  },
                  py: 1.5,
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

// Collaboration Stats Component
const CollaborationStats: React.FC = () => {
  const theme = useTheme();
  
  const stats = [
    {
      title: 'Active Projects',
      value: 12,
      change: 8,
      icon: <Assignment />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Team Members',
      value: 28,
      change: 2,
      icon: <Group />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Tasks Completed',
      value: 156,
      change: 24,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      title: 'Messages Sent',
      value: 892,
      change: 45,
      icon: <Message />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main">
                      +{stat.change} this week
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    width: 64,
                    height: 64,
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Project Timeline Component
const ProjectTimeline: React.FC = () => {
  const theme = useTheme();
  
  const timelineData = [
    { month: 'Jan', projects: 8, tasks: 45, messages: 234 },
    { month: 'Feb', projects: 12, tasks: 52, messages: 289 },
    { month: 'Mar', projects: 10, tasks: 48, messages: 312 },
    { month: 'Apr', projects: 15, tasks: 61, messages: 356 },
    { month: 'May', projects: 18, tasks: 58, messages: 401 },
    { month: 'Jun', projects: 22, tasks: 67, messages: 445 },
  ];

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Collaboration Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="projects"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="Projects"
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              name="Tasks"
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              name="Messages"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// Settings Dialog Component
const SettingsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoSave: true,
    collaborationUpdates: true,
    taskReminders: true,
    projectDeadlines: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collaboration Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              }
              label="Enable notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                />
              }
              label="Email alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.taskReminders}
                  onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                />
              }
              label="Task reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.projectDeadlines}
                  onChange={(e) => handleSettingChange('projectDeadlines', e.target.checked)}
                />
              }
              label="Project deadline alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Collaboration
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collaborationUpdates}
                  onChange={(e) => handleSettingChange('collaborationUpdates', e.target.checked)}
                />
              }
              label="Real-time collaboration updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
              }
              label="Auto-save changes"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
              }
              label="Dark mode"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Collaboration Hub Component
export const CollaborationHub: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Collaboration Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Centralized workspace for team collaboration and project management
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button variant="outlined" startIcon={<Settings />} onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            New Project
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Box mb={3}>
        <CollaborationStats />
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => setSelectedTab(value)}
              variant="fullWidth"
            >
              <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
              <Tab label="Projects" icon={<Assignment />} iconPosition="start" />
              <Tab label="Team" icon={<Group />} iconPosition="start" />
              <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {selectedTab === 0 && (
                <Box>
                  <ProjectTimeline />
                </Box>
              )}
              
              {selectedTab === 1 && (
                <Box>
                  <ProjectManagement />
                </Box>
              )}
              
              {selectedTab === 2 && (
                <Box>
                  <TeamPerformance />
                </Box>
              )}
              
              {selectedTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ProjectTimeline />
                  </Grid>
                </Grid>
              )}
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <ActivityFeed />
            <QuickActions />
          </Stack>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
};

export default CollaborationHub;