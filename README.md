# Student Voice Recording Application

A web application for recording and saving student voice samples. This application guides students through recording each letter of the alphabet (A-Z) and several command words, with each item recorded three times.

## Features

- **Student ID Entry**: Students enter their unique ID to start a recording session
- **Guided Recording**: Step-by-step interface for recording each letter and command
- **Multiple Repetitions**: Each letter/word is recorded three times
- **Progress Tracking**: Visual indicator of progress through the recording session
- **Responsive Design**: Works on desktop and tablet devices
- **Modern UI**: Clean, intuitive interface with Material-UI components
- **Server Connection**: Real-time server status indicator
- **Recording Management**: View and manage all recordings

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn
- Modern web browser with microphone access

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd voice-recorder-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Start the development servers

To run both the frontend and backend servers simultaneously:

```bash
npm run dev
```

This will start:
- Frontend development server at: http://localhost:3000
- Backend API server at: http://localhost:3001

Alternatively, you can run them separately:

```bash
# Terminal 1 - Start the backend server
npm run server

# Terminal 2 - Start the frontend development server
npm start
```

## File Structure

```
voice-recorder-app/
├── public/                 # Static files
├── server/                 # Backend server code
│   └── index.js           # Express server implementation
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── services/           # API services
│   ├── App.js              # Main application component
│   └── index.js            # Application entry point
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Frontend port
PORT=3000

# Backend API URL
REACT_APP_API_URL=http://localhost:3001

# Maximum file size for uploads (in bytes)
MAX_FILE_SIZE=10485760  # 10MB
```

## Usage

1. **Home Screen**:
   - Enter the student's ID in the input field
   - The server status indicator will show if the backend is connected
   - Click "Start Recording Session" to begin

2. **Recording Screen**:
   - The current letter/word to record is displayed prominently
   - Click the microphone button to start recording (3-second countdown)
   - After recording, you can:
     - Click "Redo" to re-record the current item
     - Click "Next" to proceed to the next repetition or item
   - Progress is shown at the bottom of the screen
   - Click "View Recordings" to see all recordings for the current session

3. **Completion**:
   - After recording all items, a completion message is displayed
   - Click "View My Recordings" to see all recordings
   - Click "Return to Home" to start a new session

## File Naming Convention

Recordings are saved with the following naming pattern:
```
{studentId}_{repetitionNumber}{letterOrWord}.wav
```

Example: For student ID "90" recording the letter "D" for the second time, the filename would be:
```
90_2D.wav
```

## Deployment

### Building for Production

To create a production build:
```bash
npm run build
# or
yarn build
```

This will create a `build` folder with optimized production files.

### Deployment Options

This app can be deployed to any static hosting service, such as:
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [GitHub Pages](https://pages.github.com/)
- Any static web server

## Backend Integration

The backend is a simple Express.js server that handles file uploads. By default, it saves files to the `uploads/` directory. For production use, you might want to:

1. Add user authentication
2. Store files in cloud storage (e.g., AWS S3, Google Cloud Storage)
3. Implement rate limiting
4. Add request validation
5. Set up proper CORS configuration

## Browser Compatibility

The application uses the Web Audio API and MediaRecorder API, which are supported in most modern browsers:
- Chrome 58+
- Firefox 53+
- Edge 17+
- Safari 14.1+

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please open an issue in the repository or contact the development team.
