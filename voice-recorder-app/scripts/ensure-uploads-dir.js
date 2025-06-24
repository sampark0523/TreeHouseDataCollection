const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at: ${uploadsDir}`);
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Set directory permissions to 755');
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    process.exit(1);
  }
} else {
  console.log(`Uploads directory already exists at: ${uploadsDir}`);
}

console.log('Uploads directory is ready');
