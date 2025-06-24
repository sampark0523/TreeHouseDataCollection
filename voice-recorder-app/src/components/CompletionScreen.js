import React from 'react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CompletionScreen = ({ onRestart }) => {
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
        </Box>
        <Typography variant="h4" gutterBottom>
          Recording Complete!
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for completing all the recordings. Your voice samples have been saved successfully.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={onRestart}
          sx={{ mt: 2 }}
        >
          Start New Session
        </Button>
      </Paper>
    </Container>
  );
};

export default CompletionScreen;
