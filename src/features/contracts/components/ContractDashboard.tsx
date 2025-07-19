import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add,
  Assessment,
  Warning,
  CheckCircle,
  Schedule,
  AttachMoney,
  Description,
  Edit,
  Visibility,
  GetApp,
  Refresh,
  Timer,
  TrendingUp,
  NotificationsActive,
  Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Contract,
  ContractStatus,
  ContractType,
  ContractAnalytics,
  ContractSearchParams
} from '../../../types/contract';
import { ContractService } from '../../../services/contracts/ContractService';
import { formatCurrency } from '../../../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contract-tabpanel-${index}`}
      aria-labelledby={`contract-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const ContractDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [analytics, setAnalytics] = useState<ContractAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus[]>([]);
  const [selectedType, setSelectedType] = useState<ContractType[]>([]);
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load contracts
      const searchParams: ContractSearchParams = {
        status: selectedStatus.length > 0 ? selectedStatus : undefined,
        type: selectedType.length > 0 ? selectedType : undefined,
        includeExpired: false,
        sortBy: 'expirationDate',
        sortOrder: 'asc'
      };

      const contractResult = await ContractService.searchContracts(searchParams);
      setContracts(contractResult.contracts);

      // Load analytics
      const analyticsData = await ContractService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return 'success';
      case ContractStatus.DRAFT:
      case ContractStatus.PENDING_REVIEW:
      case ContractStatus.PENDING_APPROVAL:
        return 'warning';
      case ContractStatus.EXPIRED:
      case ContractStatus.TERMINATED:
        return 'error';
      case ContractStatus.UNDER_NEGOTIATION:
        return 'info';
      default:
        return 'default';
    }
  };

  const getContractTypeIcon = (type: ContractType) => {
    switch (type) {
      case ContractType.PURCHASE:
      case ContractType.SALES:
        return <AttachMoney />;
      case ContractType.SERVICE:
        return <Assignment />;
      case ContractType.NDA:
        return <Description />;
      default:
        return <Description />;
    }
  };

  const handleRenewalClick = (contract: Contract) => {
    setSelectedContract(contract);
    setRenewalDialogOpen(true);
  };

  const handleRenewalConfirm = async () => {
    if (selectedContract) {
      try {
        const newExpirationDate = new Date(selectedContract.expirationDate);
        newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1);
        
        await ContractService.renewContract(
          selectedContract.id,
          newExpirationDate.toISOString()
        );
        
        setRenewalDialogOpen(false);
        loadData();
      } catch (error) {
        console.error('Error renewing contract:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Contract Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/contracts/new')}
          >
            New Contract
          </Button>
        </Box>
      </Box>

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Total Contracts
                  </Typography>
                </Box>
                <Typography variant="h4">{analytics.totalContracts}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    {analytics.activeContracts} Active
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {formatCurrency(analytics.totalValue)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg: {formatCurrency(analytics.averageValue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Timer sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Expiring Soon
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {analytics.expiringInDays.find(e => e.days === 30)?.count || 0}
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Within 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ color: 'error.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Action Required
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {analytics.overdueObligations.length}
                </Typography>
                <Typography variant="body2" color="error.main">
                  Overdue obligations
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Active Contracts" />
          <Tab label="Expiring Soon" />
          <Tab label="Pending Approval" />
          <Tab label="Performance" />
        </Tabs>
      </Paper>

      {/* Active Contracts Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Parties</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts
                .filter(c => c.status === ContractStatus.ACTIVE)
                .map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {contract.contractNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getContractTypeIcon(contract.type)}
                        <Typography sx={{ ml: 1 }}>{contract.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contract.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {contract.parties.map(p => p.organizationName).join(', ')}
                    </TableCell>
                    <TableCell>{formatCurrency(contract.totalValue)}</TableCell>
                    <TableCell>
                      <Chip
                        label={contract.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(contract.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(contract.expirationDate), 'MMM dd, yyyy')}
                        </Typography>
                        {(() => {
                          const daysLeft = Math.floor(
                            (new Date(contract.expirationDate).getTime() - new Date().getTime()) / 
                            (1000 * 60 * 60 * 24)
                          );
                          return (
                            <Typography
                              variant="caption"
                              color={daysLeft < 30 ? 'error' : 'textSecondary'}
                            >
                              {daysLeft} days left
                            </Typography>
                          );
                        })()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/contracts/${contract.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Contract">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
                            <GetApp />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Expiring Soon Tab */}
      <TabPanel value={tabValue} index={1}>
        {analytics?.expiringInDays.map((expiring) => (
          <Box key={expiring.days} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expiring in {expiring.days} days ({expiring.count} contracts)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contract Number</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Expiration Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expiring.contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.contractNumber}</TableCell>
                      <TableCell>{contract.title}</TableCell>
                      <TableCell>{formatCurrency(contract.value)}</TableCell>
                      <TableCell>
                        {format(new Date(contract.expirationDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            const fullContract = contracts.find(c => c.id === contract.id);
                            if (fullContract) {
                              handleRenewalClick(fullContract);
                            }
                          }}
                        >
                          Renew
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </TabPanel>

      {/* Pending Approval Tab */}
      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Parties</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts
                .filter(c => c.status === ContractStatus.PENDING_APPROVAL)
                .map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.contractNumber}</TableCell>
                    <TableCell>{contract.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={contract.type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {contract.parties.map(p => p.organizationName).join(', ')}
                    </TableCell>
                    <TableCell>{formatCurrency(contract.totalValue)}</TableCell>
                    <TableCell>
                      {format(new Date(contract.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => navigate(`/contracts/${contract.id}/approve`)}
                        >
                          Review
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Performance Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Upcoming Milestones */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Upcoming Milestones
                </Typography>
                {analytics?.upcomingMilestones.map((item) => (
                  <Box key={item.milestone.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {item.milestone.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.contractNumber}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Due: {format(new Date(item.milestone.dueDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Overdue Obligations */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Overdue Obligations
                </Typography>
                {analytics?.overdueObligations.map((item) => (
                  <Alert
                    key={item.obligation.id}
                    severity="warning"
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2">
                      {item.obligation.description}
                    </Typography>
                    <Typography variant="caption">
                      Contract: {item.contractNumber}
                    </Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Renewal Opportunities */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Renewal Opportunities
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Contract</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Performance Score</TableCell>
                        <TableCell>Expires</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics?.renewalOpportunities.map((opp) => (
                        <TableRow key={opp.contractId}>
                          <TableCell>{opp.contractNumber}</TableCell>
                          <TableCell>{opp.title}</TableCell>
                          <TableCell>{formatCurrency(opp.value)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={opp.performanceScore || 0}
                                sx={{ flexGrow: 1, mr: 1 }}
                              />
                              <Typography variant="body2">
                                {opp.performanceScore?.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {format(new Date(opp.expirationDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                const contract = contracts.find(c => c.id === opp.contractId);
                                if (contract) {
                                  handleRenewalClick(contract);
                                }
                              }}
                            >
                              Initiate Renewal
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Renewal Dialog */}
      <Dialog open={renewalDialogOpen} onClose={() => setRenewalDialogOpen(false)}>
        <DialogTitle>Renew Contract</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to renew contract {selectedContract?.contractNumber}?
          </Typography>
          <Typography variant="body2" color="textSecondary">
            This will create a new contract with a one-year extension from the current expiration date.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRenewalConfirm} variant="contained">
            Confirm Renewal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContractDashboard;