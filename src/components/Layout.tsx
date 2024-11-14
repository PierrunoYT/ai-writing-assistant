import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme } from '../store/slices/themeSlice';
import ChatInterface from './ChatInterface';

const Layout = () => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Writing Assistant
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => dispatch(toggleTheme())} 
            sx={{ 
              '&:hover': {
                bgcolor: (theme) => theme.palette.primary.light,
                color: 'white'
              }
            }}
          >
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          minHeight: 0,
          display: 'flex'
        }}
      >
        <ChatInterface />
      </Box>

      <Box 
        component="footer" 
        sx={{ 
          py: 1,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} AI Writing Assistant
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
