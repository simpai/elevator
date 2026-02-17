import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function ExternalPanel() {
    const { id, floor } = useParams();
    const floorNum = parseInt(floor, 10);
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

    const handleCall = (direction) => {
        socket.emit('call_elevator', { id, floor: floorNum, direction });
    };

    if (!elevator) return <div className="panel-container">Loading...</div>;

    const isUpActive = elevator.requests.some(r => r.floor === floorNum && r.direction === 'UP');
    const isDownActive = elevator.requests.some(r => r.floor === floorNum && r.direction === 'DOWN');

    return (
        <div className="panel-container internal-metal">
            <div className="panel-screw top-left">+</div>
            <div className="panel-screw top-right">+</div>
            <div className="panel-screw bottom-left">+</div>
            <div className="panel-screw bottom-right">+</div>

            <div className="led-display">
                <span className="floor-indicator">{elevator.currentFloor}</span>
                <span className={`direction-arrow ${elevator.direction === 'UP' ? 'active' : ''}`}>▲</span>
                <span className={`direction-arrow ${elevator.direction === 'DOWN' ? 'active' : ''}`}>▼</span>
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

            <div className="floor-label-metal">
                {floorNum}F
            </div>
        </div>
    );
}

export default ExternalPanel;
