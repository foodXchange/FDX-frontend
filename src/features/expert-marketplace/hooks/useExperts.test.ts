import { renderHook, act, waitFor } from '@testing-library/react';
import { useExperts } from './useExperts';
import { expertApi } from '../services/api';
import { ExpertSearchResult } from '../types';

// Mock the API
jest.mock('../services/api');
const mockedExpertApi = expertApi as jest.Mocked<typeof expertApi>;

const mockSearchResult: ExpertSearchResult = {
  experts: [
    {
      id: '1',
      userId: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      title: 'Supply Chain Expert',
      bio: 'Experienced expert',
      location: {
        city: 'New York',
        country: 'USA',
        timezone: 'America/New_York',
      },
      expertise: [],
      languages: ['English'],
      rating: 4.8,
      reviewCount: 125,
      hourlyRate: 150,
      currency: 'USD',
      availability: {
        isAvailable: true,
        schedule: {},
        blockedDates: [],
      },
      portfolio: [],
      certifications: [],
      experience: 10,
      responseTime: 2,
      completedProjects: 85,
      isVerified: true,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  total: 1,
  page: 1,
  pageSize: 20,
  hasMore: false,
};

describe('useExperts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    expect(result.current.experts).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalCount).toBe(0);
  });

  it('should search experts successfully', async () => {
    mockedExpertApi.searchExperts.mockResolvedValueOnce(mockSearchResult);

    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    await act(async () => {
      await result.current.searchExperts();
    });

    expect(mockedExpertApi.searchExperts).toHaveBeenCalledTimes(1);
    expect(result.current.experts).toEqual(mockSearchResult.experts);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle search errors', async () => {
    const errorMessage = 'Failed to search experts';
    mockedExpertApi.searchExperts.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    await act(async () => {
      await result.current.searchExperts();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.experts).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should update filters and trigger search', async () => {
    mockedExpertApi.searchExperts.mockResolvedValueOnce(mockSearchResult);

    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    await act(async () => {
      result.current.updateFilters({ query: 'supply chain' });
    });

    expect(result.current.filters.query).toBe('supply chain');
  });

  it('should load more experts', async () => {
    const firstPageResult = {
      ...mockSearchResult,
      hasMore: true,
    };

    const secondPageResult = {
      ...mockSearchResult,
      experts: [
        {
          ...mockSearchResult.experts[0],
          id: '2',
          firstName: 'Jane',
        },
      ],
      page: 2,
      hasMore: false,
    };

    mockedExpertApi.searchExperts
      .mockResolvedValueOnce(firstPageResult)
      .mockResolvedValueOnce(secondPageResult);

    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    // Initial search
    await act(async () => {
      await result.current.searchExperts();
    });

    expect(result.current.experts).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    // Load more
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.experts).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
    expect(mockedExpertApi.searchExperts).toHaveBeenCalledTimes(2);
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    act(() => {
      result.current.updateFilters({ query: 'test', categories: ['category1'] });
    });

    expect(result.current.filters.query).toBe('test');
    expect(result.current.filters.categories).toEqual(['category1']);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
    expect(result.current.experts).toEqual([]);
  });

  it('should auto-search when filters change', async () => {
    mockedExpertApi.searchExperts.mockResolvedValue(mockSearchResult);

    const { result } = renderHook(() => useExperts({ autoSearch: true }));

    await act(async () => {
      result.current.updateFilters({ query: 'supply chain' });
    });

    await waitFor(() => {
      expect(mockedExpertApi.searchExperts).toHaveBeenCalled();
    });
  });

  it('should debounce search queries', async () => {
    jest.useFakeTimers();
    mockedExpertApi.searchExperts.mockResolvedValue(mockSearchResult);

    const { result } = renderHook(() => useExperts({ autoSearch: true }));

    // Rapid filter updates should be debounced
    act(() => {
      result.current.updateFilters({ query: 's' });
      result.current.updateFilters({ query: 'su' });
      result.current.updateFilters({ query: 'sup' });
      result.current.updateFilters({ query: 'supply' });
    });

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedExpertApi.searchExperts).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  it('should refresh experts', async () => {
    mockedExpertApi.searchExperts.mockResolvedValue(mockSearchResult);

    const { result } = renderHook(() => useExperts({ autoSearch: false }));

    // Set some filters first
    act(() => {
      result.current.updateFilters({ query: 'test' });
    });

    await act(async () => {
      result.current.refreshExperts();
    });

    expect(mockedExpertApi.searchExperts).toHaveBeenCalledWith({
      query: '',
    });
  });
});