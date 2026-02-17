const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const Elevator = require('./elevator');

const app = express();
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for prototype
        methods: ["GET", "POST"]
    }
});

const elevators = new Map();

// Helper to broadcast state
const broadcastState = () => {
    const states = Array.from(elevators.values()).map(e => e.getState());
    io.emit('elevator_update', states);
};

// Periodic update loop (optional, if we want to sync frequently regardless of events)
setInterval(broadcastState, 500);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial state
    socket.emit('elevator_update', Array.from(elevators.values()).map(e => e.getState()));

    // Create Elevator
    socket.on('create_elevator', (floors) => {
        const id = Date.now().toString();
        const elevator = new Elevator(id, floors);
        elevators.set(id, elevator);
        broadcastState();
    });

    // Delete Elevator
    socket.on('delete_elevator', (id) => {
        elevators.delete(id);
        broadcastState();
    });

    // Request State (Explicit)
    socket.on('request_state', (id) => {
        // Just broadcast to everyone or send back to sender?
        // For simplicity, broadcast or just emit to sender.
        // Let's emit all elevators state to sender
        socket.emit('elevator_update', Array.from(elevators.values()).map(e => e.getState()));
    });


    // Handle Elevator Call (External)
    socket.on('call_elevator', ({ id, floor, direction }) => {
        const elevator = elevators.get(id);
        if (elevator) {
            elevator.addRequest(floor, 'external', direction);
            broadcastState();
        }
    });

    // Handle Elevator Command (Internal)
    socket.on('command_elevator', ({ id, floor }) => {
        const elevator = elevators.get(id);
        if (elevator) {
            elevator.addRequest(floor, 'internal');
            broadcastState();
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Express 5 requires regex for splat
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
