const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 30000; // 30 seconds timeout

/**
 * Saves a recording to the server
 * @param {Blob} audioBlob - The audio data to save
 * @param {string} filename - The name to save the file as
 * @returns {Promise<Object>} - The server response
 */
const uploadRecording = async (file, studentId, item, repetition) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  const formData = new FormData();
  const filename = `${studentId}_${repetition}${item}.webm`;
  formData.append('audio', file, filename);

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: {
        // Let the browser set the Content-Type with boundary
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 
        `Failed to upload recording: ${response.status} ${response.statusText}`
      );
    }


    return {
      success: true,
      data: {
        filename: data.data.filename,
        size: data.data.size,
        mimetype: data.data.mimetype,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('Error uploading recording:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please check your internet connection and try again.');
    }
    
    throw new Error(
      error.message || 'An error occurred while uploading the recording. Please try again.'
    );
  }
};

/**
 * Fetches all recordings for a specific student
 * @param {string} studentId - The student's ID
 * @returns {Promise<Array>} Array of recording filenames
 */
const getRecordings = async (studentId) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    // Validate studentId
    if (!studentId || !/^\d+$/.test(studentId)) {
      throw new Error('Invalid student ID format');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/recordings/${studentId}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 
        `Failed to fetch recordings: ${response.status} ${response.statusText}`
      );
    }

    return data.data.recordings || [];
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('Error fetching recordings:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    throw new Error(
      error.message || 'An error occurred while fetching recordings. Please try again.'
    );
  }
};

/**
 * Deletes a recording from the server
 * @param {string} filename - The name of the file to delete
 * @returns {Promise<Object>} The server response
 */
const deleteRecording = async (filename) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/recordings/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 
        `Failed to delete recording: ${response.status} ${response.statusText}`
      );
    }

    return {
      success: true,
      message: data.message || 'Recording deleted successfully',
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    console.error('Error deleting recording:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    throw new Error(
      error.message || 'An error occurred while deleting the recording. Please try again.'
    );
  }
};

/**
 * Checks if the server is online and responding
 * @returns {Promise<boolean>} True if the server is online
 */
const checkServerStatus = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout for health check
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.status === 'Server is running';
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Server health check failed:', error);
    return false;
  }
};

export { uploadRecording, getRecordings, deleteRecording, checkServerStatus };
