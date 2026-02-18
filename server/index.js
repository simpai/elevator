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
let defaultElevatorId = null;

// Helper to broadcast state
const broadcastState = () => {
    const states = Array.from(elevators.values()).map(e => e.getState());

    // Auto-set default if empty or only one exists
    if (elevators.size > 0 && (!defaultElevatorId || !elevators.has(defaultElevatorId))) {
        defaultElevatorId = Array.from(elevators.keys())[0];
    }
    if (elevators.size === 0) defaultElevatorId = null;

    io.emit('elevator_update', {
        elevators: states,
        defaultElevatorId
    });
};

// Periodic update loop
setInterval(broadcastState, 500);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial state via explicit update
    broadcastState();

    // Create Elevator
    socket.on('create_elevator', (floors) => {
        const id = Date.now().toString();
        const elevator = new Elevator(id, floors);
        elevators.set(id, elevator);
        if (!defaultElevatorId) defaultElevatorId = id;
        broadcastState();
    });

    // Delete Elevator
    socket.on('delete_elevator', (id) => {
        if (id === defaultElevatorId && elevators.size > 1) {
            // Can't delete default if others exist, or user should change default first
            // But per request: "디폴트 엘리베이터는 삭제할 수 없게"
            return;
        }
        if (elevators.size > 1 || id !== defaultElevatorId) {
            elevators.delete(id);
            broadcastState();
        }
    });

    // Set Default
    socket.on('set_default_elevator', (id) => {
        if (elevators.has(id)) {
            defaultElevatorId = id;
            broadcastState();
        }
    });

    // Request State (Explicit)
    socket.on('request_state', (id) => {
        broadcastState();
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
