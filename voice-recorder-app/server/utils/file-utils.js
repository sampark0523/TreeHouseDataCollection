const fs = require('fs');
const path = require('path');

/**
 * Ensures that the uploads directory exists and has the correct permissions
 * @param {string} dirPath - Path to the uploads directory
 */
const ensureUploadsDir = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created uploads directory at: ${dirPath}`);
      fs.chmodSync(dirPath, 0o755);
      console.log('Set directory permissions to 755');
    } else {
      console.log(`Uploads directory already exists at: ${dirPath}`);
      
      try {
        fs.accessSync(dirPath, fs.constants.R_OK | fs.constants.W_OK);
      } catch (err) {
        console.warn('Uploads directory permissions issue detected. Attempting to fix...');
        fs.chmodSync(dirPath, 0o755);
        console.log('Fixed directory permissions');
      }
    }
    
    console.log('Uploads directory is ready');
    return true;
  } catch (error) {
    console.error('Error setting up uploads directory:', error);
    throw error;
  }
};

/**
 * Validates a filename to prevent directory traversal and other security issues
 * @param {string} filename - The filename to validate
 * @returns {boolean} - True if the filename is valid
 */
const isValidFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  if (filename.includes('../') || filename.includes('..\\')) {
    return false;
  }
  if (filename.includes('\0')) {
    return false;
  }
  
  const invalidChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];
  if (invalidChars.some(char => filename.includes(char))) {
    return false;
  }
  
  if (!filename.toLowerCase().endsWith('.wav')) {
    return false;
  }
  
  // Check for valid student ID and repetition pattern (e.g., 123_1A.wav)
  const pattern = /^[a-zA-Z0-9_]+_[a-zA-Z]+[0-9]+\.wav$/i;
  if (!pattern.test(filename)) {
    return false;
  }
  
  return true;
};

/**
 * Gets the full path to a file in the uploads directory
 * @param {string} filename - The name of the file
 * @param {string} uploadsDir - Path to the uploads directory
 * @returns {string} - The full path to the file
 */
const getFilePath = (filename, uploadsDir) => {
  if (!isValidFilename(filename)) {
    throw new Error('Invalid filename');
  }
  return path.join(uploadsDir, filename);
};

/**
 * Deletes a file from the uploads directory
 * @param {string} filename - The name of the file to delete
 * @param {string} uploadsDir - Path to the uploads directory
 * @returns {Promise<boolean>} - True if the file was deleted, false otherwise
 */
const deleteFile = (filename, uploadsDir) => {
  return new Promise((resolve) => {
    if (!isValidFilename(filename)) {
      console.error('Cannot delete file: Invalid filename', filename);
      return resolve(false);
    }
    
    const filePath = path.join(uploadsDir, filename);
    
    fs.unlink(filePath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`File not found, nothing to delete: ${filename}`);
          return resolve(true);
        }
        console.error(`Error deleting file ${filename}:`, err);
        return resolve(false);
      }
      console.log(`Successfully deleted file: ${filename}`);
      resolve(true);
    });
  });
};

module.exports = {
  ensureUploadsDir,
  isValidFilename,
  getFilePath,
  deleteFile
};
