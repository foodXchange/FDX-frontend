import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../services/database';

const router = express.Router();
const db = new DatabaseService();

// Initialize database connection
db.initialize().catch(console.error);

// Get all leads with pagination and filtering
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'inactive']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('search').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search,
      assigned_agent: req.query.assigned_agent,
    };

    const leads = await db.getLeads(limit, offset, filters);
    
    // Get total count for pagination
    const totalResult = await db.get(`
      SELECT COUNT(*) as total FROM leads
      ${filters.status ? 'WHERE status = ?' : ''}
    `, filters.status ? [filters.status] : []);
    
    const total = totalResult.total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: leads.map(lead => ({
        ...lead,
        tags: JSON.parse(lead.tags || '[]'),
        customFields: JSON.parse(lead.custom_fields || '{}'),
        metadata: JSON.parse(lead.metadata || '{}'),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await db.getLeadById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    // Get related notes and activities
    const notes = await db.all('SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
    const activities = await db.all('SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({
      success: true,
      data: {
        ...lead,
        tags: JSON.parse(lead.tags || '[]'),
        customFields: JSON.parse(lead.custom_fields || '{}'),
        metadata: JSON.parse(lead.metadata || '{}'),
        notes: notes.map(note => ({
          ...note,
          tags: JSON.parse(note.tags || '[]'),
          mentions: JSON.parse(note.mentions || '[]'),
        })),
        activities,
      },
    });

  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Create new lead
router.post('/', [
  body('companyName').isLength({ min: 1 }).trim(),
  body('contactName').isLength({ min: 1 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'inactive']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('estimatedRevenue').optional().isNumeric(),
  body('source').isString(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const leadId = uuidv4();
    const leadData = {
      id: leadId,
      company_name: req.body.companyName,
      contact_name: req.body.contactName,
      email: req.body.email,
      phone: req.body.phone,
      status: req.body.status || 'new',
      priority: req.body.priority || 'medium',
      estimated_revenue: req.body.estimatedRevenue,
      source: req.body.source,
      tags: JSON.stringify(req.body.tags || []),
      assigned_agent: req.body.assignedAgent,
      custom_fields: JSON.stringify(req.body.customFields || {}),
      metadata: JSON.stringify({
        createdBy: (req as any).user?.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }),
    };

    await db.createLead(leadData);

    const createdLead = await db.getLeadById(leadId);

    res.status(201).json({
      success: true,
      data: {
        ...createdLead,
        tags: JSON.parse(createdLead.tags || '[]'),
        customFields: JSON.parse(createdLead.custom_fields || '{}'),
        metadata: JSON.parse(createdLead.metadata || '{}'),
      },
    });

  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Update lead
router.put('/:id', [
  body('companyName').optional().isLength({ min: 1 }).trim(),
  body('contactName').optional().isLength({ min: 1 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isString(),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'inactive']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('estimatedRevenue').optional().isNumeric(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const leadId = req.params.id;
    const existingLead = await db.getLeadById(leadId);
    
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    const updates: any = {};
    if (req.body.companyName) updates.company_name = req.body.companyName;
    if (req.body.contactName) updates.contact_name = req.body.contactName;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (req.body.status) updates.status = req.body.status;
    if (req.body.priority) updates.priority = req.body.priority;
    if (req.body.estimatedRevenue !== undefined) updates.estimated_revenue = req.body.estimatedRevenue;
    if (req.body.assignedAgent !== undefined) updates.assigned_agent = req.body.assignedAgent;
    if (req.body.tags) updates.tags = JSON.stringify(req.body.tags);
    if (req.body.customFields) updates.custom_fields = JSON.stringify(req.body.customFields);

    await db.updateLead(leadId, updates);

    const updatedLead = await db.getLeadById(leadId);

    res.json({
      success: true,
      data: {
        ...updatedLead,
        tags: JSON.parse(updatedLead.tags || '[]'),
        customFields: JSON.parse(updatedLead.custom_fields || '{}'),
        metadata: JSON.parse(updatedLead.metadata || '{}'),
      },
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Delete lead
router.delete('/:id', async (req, res) => {
  try {
    const leadId = req.params.id;
    const existingLead = await db.getLeadById(leadId);
    
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    // Delete related records first
    await db.run('DELETE FROM notes WHERE lead_id = ?', [leadId]);
    await db.run('DELETE FROM activities WHERE lead_id = ?', [leadId]);
    
    // Delete the lead
    await db.deleteLead(leadId);

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });

  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Add note to lead
router.post('/:id/notes', [
  body('content').isLength({ min: 1 }).trim(),
  body('type').optional().isIn(['general', 'call_summary', 'meeting_notes', 'follow_up', 'alert']),
  body('isPrivate').optional().isBoolean(),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const leadId = req.params.id;
    const existingLead = await db.getLeadById(leadId);
    
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    const noteId = uuidv4();
    await db.run(`
      INSERT INTO notes (id, lead_id, agent_id, content, type, is_private, tags, mentions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      noteId,
      leadId,
      (req as any).user?.id,
      req.body.content,
      req.body.type || 'general',
      req.body.isPrivate || false,
      JSON.stringify(req.body.tags || []),
      JSON.stringify(req.body.mentions || []),
    ]);

    const createdNote = await db.get('SELECT * FROM notes WHERE id = ?', [noteId]);

    res.status(201).json({
      success: true,
      data: {
        ...createdNote,
        tags: JSON.parse(createdNote.tags || '[]'),
        mentions: JSON.parse(createdNote.mentions || '[]'),
      },
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Add activity to lead
router.post('/:id/activities', [
  body('type').isIn(['call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'document_sent', 'contract_signed', 'payment_received']),
  body('method').isIn(['email', 'phone', 'sms', 'social_media', 'in_person', 'video_call']),
  body('subject').isLength({ min: 1 }).trim(),
  body('description').optional().isString(),
  body('outcome').optional().isIn(['successful', 'no_answer', 'voicemail', 'busy', 'interested', 'not_interested', 'callback_requested', 'information_sent', 'meeting_scheduled']),
  body('duration').optional().isInt({ min: 0 }),
  body('scheduledAt').optional().isISO8601(),
  body('completedAt').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const leadId = req.params.id;
    const existingLead = await db.getLeadById(leadId);
    
    if (!existingLead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found',
      });
    }

    const activityId = uuidv4();
    await db.run(`
      INSERT INTO activities (
        id, lead_id, agent_id, type, method, subject, description,
        outcome, duration, scheduled_at, completed_at, follow_up_required, next_action
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      activityId,
      leadId,
      (req as any).user?.id,
      req.body.type,
      req.body.method,
      req.body.subject,
      req.body.description,
      req.body.outcome,
      req.body.duration,
      req.body.scheduledAt,
      req.body.completedAt,
      req.body.followUpRequired || false,
      req.body.nextAction,
    ]);

    const createdActivity = await db.get('SELECT * FROM activities WHERE id = ?', [activityId]);

    res.status(201).json({
      success: true,
      data: createdActivity,
    });

  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;