import React, { memo } from 'react';
import { Grid } from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { MetricCard } from './MetricCard';

export interface RelationshipMetrics {
  totalLeads: number;
  activeLeads: number;
  conversionRate: number;
  avgEngagementScore: number;
  leadsRequiringAttention: number;
  upcomingActivities: number;
}

interface RelationshipMetricsCardsProps {
  metrics: RelationshipMetrics;
}

export const RelationshipMetricsCards = memo<RelationshipMetricsCardsProps>(({ metrics }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={<PeopleIcon />}
          subtitle={`${metrics.activeLeads} active`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={<TrendingUpIcon />}
          trend={{ value: 12, isPositive: true }}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Avg Engagement"
          value={metrics.avgEngagementScore.toFixed(1)}
          icon={<EventIcon />}
          subtitle="Last 30 days"
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <MetricCard
          title="Needs Attention"
          value={metrics.leadsRequiringAttention}
          icon={<WarningIcon />}
          subtitle={`${metrics.upcomingActivities} activities`}
          color="warning"
        />
      </Grid>
    </Grid>
  );
});