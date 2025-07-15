import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressIndicator } from '../../components/ui/ProgressIndicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Thermometer,
  Package,
  Truck,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
} from 'lucide-react';
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

const getStatusBadge = (status: OrderLine['status']) => {
  const configs = {
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-700' },
    partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-700' },
    fulfilled: { label: 'Fulfilled', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  };
  
  const config = configs[status];
  return <Badge className={config.className}>{config.label}</Badge>;
};

const getTemperatureBadge = (temp?: OrderLine['temperature']) => {
  if (!temp) return null;
  
  const configs = {
    normal: { icon: Thermometer, className: 'text-green-600 bg-green-50' },
    warning: { icon: AlertTriangle, className: 'text-yellow-600 bg-yellow-50' },
    critical: { icon: AlertTriangle, className: 'text-red-600 bg-red-50' },
  };
  
  const config = configs[temp.status];
  const Icon = config.icon;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      <span>{temp.current}°C</span>
    </div>
  );
};

export const OrderLinesTable: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());

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

  if (!selectedOrder) {
    return <div>No order selected</div>;
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Real-time order updates active" : "Disconnected"}
        </span>
        {connectionError && (
          <span className="text-sm text-red-600">
            ({connectionError})
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Lines - {selectedOrder.orderNumber}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Customer: {selectedOrder.customerName} | Total Value: {selectedOrder.currency} {selectedOrder.totalValue.toLocaleString()}
                {isConnected && (
                  <span className="ml-2 text-xs text-green-600">
                    • Live updates enabled
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Order
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Line</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedOrder.lines.map((line) => (
                <React.Fragment key={line.id}>
                  <TableRow className={expandedLines.has(line.id) ? "border-b-0" : ""}>
                    <TableCell className="font-medium">{line.lineNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{line.productName}</p>
                        <p className="text-xs text-muted-foreground">{line.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{line.supplier}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{line.orderedQuantity} {line.unit}</p>
                        {line.remainingQuantity > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {line.remainingQuantity} remaining
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 min-w-[120px]">
                        <div className="flex items-center justify-between text-sm">
                          <span>{line.fulfilledQuantity}/{line.orderedQuantity}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(getFulfillmentPercentage(line))}%
                          </span>
                        </div>
                        <ProgressIndicator value={getFulfillmentPercentage(line)} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getTemperatureBadge(line.temperature)}</TableCell>
                    <TableCell>{getStatusBadge(line.status)}</TableCell>
                    <TableCell>
                      {line.estimatedDelivery && (
                        <div className="text-sm">
                          <p>{line.estimatedDelivery.toLocaleDateString()}</p>
                          {line.trackingNumber && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {line.trackingNumber}
                            </p>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {line.currency} {(line.orderedQuantity * line.price).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => toggleLineExpansion(line.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleLineAction('track', line)}
                            disabled={!line.trackingNumber}
                          >
                            Track Shipment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleLineAction('expedite', line)}
                            disabled={line.status === 'fulfilled' || line.status === 'cancelled'}
                          >
                            Expedite Delivery
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleLineAction('split', line)}
                            disabled={line.status === 'fulfilled' || line.status === 'cancelled'}
                          >
                            Split Line
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleLineAction('cancel', line)}
                            disabled={line.status === 'fulfilled' || line.status === 'cancelled'}
                            className="text-red-600"
                          >
                            Cancel Line
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedLines.has(line.id) && (
                    <TableRow>
                      <TableCell colSpan={10} className="bg-muted/50">
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="font-medium mb-1">Fulfillment History</p>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {line.fulfilledQuantity > 0 && (
                                  <>
                                    <p className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3" />
                                      {line.fulfilledQuantity} {line.unit} delivered
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Last update: {line.lastUpdate.toLocaleString()}
                                    </p>
                                  </>
                                )}
                                {line.remainingQuantity > 0 && (
                                  <p className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {line.remainingQuantity} {line.unit} pending
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-1">Temperature Requirements</p>
                              {line.temperature && (
                                <div className="text-xs text-muted-foreground">
                                  <p>Required: {line.temperature.required.min}°C to {line.temperature.required.max}°C</p>
                                  <p>Current: {line.temperature.current}°C</p>
                                  <p className={`font-medium ${line.temperature.status === 'normal' ? "text-green-600" : line.temperature.status === 'warning' ? "text-yellow-600" : "text-red-600"}`}>
                                    Status: {line.temperature.status.toUpperCase()}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium mb-1">Additional Information</p>
                              <div className="text-xs text-muted-foreground">
                                <p>Unit Price: {line.currency} {line.price}</p>
                                <p>Total Value: {line.currency} {(line.orderedQuantity * line.price).toLocaleString()}</p>
                                {line.trackingNumber && (
                                  <p>Tracking: {line.trackingNumber}</p>
                                )}
                                {isConnected && (
                                  <p className="text-green-600 flex items-center gap-1 mt-1">
                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                    Live tracking active
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};