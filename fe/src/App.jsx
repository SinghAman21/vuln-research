import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import AddMenu from './pages/AddMenu';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/menu/add" element={<AddMenu />} />
          {/* Add edit route if needed, for now reusing AddMenu or creating EditMenu */}
          <Route path="/menu/edit/:id" element={<div className="container" style={{ paddingTop: '100px' }}>Edit feature not fully implemented in this demo, but vulnerability exists in Add/Delete.</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
