// File: src/components/data-table/DataTable.js

import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import { cn, AutoIcon } from '../../lib/design-system';
import { Button, Input, Badge, Skeleton } from '../ui';

// ===== TABLE HEADER COMPONENT =====
const TableHeader = ({ table, title, description, onAdd }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        {onAdd && (
          <Button onClick={onAdd} icon="create">
            Add New
          </Button>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="flex items-center space-x-4 mt-4">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search..."
            icon="search"
            value={table.getState().globalFilter ?? ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
          />
        </div>
        
        <Button variant="outline" icon="filter">
          Filters
        </Button>
        
        <Button variant="outline" icon="download">
          Export
        </Button>
      </div>
    </div>
  );
};

// ===== PAGINATION COMPONENT =====
const TablePagination = ({ table }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          icon="ChevronLeftIcon"
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
            const pageIndex = i;
            const isActive = pageIndex === table.getState().pagination.pageIndex;
            
            return (
              <button
                key={pageIndex}
                onClick={() => table.setPageIndex(pageIndex)}
                className={cn(
                  'px-3 py-1 text-sm rounded-md',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {pageIndex + 1}
              </button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          icon="ChevronRightIcon"
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// ===== MAIN DATA TABLE COMPONENT =====
export const DataTable = ({
  data = [],
  columns = [],
  title,
  description,
  loading = false,
  onAdd,
  onRowClick,
  className,
  ...props
}) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow border border-gray-200', className)}>
        <div className="p-6">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
          
          {/* Table skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow border border-gray-200', className)} {...props}>
      <div className="p-6">
        <TableHeader 
          table={table}
          title={title}
          description={description}
          onAdd={onAdd}
        />
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        header.column.getCanSort() && 'cursor-pointer hover:bg-gray-100'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            <AutoIcon 
                              name="ChevronUpIcon" 
                              className={cn(
                                'w-3 h-3',
                                header.column.getIsSorted() === 'asc' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-400'
                              )}
                            />
                            <AutoIcon 
                              name="ChevronDownIcon" 
                              className={cn(
                                'w-3 h-3 -mt-1',
                                header.column.getIsSorted() === 'desc' 
                                  ? 'text-blue-600' 
                                  : 'text-gray-400'
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td 
                      key={cell.id} 
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Empty state */}
          {table.getRowModel().rows.length === 0 && (
            <div className="text-center py-12">
              <AutoIcon name="folder" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
              <p className="text-gray-500 mb-6">
                {globalFilter ? 'No results match your search.' : 'Get started by adding some data.'}
              </p>
              {onAdd && !globalFilter && (
                <Button onClick={onAdd} icon="create">
                  Add First Item
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <TablePagination table={table} />
      )}
    </div>
  );
};

// ===== COLUMN HELPERS =====
export const createStatusColumn = (accessorKey = 'status') => ({
  accessorKey,
  header: 'Status',
  cell: ({ getValue }) => {
    const status = getValue();
    return <Badge variant={status === 'active' ? 'success' : 'default'}>{status}</Badge>;
  }
});

export const createDateColumn = (accessorKey, header = 'Date') => ({
  accessorKey,
  header,
  cell: ({ getValue }) => {
    const date = getValue();
    return new Date(date).toLocaleDateString();
  }
});

export const createActionsColumn = (onEdit, onDelete, onView) => ({
  id: 'actions',
  header: 'Actions',
  cell: ({ row }) => (
    <div className="flex items-center space-x-2">
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          icon="view"
          onClick={(e) => {
            e.stopPropagation();
            onView(row.original);
          }}
        >
          View
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          icon="edit"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
        >
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          icon="delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.original);
          }}
        >
          Delete
        </Button>
      )}
    </div>
  )
});

// ===== SAMPLE COLUMN DEFINITIONS =====
export const rfqColumns = [
  {
    accessorKey: 'id',
    header: 'RFQ ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue()}</span>
    )
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ getValue }) => (
      <div className="font-medium">{getValue()}</div>
    )
  },
  createStatusColumn(),
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ getValue }) => {
      const amount = getValue();
      return amount ? `$${amount.toLocaleString()}` : 'TBD';
    }
  },
  createDateColumn('deadline', 'Deadline'),
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ getValue }) => {
      const priority = getValue();
      const variants = {
        high: 'danger',
        medium: 'warning',
        low: 'default'
      };
      return <Badge variant={variants[priority]}>{priority}</Badge>;
    }
  },
  createActionsColumn()
];

export const supplierColumns = [
  {
    accessorKey: 'companyName',
    header: 'Company',
    cell: ({ getValue }) => (
      <div className="font-medium">{getValue()}</div>
    )
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'certifications',
    header: 'Certifications',
    cell: ({ getValue }) => {
      const certs = getValue() || [];
      return (
        <div className="flex flex-wrap gap-1">
          {certs.slice(0, 2).map(cert => (
            <Badge key={cert} variant="primary" size="sm">{cert}</Badge>
          ))}
          {certs.length > 2 && (
            <Badge variant="default" size="sm">+{certs.length - 2}</Badge>
          )}
        </div>
      );
    }
  },
  createActionsColumn()
];