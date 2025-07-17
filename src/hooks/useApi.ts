import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError, ApiResponse } from '@/services/api-client';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
  retryCount?: number;
  cacheTime?: number;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();

export function useApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Check cache
      if (options.cacheTime) {
        const cacheKey = JSON.stringify({ fn: apiFunction.name, args });
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < options.cacheTime) {
          setData(cached.data);
          setIsSuccess(true);
          setIsError(false);
          setError(null);
          return cached.data;
        }
      }

      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);

      try {
        const response = await apiFunction(...args);
        const responseData = response.data;

        if (!mountedRef.current) return responseData as T;

        setData(responseData ?? null);
        setIsSuccess(true);
        
        // Cache the result
        if (options.cacheTime) {
          const cacheKey = JSON.stringify({ fn: apiFunction.name, args });
          cache.set(cacheKey, { data: responseData, timestamp: Date.now() });
        }

        options.onSuccess?.(responseData as T);
        return responseData as T;
      } catch (err) {
        if (!mountedRef.current) throw err;

        const apiError = err as ApiError;
        setError(apiError);
        setIsError(true);
        options.onError?.(apiError);
        throw apiError;
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
          options.onSettled?.();
        }
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsError(false);
    setIsSuccess(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    execute,
    reset,
  };
}

// Hook for queries that should run automatically
export function useQuery<T = unknown>(
  queryKey: string | unknown[],
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> & { refetchInterval?: number } = {}
): UseApiResult<T> & { refetch: () => Promise<T> } {
  const { enabled = true, refetchInterval, ...apiOptions } = options;
  const result = useApi(queryFn, apiOptions);

  useEffect(() => {
    if (enabled) {
      result.execute();
    }
  }, [enabled, JSON.stringify(queryKey)]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        result.execute();
      }, refetchInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [refetchInterval, enabled]);

  return {
    ...result,
    refetch: result.execute,
  };
}

// Hook for mutations
export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseApiOptions<TData> = {}
): {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: ApiError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
} {
  const result = useApi<TData>(mutationFn, options);

  const mutate = useCallback(
    (variables: TVariables) => {
      result.execute(variables).catch(() => {
        // Error is handled in the hook
      });
      return Promise.resolve(result.data!);
    },
    [result]
  );

  const mutateAsync = useCallback(
    (variables: TVariables) => {
      return result.execute(variables);
    },
    [result]
  );

  return {
    mutate,
    mutateAsync,
    data: result.data,
    error: result.error,
    isLoading: result.isLoading,
    isError: result.isError,
    isSuccess: result.isSuccess,
    reset: result.reset,
  };
}