import React, { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment when needed
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as BellIcon,
  Language as GlobeAltIcon,
  DarkMode as MoonIcon,
  Security as ShieldCheckIcon,
  VpnKey as KeyIcon,
  PhoneAndroid as DevicePhoneMobileIcon
} from '@mui/icons-material';
import { Toast } from '@components/ui/Toast';

const Settings: React.FC = () => {
  // const { updateProfile } = useAuth(); // Uncomment when profile update is needed
  // const user = useAuth().user; // Uncomment when user data is needed
  const [activeTab, setActiveTab] = useState('notifications');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const handleSave = async () => {
    try {
      // Save settings logic here
      setToastMessage('Settings saved successfully');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to save settings');
      setShowToast(true);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 4 }}>
        Settings
      </Typography>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={tab.name}
            icon={<tab.icon />}
            iconPosition="start"
            sx={{
              textTransform: 'none',
              minHeight: 64,
              fontSize: '14px',
              fontWeight: 'medium'
            }}
          />
        ))}
      </Tabs>

      {/* Tab Content */}
      {activeTab === 'notifications' && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900', mb: 3 }}>
              Notification Settings
            </Typography>
            
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                    Email Notifications
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    Receive email updates about your account
                  </Typography>
                </Box>
                <Switch defaultChecked color="primary" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                    RFQ Updates
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    Get notified about RFQ status changes
                  </Typography>
                </Box>
                <Switch defaultChecked color="primary" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                    Order Updates
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    Notifications about order status
                  </Typography>
                </Box>
                <Switch defaultChecked color="primary" />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                    Marketing Emails
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    Product updates and promotional content
                  </Typography>
                </Box>
                <Switch color="primary" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900', mb: 3 }}>
              Preferences
            </Typography>
            
            <Stack spacing={4}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  defaultValue="English"
                  label="Language"
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Spanish">Spanish</MenuItem>
                  <MenuItem value="French">French</MenuItem>
                  <MenuItem value="German">German</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select
                  defaultValue="UTC"
                  label="Timezone"
                >
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="EST">EST</MenuItem>
                  <MenuItem value="CST">CST</MenuItem>
                  <MenuItem value="PST">PST</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select
                  defaultValue="MM/DD/YYYY"
                  label="Date Format"
                >
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoonIcon sx={{ fontSize: 20, color: 'grey.400', mr: 2 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                      Dark Mode
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.500' }}>
                      Use dark theme
                    </Typography>
                  </Box>
                </Box>
                <Switch color="primary" />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Stack spacing={3}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900', mb: 3 }}>
                Security Settings
              </Typography>
              
              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <KeyIcon sx={{ fontSize: 20, color: 'grey.400', mr: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                      Password
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
                    Last changed 30 days ago
                  </Typography>
                  <Button variant="outlined">Change Password</Button>
                </Box>

                <Divider />
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShieldCheckIcon sx={{ fontSize: 20, color: 'grey.400', mr: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                      Two-Factor Authentication
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
                    Add an extra layer of security to your account
                  </Typography>
                  <Button variant="outlined">Enable 2FA</Button>
                </Box>

                <Divider />
                
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DevicePhoneMobileIcon sx={{ fontSize: 20, color: 'grey.400', mr: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'grey.900' }}>
                      Active Sessions
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'grey.500', mb: 2 }}>
                    Manage devices where you're logged in
                  </Typography>
                  <Button variant="outlined">View Sessions</Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: 'error.light', border: 2, borderColor: 'error.main' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'error.dark', mb: 1 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" sx={{ color: 'error.main', mb: 3 }}>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                sx={{ 
                  '&:hover': { 
                    bgcolor: 'error.main', 
                    color: 'white' 
                  }
                }}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Save Button */}
      {activeTab !== 'security' && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave}>
            Save Settings
          </Button>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={showToast}
        autoHideDuration={6000}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowToast(false)} 
          severity={toastMessage.includes('Failed') ? 'error' : 'success'}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;