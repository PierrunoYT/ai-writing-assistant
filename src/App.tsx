import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import { useEffect } from 'react';
import { initializeStore } from './store/slices/chatSlice';

const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#6366f1' : '#4f46e5',
      light: mode === 'dark' ? '#818cf8' : '#6366f1',
      dark: mode === 'dark' ? '#4f46e5' : '#4338ca',
    },
    secondary: {
      main: mode === 'dark' ? '#ec4899' : '#db2777',
      light: mode === 'dark' ? '#f472b6' : '#ec4899',
      dark: mode === 'dark' ? '#db2777' : '#be185d',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
    divider: mode === 'dark' ? '#334155' : '#e2e8f0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const theme = createAppTheme(themeMode);
  
  useEffect(() => {
    dispatch(initializeStore());
  }, [dispatch]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
