import React, { useState } from 'react';
import { FC, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Radio,
  RadioGroup,
  FormControl,
  TextField,
  Autocomplete,
} from '@mui/material';
import {  } from '@mui/icons-material';
import { ExpertSearchFilters } from '../../types';

interface ExpertFiltersProps {
  filters: ExpertSearchFilters;
  onFiltersChange: (filters: Partial<ExpertSearchFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  categories?: string[];
  languages?: string[];
  countries?: string[];
}

export const ExpertFilters: FC<ExpertFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  categories = [
    'Supply Chain Optimization',
    'Quality Assurance',
    'Regulatory Compliance',
    'Food Safety',
    'Procurement Strategy',
    'Sustainability',
    'Technology Integration',
    'Market Analysis',
  ],
  languages = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Arabic'],
  countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'China', 'India'],
}) => {
  const [expanded, setExpanded] = useState<string | false>('categories');

  const handleAccordionChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleRatingChange = (_: any, value: number | number[]) => {
    onFiltersChange({ minRating: value as number });
  };

  const handlePriceRangeChange = (_: any, value: number | number[]) => {
    onFiltersChange({ maxHourlyRate: value as number });
  };

  const handleCategoryToggle = (category: string) => {
    const current = filters.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFiltersChange({ categories: updated });
  };

  const handleLanguageToggle = (language: string) => {
    const current = filters.languages || [];
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language];
    onFiltersChange({ languages: updated });
  };

  return (
    <Paper sx={{ p: 3, height: 'fit-content' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Filters</Typography>
        <Button size="small" onClick={onReset}>
          Reset All
        </Button>
      </Box>

      {/* Categories */}
      <Accordion
        expanded={expanded === 'categories'}
        onChange={handleAccordionChange('categories')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <CategoryIcon fontSize="small" />
            <Typography>Expertise Categories</Typography>
          </Box>
          {filters.categories && filters.categories.length > 0 && (
            <Chip
              label={filters.categories.length}
              size="small"
              color="primary"
              sx={{ ml: 'auto', mr: 1 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {categories.map(category => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={filters.categories?.includes(category) || false}
                    onChange={() => handleCategoryToggle(category)}
                    size="small"
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Rating */}
      <Accordion
        expanded={expanded === 'rating'}
        onChange={handleAccordionChange('rating')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon fontSize="small" />
            <Typography>Minimum Rating</Typography>
          </Box>
          {filters.minRating && (
            <Chip
              label={`${filters.minRating}+`}
              size="small"
              color="primary"
              sx={{ ml: 'auto', mr: 1 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Box px={2}>
            <Slider
              value={filters.minRating || 0}
              onChange={handleRatingChange}
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: 'Any' },
                { value: 3, label: '3★' },
                { value: 4, label: '4★' },
                { value: 5, label: '5★' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={v => `${v}★`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion
        expanded={expanded === 'price'}
        onChange={handleAccordionChange('price')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <MoneyIcon fontSize="small" />
            <Typography>Hourly Rate</Typography>
          </Box>
          {filters.maxHourlyRate && (
            <Chip
              label={`< $${filters.maxHourlyRate}`}
              size="small"
              color="primary"
              sx={{ ml: 'auto', mr: 1 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Box px={2}>
            <Slider
              value={filters.maxHourlyRate || 500}
              onChange={handlePriceRangeChange}
              min={0}
              max={500}
              step={25}
              marks={[
                { value: 0, label: '$0' },
                { value: 250, label: '$250' },
                { value: 500, label: '$500+' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={v => `$${v}/hr`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Languages */}
      <Accordion
        expanded={expanded === 'languages'}
        onChange={handleAccordionChange('languages')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <LanguageIcon fontSize="small" />
            <Typography>Languages</Typography>
          </Box>
          {filters.languages && filters.languages.length > 0 && (
            <Chip
              label={filters.languages.length}
              size="small"
              color="primary"
              sx={{ ml: 'auto', mr: 1 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {languages.map(language => (
              <FormControlLabel
                key={language}
                control={
                  <Checkbox
                    checked={filters.languages?.includes(language) || false}
                    onChange={() => handleLanguageToggle(language)}
                    size="small"
                  />
                }
                label={language}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Availability */}
      <Accordion
        expanded={expanded === 'availability'}
        onChange={handleAccordionChange('availability')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" />
            <Typography>Availability</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl>
            <RadioGroup
              value={filters.availability === true ? 'available' : filters.availability === false ? 'any' : 'any'}
              onChange={(e) => onFiltersChange({
                availability: e.target.value === 'available' ? true : undefined
              })}
            >
              <FormControlLabel value="any" control={<Radio size="small" />} label="Any" />
              <FormControlLabel value="available" control={<Radio size="small" />} label="Available Now" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Location */}
      <Accordion
        expanded={expanded === 'location'}
        onChange={handleAccordionChange('location')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon fontSize="small" />
            <Typography>Location</Typography>
          </Box>
          {filters.location?.country && (
            <Chip
              label={filters.location.country}
              size="small"
              color="primary"
              sx={{ ml: 'auto', mr: 1 }}
            />
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Autocomplete
            options={countries}
            value={filters.location?.country || null}
            onChange={(_, value) => onFiltersChange({
              location: value ? { ...filters.location, country: value } : undefined
            })}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select country" size="small" />
            )}
          />
        </AccordionDetails>
      </Accordion>

      <Box mt={3}>
        <Button
          variant="contained"
          fullWidth
          onClick={onApply}
          disabled={Object.keys(filters).length === 0}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};