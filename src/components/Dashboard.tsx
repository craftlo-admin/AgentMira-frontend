import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Properties from './Properties';
import CompareProperties from './CompareProperties';
import SearchProperties from './SearchProperties';
import Prediction from './Prediction';
import Recommendation from './Recommendation';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <ul className="sidebar-menu">
          <li className={location.pathname === '/' || location.pathname === '/properties' ? 'active' : ''}>
            <Link to="/properties">Properties</Link>
          </li>
          <li className={location.pathname === '/compare' ? 'active' : ''}>
            <Link to="/compare">Compare Properties</Link>
          </li>
          <li className={location.pathname === '/search' ? 'active' : ''}>
            <Link to="/search">Search Properties</Link>
          </li>
          <li className={location.pathname === '/prediction' ? 'active' : ''}>
            <Link to="/prediction">Prediction</Link>
          </li>
          <li className={location.pathname === '/recommendation' ? 'active' : ''}>
            <Link to="/recommendation">Recommendation</Link>
          </li>
        </ul>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Properties />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/compare" element={<CompareProperties />} />
          <Route path="/search" element={<SearchProperties />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/recommendation" element={<Recommendation />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;