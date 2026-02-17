import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';
import './Panels.css';

function InternalPanel() {
    const { id } = useParams();
    const [elevator, setElevator] = useState(null);

    useEffect(() => {
        socket.emit('request_state', id);
        const handleUpdate = (data) => {
            const target = data.find(e => e.id === id);
            if (target) {
                console.log('Elevator State:', target);
                setElevator(target);
            }
        };
        socket.on('elevator_update', handleUpdate);
        return () => socket.off('elevator_update', handleUpdate);
    }, [id]);

    const handleFloorClick = (floor) => {
        if (floor > elevator.totalFloors) return;
        socket.emit('command_elevator', { id, floor });
    };

    const handleDoor = (action) => {
        console.log(`Door ${action} requested`);
        // Since backend doesn't explicitly support door commands in this prototype, 
        // we visualize the click. In a real app, this would emit a socket event.
    };

    if (!elevator) return <div className="panel-container">Loading...</div>;

    // Generate Braille-like dots (simplified visualization)
    const renderBraille = (num) => {
        // Just a visual representation, not actual braille mapping for simplicity 
        // unless we want to map 1 -> ⠁, 2 -> ⠃ etc.
        // Let's use simple dots pattern
        return <div className="braille-dots">::::</div>;
    };

    return (
        <div className="panel-container internal-metal">
            <div className="panel-screw top-left">+</div>
            <div className="panel-screw top-right">+</div>
            <div className="panel-screw bottom-left">+</div>
            <div className="panel-screw bottom-right">+</div>

            <div className="brand-section">
                <span>비상호출</span>
                <button className="emergency-btn">🔔</button>
            </div>

            <div className="internal-grid-metal">
                {/* Visual grid rendering */}
                {/* Visual grid rendering */}
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
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19L11 5" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" />
                        <path d="M13 19L13 5" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 12L4 12M4 12L6 10M4 12L6 14" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 12L20 12M20 12L18 10M20 12L18 14" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button className="door-btn-metal" onClick={() => handleDoor('CLOSE')}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 19L11 5" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" />
                        <path d="M13 19L13 5" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" />
                        <path d="M4 12L7 12M7 12L5 10M7 12L5 14" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 12L17 12M17 12L19 10M17 12L19 14" stroke="#cc5500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default InternalPanel;
