import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
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
  MenuItem,Alert,
  LinearProgress,
  Avatar,
  Divider,
  useTheme,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
import { Grid } from '@mui/material';
import {} from '@mui/x-date-pickers/';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Download,
  FilterList,
  AccountBalance,
  Schedule,
  CheckCircle,
  Error,
  Info,
  Pending,
} from '@mui/icons-material';
import { useAgentStore } from '../store';
import { agentApi } from '../services';
import { Commission, CommissionStatus, CommissionType } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`commission-tabpanel-${index}`}
    aria-labelledby={`commission-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const CommissionTracking: React.FC = () => {
  const theme = useTheme();
  const { currentAgent } = useAgentStore();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [filters] = useState({
    status: 'all' as CommissionStatus | 'all',
    type: 'all' as CommissionType | 'all',
    period: 'month' as 'week' | 'month' | 'quarter' | 'year',
  });

  const [metrics, setMetrics] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    thisMonthEarnings: 0,
    averageCommission: 0,
    growthRate: 0,
    totalCommissions: 0,
  });

  useEffect(() => {
    loadCommissions();
  }, [filters]);

  useEffect(() => {
    calculateMetrics();
  }, [commissions]);

  const loadCommissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await agentApi.getCommissions();
      setCommissions(result.commissions);
    } catch (err: unknown) {
      const error = err as Error;
      if (error instanceof Error) {
        setError(error.message);
      } else if (typeof err === 'object' && err && 'message' in err) {
        setError(String((err as any).message));
      } else {
        setError('Failed to load commissions');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalEarned = commissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const pendingAmount = commissions
      .filter(c => c.status === 'pending' || c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthEarnings = commissions
      .filter(c => {
        const commissionDate = new Date(c.createdAt);
        return commissionDate >= thisMonth && c.status === 'paid';
      })
      .reduce((sum, c) => sum + c.amount, 0);
    
    const averageCommission = commissions.length > 0 
      ? commissions.reduce((sum, c) => sum + c.amount, 0) / commissions.length 
      : 0;
    
    // Mock growth rate calculation
    const growthRate = 15.2;
    
    setMetrics({
      totalEarned,
      pendingAmount,
      thisMonthEarnings,
      averageCommission,
      growthRate,
      totalCommissions: commissions.length,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: CommissionStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'paid': return 'success';
      case 'disputed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: CommissionStatus) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'approved': return <CheckCircle />;
      case 'paid': return <AttachMoney />;
      case 'disputed': return <Error />;
      case 'cancelled': return <Error />;
      default: return <Info />;
    }
  };

  const getTypeColor = (type: CommissionType) => {
    switch (type) {
      case 'new_signup': return 'primary';
      case 'monthly_revenue': return 'success';
      case 'referral': return 'secondary';
      case 'bonus': return 'warning';
      case 'penalty': return 'error';
      default: return 'default';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, commission: Commission) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommission(commission);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCommission(null);
  };

  const showCommissionDetails = () => {
    setShowDetails(true);
    handleMenuClose();
  };

  const exportCommissions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Lead/Order ID', 'Payment Date'],
      ...commissions.map(commission => [
        new Date(commission.createdAt).toLocaleDateString(),
        commission.type,
        commission.amount.toString(),
        commission.status,
        commission.leadId || commission.orderId || '',
        commission.paymentDate ? new Date(commission.paymentDate).toLocaleDateString() : '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    trend?: number;
  }> = ({ title, value, icon, color = theme.palette.primary.main, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {typeof value === 'number' && title.includes('$') ? formatCurrency(value) : value}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend >= 0 ? (
              <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
            ) : (
              <TrendingDown color="error" sx={{ fontSize: 16, mr: 0.5 }} />
            )}
            <Typography
              variant="body2"
              color={trend >= 0 ? 'success.main' : 'error.main'}
            >
              {Math.abs(trend)}% vs last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const CommissionsTable: React.FC = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Payment Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {commissions.map((commission) => (
            <TableRow key={commission.id}>
              <TableCell>
                {new Date(commission.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={commission.type.replace('_', ' ')}
                  size="small"
                  color={getTypeColor(commission.type) as any}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(commission.amount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {commission.rate}% of {formatCurrency(commission.baseAmount)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  icon={getStatusIcon(commission.status)}
                  label={commission.status}
                  size="small"
                  color={getStatusColor(commission.status) as any}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {commission.leadId ? `Lead: ${commission.leadId.slice(-8)}` : 
                   commission.orderId ? `Order: ${commission.orderId.slice(-8)}` : 
                   'N/A'}
                </Typography>
              </TableCell>
              <TableCell>
                {commission.paymentDate ? (
                  new Date(commission.paymentDate).toLocaleDateString()
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not paid
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <IconButton
                  onClick={(e) => handleMenuOpen(e, commission)}
                  size="small"
                >
                  <MoreVert />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const AnalyticsView: React.FC = () => (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Commission Analytics
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Chart component would go here (commission trends over time)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Commission by Type
            </Typography>
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Pie chart component would go here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Monthly Progression
            </Typography>
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Bar chart component would go here
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Commission Tracking
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={exportCommissions}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              size="small"
              sx={{ textTransform: 'none' }}
            >
              Filters
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Total Earned"
            value={metrics.totalEarned}
            icon={<AttachMoney />}
            color={theme.palette.success.main}
            trend={metrics.growthRate}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Pending"
            value={metrics.pendingAmount}
            icon={<Schedule />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="This Month"
            value={metrics.thisMonthEarnings}
            icon={<TrendingUp />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            title="Average"
            value={metrics.averageCommission}
            icon={<AccountBalance />}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Progress to Next Tier */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Progress to Next Tier
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="body2">
              Current: <strong>{currentAgent?.tier || 'Bronze'}</strong>
            </Typography>
            <Typography variant="body2">
              Next: <strong>Silver</strong>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={65}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(2500)} of {formatCurrency(5000)} monthly target (65%)
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab label="All Commissions" sx={{ textTransform: 'none' }} />
          <Tab label="Analytics" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {isLoading ? (
          <LinearProgress />
        ) : (
          <CommissionsTable />
        )}
      </TabPanel>
      
      <TabPanel value={currentTab} index={1}>
        <AnalyticsView />
      </TabPanel>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={showCommissionDetails}>
          <Info sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem>
          <Download sx={{ mr: 1 }} />
          Download Receipt
        </MenuItem>
        <Divider />
        <MenuItem disabled={selectedCommission?.status !== 'paid'}>
          <Error sx={{ mr: 1 }} />
          Dispute Commission
        </MenuItem>
      </Menu>

      {/* Commission Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Commission Details</DialogTitle>
        <DialogContent>
          {selectedCommission && (
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <AttachMoney />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Amount"
                  secondary={formatCurrency(selectedCommission.amount)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Type"
                  secondary={selectedCommission.type.replace('_', ' ')}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={selectedCommission.status}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Commission Rate"
                  secondary={`${selectedCommission.rate}%`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Base Amount"
                  secondary={formatCurrency(selectedCommission.baseAmount)}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Period"
                  secondary={`${new Date(selectedCommission.period.startDate).toLocaleDateString()} - ${new Date(selectedCommission.period.endDate).toLocaleDateString()}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Created"
                  secondary={new Date(selectedCommission.createdAt).toLocaleString()}
                />
              </ListItem>
              {selectedCommission.paymentDate && (
                <ListItem>
                  <ListItemText
                    primary="Payment Date"
                    secondary={new Date(selectedCommission.paymentDate).toLocaleDateString()}
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default CommissionTracking;