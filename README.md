# rtca

## Overview
This is a real-time chat application with a full-stack architecture, featuring a React/Next.js frontend and a Node.js/Express backend that uses Firebase Firestore for persistent message storage and Socket.IO for instant messaging and user presence tracking.

The application transforms user interactions into real-time chat experiences through a multi-layered pipeline:

1. **Frontend Rendering**: React components with Next.js App Router for modern UI.
2. **Real-time Communication**: Socket.IO WebSocket connections for instant message delivery.
3. **Message Processing**: Server-side validation, sanitization, and persistence.
4. **Data Storage**: Firebase Firestore for message history and user data.
5. **User Management**: Connection tracking and online presence monitoring.
6. **API Integration**: RESTful endpoints for message retrieval and system operations.

## Supported Features

### Real-time Messaging
- **Instant delivery**: WebSocket-based message broadcasting to all connected clients.
- **Message persistence**: Automatic storage to Firebase Firestore with server timestamps.
- **Message history**: Retrieval of recent messages (configurable limit, default 25).
- **Input validation**: Client and server-side message length and content validation.

### User Management
- **Connection tracking**: Real-time user presence with unique socket IDs.
- **Online status**: Live count of connected users displayed in the interface.
- **User events**: Join/leave notifications broadcast to all participants.
- **Session management**: Automatic cleanup on disconnection.

### User Interface
- **Responsive design**: User-friendly layout using Tailwind CSS.
- **Message display**: Chronological message list with timestamps and user identification.
- **System notifications**: Distinct styling for system messages (joins, leaves, errors).
- **Auto-scroll**: Automatic scrolling to latest messages for optimal user experience.

### Security and Validation
- **Input sanitization**: XSS protection through message escaping and control character removal.
- **Length limits**: Enforced message length constraints (1-1000 characters).
- **CORS protection**: Configured cross-origin resource sharing for secure client-server communication.

## Project Structure
The codebase is organized into modular components:
- **client/**: Next.js React frontend with component-based architecture.
- **server/**: Node.js Express backend with Socket.IO integration and Firebase connectivity.
- **client/app/components/**: Reusable UI components (ChatBox, MessageList, MessageInput).
- **server/utils/**: Firebase initialization and configuration utilities.

## Building and Usage

### Prerequisites
- Node.js.
- Firebase project with Firestore enabled and service account credentials for Firebase Admin SDK.
- Service account credentials for Firebase Admin SDK.

### Environment Setup
Create a `.env` file in the server directory:
```
GOOGLE_APPLICATION_CREDENTIALS=path/to/your-firebase-service-account-key.json
FIREBASE_PROJECT_ID=your-firebase-project-id
PORT=8080
```

### Building the Application

#### Frontend
```bash
cd client
npm install
npm run dev
npm run build
npm start
```

#### Backend
```bash
cd server
npm install
npm start
```

### Running the Application
1. Start the backend server: `cd server && npm start`.
2. Start the frontend development server: `cd client && npm run dev`.
3. Open http://localhost:3000 in your browser.

### API Endpoints
- **GET /api/messages**: Retrieve recent messages with optional limit parameter.
- **WebSocket Events**: `chat message`, `user joined`, `user left`, `system`, `error`.

## Development and Extensibility
- **Adding features**: Extend React components in `client/app/components/` and corresponding Socket.IO handlers in `server/index.js`.
- **Database operations**: Implement new Firestore collections and queries in the server utilities.
- **UI enhancements**: Modify Tailwind CSS classes and component structure for styling updates.
- **Real-time features**: Add new Socket.IO event handlers for additional real-time functionality.
- **Testing**: Implement JUnit tests for components and integration tests for Socket.IO events on top of the manual, command-line-based testing currently used.

## References
- [Socket.IO Documentation](https://socket.io).
- [Next.js Documentation](https://nextjs.org/docs).
- [React Reference](https://react.dev/reference/react).
- [Tailwind CSS Documentation](https://tailwindcss.com).
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore).
