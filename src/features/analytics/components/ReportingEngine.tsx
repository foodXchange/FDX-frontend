import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Stack,
  Chip,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Slider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Download,
  Print,
  Share,
  Schedule,
  FilterList,
  MoreVert,
  TrendingUp,
  TrendingDown,
  Assessment,
  PictureAsPdf,
  TableChart,
  Description,
  BarChart,
  PieChart,
  Timeline,
  BubbleChart,
  ScatterPlot,
  Heatmap,
  CompareArrows,
  Speed,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  CalendarMonth,
  Email,
  CloudDownload,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  Sankey,
  Funnel,
  FunnelChart,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatNumber, formatPercentage } from '../../../utils/format';
import { ChartData, ExportOptions, AnalyticsReport } from '../types';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Chart type configurations
const chartTypes = [
  { id: 'line', name: 'Line Chart', icon: <Timeline />, component: LineChart },
  { id: 'area', name: 'Area Chart', icon: <Assessment />, component: AreaChart },
  { id: 'bar', name: 'Bar Chart', icon: <BarChart />, component: RechartsBarChart },
  { id: 'pie', name: 'Pie Chart', icon: <PieChart />, component: RechartsPieChart },
  { id: 'scatter', name: 'Scatter Plot', icon: <ScatterPlot />, component: ScatterChart },
  { id: 'radar', name: 'Radar Chart', icon: <BubbleChart />, component: RadarChart },
  { id: 'treemap', name: 'Treemap', icon: <TableChart />, component: Treemap },
  { id: 'funnel', name: 'Funnel Chart', icon: <FilterList />, component: FunnelChart },
];

// D3.js Advanced Visualization Component
const D3Visualization: React.FC<{
  type: 'heatmap' | 'sankey' | 'force' | 'sunburst';
  data: any;
  width: number;
  height: number;
}> = ({ type, data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const theme = useTheme();

  React.useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    switch (type) {
      case 'heatmap':
        renderHeatmap(svg, data, width, height, theme);
        break;
      case 'sankey':
        renderSankey(svg, data, width, height, theme);
        break;
      case 'force':
        renderForceGraph(svg, data, width, height, theme);
        break;
      case 'sunburst':
        renderSunburst(svg, data, width, height, theme);
        break;
    }
  }, [type, data, width, height, theme]);

  return <svg ref={svgRef} width={width} height={height} />;
};

// D3 Heatmap renderer
const renderHeatmap = (svg: any, data: any, width: number, height: number, theme: any) => {
  const margin = { top: 50, right: 50, bottom: 100, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Color scale
  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([d3.max(data, (d: any) => d.value), d3.min(data, (d: any) => d.value)]);

  // X and Y scales
  const xScale = d3.scaleBand()
    .range([0, innerWidth])
    .domain(data.map((d: any) => d.x))
    .padding(0.05);

  const yScale = d3.scaleBand()
    .range([innerHeight, 0])
    .domain(data.map((d: any) => d.y))
    .padding(0.05);

  // Add rectangles
  g.selectAll()
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d: any) => xScale(d.x))
    .attr('y', (d: any) => yScale(d.y))
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .style('fill', (d: any) => colorScale(d.value))
    .style('stroke', theme.palette.divider)
    .style('stroke-width', 1);

  // Add X axis
  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-65)');

  // Add Y axis
  g.append('g')
    .call(d3.axisLeft(yScale));
};

// Other D3 renderers would be implemented similarly...
const renderSankey = (svg: any, data: any, width: number, height: number, theme: any) => {
  // Sankey diagram implementation
};

const renderForceGraph = (svg: any, data: any, width: number, height: number, theme: any) => {
  // Force-directed graph implementation
};

const renderSunburst = (svg: any, data: any, width: number, height: number, theme: any) => {
  // Sunburst chart implementation
};

