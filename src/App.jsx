import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Store } from 'lucide-react';
import Home from './pages/Home';
import './index.css';

function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-brand">
          <Store color="var(--primary)" size={28} />
          <span>Depot 59</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Pesan Menu
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main className="main-content" style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        <footer style={{ backgroundColor: 'var(--card-bg)', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div className="container">
            <p style={{ color: 'var(--text-light)' }}>&copy; {new Date().getFullYear()} Depot 59 (100% Halal No Pork Chinese Food).</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
