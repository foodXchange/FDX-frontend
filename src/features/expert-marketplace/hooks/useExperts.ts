import { useState, useCallback, useEffect } from 'react';
import { Expert, ExpertSearchFilters, ExpertSearchResult } from '../types';
import { expertApi } from '../services/api';
import { useDebounce } from './useDebounce';

interface UseExpertsOptions {
  initialFilters?: ExpertSearchFilters;
  pageSize?: number;
  autoSearch?: boolean;
}

export const useExperts = (options: UseExpertsOptions = {}) => {
  const { initialFilters = {}, pageSize = 20, autoSearch = true } = options;
  
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filters, setFilters] = useState<ExpertSearchFilters>(initialFilters);
  const [searchResult, setSearchResult] = useState<ExpertSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(filters.query || '', 300);

  const searchExperts = useCallback(async (searchFilters?: ExpertSearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const filtersToUse = searchFilters || filters;
      const result = await expertApi.searchExperts({
        ...filtersToUse,
        query: debouncedQuery,
      });
      
      setSearchResult(result);
      setExperts(result.experts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search experts';
      setError(errorMessage);
      console.error('Expert search error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedQuery]);

  const loadMore = useCallback(async () => {
    if (!searchResult?.hasMore || loading) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await expertApi.searchExperts({
        ...filters,
        query: debouncedQuery,
        page: nextPage,
      });
      
      setSearchResult(result);
      setExperts(prev => [...prev, ...result.experts]);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more experts');
    } finally {
      setLoading(false);
    }
  }, [searchResult, loading, page, filters, debouncedQuery]);

  const updateFilters = useCallback((newFilters: Partial<ExpertSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
    setExperts([]);
    setSearchResult(null);
  }, []);

  const refreshExperts = useCallback(() => {
    setPage(1);
    searchExperts();
  }, [searchExperts]);

  // Auto-search when filters change
  useEffect(() => {
    if (autoSearch && (debouncedQuery || Object.keys(filters).length > 1)) {
      searchExperts();
    }
  }, [debouncedQuery, filters, autoSearch, searchExperts]);

  return {
    experts,
    searchResult,
    filters,
    loading,
    error,
    hasMore: searchResult?.hasMore || false,
    totalCount: searchResult?.total || 0,
    searchExperts,
    loadMore,
    updateFilters,
    clearFilters,
    refreshExperts,
  };
};

// Hook for individual expert
export const useExpert = (expertId: string) => {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExpert = useCallback(async () => {
    if (!expertId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await expertApi.getExpertById(expertId);
      setExpert(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expert');
      console.error('Load expert error:', err);
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  useEffect(() => {
    loadExpert();
  }, [loadExpert]);

  return {
    expert,
    loading,
    error,
    refresh: loadExpert,
  };
};