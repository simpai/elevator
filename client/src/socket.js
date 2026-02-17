import io from 'socket.io-client';

// Connect to the backend server
// In production (same origin), use relative path or window.location.origin
// In development, use localhost:3001
const URL = import.meta.env.PROD ? undefined : 'http://localhost:3001';
const socket = io(URL);

export default socket;
