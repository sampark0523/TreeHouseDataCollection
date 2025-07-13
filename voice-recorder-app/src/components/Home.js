import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Fade from '@mui/material/Fade';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import RefreshIcon from '@mui/icons-material/Refresh';
import MicIcon from '@mui/icons-material/Mic';
import SchoolIcon from '@mui/icons-material/School';
import { checkServerStatus } from '../services/recordingService';

const Home = () => {
  const [studentId, setStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const navigate = useNavigate();
  const checkServerStatusWrapper = useCallback(async () => {
    try {
      const isOnline = await checkServerStatus();
      
      setServerStatus(currentStatus => {
        if (currentStatus !== 'checking' && currentStatus !== (isOnline ? 'online' : 'offline')) {
          setSnackbar({
            open: true,
            message: isOnline ? 'Server is now online' : 'Server is currently offline',
            severity: isOnline ? 'success' : 'error'
          });
        }
        return isOnline ? 'online' : 'offline';
      });

      setLastChecked(new Date());
      return isOnline;
    } catch (error) {
      console.error('Error checking server status:', error);
      setServerStatus('offline');
      setLastChecked(new Date());
      return false;
    }
  }, [setLastChecked]);

  useEffect(() => {
    const handleServerCheck = async () => {
      try {
        const isOnline = await checkServerStatus();
        
        setServerStatus(isOnline ? 'online' : 'offline');
        setLastChecked(new Date());
  
      } catch (error) {
        console.error("Failed to check server status:", error);
        setServerStatus('offline');
      }
    };
  
    handleServerCheck();
  
    // Set an interval to check again every 60 seconds to avoid rate-limiting.
    const intervalId = setInterval(handleServerCheck, 60000);
    return () => clearInterval(intervalId);
    
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!studentId.trim()) {
      setError('Please enter a student ID');
      return;
    }
    
    if (!/^\d+$/.test(studentId)) {
      setError('Student ID must contain only numbers');
      return;
    }
    
    setIsLoading(true);
    const isOnline = await checkServerStatusWrapper();
    setIsLoading(false);

    if (!isOnline) {
      setError('Cannot start recording: Server is not available. Please try again later.');
      return;
    }
    
    navigate(`/record/${studentId}`);
  };

  const handleRefreshClick = async () => {
    setIsLoading(true);
    await checkServerStatusWrapper();
    setIsLoading(false);
  };

  const getServerStatusIcon = () => {
    switch (serverStatus) {
      case 'online':
        return <CloudDoneIcon color="success" />;
      case 'offline':
        return <CloudOffIcon color="error" />;
      case 'checking':
        return <CircularProgress size={20} />;
      default:
        return <CloudQueueIcon color="disabled" />;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 4
      }}>
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <SchoolIcon 
                color="primary" 
                sx={{ 
                  fontSize: 60, 
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }} 
              />
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                iVESA Project: TreeHouse Voice Data Collection
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Record your voice samples for the alphabet and command words
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                {getServerStatusIcon()}
                <Typography variant="body2" color="text.secondary">
                    Server Status: {serverStatus}
                </Typography>
                <Tooltip title="Refresh Status">
                    <IconButton onClick={handleRefreshClick} disabled={isLoading}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="studentId"
                label="Student ID"
                name="studentId"
                autoComplete="off"
                autoFocus
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                error={!!error}
                helperText={error}
                disabled={isLoading || serverStatus !== 'online'}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 10
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: 'divider',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                      boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                    },
                  },
                }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  boxShadow: '0 4px 6px rgba(25, 118, 210, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 10px rgba(25, 118, 210, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.2s ease',
                }}
                disabled={isLoading || serverStatus !== 'online'}
                startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <MicIcon />}
              >
                {isLoading ? 'Checking Server...' : 'Start Recording Session'}
              </Button>
            </form>
          </Paper>
        </Fade>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Home;
