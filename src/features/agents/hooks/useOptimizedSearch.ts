import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface SearchConfig {
  debounceMs?: number;
  minLength?: number;
  searchFields?: string[];
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
}

interface SearchResult<T> {
  results: T[];
  query: string;
  isSearching: boolean;
  totalResults: number;
  hasMore: boolean;
}

export function useOptimizedSearch<T>(
  data: T[],
  config: SearchConfig = {}
): [SearchResult<T>, (query: string) => void, () => void] {
  const {
    debounceMs = 300,
    minLength = 2,
    searchFields = [],
    caseSensitive = false,
    fuzzyMatch = false,
  } = config;

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  // Create search index for better performance
  const searchIndex = useMemo(() => {
    if (searchFields.length === 0) return new Map();

    const index = new Map<string, T[]>();
    
    data.forEach((item) => {
      searchFields.forEach((field) => {
        const value = getNestedValue(item, field);
        if (value != null) {
          const searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
          const words = searchValue.split(/\s+/);
          
          words.forEach((word) => {
            if (word.length >= minLength) {
              if (!index.has(word)) {
                index.set(word, []);
              }
              index.get(word)!.push(item);
            }
          });
        }
      });
    });

    return index;
  }, [data, searchFields, caseSensitive, minLength]);

  const performSearch = useCallback((searchQuery: string): T[] => {
    if (!searchQuery || searchQuery.length < minLength) {
      return data;
    }

    const normalizedQuery = caseSensitive ? searchQuery : searchQuery.toLowerCase();

    // If search fields are not specified, search all string fields
    if (searchFields.length === 0) {
      return data.filter((item) => {
        return Object.values(item as any).some((value) => {
          if (typeof value === 'string') {
            const searchValue = caseSensitive ? value : value.toLowerCase();
            return fuzzyMatch 
              ? fuzzyMatchScore(searchValue, normalizedQuery) > 0.6
              : searchValue.includes(normalizedQuery);
          }
          return false;
        });
      });
    }

    // Use search index for better performance
    if (searchIndex.size > 0) {
      const queryWords = normalizedQuery.split(/\s+/);
      const matchingSets = queryWords.map((word) => {
        const exactMatches = searchIndex.get(word) || [];
        
        if (fuzzyMatch) {
          // Add fuzzy matches
          const fuzzyMatches: T[] = [];
          for (const [indexWord, items] of searchIndex.entries()) {
            if (indexWord !== word && fuzzyMatchScore(indexWord, word) > 0.7) {
              fuzzyMatches.push(...items);
            }
          }
          return [...exactMatches, ...fuzzyMatches];
        }
        
        return exactMatches;
      });

      // Find intersection of all word matches
      if (matchingSets.length === 0) return [];
      
      return matchingSets.reduce((acc, current) => 
        acc.filter((item: T) => current.includes(item))
      );
    }

    // Fallback: direct field search
    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = getNestedValue(item, field);
        if (value != null) {
          const searchValue = caseSensitive ? String(value) : String(value).toLowerCase();
          return fuzzyMatch 
            ? fuzzyMatchScore(searchValue, normalizedQuery) > 0.6
            : searchValue.includes(normalizedQuery);
        }
        return false;
      });
    });
  }, [data, searchFields, caseSensitive, fuzzyMatch, minLength, searchIndex]);

  const results = useMemo(() => {
    if (debouncedQuery !== query) {
      return {
        results: data,
        query: debouncedQuery,
        isSearching: true,
        totalResults: data.length,
        hasMore: false,
      };
    }

    const searchResults = performSearch(debouncedQuery);
    return {
      results: searchResults,
      query: debouncedQuery,
      isSearching: false,
      totalResults: searchResults.length,
      hasMore: false,
    };
  }, [data, debouncedQuery, query, performSearch]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
  }, []);

  return [results, search, clear];
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Simple fuzzy matching algorithm
function fuzzyMatchScore(str: string, pattern: string): number {
  if (pattern.length === 0) return 1;
  if (str.length === 0) return 0;

  let patternIdx = 0;
  let strIdx = 0;
  let matches = 0;

  while (strIdx < str.length && patternIdx < pattern.length) {
    if (str[strIdx] === pattern[patternIdx]) {
      matches++;
      patternIdx++;
    }
    strIdx++;
  }

  return matches / pattern.length;
}

export default useOptimizedSearch;