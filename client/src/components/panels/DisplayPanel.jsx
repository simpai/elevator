import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function DisplayPanel() {
    const { id } = useParams();
    const [elevator, setElevator] = useState(null);

    const [realId, setRealId] = useState(id === 'default' ? null : id);

    useEffect(() => {
        socket.emit('request_state');
        const handleUpdate = (data) => {
            const currentElevators = data.elevators || data;
            const defaultId = data.defaultElevatorId;

            const targetId = id === 'default' ? defaultId : id;
            if (targetId) {
                const target = currentElevators.find(e => e.id === targetId);
                if (target) {
                    setRealId(targetId);
                    setElevator(target);
                }
            }
        };
        socket.on('elevator_update', handleUpdate);
        return () => socket.off('elevator_update', handleUpdate);
    }, [id]);

    if (!elevator) return <div className="panel-container">Loading...</div>;

    return (
        <div className="panel-container display-fullscreen">
            <div className="led-display large-screen">
                <span className="floor-indicator huge">{elevator.currentFloor}</span>
                <div className="arrows-container">
                    <span className={`direction-arrow huge ${elevator.direction === 'UP' ? 'active' : ''}`}>▲</span>
                    <span className={`direction-arrow huge ${elevator.direction === 'DOWN' ? 'active' : ''}`}>▼</span>
                </div>
            </div>
        </div>
    );
}

export default DisplayPanel;
