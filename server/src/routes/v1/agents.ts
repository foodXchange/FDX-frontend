import { Router } from 'express';
import { logger } from '../../services/logger';

const router = Router();

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    // Mock data for now
    const agents = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        status: 'active',
        expertise: ['real-estate', 'commercial'],
        rating: 4.8,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        status: 'active',
        expertise: ['residential', 'luxury'],
        rating: 4.9,
        createdAt: new Date().toISOString(),
      },
    ];

    const filteredAgents = search
      ? agents.filter(agent =>
          agent.name.toLowerCase().includes(search.toLowerCase()) ||
          agent.email.toLowerCase().includes(search.toLowerCase())
        )
      : agents;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

    logger.info('Agents retrieved', { page, limit, search, count: paginatedAgents.length });

    res.json({
      success: true,
      data: paginatedAgents,
      pagination: {
        page,
        limit,
        total: filteredAgents.length,
        totalPages: Math.ceil(filteredAgents.length / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve agents', error as Error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Mock data for now
    const agent = {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'active',
      expertise: ['real-estate', 'commercial'],
      rating: 4.8,
      bio: 'Experienced real estate agent with 10+ years in the industry.',
      location: 'New York, NY',
      languages: ['English', 'Spanish'],
      certifications: ['Licensed Real Estate Agent', 'Certified Commercial Specialist'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Agent retrieved', { agentId: id });

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error('Failed to retrieve agent', error as Error, { agentId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAgent'
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, expertise, bio, location } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and phone are required',
      });
    }

    // Mock creation
    const agent = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      expertise: expertise || [],
      bio: bio || '',
      location: location || '',
      status: 'active',
      rating: 0,
      languages: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('Agent created', { agentId: agent.id, name, email });

    res.status(201).json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error('Failed to create agent', error as Error, { body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   put:
 *     summary: Update agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAgent'
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *       404:
 *         description: Agent not found
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock update
    const agent = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    logger.info('Agent updated', { agentId: id, updates });

    res.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    logger.error('Failed to update agent', error as Error, { agentId: req.params.id, body: req.body });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   delete:
 *     summary: Delete agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       204:
 *         description: Agent deleted successfully
 *       404:
 *         description: Agent not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Agent deleted', { agentId: id });

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete agent', error as Error, { agentId: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export { router as agentsRoutes };