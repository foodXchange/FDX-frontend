import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database';

const router = express.Router();
const db = new DatabaseService();

// Initialize database connection
db.initialize().catch(console.error);

// Save analytics events
router.post('/events', [
  body('events').isArray({ min: 1 }),
  body('events.*.name').isString(),
  body('events.*.timestamp').isNumeric(),
  body('events.*.sessionId').isString(),
  body('events.*.page').isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { events } = req.body;

    // Save each event
    for (const event of events) {
      await db.saveAnalyticsEvent({
        id: uuidv4(),
        session_id: event.sessionId,
        user_id: event.userId || (req as any).user?.id,
        event_name: event.name,
        properties: JSON.stringify(event.properties || {}),
        timestamp: new Date(event.timestamp).toISOString(),
        page: event.page,
        user_agent: event.userAgent || req.get('User-Agent'),
      });
    }

    res.json({
      success: true,
      message: `${events.length} events saved successfully`,
    });

  } catch (error) {
    console.error('Save analytics events error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Save user journey
router.post('/journeys', [
  body('sessionId').isString(),
  body('startTime').isNumeric(),
  body('events').isArray(),
  body('pages').isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const journey = req.body;

    await db.saveUserJourney({
      id: uuidv4(),
      session_id: journey.sessionId,
      user_id: journey.userId || (req as any).user?.id,
      start_time: new Date(journey.startTime).toISOString(),
      end_time: journey.endTime ? new Date(journey.endTime).toISOString() : null,
      duration: journey.duration,
      page_count: journey.pages.length,
      action_count: journey.actions.length,
      conversion_count: journey.conversions.length,
      bounced: journey.bounced || false,
      events: JSON.stringify(journey.events),
      pages: JSON.stringify(journey.pages),
      actions: JSON.stringify(journey.actions),
      conversions: JSON.stringify(journey.conversions),
    });

    res.json({
      success: true,
      message: 'User journey saved successfully',
    });

  } catch (error) {
    console.error('Save user journey error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    // Get page views for today
    const pageViewsToday = await db.get(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE event_name = 'page_view' AND timestamp >= ?
    `, [todayStart.toISOString()]);

    // Get unique visitors for today
    const uniqueVisitorsToday = await db.get(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM analytics_events
      WHERE timestamp >= ?
    `, [todayStart.toISOString()]);

    // Get average session duration
    const avgSessionDuration = await db.get(`
      SELECT AVG(duration) as avg_duration
      FROM user_journeys
      WHERE start_time >= ?
    `, [todayStart.toISOString()]);

    // Get conversion rate
    const totalSessions = await db.get(`
      SELECT COUNT(*) as count
      FROM user_journeys
      WHERE start_time >= ?
    `, [todayStart.toISOString()]);

    const convertedSessions = await db.get(`
      SELECT COUNT(*) as count
      FROM user_journeys
      WHERE start_time >= ? AND conversion_count > 0
    `, [todayStart.toISOString()]);

    const conversionRate = totalSessions.count > 0 
      ? convertedSessions.count / totalSessions.count 
      : 0;

    // Get top pages
    const topPages = await db.all(`
      SELECT 
        JSON_EXTRACT(properties, '$.page') as page,
        COUNT(*) as views
      FROM analytics_events
      WHERE event_name = 'page_view' AND timestamp >= ?
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `, [todayStart.toISOString()]);

    // Get recent user journeys
    const recentJourneys = await db.all(`
      SELECT 
        session_id,
        page_count + action_count as events,
        duration,
        conversion_count > 0 as converted
      FROM user_journeys
      WHERE start_time >= ?
      ORDER BY start_time DESC
      LIMIT 20
    `, [todayStart.toISOString()]);

    // Get real-time events (last 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const realTimeEvents = await db.all(`
      SELECT 
        event_name as event,
        timestamp,
        JSON_EXTRACT(properties, '$.page') as page,
        user_id
      FROM analytics_events
      WHERE timestamp >= ?
      ORDER BY timestamp DESC
      LIMIT 50
    `, [oneHourAgo.toISOString()]);

    res.json({
      success: true,
      data: {
        pageViews: pageViewsToday.count || 0,
        uniqueVisitors: uniqueVisitorsToday.count || 0,
        averageSessionDuration: avgSessionDuration.avg_duration || 0,
        bounceRate: 0.35, // Mock data
        conversionRate: conversionRate,
        topPages: topPages.map(p => ({
          page: p.page || 'Unknown',
          views: p.views,
        })),
        userJourneys: recentJourneys,
        realTimeEvents: realTimeEvents.map(e => ({
          event: e.event,
          timestamp: new Date(e.timestamp).getTime(),
          page: e.page || 'Unknown',
          userId: e.user_id,
        })),
      },
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    let startDate: Date;
    switch (timeRange) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get total events
    const totalEvents = await db.get(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE timestamp >= ?
    `, [startDate.toISOString()]);

    // Get unique sessions
    const uniqueSessions = await db.get(`
      SELECT COUNT(DISTINCT session_id) as count
      FROM analytics_events
      WHERE timestamp >= ?
    `, [startDate.toISOString()]);

    // Get page views
    const pageViews = await db.get(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE event_name = 'page_view' AND timestamp >= ?
    `, [startDate.toISOString()]);

    // Get conversion events
    const conversions = await db.get(`
      SELECT COUNT(*) as count
      FROM analytics_events
      WHERE event_name LIKE 'conversion_%' AND timestamp >= ?
    `, [startDate.toISOString()]);

    // Get events by day
    const eventsByDay = await db.all(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM analytics_events
      WHERE timestamp >= ?
      GROUP BY DATE(timestamp)
      ORDER BY date
    `, [startDate.toISOString()]);

    // Get top event types
    const topEvents = await db.all(`
      SELECT 
        event_name,
        COUNT(*) as count
      FROM analytics_events
      WHERE timestamp >= ?
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT 10
    `, [startDate.toISOString()]);

    res.json({
      success: true,
      data: {
        totalEvents: totalEvents.count || 0,
        uniqueSessions: uniqueSessions.count || 0,
        pageViews: pageViews.count || 0,
        conversions: conversions.count || 0,
        eventsByDay: eventsByDay,
        topEvents: topEvents,
      },
    });

  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get conversion funnel
router.get('/leads/conversion', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let startDate: Date;
    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get lead conversion data by month
    const conversionData = await db.all(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as leads,
        SUM(CASE WHEN status IN ('closed_won') THEN 1 ELSE 0 END) as conversions
      FROM leads
      WHERE created_at >= ?
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month
    `, [startDate.toISOString()]);

    res.json({
      success: true,
      data: conversionData.map(row => ({
        month: row.month,
        leads: row.leads,
        conversions: row.conversions,
      })),
    });

  } catch (error) {
    console.error('Get conversion data error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let startDate: Date;
    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get average response time from performance events
    const avgResponseTime = await db.get(`
      SELECT AVG(CAST(JSON_EXTRACT(properties, '$.loadTime') AS REAL)) as avg_time
      FROM analytics_events
      WHERE event_name = 'page_performance' AND timestamp >= ?
    `, [startDate.toISOString()]);

    // Get satisfaction score (mock data for now)
    const satisfactionScore = 4.6;

    // Get efficiency metrics
    const totalLeads = await db.get(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE created_at >= ?
    `, [startDate.toISOString()]);

    const convertedLeads = await db.get(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE created_at >= ? AND status = 'closed_won'
    `, [startDate.toISOString()]);

    const efficiency = totalLeads.count > 0 
      ? (convertedLeads.count / totalLeads.count) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        responseTime: {
          current: avgResponseTime.avg_time || 2.3,
          previous: 2.8,
          trend: 'improving',
        },
        satisfaction: {
          current: satisfactionScore,
          previous: 4.4,
          trend: 'improving',
        },
        efficiency: {
          current: efficiency,
          previous: 82.1,
          trend: efficiency > 82.1 ? 'improving' : 'declining',
        },
      },
    });

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get user journey details
router.get('/journeys/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const journey = await db.get(`
      SELECT * FROM user_journeys WHERE session_id = ?
    `, [sessionId]);

    if (!journey) {
      return res.status(404).json({
        success: false,
        error: 'Journey not found',
      });
    }

    const events = await db.all(`
      SELECT * FROM analytics_events 
      WHERE session_id = ? 
      ORDER BY timestamp
    `, [sessionId]);

    res.json({
      success: true,
      data: {
        ...journey,
        events: events.map(event => ({
          ...event,
          properties: JSON.parse(event.properties || '{}'),
        })),
        pages: JSON.parse(journey.pages || '[]'),
        actions: JSON.parse(journey.actions || '[]'),
        conversions: JSON.parse(journey.conversions || '[]'),
      },
    });

  } catch (error) {
    console.error('Get user journey error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;