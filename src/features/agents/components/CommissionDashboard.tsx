import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, Card, CardContent, Grid, Select, MenuItem, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Stack, Container, Divider } from '@mui/material';
import { formatCurrency, formatDate } from '@/utils/format';
import { EarningsChart } from './EarningsChart';

export const CommissionDashboard: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'year'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('all');

  // Mock earnings data - replace with actual API call
  const [earnings, setEarnings] = useState({
    today: 345.50,
    thisWeek: 1250.00,
    thisMonth: 4580.00,
    pending: 890.00,
    lifetime: 45200.00,
    totalEarnings: 45200.00,
    monthlyEarnings: 4580.00,
    pendingCommissions: 890.00,
    projectedEarnings: 5200.00,
    recentTransactions: [] as any[],
    conversionRate: 0.68
  });

  // Mock data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setEarnings(prev => ({
        ...prev,
        conversionRate: 0.68,
        recentTransactions: [
          {
            id: '1',
            agentId: 'agent123',
            orderId: 'order789',
            rfqId: 'rfq456',
            amount: 245,
            percentage: 2,
            status: 'paid',
            createdAt: new Date('2024-01-15'),
            paidAt: new Date('2024-01-15'),
            paymentMethod: 'bank_transfer'
          },
          {
            id: '2',
            agentId: 'agent123',
            orderId: 'order654',
            rfqId: 'rfq321',
            amount: 180,
            percentage: 2,
            status: 'paid',
            createdAt: new Date('2024-01-14'),
            paidAt: new Date('2024-01-14'),
            paymentMethod: 'bank_transfer'
          },
          {
            id: '3',
            agentId: 'agent123',
            orderId: 'order555',
            rfqId: 'rfq222',
            amount: 420,
            percentage: 2.5,
            status: 'pending',
            createdAt: new Date('2024-01-12')
          },
          {
            id: '4',
            agentId: 'agent123',
            orderId: 'order444',
            rfqId: 'rfq111',
            amount: 310,
            percentage: 2,
            status: 'approved',
            createdAt: new Date('2024-01-10')
          }
        ]
      }));
    }, 1000);
  }, []);

  const filteredTransactions = earnings?.recentTransactions.filter((transaction: any) => {
    if (statusFilter !== 'all' && transaction.status !== statusFilter) {
      return false;
    }
    // Additional date filtering logic would go here
    return true;
  }) || [];

  const exportTransactions = () => {
    // Export logic would go here
    console.log('Exporting transactions...');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
            Earnings & Commissions
          </Typography>
          <Button
            variant="outlined"
            onClick={exportTransactions}
            startIcon={<ArrowDownTrayIcon />}
            sx={{ bgcolor: 'white', borderColor: 'grey.300' }}
          >
            Export CSV
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="grey.600">
                        This Month
                      </Typography>
                      <CurrencyDollarIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                      {formatCurrency(earnings?.thisMonth || 0)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'success.main' }}>
                      +12% from last month
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="grey.600">
                        Pending
                      </Typography>
                      <CalendarIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                      {formatCurrency(earnings?.pending || 0)}
                    </Typography>
                    <Typography variant="caption" color="grey.600">
                      Awaiting approval
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="grey.600">
                        Lifetime
                      </Typography>
                      <ChartBarIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'grey.900', fontWeight: 'bold' }}>
                      {formatCurrency(earnings?.lifetime || 0)}
                    </Typography>
                    <Typography variant="caption" color="grey.600">
                      Since joining
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card sx={{ height: '100%', bgcolor: 'primary.main' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        Next Payout
                      </Typography>
                      <CalendarIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h4" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {formatCurrency(890)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'white' }}>
                      In 3 days
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" sx={{ color: 'grey.900', mb: 2 }}>
                Earnings Trend
              </Typography>
              <EarningsChart />
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2" sx={{ color: 'grey.900' }}>
                  Recent Transactions
                </Typography>
                
                {/* Filters */}
                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      label="Period"
                    >
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="year">This Year</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>RFQ ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>Rate</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'grey.700' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((transaction: any) => (
                      <TableRow key={transaction.id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                        <TableCell sx={{ color: 'grey.900' }}>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell sx={{ color: 'grey.900' }}>
                          #{transaction.rfqId}
                        </TableCell>
                        <TableCell sx={{ color: 'grey.900' }}>
                          #{transaction.orderId}
                        </TableCell>
                        <TableCell sx={{ color: 'grey.900' }}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell sx={{ color: 'grey.600' }}>
                          {transaction.percentage}%
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            color={
                              transaction.status === 'paid' ? 'success' :
                              transaction.status === 'pending' ? 'warning' :
                              transaction.status === 'approved' ? 'info' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredTransactions.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" color="grey.500">
                    No transactions found
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Stack>
    </Container>
  );
};