import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function DisplayPanel() {
    const { id } = useParams();
    const [elevator, setElevator] = useState(null);

    useEffect(() => {
        socket.emit('request_state', id);
        const handleUpdate = (data) => {
            const target = data.find(e => e.id === id);
            if (target) setElevator(target);
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
