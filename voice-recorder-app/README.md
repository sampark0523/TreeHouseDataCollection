# Student Voice Recording Application

A web application designed for recording and saving voice samples from students. The application guides students through recording each letter of the alphabet (A-Z) and several command words, with each item recorded three times.

## Features

- **Student ID Entry**: Students enter their unique ID to start a recording session
- **Guided Recording**: Step-by-step interface for recording each letter and command
- **Multiple Repetitions**: Each letter/word is recorded three times
- **Progress Tracking**: Visual indicator of progress through the recording session
- **Responsive Design**: Works on desktop and tablet devices
- **Modern UI**: Clean, intuitive interface with Material-UI components

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or yarn
- Modern web browser with microphone access

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd voice-recorder-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

2. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Home Screen**:
   - Enter the student's ID in the input field
   - Click "Start Recording Session" to begin

2. **Recording Screen**:
   - The current letter/word to record is displayed prominently
   - Click the microphone button to start recording (3-second countdown)
   - After recording, you can:
     - Click "Redo" to re-record the current item
     - Click "Next" to proceed to the next repetition or item
   - Progress is shown at the bottom of the screen

3. **Completion**:
   - After recording all items, a completion message is displayed
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

This application is currently set up to run in the browser with simulated file saving. For production use, you'll need to implement a backend service to:

1. Handle file uploads
2. Store recordings securely
3. Manage user sessions
4. Provide authentication if needed

The `recordingService.js` file contains placeholder functions that should be implemented to connect to your backend API.

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

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
