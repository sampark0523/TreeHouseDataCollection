import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ReplayIcon from '@mui/icons-material/Replay';
import { uploadRecording as saveRecording } from '../services/recordingService';
import Recorder from 'recorder-js';

// Constants
const RECORDING_TIME_LIMIT = 5000; // 5 seconds

const RecordingScreen = ({ studentId, itemToRecord, currentRun, totalRuns, progress, onRecordingSaved, onRedo }) => {
  // State for this component is now just about the recording process itself
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  
  // ✅ NEW: State to hold the microphone stream
  const [audioStream, setAudioStream] = useState(null);

  // Refs
  const recorderInstanceRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // This effect initializes the recorder instance once on component mount.
  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    recorderInstanceRef.current = new Recorder(audioContext, {});
  }, []);

  // ✅ MODIFIED: Function to release the microphone
  const stopMicrophone = useCallback(() => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
  }, [audioStream]);

  const stopRecording = useCallback(async () => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    
    const recorder = recorderInstanceRef.current;
    if (!recorder || !isRecording) return;
    
    setIsProcessing(true);
    setInfo('Processing recording...');

    try {
      const { blob } = await recorder.stop();
      setIsRecording(false);
      
      // Stop the microphone stream AFTER the blob is created
      stopMicrophone();
      
      // Save the recording
      await saveRecording(blob, studentId, itemToRecord, currentRun);
      setInfo(`'${itemToRecord}' (Run ${currentRun}) saved.`);

      // After saving, call the handler from the parent to move to the next item
      onRecordingSaved();

    } catch (err) {
      console.error('Error stopping/saving recording:', err);
      setError('Failed to process or save recording.');
      // Make sure to stop the mic even if saving fails
      stopMicrophone();
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording, studentId, itemToRecord, currentRun, onRecordingSaved, stopMicrophone]);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    
    // Stop any previous stream before starting a new one
    stopMicrophone();

    setIsProcessing(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // ✅ Store the stream in state to keep it alive
      setAudioStream(stream);

      const recorder = recorderInstanceRef.current;
      await recorder.init(stream);
      await recorder.start();

      setIsRecording(true);
      setIsProcessing(false);
      setInfo('Recording in progress...');

      // Auto-stop after time limit
      recordingTimerRef.current = setTimeout(stopRecording, RECORDING_TIME_LIMIT);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Microphone access denied or failed to start.');
      setIsProcessing(false);
      stopMicrophone();
    }
  }, [isRecording, stopRecording, stopMicrophone]);

  const handleRedoClick = () => {
    onRedo();
  };

  const handleCloseError = useCallback(() => { setError(''); }, []);
  const handleCloseInfo = useCallback(() => { setInfo(''); }, []);

  // Main cleanup effect when the component unmounts
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      stopMicrophone(); // Ensure microphone is released on exit
    };
  }, [stopMicrophone]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 6 }}>
        <Alert onClose={handleCloseError} severity="error" elevation={6} variant="filled" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!info} autoHideDuration={4000} onClose={handleCloseInfo} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ mt: 6 }}>
        <Alert onClose={handleCloseInfo} severity="info" elevation={6} variant="filled" sx={{ width: '100%' }}>{info}</Alert>
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
                {itemToRecord}
              </Typography>
              <Typography variant="h6" color="textSecondary">
                Run {currentRun} of {totalRuns}
              </Typography>
              <Box sx={{ mt: 4 }}>
                <IconButton 
                  onClick={isRecording ? stopRecording : startRecording} 
                  color={isRecording ? "error" : "primary"}
                  disabled={isProcessing}
                  sx={{ width: 80, height: 80, border: '2px solid' }}
                >
                  {isRecording ? <MicOffIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
                </IconButton>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {isRecording ? `Recording...` : 'Click Mic to Record'}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Divider />
        <Box sx={{ mt: 3 }}>
            <Typography variant="body2">Overall Progress: {Math.round(progress)}%</Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, mt: 1 }} />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={handleRedoClick}
          disabled={isRecording || isProcessing || (currentRun === 1 && itemToRecord === 'A')}
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