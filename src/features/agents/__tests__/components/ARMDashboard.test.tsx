import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { ARMDashboardOptimized } from '../../components/ARMDashboardOptimized';
import { useAgentStore } from '../../store/useAgentStore';
import { armApiService } from '../../services/armApi';

// Mock the store
jest.mock('../../store/useAgentStore');
const mockUseAgentStore = useAgentStore as jest.MockedFunction<typeof useAgentStore>;

// Mock the API service
jest.mock('../../services/armApi');
const mockArmApiService = armApiService as jest.Mocked<typeof armApiService>;

// Mock performance monitor hook
jest.mock('../../hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    getPerformanceSummary: jest.fn(),
  }),
  useOperationMonitor: () => ({
    startOperation: jest.fn(),
    endOperation: jest.fn(),
  }),
}));

// Mock lazy components
jest.mock('../../components/LeadPipelineOptimized', () => ({
  LeadPipelineOptimized: ({ leads, onLeadStatusChange }: any) => (
    <div data-testid="lead-pipeline">
      <div>Lead Pipeline</div>
      <div>Leads count: {leads.length}</div>
      <button onClick={() => onLeadStatusChange('lead-1', 'contacted')}>
        Update Lead Status
      </button>
    </div>
  ),
}));

jest.mock('../../components/RelationshipTimelineOptimized', () => ({
  RelationshipTimelineOptimized: ({ lead }: any) => (
    <div data-testid="relationship-timeline">
      <div>Relationship Timeline</div>
      <div>Lead: {lead?.companyName}</div>
    </div>
  ),
}));

jest.mock('../../components/CommunicationCenter', () => ({
  CommunicationCenter: ({ lead }: any) => (
    <div data-testid="communication-center">
      <div>Communication Center</div>
      <div>Lead: {lead?.companyName}</div>
    </div>
  ),
}));

