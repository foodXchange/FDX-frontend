// Re-export everything from api-client for backward compatibility
export * from '../api-client';
export { default } from '../api-client';

// Additional API utilities
export { useApi, useQuery, useMutation } from '@hooks/useApi';
export { useApiError } from '@hooks/useApiError';