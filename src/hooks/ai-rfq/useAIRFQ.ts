import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AIRFQService from '../../services/ai-rfq/AIRFQService';
import {
  EnhancedRFQ,
  CreateRFQRequest,
  UpdateRFQRequest,
  RFQSearchFilters,
  AIAnalysisResult,
  SupplierMatch,
  AIMatchingOptions,
  RFQAnalytics
} from '../../types/ai-rfq';

// Hook for fetching a single RFQ with AI data
export function useRFQ(rfqId: string) {
  return useQuery({
    queryKey: ['rfq', rfqId],
    queryFn: () => AIRFQService.getRFQ(rfqId),
    enabled: !!rfqId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
}

// Hook for searching RFQs with AI features
export function useRFQs(
  filters: RFQSearchFilters = {},
  page = 1,
  limit = 20
) {
  return useQuery({
    queryKey: ['rfqs', filters, page, limit],
    queryFn: () => AIRFQService.searchRFQs(filters, page, limit),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for creating RFQs with AI assistance
export function useCreateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRFQRequest) => AIRFQService.createRFQ(request),
    onSuccess: (newRFQ) => {
      // Invalidate and refetch RFQs list
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      queryClient.invalidateQueries({ queryKey: ['rfq-analytics'] });
      
      // Add new RFQ to cache
      queryClient.setQueryData(['rfq', newRFQ.id], newRFQ);
    },
    onError: (error) => {
      console.error('Failed to create RFQ:', error);
    }
  });
}

// Hook for updating RFQs
export function useUpdateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rfqId, updates }: { rfqId: string; updates: UpdateRFQRequest }) =>
      AIRFQService.updateRFQ(rfqId, updates),
    onSuccess: (updatedRFQ) => {
      // Update the specific RFQ in cache
      queryClient.setQueryData(['rfq', updatedRFQ.id], updatedRFQ);
      
      // Invalidate RFQs list to reflect changes
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
    },
    onError: (error) => {
      console.error('Failed to update RFQ:', error);
    }
  });
}

// Hook for AI analysis
export function useAIAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      rfqId, 
      analysisType 
    }: { 
      rfqId: string; 
      analysisType?: 'comprehensive' | 'requirements' | 'market' | 'risk' | 'compliance' 
    }) => AIRFQService.analyzeRFQWithAI(rfqId, analysisType),
    onSuccess: (result, variables) => {
      // Update RFQ with analysis result
      queryClient.setQueryData(['rfq', variables.rfqId], (oldData: EnhancedRFQ | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, aiAnalysis: result };
      });
      
      // Cache the analysis result
      queryClient.setQueryData(['ai-analysis', variables.rfqId], result);
    },
    onError: (error) => {
      console.error('Failed to analyze RFQ with AI:', error);
    }
  });
}

// Hook for AI supplier matching
export function useAIMatching() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      rfqId, 
      options 
    }: { 
      rfqId: string; 
      options?: AIMatchingOptions 
    }) => AIRFQService.getAIMatches(rfqId, options),
    onSuccess: (matches, variables) => {
      // Update RFQ with matching results
      queryClient.setQueryData(['rfq', variables.rfqId], (oldData: EnhancedRFQ | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, matchingResults: matches };
      });
      
      // Cache the matching results
      queryClient.setQueryData(['ai-matches', variables.rfqId], matches);
    },
    onError: (error) => {
      console.error('Failed to get AI matches:', error);
    }
  });
}

// Hook for RFQ optimization
export function useRFQOptimization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rfqId: string) => AIRFQService.optimizeRFQRequirements(rfqId),
    onSuccess: (optimization, rfqId) => {
      // Cache the optimization result
      queryClient.setQueryData(['rfq-optimization', rfqId], optimization);
    },
    onError: (error) => {
      console.error('Failed to optimize RFQ:', error);
    }
  });
}

// Hook for AI specification generation
export function useSpecificationGeneration() {
  return useMutation({
    mutationFn: ({ 
      rfqId, 
      productType, 
      targetMarkets, 
      qualityLevel 
    }: { 
      rfqId: string; 
      productType: string; 
      targetMarkets?: string[]; 
      qualityLevel?: 'basic' | 'premium' | 'organic' | 'specialty' 
    }) => AIRFQService.generateSpecifications(rfqId, productType, targetMarkets, qualityLevel),
    onError: (error) => {
      console.error('Failed to generate specifications:', error);
    }
  });
}

// Hook for compliance validation
export function useComplianceValidation() {
  return useMutation({
    mutationFn: ({ 
      rfqId, 
      targetMarkets 
    }: { 
      rfqId: string; 
      targetMarkets: string[] 
    }) => AIRFQService.validateCompliance(rfqId, targetMarkets),
    onError: (error) => {
      console.error('Failed to validate compliance:', error);
    }
  });
}

