import { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRouterProvider } from '@/router/RouterProvider';
import { StoreProvider } from '@/components/providers/StoreProvider';
import { 
  GlobalErrorBoundary, 
  AsyncErrorHandler,
  ErrorProvider,
  ErrorMonitoringDashboard 
} from '@/components/ErrorBoundary';
import { theme } from '@/theme/muiTheme';
import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '@/services/monitoring/appInsights';
// NO CSS IMPORTS ALLOWED - Fonts are imported in theme file

const App: FC = () => {
  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <ErrorProvider>
            <GlobalErrorBoundary>
              <AsyncErrorHandler>
                <AuthProvider>
                  <StoreProvider>
                    <AppRouterProvider />
                  </StoreProvider>
                </AuthProvider>
              </AsyncErrorHandler>
            </GlobalErrorBoundary>
            {process.env.NODE_ENV === 'development' && <ErrorMonitoringDashboard />}
          </ErrorProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppInsightsContext.Provider>
  );
};

export default App;