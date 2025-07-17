import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys, queryClient, createOptimisticMutation, getNextPageParam } from '@/services/api/queryClient';
import { rfqService } from '@/services/api/rfqService';
import { RFQ, RFQFilters, CreateRFQDto, UpdateRFQDto } from '@/types/rfq';

// Fetch RFQ list with filters
export const useRFQList = (filters: RFQFilters = {}, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.rfq.list(filters),
    queryFn: () => rfqService.getList(filters),
    enabled,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });
};

// Fetch RFQ list with infinite scroll
export const useInfiniteRFQList = (filters: RFQFilters = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.rfq.list(filters),
    queryFn: ({ pageParam = 1 }) => 
      rfqService.getList({ ...filters, page: pageParam }),
    getNextPageParam,
    initialPageParam: 1,
  });
};

// Fetch single RFQ details
export const useRFQDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.rfq.detail(id),
    queryFn: () => rfqService.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
};

// Create RFQ mutation
export const useCreateRFQ = () => {
  return useMutation(
    createOptimisticMutation(
      (data: CreateRFQDto) => rfqService.create(data),
      {
        onSuccess: (data) => {
          // Invalidate and refetch RFQ lists
          queryClient.invalidateQueries({ queryKey: queryKeys.rfq.lists() });
          
          // Prefetch the new RFQ details
          queryClient.setQueryData(queryKeys.rfq.detail(data.id), data);
        },
        invalidateKeys: [queryKeys.rfq.lists()],
      }
    )
  );
};

// Update RFQ mutation
export const useUpdateRFQ = () => {
  return useMutation(
    createOptimisticMutation(
      ({ id, data }: { id: string; data: UpdateRFQDto }) => 
        rfqService.update(id, data),
      {
        onMutate: async ({ id, data }) => {
          // Cancel outgoing refetches
          await queryClient.cancelQueries({ queryKey: queryKeys.rfq.detail(id) });
          
          // Snapshot previous value
          const previousRFQ = queryClient.getQueryData<RFQ>(queryKeys.rfq.detail(id));
          
          // Optimistically update
          if (previousRFQ) {
            queryClient.setQueryData(queryKeys.rfq.detail(id), {
              ...previousRFQ,
              ...data,
            });
          }
          
          return { previousRFQ };
        },
        onError: (err, { id }, context) => {
          // Rollback on error
          if (context?.previousRFQ) {
            queryClient.setQueryData(queryKeys.rfq.detail(id), context.previousRFQ);
          }
        },
        onSuccess: (data, { id }) => {
          // Update the cache with server response
          queryClient.setQueryData(queryKeys.rfq.detail(id), data);
        },
        invalidateKeys: [queryKeys.rfq.lists()],
      }
    )
  );
};

// Delete RFQ mutation
export const useDeleteRFQ = () => {
  return useMutation({
    mutationFn: (id: string) => rfqService.delete(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.rfq.detail(id) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.rfq.lists() });
    },
  });
};

// Submit RFQ response
export const useSubmitRFQResponse = () => {
  return useMutation({
    mutationFn: ({ rfqId, response }: { rfqId: string; response: any }) =>
      rfqService.submitResponse(rfqId, response),
    onSuccess: (_, { rfqId }) => {
      // Invalidate RFQ detail to refetch with new response
      queryClient.invalidateQueries({ queryKey: queryKeys.rfq.detail(rfqId) });
    },
  });
};

// Prefetch RFQ details
export const usePrefetchRFQ = () => {
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.rfq.detail(id),
      queryFn: () => rfqService.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Batch operations
export const useBatchRFQOperations = () => {
  return useMutation({
    mutationFn: async (operations: Array<{ type: 'update' | 'delete'; id: string; data?: UpdateRFQDto }>) => {
      const results = await Promise.all(
        operations.map(op => {
          if (op.type === 'update' && op.data) {
            return rfqService.update(op.id, op.data);
          } else if (op.type === 'delete') {
            return rfqService.delete(op.id);
          }
          return Promise.resolve(null);
        })
      );
      return results;
    },
    onSuccess: () => {
      // Invalidate all RFQ queries
      queryClient.invalidateQueries({ queryKey: queryKeys.rfq.all });
    },
  });
};