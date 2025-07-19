import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Button,
  Tab,
  Tabs,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../../../services/payments/PaymentService';
import InvoiceService from '../../../services/payments/InvoiceService';
import { PaymentAnalytics, InvoiceAnalytics, PaymentStatus, InvoiceStatus } from '../../../types/payment';
import { formatCurrency } from '../../../utils/format';
import PaymentList from './PaymentList';
import InvoiceList from './InvoiceList';
import PaymentChart from './PaymentChart';
import AgingReport from './AgingReport';

export const PaymentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [paymentAnalytics, setPaymentAnalytics] = useState<PaymentAnalytics | null>(null);
  const [invoiceAnalytics, setInvoiceAnalytics] = useState<InvoiceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [payments, invoices] = await Promise.all([
        PaymentService.getPaymentAnalytics(dateRange),
        InvoiceService.getInvoiceAnalytics(dateRange)
      ]);
      setPaymentAnalytics(payments);
      setInvoiceAnalytics(invoices);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'payments' | 'invoices') => {
    try {
      const result = type === 'payments'
        ? await PaymentService.exportPayments({}, 'excel')
        : await InvoiceService.exportInvoices({}, 'excel');
      
      // Download file
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Export failed:', error);
    }
    setAnchorEl(null);
  };

  const getStatusColor = (status: PaymentStatus | InvoiceStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
      case InvoiceStatus.PAID:
        return 'success';
      case PaymentStatus.PROCESSING:
      case InvoiceStatus.SENT:
        return 'info';
      case PaymentStatus.FAILED:
      case InvoiceStatus.OVERDUE:
        return 'error';
      case PaymentStatus.PENDING:
      case InvoiceStatus.DRAFT:
        return 'warning';
      default:
        return 'default';
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Payments & Invoicing
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/payments/new')}
          >
            New Payment
          </Button>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography color="text.secondary" variant="body2">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {formatCurrency(paymentAnalytics?.totalVolume || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                  +12.5% from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ReceiptIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography color="text.secondary" variant="body2">
                  Outstanding Invoices
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {formatCurrency(invoiceAnalytics?.totalOutstanding || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {invoiceAnalytics?.overdueCount || 0} overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography color="text.secondary" variant="body2">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {((paymentAnalytics?.successRate || 0) * 100).toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {paymentAnalytics?.totalTransactions || 0} total transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography color="text.secondary" variant="body2">
                  Avg. Payment Time
                </Typography>
              </Box>
              <Typography variant="h5" component="div">
                {invoiceAnalytics?.averageDaysToPayment?.toFixed(1) || 0} days
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Processing: {paymentAnalytics?.averageProcessingTime?.toFixed(1) || 0}h
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {invoiceAnalytics && invoiceAnalytics.overdueCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setActiveTab(1)}>
              View Overdue
            </Button>
          }
        >
          You have {invoiceAnalytics.overdueCount} overdue invoices totaling {formatCurrency(invoiceAnalytics.overdueAmount)}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Overview" />
          <Tab label="Invoices" />
          <Tab label="Payments" />
          <Tab label="Aging Report" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <PaymentChart 
              paymentData={paymentAnalytics}
              invoiceData={invoiceAnalytics}
              dateRange={dateRange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Payment Methods
                </Typography>
                {paymentAnalytics && Object.entries(paymentAnalytics.byMethod).map(([method, count]) => (
                  <Box key={method} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{method.replace(/_/g, ' ')}</Typography>
                      <Typography variant="body2">{count} transactions</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(count / paymentAnalytics.totalTransactions) * 100}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && <InvoiceList />}
      {activeTab === 2 && <PaymentList />}
      {activeTab === 3 && <AgingReport />}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Customers by Revenue
                </Typography>
                {paymentAnalytics?.topCustomers.map((customer) => (
                  <Box key={customer.customerId} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{customer.customerName}</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(customer.totalAmount)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {customer.transactionCount} transactions
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Invoice Status Distribution
                </Typography>
                {invoiceAnalytics && Object.entries(invoiceAnalytics.byStatus).map(([status, count]) => (
                  <Box key={status} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={status.replace(/_/g, ' ')} 
                          size="small" 
                          color={getStatusColor(status as InvoiceStatus) as any}
                          sx={{ mr: 1 }}
                        />
                      </Box>
                      <Typography variant="body2">{count} invoices</Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('payments')}>
          <DownloadIcon sx={{ mr: 1 }} /> Export Payments
        </MenuItem>
        <MenuItem onClick={() => handleExport('invoices')}>
          <DownloadIcon sx={{ mr: 1 }} /> Export Invoices
        </MenuItem>
        <MenuItem onClick={() => navigate('/payments/settings')}>
          <AssessmentIcon sx={{ mr: 1 }} /> Payment Settings
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default PaymentDashboard;