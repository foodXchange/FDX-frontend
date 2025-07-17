import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, IconButton, LinearProgress, Menu, MenuItem, Divider, Stack, Grid } from '@mui/material';
import {
  Thermostat,
  Inventory,
  LocalShipping,
  MoreHoriz,
  Warning,
  CheckCircle,
  Schedule,
  Description,
  Visibility
} from '@mui/icons-material';
import { useOrderTracking } from '../../hooks/useOrderTracking';


interface OrderLine {
  id: string;
  lineNumber: number;
  productName: string;
  sku: string;
  orderedQuantity: number;
  fulfilledQuantity: number;
  remainingQuantity: number;
  unit: string;
  status: 'pending' | 'partial' | 'fulfilled' | 'cancelled';
  temperature?: {
    current: number;
    required: { min: number; max: number };
    status: 'normal' | 'warning' | 'critical';
  };
  estimatedDelivery?: Date;
  lastUpdate: Date;
  trackingNumber?: string;
  supplier: string;
  price: number;
  currency: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  totalLines: number;
  totalValue: number;
  currency: string;
  createdDate: Date;
  lines: OrderLine[];
}

const getStatusChip = (status: OrderLine['status']) => {
  const configs = {
    pending: { label: 'Pending', color: 'default' as const },
    partial: { label: 'Partial', color: 'warning' as const },
    fulfilled: { label: 'Fulfilled', color: 'success' as const },
    cancelled: { label: 'Cancelled', color: 'error' as const },
  };
  
  const config = configs[status];
  return <Chip label={config.label} color={config.color} size="small" />;
};

const getTemperatureChip = (temp?: OrderLine['temperature']) => {
  if (!temp) return null;
  
  const configs = {
    normal: { icon: <Thermostat />, color: 'success' as const },
    warning: { icon: <Warning />, color: 'warning' as const },
    critical: { icon: <Warning />, color: 'error' as const },
  };
  
  const config = configs[temp.status];
  
  return (
    <Chip
      icon={config.icon}
      label={`${temp.current}°C`}
      color={config.color}
      size="small"
      variant="outlined"
    />
  );
};

