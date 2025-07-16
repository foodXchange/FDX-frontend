import { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react';
import { Expert, ExpertSearchFilters, ExpertSearchResult } from '../types';

interface ExpertContextValue {
  // State
  experts: Expert[];
  selectedExpert: Expert | null;
  searchResults: ExpertSearchResult | null;
  searchFilters: ExpertSearchFilters;
  loading: boolean;
  error: string | null;
  
  // Actions
  searchExperts: (filters: ExpertSearchFilters) => Promise<void>;
  getExpertById: (expertId: string) => Promise<Expert | null>;
  selectExpert: (expert: Expert | null) => void;
  updateSearchFilters: (filters: Partial<ExpertSearchFilters>) => void;
  clearSearch: () => void;
  refreshExperts: () => Promise<void>;
}

const ExpertContext = createContext<ExpertContextValue | undefined>(undefined);

export const useExpertContext = () => {
  const context = useContext(ExpertContext);
  if (!context) {
    throw new Error('useExpertContext must be used within an ExpertProvider');
  }
  return context;
};

interface ExpertProviderProps {
  children: ReactNode;
}

export const ExpertProvider: FC<ExpertProviderProps> = ({ children }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [searchResults, setSearchResults] = useState<ExpertSearchResult | null>(null);
  const [searchFilters, setSearchFilters] = useState<ExpertSearchFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchExperts = useCallback(async (filters: ExpertSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const mockResults: ExpertSearchResult = {
        experts: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      };
      setSearchResults(mockResults);
      setExperts(mockResults.experts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search experts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getExpertById = useCallback(async (expertId: string): Promise<Expert | null> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      const cachedExpert = experts.find(e => e.id === expertId);
      if (cachedExpert) {
        return cachedExpert;
      }
      // Fetch from API if not cached
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expert');
      return null;
    } finally {
      setLoading(false);
    }
  }, [experts]);

  const selectExpert = useCallback((expert: Expert | null) => {
    setSelectedExpert(expert);
  }, []);

  const updateSearchFilters = useCallback((filters: Partial<ExpertSearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchFilters({});
    setSearchResults(null);
    setExperts([]);
    setError(null);
  }, []);

  const refreshExperts = useCallback(async () => {
    if (Object.keys(searchFilters).length > 0) {
      await searchExperts(searchFilters);
    }
  }, [searchFilters, searchExperts]);

  const value: ExpertContextValue = {
    experts,
    selectedExpert,
    searchResults,
    searchFilters,
    loading,
    error,
    searchExperts,
    getExpertById,
    selectExpert,
    updateSearchFilters,
    clearSearch,
    refreshExperts,
  };

  return <ExpertContext.Provider value={value}>{children}</ExpertContext.Provider>;
};