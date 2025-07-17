import { useMemo } from 'react';
import { Lead, LeadActivity } from '../../../types';
import { RelationshipMetrics } from '../components/RelationshipMetricsCards';

const ATTENTION_THRESHOLD_DAYS = 7;

export const useRelationshipMetrics = (
  leads: Lead[],
  activities: LeadActivity[]
): RelationshipMetrics => {
  return useMemo(() => {
    const now = new Date();
    
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => ['hot', 'warm'].includes(l.status)).length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    const avgEngagementScore = leads.reduce((sum, lead) => sum + (lead.engagementScore || 0), 0) / (totalLeads || 1);
    
    const leadsRequiringAttention = leads.filter(lead => {
      const daysSinceContact = Math.floor(
        (now.getTime() - new Date(lead.lastContact).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceContact > ATTENTION_THRESHOLD_DAYS && lead.status !== 'converted' && lead.status !== 'lost';
    }).length;
    
    const upcomingActivities = activities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= now && activity.type === 'scheduled';
    }).length;

    return {
      totalLeads,
      activeLeads,
      conversionRate,
      avgEngagementScore,
      leadsRequiringAttention,
      upcomingActivities,
    };
  }, [leads, activities]);
};