export const OrderLinesTable: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // WebSocket integration for real-time updates
  const { 
    isConnected, 
    lineUpdates,
    connectionError,
    subscribeToOrder,
    subscribeToOrderLine
  } = useOrderTracking();

  // Mock data
  const mockOrder: Order = {
    id: '1',
    orderNumber: 'ORD-2024-1234',
    customerName: 'Global Foods Inc.',
    totalLines: 5,
    totalValue: 45000,
    currency: 'EUR',
    createdDate: new Date('2024-12-01'),
    lines: [
      {
        id: '1',
        lineNumber: 1,
        productName: 'Organic Wheat Flour',
        sku: 'OWF-001',
        orderedQuantity: 5000,
        fulfilledQuantity: 3000,
        remainingQuantity: 2000,
        unit: 'kg',
        status: 'partial',
        temperature: {
          current: 22,
          required: { min: 18, max: 25 },
          status: 'normal',
        },
        estimatedDelivery: new Date('2024-12-20'),
        lastUpdate: new Date('2024-12-15T10:30:00'),
        trackingNumber: 'TRK-001-A',
        supplier: 'Munich Mills GmbH',
        price: 2.5,
        currency: 'EUR',
      },
      {
        id: '2',
        lineNumber: 2,
        productName: 'Extra Virgin Olive Oil',
        sku: 'EVOO-201',
        orderedQuantity: 1000,
        fulfilledQuantity: 1000,
        remainingQuantity: 0,
        unit: 'liters',
        status: 'fulfilled',
        temperature: {
          current: 19,
          required: { min: 15, max: 20 },
          status: 'normal',
        },
        estimatedDelivery: new Date('2024-12-18'),
        lastUpdate: new Date('2024-12-14T14:00:00'),
        trackingNumber: 'TRK-002-A',
        supplier: 'Mediterranean Oils Ltd',
        price: 8.5,
        currency: 'EUR',
      },
      {
        id: '3',
        lineNumber: 3,
        productName: 'Frozen Blueberries',
        sku: 'FB-301',
        orderedQuantity: 500,
        fulfilledQuantity: 0,
        remainingQuantity: 500,
        unit: 'kg',
        status: 'pending',
        temperature: {
          current: -15,
          required: { min: -20, max: -15 },
          status: 'warning',
        },
        estimatedDelivery: new Date('2024-12-22'),
        lastUpdate: new Date('2024-12-15T08:00:00'),
        supplier: 'Nordic Berries AB',
        price: 12.0,
        currency: 'EUR',
      },
      {
        id: '4',
        lineNumber: 4,
        productName: 'Premium Coffee Beans',
        sku: 'PCB-401',
        orderedQuantity: 200,
        fulfilledQuantity: 150,
        remainingQuantity: 50,
        unit: 'kg',
        status: 'partial',
        estimatedDelivery: new Date('2024-12-21'),
        lastUpdate: new Date('2024-12-15T16:45:00'),
        trackingNumber: 'TRK-004-A',
        supplier: 'Colombian Coffee Co.',
        price: 25.0,
        currency: 'EUR',
      },
      {
        id: '5',
        lineNumber: 5,
        productName: 'Organic Honey',
        sku: 'OH-501',
        orderedQuantity: 300,
        fulfilledQuantity: 0,
        remainingQuantity: 300,
        unit: 'kg',
        status: 'cancelled',
        lastUpdate: new Date('2024-12-10T12:00:00'),
        supplier: 'Alpine Honey Farm',
        price: 15.0,
        currency: 'EUR',
      },
    ],
  };

  useEffect(() => {
    setSelectedOrder(mockOrder);
    
    // Subscribe to order and line updates
    subscribeToOrder(mockOrder.id);
    mockOrder.lines.forEach(line => {
      subscribeToOrderLine(line.id);
    });
  }, [subscribeToOrder, subscribeToOrderLine]);

  // Update order lines with real-time data
  useEffect(() => {
    if (selectedOrder && lineUpdates.length > 0) {
      const updatedOrder = {
        ...selectedOrder,
        lines: selectedOrder.lines.map(line => {
          const update = lineUpdates.find(u => u.id === line.id);
          if (update) {
            return {
              ...line,
              fulfilledQuantity: update.fulfilledQuantity,
              remainingQuantity: update.remainingQuantity,
              status: update.status,
              temperature: update.temperature || line.temperature,
              trackingNumber: update.trackingNumber || line.trackingNumber,
              lastUpdate: update.lastUpdate,
            };
          }
          return line;
        })
      };
      setSelectedOrder(updatedOrder);
    }
  }, [lineUpdates, selectedOrder]);

  const toggleLineExpansion = (lineId: string) => {
    const newExpanded = new Set(expandedLines);
    if (newExpanded.has(lineId)) {
      newExpanded.delete(lineId);
    } else {
      newExpanded.add(lineId);
    }
    setExpandedLines(newExpanded);
  };

  const getFulfillmentPercentage = (line: OrderLine) => {
    return (line.fulfilledQuantity / line.orderedQuantity) * 100;
  };

  const handleLineAction = (action: string, line: OrderLine) => {
    console.log(`Action: ${action} for line ${line.id}`);
    // TODO: Implement line actions
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, lineId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedLineId(lineId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLineId(null);
  };

  if (!selectedOrder) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No order selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isConnected ? 'success.main' : 'error.main'
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {isConnected ? "Real-time order updates active" : "Disconnected"}
        </Typography>
        {connectionError && (
          <Typography variant="caption" color="error">
            ({connectionError})
          </Typography>
        )}
      </Box>

      <Card>
        <CardHeader
          title={`Order Lines - ${selectedOrder.orderNumber}`}
          subheader={
            <Box>
              <Typography variant="body2" color="text.secondary">
                Customer: {selectedOrder.customerName} | Total Value: {selectedOrder.currency} {selectedOrder.totalValue.toLocaleString()}
                {isConnected && (
                  <Typography component="span" variant="caption" color="success.main" sx={{ ml: 2 }}>
                    • Live updates enabled
                  </Typography>
                )}
              </Typography>
            </Box>
          }
          action={
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" startIcon={<Description />}>
                Export
              </Button>
              <Button variant="outlined" size="small" startIcon={<Visibility />}>
                View Order
              </Button>
            </Stack>
          }
        />
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 50 }}>Line</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Fulfillment</TableCell>
                  <TableCell>Temperature</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Est. Delivery</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell sx={{ width: 50 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {selectedOrder.lines.map((line) => (
                <React.Fragment key={line.id}>
                  <TableRow sx={expandedLines.has(line.id) ? { borderBottom: 0 } : {}}>
                    <TableCell sx={{ fontWeight: 500 }}>{line.lineNumber}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {line.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {line.sku}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{line.supplier}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {line.orderedQuantity} {line.unit}
                        </Typography>
                        {line.remainingQuantity > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {line.remainingQuantity} remaining
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {line.fulfilledQuantity}/{line.orderedQuantity}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(getFulfillmentPercentage(line))}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getFulfillmentPercentage(line)}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{getTemperatureChip(line.temperature)}</TableCell>
                    <TableCell>{getStatusChip(line.status)}</TableCell>
                    <TableCell>
                      {line.estimatedDelivery && (
                        <Box>
                          <Typography variant="body2">
                            {line.estimatedDelivery.toLocaleDateString()}
                          </Typography>
                          {line.trackingNumber && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocalShipping sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {line.trackingNumber}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {line.currency} {(line.orderedQuantity * line.price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, line.id)}
                      >
                        <MoreHoriz />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {expandedLines.has(line.id) && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ bgcolor: 'action.hover' }}>
                        <Grid container spacing={3} sx={{ p: 2 }}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                              Fulfillment History
                            </Typography>
                            <Stack spacing={1}>
                              {line.fulfilledQuantity > 0 && (
                                <>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                                    <Typography variant="caption">
                                      {line.fulfilledQuantity} {line.unit} delivered
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption">
                                      Last update: {line.lastUpdate.toLocaleString()}
                                    </Typography>
                                  </Box>
                                </>
                              )}
                              {line.remainingQuantity > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Inventory sx={{ fontSize: 14, color: 'info.main' }} />
                                  <Typography variant="caption">
                                    {line.remainingQuantity} {line.unit} pending
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                              Temperature Requirements
                            </Typography>
                            {line.temperature && (
                              <Stack spacing={0.5}>
                                <Typography variant="caption">
                                  Required: {line.temperature.required.min}°C to {line.temperature.required.max}°C
                                </Typography>
                                <Typography variant="caption">
                                  Current: {line.temperature.current}°C
                                </Typography>
                                <Typography
                                  variant="caption"
                                  fontWeight="medium"
                                  color={
                                    line.temperature.status === 'normal' ? 'success.main' :
                                    line.temperature.status === 'warning' ? 'warning.main' :
                                    'error.main'
                                  }
                                >
                                  Status: {line.temperature.status.toUpperCase()}
                                </Typography>
                              </Stack>
                            )}
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>
                              Additional Information
                            </Typography>
                            <Stack spacing={0.5}>
                              <Typography variant="caption">
                                Unit Price: {line.currency} {line.price}
                              </Typography>
                              <Typography variant="caption">
                                Total Value: {line.currency} {(line.orderedQuantity * line.price).toLocaleString()}
                              </Typography>
                              {line.trackingNumber && (
                                <Typography variant="caption">
                                  Tracking: {line.trackingNumber}
                                </Typography>
                              )}
                              {isConnected && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: 'success.main'
                                    }}
                                  />
                                  <Typography variant="caption">
                                    Live tracking active
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedLineId) {
            toggleLineExpansion(selectedLineId);
            handleMenuClose();
          }
        }}>
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLineId) {
              const line = selectedOrder.lines.find(l => l.id === selectedLineId);
              if (line) {
                handleLineAction('track', line);
                handleMenuClose();
              }
            }
          }}
          disabled={!selectedLineId || !selectedOrder.lines.find(l => l.id === selectedLineId)?.trackingNumber}
        >
          Track Shipment
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedLineId) {
              const line = selectedOrder.lines.find(l => l.id === selectedLineId);
              if (line) {
                handleLineAction('expedite', line);
                handleMenuClose();
              }
            }
          }}
          disabled={!selectedLineId || (() => {
            const line = selectedOrder.lines.find(l => l.id === selectedLineId);
            return line?.status === 'fulfilled' || line?.status === 'cancelled';
          })()}
        >
          Expedite Delivery
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLineId) {
              const line = selectedOrder.lines.find(l => l.id === selectedLineId);
              if (line) {
                handleLineAction('split', line);
                handleMenuClose();
              }
            }
          }}
          disabled={!selectedLineId || (() => {
            const line = selectedOrder.lines.find(l => l.id === selectedLineId);
            return line?.status === 'fulfilled' || line?.status === 'cancelled';
          })()}
        >
          Split Line
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedLineId) {
              const line = selectedOrder.lines.find(l => l.id === selectedLineId);
              if (line) {
                handleLineAction('cancel', line);
                handleMenuClose();
              }
            }
          }}
          disabled={!selectedLineId || (() => {
            const line = selectedOrder.lines.find(l => l.id === selectedLineId);
            return line?.status === 'fulfilled' || line?.status === 'cancelled';
          })()}
          sx={{ color: 'error.main' }}
        >
          Cancel Line
        </MenuItem>
      </Menu>
    </Box>
  );
};