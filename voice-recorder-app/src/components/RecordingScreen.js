import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import PlayIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListIcon from '@mui/icons-material/List';
import { uploadRecording as saveRecording, getRecordings as getStudentRecordings, deleteRecording, checkServerStatus } from '../services/recordingService';
import Recorder from 'recorder-js';

// Constants
const LETTERS = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const COMMANDS = ['Done', 'Enter', 'Delete', 'Repeat', 'Backspace', 'Again', 'Undo', 'Tutorial', 'Screening'];
const ITEMS = [...LETTERS, ...COMMANDS];
const REPETITIONS = 3;
const RECORDING_TIME_LIMIT = 5000;

// Helper functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const RecordingScreen = ({ studentId, onComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // State management
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const [recordingList, setRecordingList] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [pendingRecording, setPendingRecording] = useState(null);
  const [hasRedonePrevious, setHasRedonePrevious] = useState(false);

  // Refs
  const recorderInstanceRef = useRef(null);
  const audioElementRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const errorShownRef = useRef(false);
  const latestStateRef = useRef();

  // Derived state
  const currentItem = ITEMS[currentItemIndex];
  const isLastItem = currentItemIndex === ITEMS.length - 1;
  const isLastRepetition = currentRepetition === REPETITIONS;

  // This effect initializes the recorder instance once on component mount.
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    recorderInstanceRef.current = new Recorder(audioContext, {});
  }, []);

  const handleCheckServerStatus = useCallback(async () => {
    try {
      const isOnline = await checkServerStatus();
      setServerOnline(isOnline);
      if (!isOnline && !errorShownRef.current) {
        setError('Server is offline. Recordings will be saved locally and synced later.');
        errorShownRef.current = true;
      }
      return isOnline;
    } catch (err) {
      console.error('Error checking server status:', err);
      setServerOnline(false);
      if (!errorShownRef.current) {
        setError('Unable to connect to server.');
        errorShownRef.current = true;
      }
      return false;
    }
  }, []);

  const loadRecordings = useCallback(async () => {
    // This function can be expanded to load recordings from localStorage if needed.
  }, [studentId, handleCheckServerStatus]);

  const saveAndUploadRecording = useCallback(async (recordingToProcess) => {
    if (!recordingToProcess) return;

    const { item, repetition, audio } = recordingToProcess;
    const recordingId = `${item}_${repetition}_${Date.now()}`;
    const audioUrl = URL.createObjectURL(audio);
    const recordingToSave = {
      item,
      repetition,
      audio,
      id: recordingId,
      audioUrl,
      timestamp: new Date().toISOString(),
      isSynced: false
    };

    try {
      const localData = localStorage.getItem(`recordings_${studentId}`) || '[]';
      const updatedList = [...JSON.parse(localData), recordingToSave];
      localStorage.setItem(`recordings_${studentId}`, JSON.stringify(updatedList));
      setRecordingList(updatedList);

      if (serverOnline) {
        try {
          await saveRecording(audio, studentId, item, repetition);
          recordingToSave.isSynced = true;
          
          const freshList = JSON.parse(localStorage.getItem(`recordings_${studentId}`) || '[]');
          const finalUpdatedList = freshList.map(r => r.id === recordingToSave.id ? recordingToSave : r);
          localStorage.setItem(`recordings_${studentId}`, JSON.stringify(finalUpdatedList));
          
          setRecordingList(finalUpdatedList);
        } catch (err) {
          console.error('Failed to sync recording:', err);
          setInfo(`'${item} (${repetition})' saved locally (server sync failed).`);
        }
      } else {
        setInfo(`'${item} (${repetition})' saved locally (offline).`);
      }
    } catch (err) {
      console.error('Error saving recording:', err);
      setError('Failed to save recording.');
    }
  }, [serverOnline, studentId]);

  const stopRecording = useCallback(async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    
    const recorder = recorderInstanceRef.current;
    if (!recorder || !isRecording) return;
    
    setIsProcessing(true);
    setInfo('Processing recording...');

    try {
      const { blob } = await recorder.stop();
      setIsRecording(false);
      
      const { currentItem, currentRepetition, isLastItem, isLastRepetition, handleRecordingComplete } = latestStateRef.current;
      
      const newPendingRecording = { item: currentItem, repetition: currentRepetition, audio: blob };
      setPendingRecording(newPendingRecording);
      setHasRedonePrevious(false);
      
      setRecordingTime(0);

      if (isLastRepetition) {
        if (isLastItem) {
          handleRecordingComplete();
        } else {
          setCurrentItemIndex(prev => prev + 1);
          setCurrentRepetition(1);
        }
      } else {
        setCurrentRepetition(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to process recording.');
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording]);

  const startRecordingProcess = useCallback(async () => {
    setIsProcessing(true);
    setError('');
    
    if (pendingRecording) {
      await saveAndUploadRecording(pendingRecording);
      setPendingRecording(null);
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = recorderInstanceRef.current;
      await recorder.init(stream);
      await recorder.start();

      setIsRecording(true);
      setRecordingTime(0);
      setIsProcessing(false);
      setInfo('Recording in progress...');

      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsed);
        if (elapsed * 1000 >= RECORDING_TIME_LIMIT) {
          stopRecording();
        }
      }, 100);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Failed to start recording.');
      setIsProcessing(false);
    }
  }, [pendingRecording, saveAndUploadRecording, stopRecording]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecordingProcess();
    }
  }, [isRecording, stopRecording, startRecordingProcess]);

  const handleRecordingComplete = useCallback(async () => {
    if (pendingRecording) {
        await saveAndUploadRecording(pendingRecording);
        setPendingRecording(null);
    }
    setRecordingComplete(true);
    if (onComplete) onComplete();
    setInfo('All recordings completed successfully!');
  }, [onComplete, pendingRecording, saveAndUploadRecording]);
  
  const handleRedoPrevious = useCallback(() => {
    if (pendingRecording) {
      setPendingRecording(null);
      setHasRedonePrevious(true);
    }
    
    if (currentRepetition > 1) {
      setCurrentRepetition(prev => prev - 1);
    } else if (currentItemIndex > 0) {
      const prevIndex = currentItemIndex - 1;
      setCurrentItemIndex(prevIndex);
      setCurrentRepetition(REPETITIONS);
    }
  }, [pendingRecording, currentRepetition, currentItemIndex]);

  const handleCloseError = useCallback(() => { setError(''); errorShownRef.current = false; }, []);
  const handleCloseInfo = useCallback(() => { setInfo(''); }, []);
  const playRecording = useCallback((audioUrl) => { /* ... */ }, []);

  // Main setup effect
  useEffect(() => {
    loadRecordings();
    const serverStatusInterval = setInterval(handleCheckServerStatus, 30000);
    return () => {
      clearInterval(serverStatusInterval);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      const recorder = recorderInstanceRef.current;
      if (recorder && isRecording) { 
        recorder.stop();
      }
    };
  }, [loadRecordings, handleCheckServerStatus, isRecording]);

  useEffect(() => {
    latestStateRef.current = {
      currentItem,
      currentRepetition,
      isLastItem,
      isLastRepetition,
      isRecording,
      handleRecordingComplete
    };
  });

  // ✅ CORRECTED PROGRESS BAR LOGIC
  useEffect(() => {
    const itemsCompleted = currentItemIndex;
    // We subtract 1 from currentRepetition because it shows the *next* repetition number.
    // If it shows "Repetition 1", 0 have been done for this item.
    const repetitionsCompleted = currentRepetition - 1;
    
    // If a recording is pending, it means we just finished one, so we add it to the count.
    const pendingAdjustment = pendingRecording ? 1 : 0;

    const completedCount = (itemsCompleted * REPETITIONS) + repetitionsCompleted + pendingAdjustment;
    const totalCount = ITEMS.length * REPETITIONS;
    
    const newPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    setProgressPercentage(newPercentage);
  }, [currentItemIndex, currentRepetition, pendingRecording]);
  
  if (recordingComplete) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
                <Typography variant="h4" gutterBottom>Session Complete!</Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    All recordings have been processed. Thank you!
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => navigate('/')}
                  sx={{ mt: 2 }}
                >
                  Start New Session
                </Button>
            </Paper>
        </Container>
      );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <audio ref={audioElementRef} />
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 6 }}>
        <Alert onClose={handleCloseError} severity="error" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!info} autoHideDuration={4000} onClose={handleCloseInfo} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 6 }}>
        <Alert onClose={handleCloseInfo} severity="info" elevation={6} variant="filled" sx={{ width: '100%' }}>
          {info}
        </Alert>
      </Snackbar>
      
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium' }}>Voice Recording Session</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Student ID: {studentId}</Typography>
        <Divider />
        
        <Box sx={{ textAlign: 'center', my: 4, minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {isProcessing ? (
            <Box>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>Processing...</Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h1" component="div" sx={{ fontSize: { xs: '4rem', sm: '6rem' }, fontWeight: 'bold', color: 'primary.main', fontFamily: 'monospace' }}>
                {currentItem}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Repetition {currentRepetition} of {REPETITIONS}
              </Typography>
              <Box sx={{ mt: 4 }}>
                {isRecording ? (
                  <IconButton onClick={stopRecording} color="error" sx={{ width: 80, height: 80 }}>
                    <MicOffIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                ) : (
                  <IconButton onClick={toggleRecording} color="primary" sx={{ width: 80, height: 80 }}>
                    <MicIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                )}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Click to Record'}
                </Typography>
                 {pendingRecording && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    </Typography>
                )}
              </Box>
            </>
          )}
        </Box>

        <Divider />
        <Box sx={{ mt: 3 }}>
            <Typography variant="body2">Progress: {Math.round(progressPercentage)}%</Typography>
            <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handleRedoPrevious}
          disabled={
            isRecording || 
            isProcessing || 
            hasRedonePrevious ||
            (!pendingRecording && currentItemIndex === 0 && currentRepetition === 1)
          }
          startIcon={<ReplayIcon />}
          size="large"
        >
          Redo Previous
        </Button>
      </Box>
    </Container>
  );
};

export default RecordingScreen;
