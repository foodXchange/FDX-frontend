import { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouterProvider } from '@/router/RouterProvider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AsyncErrorBoundary } from '@/components/ErrorBoundary/AsyncErrorBoundary';
import { theme } from '@/theme/muiTheme';
// NO CSS IMPORTS ALLOWED - Fonts are imported in theme file

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