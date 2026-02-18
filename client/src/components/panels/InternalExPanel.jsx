import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function InternalExPanel() {
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

    const handleFloorClick = (floor) => {
        if (!elevator || floor > elevator.totalFloors) return;
        socket.emit('command_elevator', { id: realId, floor });
    };

    const handleDoor = (action) => {
        console.log(`Door ${action} requested`);
    };

    if (!elevator) return <div className="panel-container">Loading...</div>;

    const renderBraille = (num) => {
        return <div className="braille-dots">::::</div>;
    };

    return (
        <div className="panel-container internal-metal">
            {/* Top LED Display */}
            <div className="led-display small">
                <span className="floor-indicator">{elevator.currentFloor}</span>
                <span className={`direction-arrow ${elevator.direction === 'UP' ? 'active' : ''}`}>▲</span>
                <span className={`direction-arrow ${elevator.direction === 'DOWN' ? 'active' : ''}`}>▼</span>
            </div>

            <div className="brand-section">
                <button className="emergency-btn">🔔</button>
            </div>

            <div className="internal-grid-metal">
                {Array.from({ length: Number(elevator.totalFloors) }).map((_, i) => {
                    const floor = i + 1;
                    const isActive = elevator.requests.some(r => r.floor === floor && r.type === 'internal');
                    const isCurrent = elevator.currentFloor === floor;

                    return (
                        <div key={floor} className="floor-btn-wrapper">
                            <button
                                className={`floor-btn-metal ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                                onClick={() => handleFloorClick(floor)}
                            >
                                <span className="floor-num">{floor}</span>
                                {renderBraille(floor)}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="door-controls-metal">
                <button className="door-btn-metal" onClick={() => handleDoor('OPEN')}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17L12 7" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M4 12L8 7M4 12L8 17" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M20 12L16 7M20 12L16 17" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
                <button className="door-btn-metal" onClick={() => handleDoor('CLOSE')}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17L12 7" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M8 12L5 7M8 12L5 17" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M16 12L19 7M16 12L19 17" stroke="#cc5500" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default InternalExPanel;
