import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Home from './components/Home';
import RecordingScreen from './components/RecordingScreen';
import CompletionScreen from './components/CompletionScreen';
import { checkServerStatus } from './services/recordingService';

// --- THEME (No changes here) ---
let theme = createTheme({
  palette: {
    primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#fff' },
    secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2', contrastText: '#fff' },
    error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#fff' },
    warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100', contrastText: '#fff' },
    info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#fff' },
    success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#fff' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.6)', disabled: 'rgba(0, 0, 0, 0.38)' },
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '"Helvetica Neue"', 'sans-serif'].join(','),
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 },
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, padding: '8px 22px', boxShadow: 'none', '&:hover': { boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)' } }, contained: { '&:hover': { boxShadow: '0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)' } } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', '&:hover': { boxShadow: '0 6px 24px 0 rgba(0,0,0,0.1)' } } } },
  },
});
theme = responsiveFontSizes(theme);


// --- NEW CONSTANTS FOR RECORDING SEQUENCE ---
const LETTERS = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const COMMANDS = ['Done', 'Enter', 'Delete', 'Repeat', 'Backspace', 'Again', 'Undo', 'Tutorial', 'Screening'];
const ITEMS_TO_RECORD = [...LETTERS, ...COMMANDS];
const TOTAL_RUNS = 3;


// --- ERROR BOUNDARY (No changes here) ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error('Error caught by error boundary:', error, errorInfo); }
  handleReset = () => { this.setState({ hasError: false, error: null }); };
  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" p={3} textAlign="center">
          <Typography variant="h4" color="error" gutterBottom>Something went wrong</Typography>
          <Typography variant="body1" paragraph>{this.state.error?.message || 'An unexpected error occurred'}</Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={this.handleReset} startIcon={<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>}>
              Try Again
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children;
  }
}


// --- MODIFIED WRAPPER COMPONENT ---
// This component now manages the recording sequence state.
const RecordingScreenWrapper = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // State for server status and loading
  const [isValidStudentId, setIsValidStudentId] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATE for controlling the recording sequence ---
  const [currentRun, setCurrentRun] = useState(1);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // --- NEW LOGIC for advancing the sequence ---
  const handleRecordingSaved = () => {
    // Are there more items in the current run?
    if (currentItemIndex < ITEMS_TO_RECORD.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      // It's the end of a run. Are there more runs to go?
      if (currentRun < TOTAL_RUNS) {
        setCurrentRun(prev => prev + 1);
        setCurrentItemIndex(0); // Reset for the next run
      } else {
        // All runs are complete! Navigate to the completion screen.
        navigate('/complete', { replace: true });
      }
    }
  };
  
  // --- NEW LOGIC for redoing a recording ---
  const handleRedo = () => {
    // This logic allows redoing the immediate previous item.
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    } else if (currentRun > 1) {
      // Go to the last item of the previous run
      setCurrentRun(prev => prev - 1);
      setCurrentItemIndex(ITEMS_TO_RECORD.length - 1);
    }
    // If it's the very first item (Run 1, Item 0), it does nothing.
  };

  useEffect(() => {
    if (!studentId || !/^\d+$/.test(studentId)) {
      console.error('Invalid student ID format');
      navigate('/', { replace: true });
      return;
    }
    const checkServer = async () => {
      try {
        const isOnline = await checkServerStatus();
        if (!isOnline) {
          navigate('/', { replace: true, state: { error: 'Server is not available. Please try again later.' } });
          return;
        }
        setIsValidStudentId(true);
      } catch (error) {
        console.error('Error checking server status:', error);
        navigate('/', { replace: true, state: { error: 'Failed to connect to the server. Please try again.' } });
      } finally {
        setIsLoading(false);
      }
    };
    checkServer();
  }, [studentId, navigate]);

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="textSecondary" style={{ marginTop: 20 }}>Loading recording session...</Typography>
      </Box>
    );
  }
  
  // Calculate progress percentage here
  const runsCompleted = currentRun - 1;
  const itemsCompletedInCurrentRun = currentItemIndex;
  const totalItemsCompleted = (runsCompleted * ITEMS_TO_RECORD.length) + itemsCompletedInCurrentRun;
  const totalItemsToRecord = TOTAL_RUNS * ITEMS_TO_RECORD.length;
  const progressPercentage = totalItemsToRecord > 0 ? (totalItemsCompleted / totalItemsToRecord) * 100 : 0;

  // Render RecordingScreen with all the necessary props
  return isValidStudentId ? (
    <RecordingScreen
      studentId={studentId}
      itemToRecord={ITEMS_TO_RECORD[currentItemIndex]}
      currentRun={currentRun}
      totalRuns={TOTAL_RUNS}
      progress={progressPercentage}
      onRecordingSaved={handleRecordingSaved}
      onRedo={handleRedo}
    />
  ) : null;
};


// --- APP COMPONENT (No significant changes here) ---
function App() {
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record/:studentId" element={<ErrorBoundary><RecordingScreenWrapper /></ErrorBoundary>} />
            <Route path="/complete" element={<ErrorBoundary><CompletionScreen /></ErrorBoundary>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }} elevation={6}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;