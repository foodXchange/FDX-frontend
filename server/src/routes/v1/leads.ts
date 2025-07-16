import { Router } from 'express';
import { logger } from '../../services/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, contacted, qualified, converted, lost]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: List of leads
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const assignedTo = req.query.assignedTo as string;

    // Mock leads data
    const leads = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1234567890',
        status: 'new',
        source: 'website',
        score: 85,
        assignedTo: 'agent-1',
        notes: 'Interested in commercial property',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1987654321',
        status: 'contacted',
        source: 'referral',
        score: 92,
        assignedTo: 'agent-2',
        notes: 'Looking for residential property',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let filteredLeads = leads;

    if (status) {
      filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }

    if (assignedTo) {
      filteredLeads = filteredLeads.filter(lead => lead.assignedTo === assignedTo);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    logger.info('Leads retrieved', { page, limit, status, assignedTo, count: paginatedLeads.length });

    res.json({
      success: true,
      data: paginatedLeads,
      pagination: {
        page,
        limit,
        total: filteredLeads.length,
        totalPages: Math.ceil(filteredLeads.length / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve leads', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   get:
 *     summary: Get lead by ID
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 *       404:
 *         description: Lead not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock lead data
    const lead = {
      id,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      phone: '+1234567890',
      status: 'new',
      source: 'website',
      score: 85,
      assignedTo: 'agent-1',
      notes: 'Interested in commercial property',
      requirements: {
        propertyType: 'commercial',
        budget: '500000-1000000',
        location: 'New York, NY',
        timeline: '3-6 months',
      },
      activities: [
        {
          id: '1',
          type: 'email',
          description: 'Initial contact email sent',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'call',
          description: 'Follow-up call scheduled',
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Lead retrieved', { leadId: id });

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    logger.error('Failed to retrieve lead', error as Error, { leadId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               source:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, source, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required',
      });
    }

    // Mock lead creation
    const lead = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || null,
      status: 'new',
      source: source || 'unknown',
      score: Math.floor(Math.random() * 100) + 1,
      assignedTo: null,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Lead created', { leadId: lead.id, name, email });

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    logger.error('Failed to create lead', error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/leads/{id}:
 *   put:
 *     summary: Update lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, contacted, qualified, converted, lost]
 *               assignedTo:
 *                 type: string
 *               notes:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock update
    const lead = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    logger.info('Lead updated', { leadId: id, updates });

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    logger.error('Failed to update lead', error as Error, { leadId: req.params.id, body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/leads/{id}/assign:
 *   post:
 *     summary: Assign lead to agent
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *             properties:
 *               agentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead assigned successfully
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'Agent ID is required',
      });
    }

    logger.info('Lead assigned', { leadId: id, agentId });

    res.json({
      success: true,
      message: 'Lead assigned successfully',
    });
  } catch (error) {
    logger.error('Failed to assign lead', error as Error, { leadId: req.params.id, body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/leads/{id}/activities:
 *   post:
 *     summary: Add activity to lead
 *     tags: [Leads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [call, email, meeting, note]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Activity added successfully
 */
router.post('/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: 'Type and description are required',
      });
    }

    const activity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: new Date().toISOString(),
    };

    logger.info('Activity added to lead', { leadId: id, activityType: type });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    logger.error('Failed to add activity', error as Error, { leadId: req.params.id, body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export { router as leadsRoutes };