// Hook for pricing prediction
export function usePricingPrediction() {
  return useMutation({
    mutationFn: (rfqId: string) => AIRFQService.predictPricing(rfqId),
    onError: (error) => {
      console.error('Failed to predict pricing:', error);
    }
  });
}

// Hook for supplier recommendations
export function useSupplierRecommendations() {
  return useMutation({
    mutationFn: ({ 
      rfqId, 
      criteria 
    }: { 
      rfqId: string; 
      criteria?: any 
    }) => AIRFQService.recommendSuppliers(rfqId, criteria),
    onError: (error) => {
      console.error('Failed to get supplier recommendations:', error);
    }
  });
}

// Hook for RFQ analytics
export function useRFQAnalytics(
  dateRange?: { start: string; end: string },
  filters?: RFQSearchFilters
) {
  return useQuery({
    queryKey: ['rfq-analytics', dateRange, filters],
    queryFn: () => AIRFQService.getRFQAnalytics(dateRange, filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for comprehensive RFQ management with AI
export function useRFQManagement() {
  const [activeRFQ, setActiveRFQ] = useState<string | null>(null);
  const [analysisInProgress, setAnalysisInProgress] = useState<boolean>(false);
  
  const createRFQMutation = useCreateRFQ();
  const updateRFQMutation = useUpdateRFQ();
  const aiAnalysisMutation = useAIAnalysis();
  const aiMatchingMutation = useAIMatching();
  const optimizationMutation = useRFQOptimization();

  // Auto-trigger AI analysis when RFQ is created
  useEffect(() => {
    if (createRFQMutation.isSuccess && activeRFQ) {
      setAnalysisInProgress(true);
      aiAnalysisMutation.mutate(
        { rfqId: activeRFQ, analysisType: 'comprehensive' },
        {
          onSettled: () => setAnalysisInProgress(false)
        }
      );
    }
  }, [createRFQMutation.isSuccess, activeRFQ]);

  const createRFQWithAI = useCallback(async (request: CreateRFQRequest) => {
    try {
      const rfq = await createRFQMutation.mutateAsync(request);
      setActiveRFQ(rfq.id);
      return rfq;
    } catch (error) {
      console.error('Failed to create RFQ with AI:', error);
      throw error;
    }
  }, [createRFQMutation]);

  const analyzeAndMatch = useCallback(async (
    rfqId: string,
    matchingOptions?: AIMatchingOptions
  ) => {
    try {
      setAnalysisInProgress(true);
      
      // Run analysis and matching in parallel
      const [analysis, matches] = await Promise.all([
        aiAnalysisMutation.mutateAsync({ rfqId, analysisType: 'comprehensive' }),
        aiMatchingMutation.mutateAsync({ rfqId, options: matchingOptions })
      ]);
      
      return { analysis, matches };
    } catch (error) {
      console.error('Failed to analyze and match:', error);
      throw error;
    } finally {
      setAnalysisInProgress(false);
    }
  }, [aiAnalysisMutation, aiMatchingMutation]);

  const optimizeAndUpdate = useCallback(async (rfqId: string) => {
    try {
      const optimization = await optimizationMutation.mutateAsync(rfqId);
      
      // Apply optimizations if user confirms
      if (optimization.benefits.length > 0) {
        const updates = this.extractUpdatesFromOptimization(optimization);
        await updateRFQMutation.mutateAsync({ rfqId, updates });
      }
      
      return optimization;
    } catch (error) {
      console.error('Failed to optimize RFQ:', error);
      throw error;
    }
  }, [optimizationMutation, updateRFQMutation]);

  return {
    activeRFQ,
    setActiveRFQ,
    analysisInProgress,
    createRFQWithAI,
    analyzeAndMatch,
    optimizeAndUpdate,
    mutations: {
      create: createRFQMutation,
      update: updateRFQMutation,
      analyze: aiAnalysisMutation,
      match: aiMatchingMutation,
      optimize: optimizationMutation
    }
  };
}

// Hook for real-time RFQ updates
export function useRFQRealTimeUpdates(rfqId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!rfqId) return;

    setConnectionStatus('connecting');

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/rfq/${rfqId}`);

    ws.onopen = () => {
      setConnectionStatus('connected');
      console.log(`Connected to RFQ ${rfqId} updates`);
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        
        // Update the RFQ in cache
        queryClient.setQueryData(['rfq', rfqId], (oldData: EnhancedRFQ | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...update };
        });

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['rfqs'] });
        
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      console.log(`Disconnected from RFQ ${rfqId} updates`);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for RFQ ${rfqId}:`, error);
      setConnectionStatus('disconnected');
    };

    return () => {
      ws.close();
    };
  }, [rfqId, queryClient]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected'
  };
}