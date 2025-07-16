import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FDX Agents API',
      version: '1.0.0',
      description: 'API documentation for FDX Agents platform',
      contact: {
        name: 'FDX Development Team',
        email: 'dev@fdx-agents.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.fdx-agents.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Agent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the agent',
            },
            name: {
              type: 'string',
              description: 'Agent full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Agent email address',
            },
            phone: {
              type: 'string',
              description: 'Agent phone number',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'Agent status',
            },
            expertise: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas of expertise',
            },
            rating: {
              type: 'number',
              minimum: 0,
              maximum: 5,
              description: 'Agent rating',
            },
            bio: {
              type: 'string',
              description: 'Agent biography',
            },
            location: {
              type: 'string',
              description: 'Agent location',
            },
            languages: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Languages spoken',
            },
            certifications: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Professional certifications',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateAgent: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: {
              type: 'string',
              description: 'Agent full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Agent email address',
            },
            phone: {
              type: 'string',
              description: 'Agent phone number',
            },
            expertise: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas of expertise',
            },
            bio: {
              type: 'string',
              description: 'Agent biography',
            },
            location: {
              type: 'string',
              description: 'Agent location',
            },
          },
        },
        UpdateAgent: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Agent full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Agent email address',
            },
            phone: {
              type: 'string',
              description: 'Agent phone number',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: 'Agent status',
            },
            expertise: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Areas of expertise',
            },
            bio: {
              type: 'string',
              description: 'Agent biography',
            },
            location: {
              type: 'string',
              description: 'Agent location',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the user',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['user', 'agent', 'admin'],
              description: 'User role',
            },
            avatar: {
              type: 'string',
              nullable: true,
              description: 'User avatar URL',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the lead',
            },
            name: {
              type: 'string',
              description: 'Lead full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Lead email address',
            },
            phone: {
              type: 'string',
              nullable: true,
              description: 'Lead phone number',
            },
            status: {
              type: 'string',
              enum: ['new', 'contacted', 'qualified', 'converted', 'lost'],
              description: 'Lead status',
            },
            source: {
              type: 'string',
              description: 'Lead source',
            },
            score: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Lead score',
            },
            assignedTo: {
              type: 'string',
              nullable: true,
              description: 'Assigned agent ID',
            },
            notes: {
              type: 'string',
              description: 'Lead notes',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Unauthorized: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        Forbidden: {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Agents',
        description: 'Agent management',
      },
      {
        name: 'Leads',
        description: 'Lead management',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting',
      },
      {
        name: 'System',
        description: 'System monitoring and health',
      },
    ],
  },
  apis: [
    './src/routes/v1/*.ts',
    './src/routes/v1/*.js',
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FDX Agents API Documentation',
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
    },
  }));

  // JSON endpoint for the spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;