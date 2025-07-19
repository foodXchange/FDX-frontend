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
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add,
  Inventory,
  Warning,
  TrendingUp,
  LocalShipping,
  Search,
  Refresh,
  Download,
  Edit,
  SwapHoriz,
  Assessment,
  AcUnit,
  WbSunny,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  BarChart,
  PieChart,
  Timeline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Product,
  StockLevel,
  InventoryLocation,
  InventoryAnalytics,
  StockStatus,
  ReceiveStockRequest,
  TransferStockRequest
} from '../../../types/inventory';
import { InventoryService } from '../../../services/inventory/InventoryService';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState<Array<{ product: Product; stockLevels: StockLevel[] }>>([]);
  const [locations, setLocations] = useState<InventoryLocation[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedLocation]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load inventory data
      const searchParams = {
        searchTerm: searchTerm || undefined,
        locationId: selectedLocation || undefined,
        page: 1,
        limit: 100
      };

      const [inventoryResult, locationsData, analyticsData] = await Promise.all([
        InventoryService.searchInventory(searchParams),
        InventoryService.getLocations(),
        InventoryService.getAnalytics()
      ]);

      setProducts(inventoryResult.products);
      setLocations(locationsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK:
        return 'success';
      case StockStatus.LOW_STOCK:
        return 'warning';
      case StockStatus.OUT_OF_STOCK:
        return 'error';
      case StockStatus.RESERVED:
        return 'info';
      default:
        return 'default';
    }
  };

  const getTemperatureIcon = (requirement?: { min: number; max: number }) => {
    if (!requirement) return <WbSunny sx={{ fontSize: 16 }} />;
    if (requirement.max <= 5) return <AcUnit sx={{ fontSize: 16, color: 'info.main' }} />;
    return <WbSunny sx={{ fontSize: 16, color: 'warning.main' }} />;
  };

  const handleReceiveStock = async (data: ReceiveStockRequest) => {
    try {
      await InventoryService.receiveStock(data);
      setReceiveDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error receiving stock:', error);
    }
  };

  const handleTransferStock = async (data: TransferStockRequest) => {
    try {
      await InventoryService.createTransfer(data);
      setTransferDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  const movementChartData = {
    labels: analytics?.movementTrends.map(t => format(new Date(t.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Inbound',
        data: analytics?.movementTrends.map(t => t.inbound) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Outbound',
        data: analytics?.movementTrends.map(t => t.outbound) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const categoryChartData = {
    labels: analytics?.categoryDistribution.map(c => c.category) || [],
    datasets: [{
      data: analytics?.categoryDistribution.map(c => c.value) || [],
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Inventory Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/inventory/products/new')}
          >
            Add Product
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
                  <Inventory sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Total Products
                  </Typography>
                </Box>
                <Typography variant="h4">{formatNumber(analytics.totalProducts)}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip
                    label={`${analytics.stockStatus.inStock} In Stock`}
                    size="small"
                    color="success"
                  />
                  <Chip
                    label={`${analytics.stockStatus.outOfStock} Out`}
                    size="small"
                    color="error"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ color: 'success.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {formatCurrency(analytics.totalValue)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Across {analytics.totalLocations} locations
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ color: 'warning.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Low Stock Items
                  </Typography>
                </Box>
                <Typography variant="h4">{analytics.stockStatus.lowStock}</Typography>
                <Typography variant="body2" color="warning.main">
                  {analytics.reorderAlerts.length} need reordering
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ color: 'error.main', mr: 1 }} />
                  <Typography color="textSecondary" variant="body2">
                    Expiring Soon
                  </Typography>
                </Box>
                <Typography variant="h4">{analytics.expiringProducts.length}</Typography>
                <Typography variant="body2" color="error.main">
                  Within 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setReceiveDialogOpen(true)}
              >
                Receive Stock
              </Button>
              <Button
                variant="outlined"
                startIcon={<SwapHoriz />}
                onClick={() => setTransferDialogOpen(true)}
              >
                Transfer
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Stock Levels" />
          <Tab label="Low Stock Alerts" />
          <Tab label="Expiring Products" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Stock Levels Tab */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right">Available</TableCell>
                <TableCell align="right">Reserved</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map(({ product, stockLevels }) => (
                stockLevels.map((stockLevel) => (
                  <TableRow key={`${product.id}-${stockLevel.locationId}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getTemperatureIcon(product.temperatureRequirement)}
                        <Typography sx={{ ml: 1 }}>{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {locations.find(l => l.id === stockLevel.locationId)?.name}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(stockLevel.availableQuantity)} {stockLevel.unit}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(stockLevel.reservedQuantity)} {stockLevel.unit}
                    </TableCell>
                    <TableCell align="right">
                      {formatNumber(stockLevel.quantity)} {stockLevel.unit}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={stockLevel.status.replace('_', ' ')}
                        size="small"
                        color={getStockStatusColor(stockLevel.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/inventory/products/${product.id}`)}
                          >
                            <Assessment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adjust Stock">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Low Stock Alerts Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {analytics?.reorderAlerts.map((alert) => (
            <Grid item xs={12} md={6} key={alert.productId}>
              <Alert
                severity="warning"
                action={
                  <Button color="inherit" size="small">
                    Create PO
                  </Button>
                }
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {alert.productName}
                </Typography>
                <Typography variant="body2">
                  Current Stock: {formatNumber(alert.currentStock)} | 
                  Reorder Point: {formatNumber(alert.reorderPoint)} | 
                  Suggested Qty: {formatNumber(alert.suggestedQuantity)}
                </Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Expiring Products Tab */}
      <TabPanel value={tabValue} index={2}>
        <List>
          {analytics?.expiringProducts.map((item, index) => (
            <React.Fragment key={item.batchNumber}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: item.daysToExpiry < 7 ? 'error.main' : 'warning.main' }}>
                    <Schedule />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.productName}
                  secondary={
                    <Box>
                      <Typography variant="body2">
                        Batch: {item.batchNumber} | Quantity: {formatNumber(item.quantity)}
                      </Typography>
                      <Typography variant="caption" color={item.daysToExpiry < 7 ? 'error' : 'warning'}>
                        Expires: {format(new Date(item.expiryDate), 'MMM dd, yyyy')} ({item.daysToExpiry} days)
                      </Typography>
                    </Box>
                  }
                />
                <Button size="small" variant="outlined">
                  Take Action
                </Button>
              </ListItem>
              {index < analytics.expiringProducts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {/* Movement Trends */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Stock Movement Trends
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={movementChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Value by Category
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Warehouse Utilization */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Warehouse Utilization
                </Typography>
                {analytics?.warehouseUtilization.map((warehouse) => (
                  <Box key={warehouse.locationId} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">{warehouse.locationName}</Typography>
                      <Typography variant="body2">
                        {warehouse.utilizationPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={warehouse.utilizationPercentage}
                      sx={{ height: 8, borderRadius: 1 }}
                      color={warehouse.utilizationPercentage > 90 ? 'error' : 'primary'}
                    />
                    <Typography variant="caption" color="textSecondary">
                      {formatNumber(warehouse.usedCapacity)} / {formatNumber(warehouse.totalCapacity)} pallets
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Top Products by Quantity
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell align="right">Turnover Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics?.topProducts.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell align="right">{formatNumber(product.quantity)}</TableCell>
                          <TableCell align="right">{formatCurrency(product.value)}</TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                              <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                              {product.turnoverRate.toFixed(1)}x
                            </Box>
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

      {/* Receive Stock Dialog */}
      <Dialog open={receiveDialogOpen} onClose={() => setReceiveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Receive Stock</DialogTitle>
        <DialogContent>
          {/* Receive stock form would go here */}
          <Typography>Receive stock form implementation needed</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiveDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Receive</Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Stock Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent>
          {/* Transfer stock form would go here */}
          <Typography>Transfer stock form implementation needed</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryDashboard;