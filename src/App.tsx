import { FC } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouterProvider } from '@/router/RouterProvider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { MonitoringProvider } from '@/providers/MonitoringProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/ErrorBoundary/AsyncErrorBoundary';
import './styles/global.css';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StoreProvider>
          <AsyncErrorBoundary level="page">
            <MonitoringProvider>
              <AppRouterProvider />
            </MonitoringProvider>
          </AsyncErrorBoundary>
        </StoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;