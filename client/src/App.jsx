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
          <Route path="/building/:id" element={<BuildingView />} />
          <Route path="/external/:id/:floor" element={<ExternalPanel />} />
          <Route path="/internal/:id" element={<InternalPanel />} />
          <Route path="/display/:id" element={<DisplayPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
