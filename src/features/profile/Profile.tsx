import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { Email as EnvelopeIcon, Edit as PencilIcon } from '@mui/icons-material';
import { UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 4 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              {user.avatar ? (
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{ width: 128, height: 128, mx: 'auto', mb: 2 }}
                />
              ) : (
                <UserCircleIcon sx={{ fontSize: 128, color: 'grey.400', mx: 'auto', mb: 2 }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900' }}>
                {user.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', mb: 1 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role}
                variant="filled"
                size="small"
                sx={{ mt: 1 }}
              />

              <Stack spacing={1} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PencilIcon />}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                >
                  Change Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900', mb: 3 }}>
                Account Details
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <EnvelopeIcon sx={{ fontSize: 20, color: 'grey.400', mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.700' }}>
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <BuildingOfficeIcon sx={{ fontSize: 20, color: 'grey.400', mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.700' }}>
                      Company
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900' }}>
                      {user.company}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <ShieldCheckIcon sx={{ fontSize: 20, color: 'grey.400', mt: 0.5, mr: 1.5 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.700' }}>
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.900', textTransform: 'capitalize' }}>
                      {user.role}
                    </Typography>
                  </Box>
                </Box>

                {user.lastLogin && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CalendarIcon sx={{ fontSize: 20, color: 'grey.400', mt: 0.5, mr: 1.5 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.700' }}>
                        Last Login
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'grey.900' }}>
                        {format(new Date(user.lastLogin), 'PPpp')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ mt: 3, mb: 3 }} />
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'grey.700', mb: 2 }}>
                  Permissions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.permissions.map((permission) => (
                    <Chip
                      key={permission}
                      label={permission.replace(/\./g, ' ').toUpperCase()}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity Card */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'grey.900', mb: 3 }}>
            Recent Activity
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            No recent activity to display.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;