// Test data
const mockAgent = {
  id: 'agent-1',
  userId: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  whatsappNumber: '+1234567890',
  status: 'active' as const,
  tier: 'gold' as const,
  location: {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
  },
  territoryAssignments: [],
  commissionStructure: {
    baseRate: 0.05,
    tierMultipliers: { bronze: 1, silver: 1.2, gold: 1.5, platinum: 2, diamond: 2.5 },
    bonusThresholds: [],
    paymentSchedule: 'monthly' as const,
    minimumPayout: 100,
  },
  metrics: {
    totalLeads: 50,
    convertedLeads: 25,
    conversionRate: 0.5,
    totalRevenue: 100000,
    averageDealSize: 2000,
    responseTime: 2,
    activeLeads: 15,
    thisMonthLeads: 10,
    thisMonthRevenue: 20000,
    totalCommissions: 5000,
    pendingCommissions: 500,
    rank: 5,
    performance: {
      lastMonth: {
        leadsGenerated: 8,
        leadsConverted: 4,
        revenue: 8000,
        commissionEarned: 400,
        activeDays: 20,
        averageDealSize: 2000,
      },
      thisMonth: {
        leadsGenerated: 10,
        leadsConverted: 5,
        revenue: 10000,
        commissionEarned: 500,
        activeDays: 22,
        averageDealSize: 2000,
      },
      yearToDate: {
        leadsGenerated: 100,
        leadsConverted: 50,
        revenue: 100000,
        commissionEarned: 5000,
        activeDays: 250,
        averageDealSize: 2000,
      },
    },
  },
  onboardingStatus: {
    currentStep: 5,
    totalSteps: 5,
    isCompleted: true,
    completedAt: new Date().toISOString(),
    steps: [],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  activeLeads: 15,
};

const mockLeads = [
  {
    id: 'lead-1',
    companyName: 'Acme Corp',
    contactPerson: 'Jane Smith',
    email: 'jane@acme.com',
    phone: '+1234567890',
    businessType: 'restaurant' as const,
    estimatedRevenue: 50000,
    priority: 'high' as const,
    status: 'new' as const,
    source: 'website' as const,
    location: {
      city: 'New York',
      state: 'NY',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
    },
    notes: [],
    activities: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    rfqTitle: 'Dairy Products Supply',
    category: 'Dairy',
    buyerName: 'Jane Smith',
    buyerLocation: 'New York, NY',
    estimatedValue: 50000,
    matchScore: 85,
    estimatedCommission: 2500,
  },
];

const mockStoreState = {
  agent: mockAgent,
  leads: mockLeads,
  selectedLead: null,
  setSelectedLead: jest.fn(),
  updateLead: jest.fn(),
  addNotification: jest.fn(),
  dashboardData: null,
  updateAgent: jest.fn(),
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const theme = createTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('ARMDashboard', () => {
  beforeEach(() => {
    mockUseAgentStore.mockReturnValue(mockStoreState as any);
    mockArmApiService.updateLeadStatus.mockResolvedValue(mockLeads[0]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with correct metrics', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    expect(screen.getByText('Agent Relationship Management')).toBeInTheDocument();
    expect(screen.getByText('Total Relationships')).toBeInTheDocument();
    expect(screen.getByText('Active Deals')).toBeInTheDocument();
    expect(screen.getByText('New This Week')).toBeInTheDocument();
    expect(screen.getByText('Needs Attention')).toBeInTheDocument();
  });

  it('displays the correct metrics values', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    // Check if metrics are calculated correctly
    expect(screen.getByText('1')).toBeInTheDocument(); // Total relationships
    expect(screen.getByText('0')).toBeInTheDocument(); // Active deals (no leads in active status)
  });

  it('shows pipeline view by default', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('lead-pipeline')).toBeInTheDocument();
    });
  });

  it('disables timeline and communication tabs when no lead is selected', () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const timelineTab = screen.getByRole('tab', { name: /relationship timeline/i });
    const communicationTab = screen.getByRole('tab', { name: /communication/i });

    expect(timelineTab).toHaveAttribute('aria-disabled', 'true');
    expect(communicationTab).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables timeline and communication tabs when lead is selected', async () => {
    const storeWithSelectedLead = {
      ...mockStoreState,
      selectedLead: mockLeads[0],
    };

    mockUseAgentStore.mockReturnValue(storeWithSelectedLead as any);

    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const timelineTab = screen.getByRole('tab', { name: /relationship timeline/i });
    const communicationTab = screen.getByRole('tab', { name: /communication/i });

    expect(timelineTab).not.toHaveAttribute('aria-disabled', 'true');
    expect(communicationTab).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('switches to timeline tab when lead is selected', async () => {
    const storeWithSelectedLead = {
      ...mockStoreState,
      selectedLead: mockLeads[0],
    };

    mockUseAgentStore.mockReturnValue(storeWithSelectedLead as any);

    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const timelineTab = screen.getByRole('tab', { name: /relationship timeline/i });
    fireEvent.click(timelineTab);

    await waitFor(() => {
      expect(screen.getByTestId('relationship-timeline')).toBeInTheDocument();
      expect(screen.getByText('Lead: Acme Corp')).toBeInTheDocument();
    });
  });

  it('handles lead status change correctly', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const updateButton = screen.getByText('Update Lead Status');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockStoreState.updateLead).toHaveBeenCalledWith('lead-1', { status: 'contacted' });
      expect(mockStoreState.addNotification).toHaveBeenCalled();
    });
  });

  it('displays refresh button and handles refresh', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const refreshButton = screen.getByLabelText('Refresh data');
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
    });
  });

  it('shows add new lead button', () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add New Lead');
    expect(addButton).toBeInTheDocument();
  });

  it('displays attention section when leads need attention', () => {
    const leadsNeedingAttention = [
      {
        ...mockLeads[0],
        activities: [
          {
            id: 'activity-1',
            leadId: 'lead-1',
            agentId: 'agent-1',
            type: 'call' as const,
            description: 'Called customer',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          },
        ],
      },
    ];

    const storeWithAttentionLeads = {
      ...mockStoreState,
      leads: leadsNeedingAttention,
    };

    mockUseAgentStore.mockReturnValue(storeWithAttentionLeads as any);

    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    expect(screen.getByText('Leads Requiring Attention')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('handles tab changes correctly', async () => {
    const storeWithSelectedLead = {
      ...mockStoreState,
      selectedLead: mockLeads[0],
    };

    mockUseAgentStore.mockReturnValue(storeWithSelectedLead as any);

    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    // Switch to communication tab
    const communicationTab = screen.getByRole('tab', { name: /communication/i });
    fireEvent.click(communicationTab);

    await waitFor(() => {
      expect(screen.getByTestId('communication-center')).toBeInTheDocument();
    });
  });

  it('shows loading state during operations', async () => {
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const refreshButton = screen.getByLabelText('Refresh data');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refreshButton).toBeDisabled();
    });
  });

  it('handles errors gracefully', async () => {
    mockArmApiService.updateLeadStatus.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const updateButton = screen.getByText('Update Lead Status');
    fireEvent.click(updateButton);

    // Should not crash and should handle error
    await waitFor(() => {
      expect(mockStoreState.updateLead).toHaveBeenCalled();
    });
  });
});

// Performance test
describe('ARMDashboard Performance', () => {
  it('renders within acceptable time', async () => {
    mockUseAgentStore.mockReturnValue(mockStoreState as any);

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Agent Relationship Management')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 500ms
    expect(renderTime).toBeLessThan(500);
  });

  it('memoizes expensive calculations', () => {
    const largeMockLeads = Array.from({ length: 1000 }, (_, i) => ({
      ...mockLeads[0],
      id: `lead-${i}`,
      companyName: `Company ${i}`,
    }));

    const storeWithManyLeads = {
      ...mockStoreState,
      leads: largeMockLeads,
    };

    mockUseAgentStore.mockReturnValue(storeWithManyLeads as any);

    const startTime = performance.now();
    
    render(
      <TestWrapper>
        <ARMDashboardOptimized />
      </TestWrapper>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should still render efficiently with large datasets
    expect(renderTime).toBeLessThan(1000);
  });
});