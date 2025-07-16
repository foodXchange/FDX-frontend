import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Badge,
  Avatar,
  useTheme,
  CircularProgress,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  CheckBox,
  CheckBoxOutlineBlank,
  MoreVert,
  Edit,
  Delete,
  Send,
  Schedule,
  Assignment,
  AutoMode,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  History,
  Download,
  Upload,
  ContentCopy,
  FilterList,
  SelectAll,
  Clear,
  Phone,
  Email,
  WhatsApp,
  Assignment as AssignmentIcon,
  Person,
  Business,
  LocationOn,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Error,
  Warning,
  Info,
} from '@mui/icons-material';
import { useAgentStore } from '../../store';
import { Lead, LeadStatus, LeadPriority, BusinessType } from '../../types';

interface BulkOperation {
  id: string;
  name: string;
  type: 'update_status' | 'assign_agent' | 'send_message' | 'update_priority' | 'bulk_email' | 'export_data' | 'delete_leads';
  description: string;
  configuration: Record<string, any>;
  leadIds: string[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  results?: BulkOperationResult[];
}

interface BulkOperationResult {
  leadId: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule?: AutomationSchedule;
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
}

interface AutomationTrigger {
  type: 'time_based' | 'event_based' | 'condition_based';
  configuration: Record<string, any>;
}

interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

interface AutomationAction {
  type: 'update_field' | 'send_email' | 'send_whatsapp' | 'create_task' | 'assign_agent' | 'add_note';
  configuration: Record<string, any>;
}

interface AutomationSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

const BulkOperations: React.FC = () => {
  const theme = useTheme();
  const { leads, setLeads, updateLead } = useAgentStore();
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAutomationDialog, setShowAutomationDialog] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('');
  const [operationConfig, setOperationConfig] = useState<Record<string, any>>({});
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    loadBulkOperations();
    loadAutomationRules();
  }, []);

  const loadBulkOperations = () => {
    // Mock data
    const mockOperations: BulkOperation[] = [
      {
        id: '1',
        name: 'Update High Priority Leads',
        type: 'update_status',
        description: 'Update status to "qualified" for high priority leads',
        configuration: { newStatus: 'qualified' },
        leadIds: ['1', '2', '3', '4', '5'],
        status: 'completed',
        progress: 100,
        totalItems: 5,
        processedItems: 5,
        failedItems: 0,
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3300000).toISOString(),
        createdBy: 'current-agent',
        results: [
          { leadId: '1', status: 'success', message: 'Status updated successfully', timestamp: new Date().toISOString() },
          { leadId: '2', status: 'success', message: 'Status updated successfully', timestamp: new Date().toISOString() },
          { leadId: '3', status: 'success', message: 'Status updated successfully', timestamp: new Date().toISOString() },
          { leadId: '4', status: 'success', message: 'Status updated successfully', timestamp: new Date().toISOString() },
          { leadId: '5', status: 'success', message: 'Status updated successfully', timestamp: new Date().toISOString() },
        ],
      },
      {
        id: '2',
        name: 'Send Welcome Emails',
        type: 'bulk_email',
        description: 'Send welcome email to new restaurant leads',
        configuration: { 
          template: 'welcome_restaurant',
          subject: 'Welcome to FDX - Your Food Distribution Partner'
        },
        leadIds: ['6', '7', '8'],
        status: 'running',
        progress: 67,
        totalItems: 3,
        processedItems: 2,
        failedItems: 0,
        startedAt: new Date(Date.now() - 900000).toISOString(),
        createdBy: 'current-agent',
      },
    ];
    
    setBulkOperations(mockOperations);
  };

  const loadAutomationRules = () => {
    // Mock data
    const mockRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Auto-follow up cold leads',
        enabled: true,
        trigger: {
          type: 'time_based',
          configuration: { interval: 'daily', time: '09:00' },
        },
        conditions: [
          { field: 'status', operator: 'equals', value: 'contacted' },
          { field: 'daysSinceContact', operator: 'greater_than', value: 7 },
        ],
        actions: [
          {
            type: 'send_email',
            configuration: {
              template: 'follow_up_cold',
              subject: 'Following up on our conversation',
            },
          },
          {
            type: 'update_field',
            configuration: {
              field: 'status',
              value: 'nurturing',
            },
          },
        ],
        executionCount: 24,
        lastExecuted: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: '2',
        name: 'High-value lead alerts',
        enabled: true,
        trigger: {
          type: 'event_based',
          configuration: { event: 'lead_created' },
        },
        conditions: [
          { field: 'estimatedRevenue', operator: 'greater_than', value: 10000 },
        ],
        actions: [
          {
            type: 'assign_agent',
            configuration: { agentId: 'senior-agent-1' },
          },
          {
            type: 'create_task',
            configuration: {
              title: 'Contact high-value lead immediately',
              priority: 'urgent',
              dueDate: 'today',
            },
          },
        ],
        executionCount: 8,
        lastExecuted: new Date(Date.now() - 43200000).toISOString(),
        createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ];
    
    setAutomationRules(mockRules);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'update_status': return <Edit />;
      case 'assign_agent': return <Person />;
      case 'send_message': return <Send />;
      case 'bulk_email': return <Email />;
      case 'export_data': return <Download />;
      case 'delete_leads': return <Delete />;
      default: return <Assignment />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'running': return <CircularProgress size={20} />;
      case 'failed': return <Error color="error" />;
      case 'paused': return <Pause color="warning" />;
      default: return <Schedule color="action" />;
    }
  };

  const executeBulkOperation = async () => {
    if (selectedLeads.length === 0 || !selectedOperation) return;

    setIsProcessing(true);
    
    const operation: BulkOperation = {
      id: Date.now().toString(),
      name: `Bulk ${selectedOperation.replace('_', ' ')}`,
      type: selectedOperation as any,
      description: `${selectedOperation.replace('_', ' ')} for ${selectedLeads.length} leads`,
      configuration: operationConfig,
      leadIds: selectedLeads,
      status: 'running',
      progress: 0,
      totalItems: selectedLeads.length,
      processedItems: 0,
      failedItems: 0,
      startedAt: new Date().toISOString(),
      createdBy: 'current-agent',
    };

    setBulkOperations(prev => [operation, ...prev]);
    setShowBulkDialog(false);

    // Simulate processing
    for (let i = 0; i < selectedLeads.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBulkOperations(prev => prev.map(op => 
        op.id === operation.id 
          ? {
              ...op,
              progress: ((i + 1) / selectedLeads.length) * 100,
              processedItems: i + 1,
            }
          : op
      ));

      // Apply the actual operation
      if (selectedOperation === 'update_status' && operationConfig.newStatus) {
        updateLead(selectedLeads[i], { status: operationConfig.newStatus });
      }
    }

    // Complete operation
    setBulkOperations(prev => prev.map(op => 
      op.id === operation.id 
        ? {
            ...op,
            status: 'completed',
            completedAt: new Date().toISOString(),
          }
        : op
    ));

    setIsProcessing(false);
    setSelectedLeads([]);
    setSelectedOperation('');
    setOperationConfig({});
  };

  const BulkOperationSteps = () => {
    const steps = [
      {
        label: 'Select Leads',
        content: (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Select the leads you want to perform bulk operations on.
            </Typography>
            <Typography variant="h6" color="primary">
              {selectedLeads.length} leads selected
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Choose Operation',
        content: (
          <FormControl fullWidth>
            <InputLabel>Operation Type</InputLabel>
            <Select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              label="Operation Type"
            >
              <MenuItem value="update_status">Update Status</MenuItem>
              <MenuItem value="update_priority">Update Priority</MenuItem>
              <MenuItem value="assign_agent">Assign Agent</MenuItem>
              <MenuItem value="send_message">Send Message</MenuItem>
              <MenuItem value="bulk_email">Send Email</MenuItem>
              <MenuItem value="export_data">Export Data</MenuItem>
              <MenuItem value="delete_leads">Delete Leads</MenuItem>
            </Select>
          </FormControl>
        ),
      },
      {
        label: 'Configure Operation',
        content: (
          <Box>
            {selectedOperation === 'update_status' && (
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={operationConfig.newStatus || ''}
                  onChange={(e) => setOperationConfig({ ...operationConfig, newStatus: e.target.value })}
                  label="New Status"
                >
                  <MenuItem value="contacted">Contacted</MenuItem>
                  <MenuItem value="qualified">Qualified</MenuItem>
                  <MenuItem value="proposal">Proposal</MenuItem>
                  <MenuItem value="negotiation">Negotiation</MenuItem>
                  <MenuItem value="closed_won">Closed Won</MenuItem>
                  <MenuItem value="closed_lost">Closed Lost</MenuItem>
                  <MenuItem value="nurturing">Nurturing</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {selectedOperation === 'update_priority' && (
              <FormControl fullWidth>
                <InputLabel>New Priority</InputLabel>
                <Select
                  value={operationConfig.newPriority || ''}
                  onChange={(e) => setOperationConfig({ ...operationConfig, newPriority: e.target.value })}
                  label="New Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            )}
            
            {selectedOperation === 'send_message' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Message"
                value={operationConfig.message || ''}
                onChange={(e) => setOperationConfig({ ...operationConfig, message: e.target.value })}
                placeholder="Enter your message..."
              />
            )}
            
            {selectedOperation === 'bulk_email' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={operationConfig.subject || ''}
                  onChange={(e) => setOperationConfig({ ...operationConfig, subject: e.target.value })}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Email Content"
                  value={operationConfig.content || ''}
                  onChange={(e) => setOperationConfig({ ...operationConfig, content: e.target.value })}
                />
              </Box>
            )}
          </Box>
        ),
      },
    ];

    return (
      <Stepper activeStep={currentStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              {step.content}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (index === steps.length - 1) {
                      executeBulkOperation();
                    } else {
                      setCurrentStep(index + 1);
                    }
                  }}
                  disabled={
                    (index === 0 && selectedLeads.length === 0) ||
                    (index === 1 && !selectedOperation) ||
                    (index === 2 && selectedOperation === 'update_status' && !operationConfig.newStatus) ||
                    isProcessing
                  }
                  sx={{ mr: 1 }}
                >
                  {index === steps.length - 1 ? 'Execute' : 'Continue'}
                </Button>
                <Button
                  disabled={index === 0}
                  onClick={() => setCurrentStep(index - 1)}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    );
  };

  const LeadsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedLeads.length > 0 && selectedLeads.length < leads.length}
                checked={leads.length > 0 && selectedLeads.length === leads.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.slice(0, 10).map((lead) => (
            <TableRow key={lead.id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onChange={() => handleSelectLead(lead.id)}
                />
              </TableCell>
              <TableCell>{lead.companyName}</TableCell>
              <TableCell>{lead.contactPerson}</TableCell>
              <TableCell>
                <Chip label={lead.status} size="small" />
              </TableCell>
              <TableCell>
                <Chip 
                  label={lead.priority} 
                  size="small" 
                  color={
                    lead.priority === 'urgent' ? 'error' :
                    lead.priority === 'high' ? 'warning' :
                    lead.priority === 'medium' ? 'info' : 'default'
                  }
                />
              </TableCell>
              <TableCell>${lead.estimatedRevenue.toLocaleString()}</TableCell>
              <TableCell>{lead.location.city}, {lead.location.state}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const OperationsHistory = () => (
    <List>
      {bulkOperations.map((operation) => (
        <ListItem key={operation.id} sx={{ mb: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          <ListItemIcon>
            <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
              {getOperationIcon(operation.type)}
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2">{operation.name}</Typography>
                {getStatusIcon(operation.status)}
                <Chip label={operation.status} size="small" />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {operation.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="caption">
                    {operation.processedItems}/{operation.totalItems} items
                  </Typography>
                  {operation.status === 'running' && (
                    <LinearProgress
                      variant="determinate"
                      value={operation.progress}
                      sx={{ flex: 1, maxWidth: 200 }}
                    />
                  )}
                  <Typography variant="caption">
                    {operation.startedAt && new Date(operation.startedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  const AutomationRules = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Automation Rules</Typography>
        <Button
          variant="contained"
          startIcon={<AutoMode />}
          onClick={() => setShowAutomationDialog(true)}
        >
          Create Rule
        </Button>
      </Box>
      
      <List>
        {automationRules.map((rule) => (
          <ListItem key={rule.id} sx={{ mb: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: rule.enabled ? theme.palette.success.light : theme.palette.grey[400] }}>
                <AutoMode />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">{rule.name}</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={rule.enabled}
                        onChange={(e) => {
                          setAutomationRules(prev => prev.map(r => 
                            r.id === rule.id ? { ...r, enabled: e.target.checked } : r
                          ));
                        }}
                        size="small"
                      />
                    }
                    label=""
                  />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {rule.conditions.length} condition(s) • {rule.actions.length} action(s)
                  </Typography>
                  <Typography variant="caption">
                    Executed {rule.executionCount} times • 
                    Last: {rule.lastExecuted ? new Date(rule.lastExecuted).toLocaleString() : 'Never'}
                  </Typography>
                </Box>
              }
            />
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <Assignment />
          </Avatar>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Bulk Operations & Automation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Efficiently manage multiple leads and automate repetitive tasks
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Badge badgeContent={selectedLeads.length} color="primary">
            <Button
              variant="contained"
              startIcon={<CheckBox />}
              onClick={() => setShowBulkDialog(true)}
              disabled={selectedLeads.length === 0}
            >
              Bulk Actions
            </Button>
          </Badge>
          <Button
            variant="outlined"
            startIcon={<AutoMode />}
            onClick={() => setShowAutomationDialog(true)}
          >
            Automation
          </Button>
        </Box>
      </Box>

      {/* Selection Summary */}
      {selectedLeads.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              {selectedLeads.length} lead(s) selected
            </Typography>
            <Button size="small" onClick={() => setSelectedLeads([])}>
              Clear Selection
            </Button>
          </Box>
        </Alert>
      )}

      {/* Leads Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Leads</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                startIcon={selectedLeads.length === leads.length ? <Clear /> : <SelectAll />}
                onClick={handleSelectAll}
                size="small"
              >
                {selectedLeads.length === leads.length ? 'Clear All' : 'Select All'}
              </Button>
              <Button startIcon={<FilterList />} size="small">
                Filter
              </Button>
            </Box>
          </Box>
          <LeadsTable />
        </CardContent>
      </Card>

      {/* Operations History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recent Operations
          </Typography>
          <OperationsHistory />
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardContent>
          <AutomationRules />
        </CardContent>
      </Card>

      {/* Bulk Operation Dialog */}
      <Dialog open={showBulkDialog} onClose={() => setShowBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Operations</DialogTitle>
        <DialogContent>
          <BulkOperationSteps />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBulkDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Automation Dialog */}
      <Dialog open={showAutomationDialog} onClose={() => setShowAutomationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Automation Rule</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Advanced automation rule builder coming soon. Create custom triggers, conditions, and actions.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAutomationDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Rule</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>
          <Edit sx={{ mr: 1 }} />
          Edit Rule
        </MenuItem>
        <MenuItem>
          <PlayArrow sx={{ mr: 1 }} />
          Run Now
        </MenuItem>
        <MenuItem>
          <History sx={{ mr: 1 }} />
          View History
        </MenuItem>
        <Divider />
        <MenuItem>
          <Delete sx={{ mr: 1 }} />
          Delete Rule
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BulkOperations;