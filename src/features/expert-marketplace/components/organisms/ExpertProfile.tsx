import React, { useState } from 'react';
import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Share,
  MoreVert,
  LocationOn,
  Language,
  AccessTime,
  CalendarMonth,
  School,
  Message,
} from '@mui/icons-material';
import { Grid } from '@mui/material';
import { Expert, Service, Rating, Portfolio } from '../../types';
import {
  ExpertAvatar,
  RatingDisplay,
  PriceDisplay,
  AvailabilityBadge,
  ExpertiseBadge,
} from '../atoms';
import { ServiceList } from '../molecules/ServiceList';
import { ReviewList } from '../molecules/ReviewList';
import { PortfolioGallery } from '../molecules/PortfolioGallery';
import { ExpertStats } from '../molecules/ExpertStats';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box pt={3}>{children}</Box>}
  </div>
);

interface ExpertProfileProps {
  expert: Expert;
  services: Service[];
  ratings: Rating[];
  portfolio: Portfolio[];
  onBook?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  isOwnProfile?: boolean;
}

export const ExpertProfile: FC<ExpertProfileProps> = ({
  expert,
  services,
  ratings,
  portfolio,
  onBook,
  onMessage,
  onShare,
  isOwnProfile = false,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTabChange = (_: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleMoreClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box display="flex" gap={3}>
              <ExpertAvatar
                name={`${expert.firstName} ${expert.lastName}`}
                imageUrl={expert.avatar}
                isVerified={expert.isVerified}
                isOnline={expert.availability.isAvailable}
                size="large"
              />
              <Box flex={1}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      {expert.firstName} {expert.lastName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {expert.title}
                    </Typography>
                    {expert.company && (
                      <Typography variant="body1" color="text.secondary">
                        {expert.company}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton onClick={onShare}>
                      <Share />
                    </IconButton>
                    <IconButton onClick={handleMoreClick}>
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMoreClose}
                    >
                      <MenuItem onClick={handleMoreClose}>Report Profile</MenuItem>
                      <MenuItem onClick={handleMoreClose}>Block Expert</MenuItem>
                    </Menu>
                  </Box>
                </Box>

                <Stack direction="row" spacing={3} mt={2} flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">
                      {expert.location.city}, {expert.location.country}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Language fontSize="small" color="action" />
                    <Typography variant="body2">
                      {expert.languages.join(', ')}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2">
                      {expert.location.timezone}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2">
                      Joined {new Date(expert.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>

                <Box mt={3}>
                  <Typography variant="body1" paragraph>
                    {expert.bio}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                  {expert.expertise.map((exp) => (
                    <ExpertiseBadge
                      key={exp.id}
                      category={exp.name}
                      yearsExperience={exp.yearsOfExperience}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <RatingDisplay
                      rating={expert.rating}
                      reviewCount={expert.reviewCount}
                      size="large"
                    />
                    <PriceDisplay
                      amount={expert.hourlyRate}
                      currency={expert.currency}
                      variant="prominent"
                    />
                  </Box>
                  <Divider />
                  <AvailabilityBadge
                    isAvailable={expert.availability.isAvailable}
                    nextAvailable={expert.availability.nextAvailable}
                  />
                  {!isOwnProfile && (
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={onBook}
                        disabled={!expert.availability.isAvailable}
                      >
                        Book Consultation
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<Message />}
                        onClick={onMessage}
                      >
                        Send Message
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Paper>

              <ExpertStats
                completedProjects={expert.completedProjects}
                responseTime={expert.responseTime}
                experience={expert.experience}
                certifications={expert.certifications.length}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Profile Content Tabs */}
      <Paper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`Services (${services.length})`} />
          <Tab label={`Reviews (${ratings.length})`} />
          <Tab label={`Portfolio (${portfolio.length})`} />
          <Tab label="About" />
          {expert.certifications.length > 0 && (
            <Tab label={`Certifications (${expert.certifications.length})`} />
          )}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <ServiceList services={services} expertId={expert.id} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <ReviewList ratings={ratings} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <PortfolioGallery portfolio={portfolio} />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Experience
                </Typography>
                <Typography variant="body1" paragraph>
                  {expert.experience} years of experience in the food industry
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Expertise Areas
                </Typography>
                <Stack spacing={1}>
                  {expert.expertise.map((exp) => (
                    <Box key={exp.id}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {exp.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {exp.description || `${exp.yearsOfExperience} years of experience`}
                      </Typography>
                      {exp.subcategories.length > 0 && (
                        <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
                          {exp.subcategories.map((sub) => (
                            <Chip key={sub} label={sub} size="small" variant="outlined" />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Working Hours
                </Typography>
                <Stack spacing={1}>
                  {Object.entries(expert.availability.schedule).map(([day, slots]) => (
                    <Box key={day} display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {day}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {slots.length > 0
                          ? slots.map(s => `${s.start} - ${s.end}`).join(', ')
                          : 'Unavailable'}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>

          {expert.certifications.length > 0 && (
            <TabPanel value={activeTab} index={4}>
              <Grid container spacing={2}>
                {expert.certifications.map((cert) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cert.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box display="flex" alignItems="start" gap={2}>
                        <School color="primary" />
                        <Box flex={1}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {cert.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {cert.issuer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Issued {new Date(cert.issueDate).toLocaleDateString()}
                          </Typography>
                          {cert.expiryDate && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Expires {new Date(cert.expiryDate).toLocaleDateString()}
                            </Typography>
                          )}
                          {cert.url && (
                            <Button
                              size="small"
                              href={cert.url}
                              target="_blank"
                              sx={{ mt: 1 }}
                            >
                              View Certificate
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          )}
        </Box>
      </Paper>
    </Box>
  );
};