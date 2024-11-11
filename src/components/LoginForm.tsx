import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { setError, setUser, authenticateUser, createUser } from '../store/slices/authSlice';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const user = authenticateUser(email, password);
        if (user) {
          dispatch(setUser(user));
        } else {
          throw new Error('Invalid email or password');
        }
      } else {
        const newUser = createUser(email, password);
        dispatch(setUser(newUser));
      }
    } catch (error) {
      dispatch(setError(error instanceof Error ? error.message : 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 8
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%'
        }}
      >
        <Typography component="h1" variant="h5">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setIsLogin(!isLogin)}
            disabled={loading}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
