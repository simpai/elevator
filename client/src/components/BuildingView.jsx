import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import socket from '../socket';
import './BuildingView.css';

function BuildingView() {
    const { id } = useParams();
    const [elevator, setElevator] = useState(null);
    const lastDoorState = useRef('CLOSED');
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [realId, setRealId] = useState(id === 'default' ? null : id);

    useEffect(() => {
        // Request initial state
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

                    // TTS Logic
                    if (target.doorState !== lastDoorState.current) {
                        if (target.doorState === 'OPENING' && lastDoorState.current !== 'OPENING') {
                            speak('문이 열립니다');
                        } else if (target.doorState === 'CLOSING' && lastDoorState.current !== 'CLOSING') {
                            speak('문이 닫힙니다');
                        }
                        lastDoorState.current = target.doorState;
                    }
                }
            }
        };

        socket.on('elevator_update', handleUpdate);

        return () => {
            socket.off('elevator_update', handleUpdate);
        };
    }, [id]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = 'ko-KR';
            window.speechSynthesis.speak(utter);
        }
    };

    if (!elevator) return <div className="loading">Loading Elevator {id}...</div>;

    // Dynamically calculate floor height to fit all floors on one screen
    const headerHeight = 100; // Reduced to give more space
    const availableHeight = windowHeight - headerHeight - 20;
    const floorHeight = availableHeight / (elevator?.totalFloors || 10);
    const elevatorBottom = ((elevator?.currentFloor || 1) - 1) * floorHeight;
    const labelFontSize = Math.max(6, Math.min(20, floorHeight * 0.6));

    return (
        <div className="building-container">
            <div className="building-header">
                <Link to="/" className="back-link">← Dashboard</Link>
                <h2>Elevator {elevator.id}</h2>
                <div className="quick-links">
                    <Link to={`/internal/${realId}`} target="_blank">Internal Panel ↗</Link>
                    <Link to={`/display/${realId}`} target="_blank">Display ↗</Link>
                    <Link to={`/external/${realId}/1`} target="_blank">Ext. Floor 1 ↗</Link>
                </div>
            </div>

            <div className="shaft-container">
                <div className="floors-layer">
                    {Array.from({ length: elevator.totalFloors }).map((_, i) => {
                        const floorNum = elevator.totalFloors - i;
                        return (
                            <div key={floorNum} className="floor-level" style={{ height: floorHeight }}>
                                <span className="floor-label" style={{ fontSize: labelFontSize, visibility: labelFontSize < 8 ? 'hidden' : 'visible' }}>
                                    {floorNum}F
                                </span>
                                <div className="floor-door-frame" style={{ height: '80%' }}></div>
                            </div>
                        );
                    })}
                </div>

                <div
                    className="elevator-car"
                    style={{
                        height: floorHeight,
                        bottom: elevatorBottom,
                        transition: elevator.direction === 'IDLE' ? 'none' : 'bottom 1s linear'
                    }}
                >
                    <div className={`elevator-door left ${elevator.doorState}`}></div>
                    <div className={`elevator-door right ${elevator.doorState}`}></div>
                    <div className="car-interior">
                        <span className="direction-indicator">
                            {elevator.direction === 'UP' ? '▲' : elevator.direction === 'DOWN' ? '▼' : '-'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="status-debug">
                <p>State: {elevator.doorState}</p>
                <p>Queue: {elementRequestsToString(elevator.requests)}</p>
            </div>
        </div>
    );
}

function elementRequestsToString(requests) {
    if (!requests || requests.length === 0) return "Empty";
    return requests.map(r => `${r.floor}(${r.type})`).join(", ");
}

export default BuildingView;