// Interactive Chart Builder Component
const ChartBuilder: React.FC<{
  data: any[];
  onSave: (chart: ChartData) => void;
}> = ({ data, onSave }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState('line');
  const [selectedFields, setSelectedFields] = useState<{ x: string; y: string[] }>({ x: '', y: [] });
  const [chartConfig, setChartConfig] = useState({
    title: '',
    showGrid: true,
    showLegend: true,
    curved: false,
    stacked: false,
  });

  const availableFields = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const renderChart = () => {
    if (!selectedFields.x || selectedFields.y.length === 0) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" height={400}>
          <Typography color="text.secondary">
            Select fields to visualize
          </Typography>
        </Box>
      );
    }

    const ChartComponent = chartTypes.find(c => c.id === chartType)?.component || LineChart;

    switch (chartType) {
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey={selectedFields.y[0]}
              nameKey={selectedFields.x}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill={theme.palette.primary.main}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={theme.palette.primary.main} />
              ))}
            </Pie>
            <RechartsTooltip />
            {chartConfig.showLegend && <Legend />}
          </RechartsPieChart>
        );

      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={selectedFields.x} />
            <YAxis dataKey={selectedFields.y[0]} />
            <RechartsTooltip />
            <Scatter data={data} fill={theme.palette.primary.main} />
          </ScatterChart>
        );

      default:
        return (
          <ChartComponent data={data}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={selectedFields.x} />
            <YAxis />
            <RechartsTooltip />
            {chartConfig.showLegend && <Legend />}
            {selectedFields.y.map((field, index) => {
              const props = {
                key: field,
                dataKey: field,
                stroke: index === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                fill: index === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
              };

              if (chartType === 'line') {
                return <Line {...props} type={chartConfig.curved ? 'monotone' : 'linear'} />;
              } else if (chartType === 'area') {
                return <Area {...props} stackId={chartConfig.stacked ? 'stack' : undefined} />;
              } else if (chartType === 'bar') {
                return <Bar {...props} stackId={chartConfig.stacked ? 'stack' : undefined} />;
              }
              return null;
            })}
          </ChartComponent>
        );
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Chart Configuration
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Chart Type</InputLabel>
                <Select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  label="Chart Type"
                >
                  {chartTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Chart Title"
                value={chartConfig.title}
                onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>X-Axis Field</InputLabel>
                <Select
                  value={selectedFields.x}
                  onChange={(e) => setSelectedFields({ ...selectedFields, x: e.target.value })}
                  label="X-Axis Field"
                >
                  {availableFields.map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Y-Axis Fields</InputLabel>
                <Select
                  multiple
                  value={selectedFields.y}
                  onChange={(e) => setSelectedFields({ ...selectedFields, y: e.target.value as string[] })}
                  label="Y-Axis Fields"
                >
                  {availableFields.map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={chartConfig.showGrid}
                      onChange={(e) => setChartConfig({ ...chartConfig, showGrid: e.target.checked })}
                    />
                  }
                  label="Show Grid"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={chartConfig.showLegend}
                      onChange={(e) => setChartConfig({ ...chartConfig, showLegend: e.target.checked })}
                    />
                  }
                  label="Show Legend"
                />
                {chartType === 'line' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={chartConfig.curved}
                        onChange={(e) => setChartConfig({ ...chartConfig, curved: e.target.checked })}
                      />
                    }
                    label="Curved Lines"
                  />
                )}
                {(chartType === 'bar' || chartType === 'area') && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={chartConfig.stacked}
                        onChange={(e) => setChartConfig({ ...chartConfig, stacked: e.target.checked })}
                      />
                    }
                    label="Stacked"
                  />
                )}
              </FormGroup>

              <Button
                fullWidth
                variant="contained"
                onClick={() => onSave({
                  id: `chart_${Date.now()}`,
                  type: chartType as any,
                  title: chartConfig.title,
                  data,
                  config: {
                    xAxis: selectedFields.x,
                    yAxis: selectedFields.y[0],
                    series: selectedFields.y,
                    ...chartConfig,
                  },
                })}
                disabled={!selectedFields.x || selectedFields.y.length === 0}
              >
                Save Chart
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// Report Template Component
const ReportTemplate: React.FC<{
  report: AnalyticsReport;
  data: any;
}> = ({ report, data }) => {
  const theme = useTheme();

  return (
    <Box id="report-content">
      {/* Report Header */}
      <Box sx={{ mb: 4, pb: 2, borderBottom: `2px solid ${theme.palette.primary.main}` }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {report.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {report.description}
        </Typography>
        <Box display="flex" gap={2} mt={2}>
          <Chip label={`Generated: ${format(new Date(), 'PPP')}`} size="small" />
          <Chip label={`Type: ${report.type}`} size="small" />
          <Chip label={`Format: ${report.format}`} size="small" />
        </Box>
      </Box>

      {/* Executive Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Executive Summary
        </Typography>
        <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
          <Typography variant="body1" paragraph>
            This report provides comprehensive analytics for the period covered, highlighting key performance 
            indicators, trends, and actionable insights to drive business decisions.
          </Typography>
          <Grid container spacing={2}>
            {data.summary?.map((item: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {item.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* Key Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Key Performance Indicators
        </Typography>
        <Grid container spacing={3}>
          {data.metrics?.map((metric: any, index: number) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">{metric.name}</Typography>
                  <Chip 
                    label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                    color={metric.change > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts Section */}
      {data.charts?.map((chart: ChartData, index: number) => (
        <Box key={index} sx={{ mb: 4, pageBreakInside: 'avoid' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {chart.title}
          </Typography>
          {chart.subtitle && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {chart.subtitle}
            </Typography>
          )}
          <Paper sx={{ p: 3 }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Box>
      ))}

      {/* Insights Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Key Insights & Recommendations
        </Typography>
        <Stack spacing={2}>
          {data.insights?.map((insight: any, index: number) => (
            <Alert 
              key={index}
              severity={insight.type}
              icon={
                insight.type === 'success' ? <CheckCircle /> :
                insight.type === 'warning' ? <Warning /> :
                insight.type === 'error' ? <ErrorIcon /> : <Info />
              }
            >
              <Typography variant="subtitle2" fontWeight="bold">
                {insight.title}
              </Typography>
              <Typography variant="body2">
                {insight.message}
              </Typography>
            </Alert>
          ))}
        </Stack>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 6, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary">
          This report was automatically generated by FoodXchange Analytics Platform. 
          For questions or concerns, please contact the analytics team.
        </Typography>
      </Box>
    </Box>
  );
};

// Main Reporting Engine Component
export const ReportingEngine: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [reportType, setReportType] = useState<'instant' | 'scheduled'>('instant');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCharts: true,
    includeRawData: false,
  });

  const { 
    charts, 
    metrics,
    exportAnalytics,
    isExporting 
  } = useAnalytics({
    enableInsights: true,
  });

  // Mock report templates
  const reportTemplates = [
    {
      id: 'supplier_performance',
      name: 'Supplier Performance Report',
      description: 'Comprehensive analysis of supplier metrics and compliance',
      icon: <Store />,
    },
    {
      id: 'compliance_audit',
      name: 'Compliance Audit Report',
      description: 'Detailed compliance tracking and certification status',
      icon: <VerifiedUser />,
    },
    {
      id: 'financial_summary',
      name: 'Financial Summary Report',
      description: 'Revenue, costs, and profitability analysis',
      icon: <AttachMoney />,
    },
    {
      id: 'market_analysis',
      name: 'Market Analysis Report',
      description: 'Market trends, competitor analysis, and opportunities',
      icon: <TrendingUp />,
    },
  ];

  const handleExport = async () => {
    await exportAnalytics(exportOptions);
    setExportDialogOpen(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const reportContent = document.getElementById('report-content');
    
    if (reportContent) {
      doc.html(reportContent, {
        callback: (doc) => {
          doc.save('analytics-report.pdf');
        },
        x: 10,
        y: 10,
      });
    }
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(metrics || []);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analytics Data');
    XLSX.writeFile(wb, 'analytics-report.xlsx');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Reporting & Visualization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create custom reports and advanced data visualizations
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Schedule />}>
            Schedule Report
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="Report Builder" icon={<Assessment />} iconPosition="start" />
          <Tab label="Chart Builder" icon={<BarChart />} iconPosition="start" />
          <Tab label="Advanced Visualizations" icon={<BubbleChart />} iconPosition="start" />
          <Tab label="Templates" icon={<Description />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={glassmorphismStyle}>
                  <Box p={3}>
                    <ToggleButtonGroup
                      value={reportType}
                      exclusive
                      onChange={(_, value) => value && setReportType(value)}
                      sx={{ mb: 3 }}
                    >
                      <ToggleButton value="instant">
                        Instant Report
                      </ToggleButton>
                      <ToggleButton value="scheduled">
                        Scheduled Report
                      </ToggleButton>
                    </ToggleButtonGroup>

                    {selectedTemplate && (
                      <ReportTemplate
                        report={{
                          id: '1',
                          name: reportTemplates.find(t => t.id === selectedTemplate)?.name || '',
                          type: reportType === 'instant' ? 'adhoc' : 'scheduled',
                          format: 'pdf',
                          filters: {},
                          recipients: [],
                          createdBy: 'current_user',
                          createdAt: new Date().toISOString(),
                          status: 'active',
                        }}
                        data={{
                          summary: [
                            { label: 'Total Revenue', value: '$2.5M' },
                            { label: 'Active Orders', value: '342' },
                            { label: 'Suppliers', value: '89' },
                            { label: 'Compliance Rate', value: '94%' },
                          ],
                          metrics: metrics?.slice(0, 4),
                          charts: charts?.slice(0, 2),
                          insights: [
                            {
                              type: 'success',
                              title: 'Revenue Growth',
                              message: 'Revenue has increased by 15% compared to last quarter',
                            },
                            {
                              type: 'warning',
                              title: 'Compliance Alert',
                              message: '3 suppliers have certifications expiring within 30 days',
                            },
                          ],
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {selectedTab === 1 && (
            <ChartBuilder
              data={[
                { month: 'Jan', revenue: 45000, orders: 120, compliance: 92 },
                { month: 'Feb', revenue: 52000, orders: 145, compliance: 94 },
                { month: 'Mar', revenue: 48000, orders: 135, compliance: 91 },
                { month: 'Apr', revenue: 61000, orders: 165, compliance: 95 },
                { month: 'May', revenue: 58000, orders: 155, compliance: 93 },
                { month: 'Jun', revenue: 67000, orders: 180, compliance: 96 },
              ]}
              onSave={(chart) => console.log('Chart saved:', chart)}
            />
          )}

          {selectedTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...glassmorphismStyle, p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Supply Chain Flow (Sankey Diagram)
                  </Typography>
                  <D3Visualization
                    type="sankey"
                    data={{}} // Mock data
                    width={500}
                    height={400}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ ...glassmorphismStyle, p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Product Category Heatmap
                  </Typography>
                  <D3Visualization
                    type="heatmap"
                    data={[
                      { x: 'Mon', y: 'Produce', value: 45 },
                      { x: 'Tue', y: 'Produce', value: 52 },
                      { x: 'Wed', y: 'Produce', value: 48 },
                      { x: 'Mon', y: 'Dairy', value: 32 },
                      { x: 'Tue', y: 'Dairy', value: 38 },
                      { x: 'Wed', y: 'Dairy', value: 35 },
                    ]}
                    width={500}
                    height={400}
                  />
                </Paper>
              </Grid>
            </Grid>
          )}

          {selectedTab === 3 && (
            <Grid container spacing={3}>
              {reportTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={3} key={template.id}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      sx={{
                        ...glassmorphismStyle,
                        cursor: 'pointer',
                        border: selectedTemplate === template.id 
                          ? `2px solid ${theme.palette.primary.main}` 
                          : undefined,
                      }}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                            {template.icon}
                          </Avatar>
                          <Typography variant="h6">
                            {template.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {template.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportOptions.format}
                onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as any })}
                label="Export Format"
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="csv">CSV File</MenuItem>
                <MenuItem value="png">PNG Image</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeCharts: e.target.checked })}
                  />
                }
                label="Include Charts"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.includeRawData}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeRawData: e.target.checked })}
                  />
                }
                label="Include Raw Data"
              />
            </FormGroup>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={exportOptions.dateRange?.start || new Date()}
                onChange={(date) => setExportOptions({
                  ...exportOptions,
                  dateRange: { ...exportOptions.dateRange!, start: date! }
                })}
              />
              <DatePicker
                label="End Date"
                value={exportOptions.dateRange?.end || new Date()}
                onChange={(date) => setExportOptions({
                  ...exportOptions,
                  dateRange: { ...exportOptions.dateRange!, end: date! }
                })}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleExport} 
            variant="contained" 
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportingEngine;