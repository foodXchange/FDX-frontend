import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

export class DatabaseService {
  private db: sqlite3.Database | null = null;

  async initialize() {
    const dbPath = path.join(__dirname, '../../data/agents.db');
    const dbDir = path.dirname(dbPath);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise<void>((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('Connected to SQLite database');
        this.createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    const run = promisify(this.db.run.bind(this.db));

    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'agent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agents table
    await run(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'junior',
        department TEXT NOT NULL,
        avatar TEXT,
        status TEXT DEFAULT 'active',
        skills TEXT, -- JSON array
        territories TEXT, -- JSON array
        languages TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Leads table
    await run(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        status TEXT DEFAULT 'new',
        priority TEXT DEFAULT 'medium',
        estimated_revenue REAL,
        source TEXT NOT NULL,
        tags TEXT, -- JSON array
        assigned_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_contact_at DATETIME,
        next_follow_up_at DATETIME,
        custom_fields TEXT, -- JSON object
        metadata TEXT, -- JSON object
        FOREIGN KEY (assigned_agent) REFERENCES agents (id)
      )
    `);

    // Notes table
    await run(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT DEFAULT 'general',
        is_private BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT, -- JSON array
        mentions TEXT, -- JSON array
        FOREIGN KEY (lead_id) REFERENCES leads (id),
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      )
    `);

    // Activities table
    await run(`
      CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        lead_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        type TEXT NOT NULL,
        method TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        outcome TEXT,
        duration INTEGER,
        scheduled_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        follow_up_required BOOLEAN DEFAULT 0,
        next_action TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads (id),
        FOREIGN KEY (agent_id) REFERENCES agents (id)
      )
    `);

    // Analytics events table
    await run(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT,
        event_name TEXT NOT NULL,
        properties TEXT, -- JSON object
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        page TEXT,
        user_agent TEXT
      )
    `);

    // User journeys table
    await run(`
      CREATE TABLE IF NOT EXISTS user_journeys (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        user_id TEXT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER,
        page_count INTEGER DEFAULT 0,
        action_count INTEGER DEFAULT 0,
        conversion_count INTEGER DEFAULT 0,
        bounced BOOLEAN DEFAULT 0,
        events TEXT, -- JSON array
        pages TEXT, -- JSON array
        actions TEXT, -- JSON array
        conversions TEXT -- JSON array
      )
    `);

    // Sessions table for auth
    await run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        csrf_token TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Notifications table
    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT, -- JSON object
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database tables created successfully');
  }

  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) reject(err);
          else {
            console.log('Database connection closed');
            resolve();
          }
        });
      });
    }
  }

  // Helper methods for common operations
  async createUser(user: any) {
    const { id, email, password_hash, name, role = 'agent' } = user;
    return this.run(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, password_hash, name, role]
    );
  }

  async getUserByEmail(email: string) {
    return this.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserById(id: string) {
    return this.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async createLead(lead: any) {
    const {
      id, company_name, contact_name, email, phone, status = 'new',
      priority = 'medium', estimated_revenue, source, tags = '[]',
      assigned_agent, custom_fields = '{}', metadata = '{}'
    } = lead;

    return this.run(`
      INSERT INTO leads (
        id, company_name, contact_name, email, phone, status,
        priority, estimated_revenue, source, tags, assigned_agent,
        custom_fields, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, company_name, contact_name, email, phone, status,
      priority, estimated_revenue, source, tags, assigned_agent,
      custom_fields, metadata
    ]);
  }

  async getLeads(limit = 20, offset = 0, filters: any = {}) {
    let sql = 'SELECT * FROM leads';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.priority) {
      conditions.push('priority = ?');
      params.push(filters.priority);
    }

    if (filters.assigned_agent) {
      conditions.push('assigned_agent = ?');
      params.push(filters.assigned_agent);
    }

    if (filters.search) {
      conditions.push('(company_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return this.all(sql, params);
  }

  async getLeadById(id: string) {
    return this.get('SELECT * FROM leads WHERE id = ?', [id]);
  }

  async updateLead(id: string, updates: any) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    values.push(id);
    
    return this.run(
      `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }

  async deleteLead(id: string) {
    return this.run('DELETE FROM leads WHERE id = ?', [id]);
  }

  async createAgent(agent: any) {
    const {
      id, user_id, name, email, phone, role = 'junior',
      department, avatar, status = 'active', skills = '[]',
      territories = '[]', languages = '[]'
    } = agent;

    return this.run(`
      INSERT INTO agents (
        id, user_id, name, email, phone, role, department,
        avatar, status, skills, territories, languages
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, user_id, name, email, phone, role, department,
      avatar, status, skills, territories, languages
    ]);
  }

  async getAgents() {
    return this.all('SELECT * FROM agents ORDER BY created_at DESC');
  }

  async getAgentById(id: string) {
    return this.get('SELECT * FROM agents WHERE id = ?', [id]);
  }

  async saveAnalyticsEvent(event: any) {
    const {
      id, session_id, user_id, event_name, properties = '{}',
      timestamp, page, user_agent
    } = event;

    return this.run(`
      INSERT INTO analytics_events (
        id, session_id, user_id, event_name, properties,
        timestamp, page, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, session_id, user_id, event_name, properties, timestamp, page, user_agent]);
  }

  async getAnalyticsEvents(limit = 100, offset = 0) {
    return this.all(`
      SELECT * FROM analytics_events
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  }

  async saveUserJourney(journey: any) {
    const {
      id, session_id, user_id, start_time, end_time, duration,
      page_count, action_count, conversion_count, bounced,
      events = '[]', pages = '[]', actions = '[]', conversions = '[]'
    } = journey;

    return this.run(`
      INSERT OR REPLACE INTO user_journeys (
        id, session_id, user_id, start_time, end_time, duration,
        page_count, action_count, conversion_count, bounced,
        events, pages, actions, conversions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, session_id, user_id, start_time, end_time, duration,
      page_count, action_count, conversion_count, bounced,
      events, pages, actions, conversions
    ]);
  }

  async getUserJourneys(limit = 50, offset = 0) {
    return this.all(`
      SELECT * FROM user_journeys
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);
  }
}