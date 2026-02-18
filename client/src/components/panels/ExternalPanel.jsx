import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function ExternalPanel() {
    const { id, floor } = useParams();
    const navigate = useNavigate();
    const floorNum = parseInt(floor, 10);
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

    const handleCall = (direction) => {
        if (!realId) return;
        socket.emit('call_elevator', { id: realId, floor: floorNum, direction });
    };

    const navigateToFloor = (newFloor) => {
        if (newFloor < 1 || (elevator && newFloor > elevator.totalFloors)) return;
        navigate(`/external/${id}/${newFloor}`);
    };

    if (!elevator) return <div className="panel-container">Loading...</div>;

    const isUpActive = elevator.requests.some(r => r.floor === floorNum && r.direction === 'UP');
    const isDownActive = elevator.requests.some(r => r.floor === floorNum && r.direction === 'DOWN');

    return (
        <div className="panel-container internal-metal">
            <div className="led-display large">
                <span className="floor-indicator">{elevator.currentFloor}</span>
                <span className={`direction-arrow ${elevator.direction === 'UP' ? 'active' : ''}`}>▲</span>
                <span className={`direction-arrow ${elevator.direction === 'DOWN' ? 'active' : ''}`}>▼</span>
            </div>

            <div className="floor-label-metal">
                {floorNum}F
            </div>

            <div className="external-controls-metal">
                <div className="call-btn-wrapper">
                    <button
                        className={`call-btn-metal ${isUpActive ? 'active' : ''}`}
                        onClick={() => handleCall('UP')}
                    >
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="call-btn-wrapper">
                    <button
                        className={`call-btn-metal ${isDownActive ? 'active' : ''}`}
                        onClick={() => handleCall('DOWN')}
                    >
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 19L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 12L12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <button
                className="nav-floor-btn prev"
                onClick={() => navigateToFloor(floorNum - 1)}
                disabled={floorNum <= 1}
            >
                ◀
            </button>
            <button
                className="nav-floor-btn next"
                onClick={() => navigateToFloor(floorNum + 1)}
                disabled={floorNum >= elevator.totalFloors}
            >
                ▶
            </button>
        </div>
    );
}

export default ExternalPanel;
