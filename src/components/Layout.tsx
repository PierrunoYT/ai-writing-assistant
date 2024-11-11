import { Box, Container, AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearAuth } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import ChatInterface from './ChatInterface';
import LoginForm from './LoginForm';

const Layout = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearAuth());
  };

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
            sx={{ mr: 1 }}
          >
            {themeMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          {user && (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {user ? <ChatInterface /> : <LoginForm />}
      </Container>

      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
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
