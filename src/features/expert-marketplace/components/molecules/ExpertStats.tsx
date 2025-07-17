import React from 'react';
import { FC } from 'react';
import {
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  WorkHistory,
  AccessTime,
  BusinessCenter,
  School,
} from '@mui/icons-material';

interface ExpertStatsProps {
  completedProjects: number;
  responseTime: number;
  experience: number;
  certifications: number;
}

export const ExpertStats: FC<ExpertStatsProps> = ({
  completedProjects,
  responseTime,
  experience,
  certifications,
}) => {
  const stats = [
    {
      icon: <WorkHistory />,
      label: 'Completed Projects',
      value: completedProjects,
      suffix: '',
    },
    {
      icon: <AccessTime />,
      label: 'Avg Response Time',
      value: responseTime,
      suffix: 'hrs',
    },
    {
      icon: <BusinessCenter />,
      label: 'Experience',
      value: experience,
      suffix: 'yrs',
    },
    {
      icon: <School />,
      label: 'Certifications',
      value: certifications,
      suffix: '',
    },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 6 }} key={index}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {stat.value}{stat.suffix}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};