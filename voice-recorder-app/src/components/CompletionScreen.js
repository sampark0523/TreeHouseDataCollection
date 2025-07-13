import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CompletionScreen = () => {
  // ✅ Get the navigate function from React Router
  const navigate = useNavigate();

  // ✅ Create a handler to navigate to the home page
  const handleStartNewSession = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
        <Typography variant="h4" gutterBottom>
          Session Complete!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          All recordings have been successfully saved. Thank you for your participation.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          // ✅ Attach the handler to the button's onClick event
          onClick={handleStartNewSession}
          sx={{ mt: 2 }}
        >
          Start New Session
        </Button>
      </Paper>
    </Container>
  );
};

export default CompletionScreen;