import React from 'react';
import { 
  Table as MuiTable, 
  TableHead as MuiTableHead, 
  TableBody as MuiTableBody, 
  TableRow as MuiTableRow, 
  TableCell as MuiTableCell,
  Box,
  SxProps,
  Theme
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TableProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const Table: React.FC<TableProps> = ({ children, sx }) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'auto' }}>
      <MuiTable 
        sx={{ 
          width: '100%', 
          captionSide: 'bottom', 
          fontSize: '0.875rem',
          ...sx 
        }}
      >
        {children}
      </MuiTable>
    </Box>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, sx }) => {
  const theme = useTheme();
  
  return (
    <MuiTableHead 
      sx={{ 
        '& tr': { 
          borderBottom: `1px solid ${theme.palette.divider}` 
        },
        ...sx 
      }}
    >
      {children}
    </MuiTableHead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const TableBody: React.FC<TableBodyProps> = ({ children, sx }) => {
  return (
    <MuiTableBody 
      sx={{ 
        '& tr:last-child': { 
          border: 0 
        },
        ...sx 
      }}
    >
      {children}
    </MuiTableBody>
  );
};

interface TableRowProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  selected?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, sx, selected }) => {
  const theme = useTheme();
  
  return (
    <MuiTableRow 
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: 'background-color 0.2s',
        '&:hover': { 
          bgcolor: 'action.hover' 
        },
        ...(selected && {
          bgcolor: 'action.selected',
        }),
        ...sx 
      }}
    >
      {children}
    </MuiTableRow>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, sx }) => {
  return (
    <MuiTableCell 
      component="th"
      sx={{ 
        height: 48,
        px: 2,
        textAlign: 'left',
        verticalAlign: 'middle',
        fontWeight: 500,
        color: 'text.secondary',
        ...sx 
      }}
    >
      {children}
    </MuiTableCell>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  colSpan?: number;
}

export const TableCell: React.FC<TableCellProps> = ({ children, sx, colSpan }) => {
  return (
    <MuiTableCell 
      sx={{ 
        p: 2, 
        verticalAlign: 'middle',
        ...sx 
      }} 
      colSpan={colSpan}
    >
      {children}
    </MuiTableCell>
  );
};