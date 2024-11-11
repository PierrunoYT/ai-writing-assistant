import { Box, Container, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AI Writing Assistant
          </Typography>
          <IconButton 
            color="inherit" 
            onClick={() => dispatch(toggleTheme())} 
            sx={{ 
              mr: 1,
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

      <Container component="main" sx={{ flexGrow: 1, py: 2 }}>
        <ChatInterface />
      </Container>

      <Box component="footer" sx={{ py: 1, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} AI Writing Assistant
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
