import { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouterProvider } from '@/router/RouterProvider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/ErrorBoundary/AsyncErrorBoundary';
import { theme } from '@/theme/muiTheme';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

const App: FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <StoreProvider>
            <AsyncErrorBoundary level="page">
              <AppRouterProvider />
            </AsyncErrorBoundary>
          </StoreProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;