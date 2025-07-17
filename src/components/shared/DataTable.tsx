import React, { useMemo, useState, useCallback, memo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  MoreVert,
  Search,
  FilterList,
  Download,
  Refresh,
} from '@mui/icons-material';
import { VirtualizedList } from './VirtualizedList';
import { visuallyHidden } from '@mui/utils';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selected: T[]) => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    disabled?: (row: T) => boolean;
  }>;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
  virtualized?: boolean;
  rowHeight?: number;
  selectable?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  getRowId?: (row: T) => string | number;
  rowsPerPage?: number;
}

type Order = 'asc' | 'desc';

function DataTableComponent<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  onSelectionChange,
  actions,
  loading = false,
  error,
  emptyMessage = 'No data available',
  stickyHeader = true,
  maxHeight = 600,
  virtualized = true,
  rowHeight = 72,
  selectable = false,
  searchable = true,
  exportable = false,
  refreshable = false,
  onRefresh,
  onExport,
  getRowId = (row, index) => index,
  rowsPerPage = 50,
}: DataTableProps<T>) {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T | string>('');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);

  // Filter columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!orderBy) return data;

    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return order === 'desc' ? -comparison : comparison;
    });
  }, [data, order, orderBy]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchQuery) return sortedData;

    const query = searchQuery.toLowerCase();
    return sortedData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [sortedData, searchQuery]);

  // Handle sorting
  const handleSort = useCallback((property: keyof T | string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  }, [order, orderBy]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (selected.size === filteredData.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelected = new Set(filteredData.map((row, index) => getRowId(row, index)));
      setSelected(newSelected);
      onSelectionChange?.(filteredData);
    }
  }, [filteredData, selected.size, getRowId, onSelectionChange]);

  const handleSelectRow = useCallback((row: T, index: number) => {
    const id = getRowId(row, index);
    const newSelected = new Set(selected);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    
    setSelected(newSelected);
    
    const selectedRows = filteredData.filter((r, i) => 
      newSelected.has(getRowId(r, i))
    );
    onSelectionChange?.(selectedRows);
  }, [selected, filteredData, getRowId, onSelectionChange]);

  // Handle actions menu
  const handleActionsClick = (event: React.MouseEvent<HTMLElement>, row: T) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setActiveRow(null);
  };

  // Table header
  const tableHeader = (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox" sx={{ width: 48 }}>
            <Checkbox
              indeterminate={selected.size > 0 && selected.size < filteredData.length}
              checked={filteredData.length > 0 && selected.size === filteredData.length}
              onChange={handleSelectAll}
            />
          </TableCell>
        )}
        {visibleColumns.map((column) => (
          <TableCell
            key={String(column.id)}
            align={column.align || 'left'}
            sx={{ width: column.width }}
          >
            {column.sortable !== false ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={() => handleSort(column.id)}
              >
                {column.label}
                {orderBy === column.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
        {actions && (
          <TableCell align="right" sx={{ width: 48 }}>
            Actions
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );

  // Row renderer for virtualized list
  const renderRow = useCallback((row: T, index: number) => {
    const id = getRowId(row, index);
    const isSelected = selected.has(id);

    return (
      <TableRow
        hover
        onClick={() => onRowClick?.(row, index)}
        selected={isSelected}
        sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
      >
        {selectable && (
          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onChange={() => handleSelectRow(row, index)}
            />
          </TableCell>
        )}
        {visibleColumns.map((column) => (
          <TableCell key={String(column.id)} align={column.align || 'left'}>
            {column.format
              ? column.format(row[column.id as keyof T], row)
              : row[column.id as keyof T]}
          </TableCell>
        ))}
        {actions && (
          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={(e) => handleActionsClick(e, row)}
            >
              <MoreVert />
            </IconButton>
          </TableCell>
        )}
      </TableRow>
    );
  }, [selected, visibleColumns, actions, selectable, onRowClick, getRowId, handleSelectRow]);

  // Loading skeleton
  const renderSkeleton = () => (
    <TableBody>
      {Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          {selectable && (
            <TableCell padding="checkbox">
              <Skeleton variant="rectangular" width={24} height={24} />
            </TableCell>
          )}
          {visibleColumns.map((column) => (
            <TableCell key={String(column.id)}>
              <Skeleton variant="text" />
            </TableCell>
          ))}
          {actions && (
            <TableCell>
              <Skeleton variant="circular" width={24} height={24} />
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  );

  return (
    <Paper sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {searchable && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, maxWidth: 400 }}
            />
          )}
          
          {selected.size > 0 && (
            <Chip
              label={`${selected.size} selected`}
              onDelete={() => {
                setSelected(new Set());
                onSelectionChange?.([]);
              }}
              color="primary"
              size="small"
            />
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {refreshable && (
            <IconButton onClick={onRefresh} size="small">
              <Refresh />
            </IconButton>
          )}
          
          {exportable && (
            <IconButton onClick={onExport} size="small">
              <Download />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : loading ? (
          <Table stickyHeader={stickyHeader}>
            {tableHeader}
            {renderSkeleton()}
          </Table>
        ) : filteredData.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{emptyMessage}</Typography>
          </Box>
        ) : virtualized && filteredData.length > rowsPerPage ? (
          <Box sx={{ height: '100%' }}>
            <Table stickyHeader={stickyHeader}>
              {tableHeader}
            </Table>
            <VirtualizedList
              items={filteredData}
              renderItem={renderRow}
              itemHeight={rowHeight}
              emptyMessage={emptyMessage}
            />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight }}>
            <Table stickyHeader={stickyHeader}>
              {tableHeader}
              <TableBody>
                {filteredData.map((row, index) => renderRow(row, index))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
      >
        {actions?.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (activeRow) {
                action.onClick(activeRow);
              }
              handleActionsClose();
            }}
            disabled={activeRow ? action.disabled?.(activeRow) : false}
          >
            {action.icon}
            <Box sx={{ ml: action.icon ? 1 : 0 }}>{action.label}</Box>
          </MenuItem>
        ))}
      </Menu>
    </Paper>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;