import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ElevatorList from './components/ElevatorList';
import BuildingView from './components/BuildingView';
import ExternalPanel from './components/panels/ExternalPanel';
import InternalPanel from './components/panels/InternalPanel';
import DisplayPanel from './components/panels/DisplayPanel';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ElevatorList />} />
          <Route path="/elevator/:id" element={<BuildingView />} />
          <Route path="/elevator/:id/external/:floor" element={<ExternalPanel />} />
          <Route path="/elevator/:id/internal" element={<InternalPanel />} />
          <Route path="/elevator/:id/display" element={<DisplayPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
