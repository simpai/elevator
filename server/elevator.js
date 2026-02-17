class Elevator {
    constructor(id, totalFloors) {
        this.id = id;
        this.totalFloors = totalFloors;
        this.currentFloor = 1;
        this.direction = 'IDLE'; // 'UP', 'DOWN', 'IDLE'
        this.doorState = 'CLOSED'; // 'OPEN', 'CLOSED', 'OPENING', 'CLOSING'
        this.requests = []; // Array of { floor: number, type: 'internal' | 'external', direction: 'UP' | 'DOWN' | null }
        this.isMoving = false;

        // Constants
        this.FLOOR_TRAVEL_TIME = 1000; // ms per floor
        this.DOOR_OPERATION_TIME = 2000; // ms to open/close
        this.DOOR_OPEN_TIME = 3000; // ms to stay open
    }

    // Add a request to the queue
    addRequest(floor, type, direction = null) {
        // Prevent duplicate requests
        const existing = this.requests.find(r => r.floor === floor && r.type === type && r.direction === direction);
        if (!existing) {
            this.requests.push({ floor, type, direction });
            this.sortRequests();
            this.processNextStep();
        }
    }

    // Sort requests based on current direction and SCAN/C-LOOK logic
    sortRequests() {
        if (this.requests.length === 0) return;

        const current = this.currentFloor;
        const upRequests = this.requests.filter(r => r.floor >= current).sort((a, b) => a.floor - b.floor);
        const downRequests = this.requests.filter(r => r.floor < current).sort((a, b) => b.floor - a.floor);

        if (this.direction === 'UP' || this.direction === 'IDLE') {
            this.requests = [...upRequests, ...downRequests];
        } else {
            this.requests = [...downRequests, ...upRequests];
        }
    }

    // Main loop logic (simplified for prototype)
    processNextStep() {
        if (this.isMoving || this.doorState !== 'CLOSED') return;
        if (this.requests.length === 0) {
            this.direction = 'IDLE';
            return;
        }

        const nextRequest = this.requests[0];

        if (nextRequest.floor === this.currentFloor) {
            this.openDoor();
        } else {
            this.startMoving(nextRequest.floor);
        }
    }

    startMoving(targetFloor) {
        this.isMoving = true;
        this.direction = targetFloor > this.currentFloor ? 'UP' : 'DOWN';

        // Simulate movement
        setTimeout(() => {
            this.currentFloor += (this.direction === 'UP' ? 1 : -1);
            this.isMoving = false;
            this.processNextStep(); // Recursively checking after moving one floor
        }, this.FLOOR_TRAVEL_TIME);
    }

    openDoor() {
        this.doorState = 'OPENING';
        setTimeout(() => {
            this.doorState = 'OPEN';
            // Remove handled requests at this floor
            this.requests = this.requests.filter(r => r.floor !== this.currentFloor);

            setTimeout(() => {
                this.closeDoor();
            }, this.DOOR_OPEN_TIME);
        }, this.DOOR_OPERATION_TIME);
    }

    closeDoor() {
        this.doorState = 'CLOSING';
        setTimeout(() => {
            this.doorState = 'CLOSED';
            this.processNextStep();
        }, this.DOOR_OPERATION_TIME);
    }

    getState() {
        return {
            id: this.id,
            totalFloors: this.totalFloors,
            currentFloor: this.currentFloor,
            direction: this.direction,
            doorState: this.doorState,
            requests: this.requests
        };
    }
}

module.exports = Elevator;
