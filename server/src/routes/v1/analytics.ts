import { Router } from 'express';
import { logger } from '../../services/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: Time range for analytics
 *     responses:
 *       200:
 *         description: Dashboard analytics data
 */
router.get('/dashboard', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';

    // Mock analytics data
    const analytics = {
      overview: {
        totalLeads: 1250,
        totalAgents: 45,
        conversionRate: 18.5,
        avgResponseTime: 2.3,
        totalRevenue: 2450000,
      },
      leads: {
        new: 120,
        contacted: 95,
        qualified: 65,
        converted: 35,
        lost: 85,
      },
      performance: {
        topAgents: [
          { id: '1', name: 'John Doe', leads: 45, conversions: 12, revenue: 450000 },
          { id: '2', name: 'Jane Smith', leads: 38, conversions: 10, revenue: 380000 },
          { id: '3', name: 'Mike Johnson', leads: 32, conversions: 8, revenue: 320000 },
        ],
        topSources: [
          { source: 'website', leads: 450, conversions: 95 },
          { source: 'referral', leads: 320, conversions: 85 },
          { source: 'social', leads: 280, conversions: 65 },
        ],
      },
      trends: {
        leadsByDay: [
          { date: '2024-01-01', leads: 15, conversions: 3 },
          { date: '2024-01-02', leads: 18, conversions: 4 },
          { date: '2024-01-03', leads: 22, conversions: 5 },
          { date: '2024-01-04', leads: 19, conversions: 3 },
          { date: '2024-01-05', leads: 25, conversions: 6 },
        ],
        revenueByMonth: [
          { month: '2024-01', revenue: 450000 },
          { month: '2024-02', revenue: 520000 },
          { month: '2024-03', revenue: 480000 },
          { month: '2024-04', revenue: 580000 },
        ],
      },
    };

    logger.info('Dashboard analytics retrieved', { timeRange });

    res.json({
      success: true,
      data: analytics,
      timeRange,
    });
  } catch (error) {
    logger.error('Failed to retrieve dashboard analytics', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/analytics/leads:
 *   get:
 *     summary: Get lead analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 *         description: Filter by agent ID
 *     responses:
 *       200:
 *         description: Lead analytics data
 */
router.get('/leads', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';
    const agentId = req.query.agentId as string;

    // Mock lead analytics
    const analytics = {
      summary: {
        totalLeads: 1250,
        newLeads: 120,
        convertedLeads: 95,
        lostLeads: 85,
        avgScore: 72.5,
        conversionRate: 18.5,
      },
      distribution: {
        byStatus: [
          { status: 'new', count: 120, percentage: 24 },
          { status: 'contacted', count: 95, percentage: 19 },
          { status: 'qualified', count: 65, percentage: 13 },
          { status: 'converted', count: 35, percentage: 7 },
          { status: 'lost', count: 85, percentage: 17 },
        ],
        bySource: [
          { source: 'website', count: 450, percentage: 45 },
          { source: 'referral', count: 320, percentage: 32 },
          { source: 'social', count: 280, percentage: 28 },
          { source: 'email', count: 200, percentage: 20 },
        ],
        byScore: [
          { range: '0-20', count: 50, percentage: 4 },
          { range: '21-40', count: 125, percentage: 10 },
          { range: '41-60', count: 275, percentage: 22 },
          { range: '61-80', count: 450, percentage: 36 },
          { range: '81-100', count: 350, percentage: 28 },
        ],
      },
      trends: {
        leadsByDay: [
          { date: '2024-01-01', new: 15, contacted: 12, qualified: 8, converted: 3, lost: 5 },
          { date: '2024-01-02', new: 18, contacted: 15, qualified: 10, converted: 4, lost: 6 },
          { date: '2024-01-03', new: 22, contacted: 18, qualified: 12, converted: 5, lost: 7 },
        ],
        conversionFunnel: [
          { stage: 'Leads', count: 1250, percentage: 100 },
          { stage: 'Contacted', count: 950, percentage: 76 },
          { stage: 'Qualified', count: 450, percentage: 36 },
          { stage: 'Converted', count: 230, percentage: 18.4 },
        ],
      },
    };

    logger.info('Lead analytics retrieved', { timeRange, agentId });

    res.json({
      success: true,
      data: analytics,
      timeRange,
      agentId,
    });
  } catch (error) {
    logger.error('Failed to retrieve lead analytics', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/analytics/agents:
 *   get:
 *     summary: Get agent performance analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Agent performance analytics
 */
router.get('/agents', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';

    // Mock agent analytics
    const analytics = {
      summary: {
        totalAgents: 45,
        activeAgents: 38,
        avgLeadsPerAgent: 27.8,
        avgConversionRate: 18.5,
        topPerformer: 'John Doe',
      },
      performance: [
        {
          id: '1',
          name: 'John Doe',
          leads: 45,
          contacted: 38,
          qualified: 25,
          converted: 12,
          conversionRate: 26.7,
          avgResponseTime: 1.2,
          revenue: 450000,
          rating: 4.8,
        },
        {
          id: '2',
          name: 'Jane Smith',
          leads: 38,
          contacted: 32,
          qualified: 20,
          converted: 10,
          conversionRate: 26.3,
          avgResponseTime: 1.5,
          revenue: 380000,
          rating: 4.9,
        },
      ],
      rankings: {
        byLeads: [
          { agentId: '1', name: 'John Doe', value: 45 },
          { agentId: '2', name: 'Jane Smith', value: 38 },
          { agentId: '3', name: 'Mike Johnson', value: 32 },
        ],
        byConversions: [
          { agentId: '1', name: 'John Doe', value: 12 },
          { agentId: '2', name: 'Jane Smith', value: 10 },
          { agentId: '3', name: 'Mike Johnson', value: 8 },
        ],
        byRevenue: [
          { agentId: '1', name: 'John Doe', value: 450000 },
          { agentId: '2', name: 'Jane Smith', value: 380000 },
          { agentId: '3', name: 'Mike Johnson', value: 320000 },
        ],
      },
    };

    logger.info('Agent analytics retrieved', { timeRange });

    res.json({
      success: true,
      data: analytics,
      timeRange,
    });
  } catch (error) {
    logger.error('Failed to retrieve agent analytics', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *     responses:
 *       200:
 *         description: Revenue analytics data
 */
router.get('/revenue', async (req, res) => {
  try {
    const timeRange = req.query.timeRange as string || '30d';

    // Mock revenue analytics
    const analytics = {
      summary: {
        totalRevenue: 2450000,
        avgDealSize: 125000,
        recurringRevenue: 1850000,
        newRevenue: 600000,
        revenueGrowth: 15.2,
      },
      breakdown: {
        byAgent: [
          { agentId: '1', name: 'John Doe', revenue: 450000, deals: 12 },
          { agentId: '2', name: 'Jane Smith', revenue: 380000, deals: 10 },
          { agentId: '3', name: 'Mike Johnson', revenue: 320000, deals: 8 },
        ],
        byPropertyType: [
          { type: 'commercial', revenue: 1200000, percentage: 49 },
          { type: 'residential', revenue: 800000, percentage: 33 },
          { type: 'luxury', revenue: 450000, percentage: 18 },
        ],
        byMonth: [
          { month: '2024-01', revenue: 450000, deals: 18 },
          { month: '2024-02', revenue: 520000, deals: 21 },
          { month: '2024-03', revenue: 480000, deals: 19 },
          { month: '2024-04', revenue: 580000, deals: 23 },
        ],
      },
      forecasting: {
        predictedRevenue: 3200000,
        confidence: 85,
        factors: [
          { factor: 'Pipeline value', impact: 'high' },
          { factor: 'Conversion rate', impact: 'medium' },
          { factor: 'Market conditions', impact: 'low' },
        ],
      },
    };

    logger.info('Revenue analytics retrieved', { timeRange });

    res.json({
      success: true,
      data: analytics,
      timeRange,
    });
  } catch (error) {
    logger.error('Failed to retrieve revenue analytics', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export { router as analyticsRoutes };