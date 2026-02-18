import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import socket from '../socket';

function ElevatorList() {
    const [elevators, setElevators] = useState([]);
    const [defaultId, setDefaultId] = useState(null);
    const [newFloors, setNewFloors] = useState(10);

    useEffect(() => {
        socket.on('elevator_update', (data) => {
            if (data.elevators) {
                setElevators(data.elevators);
                setDefaultId(data.defaultElevatorId);
            } else {
                setElevators(data);
            }
        });

        return () => {
            socket.off('elevator_update');
        };
    }, []);

    const createElevator = () => {
        socket.emit('create_elevator', parseInt(newFloors));
    };

    const deleteElevator = (id) => {
        socket.emit('delete_elevator', id);
    };

    const setDefault = (id) => {
        socket.emit('set_default_elevator', id);
    };

    return (
        <div className="elevator-list-container">
            <h1>Elevator Dashboard</h1>

            <div className="create-section">
                <label>
                    Floors:
                    <input
                        type="number"
                        value={newFloors}
                        onChange={(e) => setNewFloors(e.target.value)}
                        min="2"
                        max="100"
                    />
                </label>
                <button onClick={createElevator}>Create Elevator</button>
            </div>

            <div className="list-view">
                {elevators.map(elevator => (
                    <div key={elevator.id} className={`elevator-card ${elevator.id === defaultId ? 'default-elevator' : ''}`}>
                        <h3>ID: {elevator.id} {elevator.id === defaultId && '⭐'}</h3>
                        <p>Floors: {elevator.totalFloors}</p>
                        <p>Current Floor: {elevator.currentFloor}</p>
                        <p>Status: {elevator.direction} | Gap: {elevator.doorState}</p>
                        <div className="actions">
                            <Link to={`/building/${elevator.id}`}>View Building</Link>
                            <Link to={`/internal/${elevator.id}`}>Internal Panel</Link>
                            <Link to={`/display/${elevator.id}`}>Display</Link>
                            <button
                                onClick={() => setDefault(elevator.id)}
                                className="default-btn"
                                disabled={elevator.id === defaultId}
                            >
                                Set Default
                            </button>
                            <button
                                onClick={() => deleteElevator(elevator.id)}
                                className="delete-btn"
                                disabled={elevator.id === defaultId}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ElevatorList;
