import React, { useState, useEffect } from 'react';
import { FC, useState, useEffect } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Chip,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { ExpertSearchFilters } from '../../types';

interface ExpertSearchBarProps {
  value: string;
  filters: ExpertSearchFilters;
  onSearch: (query: string) => void;
  onFilterClick: () => void;
  onClearSearch: () => void;
  placeholder?: string;
  recentSearches?: string[];
  trendingSearches?: string[];
  activeFilterCount?: number;
}

export const ExpertSearchBar: FC<ExpertSearchBarProps> = ({
  value,
  filters,
  onSearch,
  onFilterClick,
  onClearSearch,
  placeholder = 'Search experts by name, expertise, or keyword...',
  recentSearches = [],
  trendingSearches = [],
  activeFilterCount = 0,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [_anchorEl, _setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchValue);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchValue('');
    onClearSearch();
    setShowSuggestions(false);
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null;
  });

  return (
    <Box position="relative">
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderRadius: 2,
          boxShadow: showSuggestions ? 3 : 1,
          transition: 'box-shadow 0.3s',
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        {searchValue && (
          <IconButton onClick={handleClear} sx={{ p: '10px' }}>
            <ClearIcon />
          </IconButton>
        )}
        
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        
        <Tooltip title={`${activeFilterCount} active filters`}>
          <IconButton
            onClick={onFilterClick}
            sx={{ p: '10px' }}
            color={activeFilterCount > 0 ? 'primary' : 'default'}
          >
            <Badge badgeContent={activeFilterCount} color="primary">
              <FilterIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (searchValue.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1000,
          }}
        >
          {recentSearches.length > 0 && (
            <Box>
              <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon fontSize="small" color="action" />
                <Box component="span" color="text.secondary" fontSize="0.875rem">
                  Recent Searches
                </Box>
              </Box>
              {recentSearches.map((search, index) => (
                <MenuItem
                  key={`recent-${index}`}
                  onClick={() => handleSuggestionClick(search)}
                  sx={{ py: 1 }}
                >
                  {search}
                </MenuItem>
              ))}
            </Box>
          )}

          {trendingSearches.length > 0 && (
            <>
              {recentSearches.length > 0 && <Divider />}
              <Box>
                <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingIcon fontSize="small" color="action" />
                  <Box component="span" color="text.secondary" fontSize="0.875rem">
                    Trending
                  </Box>
                </Box>
                {trendingSearches.map((search, index) => (
                  <MenuItem
                    key={`trending-${index}`}
                    onClick={() => handleSuggestionClick(search)}
                    sx={{ py: 1 }}
                  >
                    {search}
                  </MenuItem>
                ))}
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map(([key, value]) => {
            const label = Array.isArray(value) ? `${key}: ${value.length} selected` : `${key}: ${value}`;
            return (
              <Chip
                key={key}
                label={label}
                size="small"
                onDelete={() => {/* Handle individual filter removal */}}
                color="primary"
                variant="outlined"
              />
            );
          })}
          {activeFilters.length > 1 && (
            <Chip
              label="Clear all"
              size="small"
              onClick={onClearSearch}
              color="default"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Box>
  );
};