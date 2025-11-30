import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar" id="navbar">
            <div className="nav-brand">
                <Link to="/">La Belle Cuisine</Link>
            </div>

            <div className="nav-toggle" id="navToggle" onClick={() => setIsOpen(!isOpen)}>
                <i className="fas fa-bars"></i>
            </div>

            <ul className={`nav-links ${isOpen ? 'active' : ''}`} id="navLinks">
                <li><Link to="/">Home</Link></li>
                <li><a href="/#about">About</a></li>
                <li><Link to="/menu">Menu</Link></li>
                <li><a href="/#reservations">Reservations</a></li>
                <li><a href="/#contact">Contact</a></li>

                {!user ? (
                    <li><Link to="/login">Login</Link></li>
                ) : (
                    <>
                        <li><Link to="/orders">Orders</Link></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout ({user.username})</a></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
