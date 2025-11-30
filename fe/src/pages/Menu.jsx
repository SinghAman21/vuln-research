import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, orderAPI } from '../services/api';

const Menu = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMenuItems();
    }, []);

    const loadMenuItems = async () => {
        try {
            const items = await menuAPI.getAll();
            setMenuItems(items);
        } catch (err) {
            console.error('Failed to load menu items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // For now, just filter locally since backend doesn't have search endpoint
        // In production, you'd want to add a search endpoint
        await loadMenuItems();
        if (searchTerm) {
            const filtered = menuItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setMenuItems(filtered);
        }
    };

    const handleOrder = async (itemId) => {
        if (!user) {
            alert('Please login to place an order');
            return;
        }
        try {
            await orderAPI.create(itemId, 1);
            alert('Order placed!');
        } catch (err) {
            alert('Failed to place order');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await menuAPI.delete(itemId);
            await loadMenuItems(); // Refresh the list
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    return (
        <>
            <section className="hero" style={{ height: '40vh', minHeight: '300px' }}>
                <div className="hero-content">
                    <h1>Our Menu</h1>
                    <p>Discover our exquisite dishes</p>
                    {user && user.role === 'manager' && (
                        <Link to="/menu/add" className="btn-primary">Add New Item</Link>
                    )}
                </div>
            </section>

            <section className="menu">
                <div className="container">
                    <p className="warning" style={{ textAlign: 'center', color: 'red', marginBottom: '20px' }}>
                        ⚠️ VULNERABLE APPLICATION - FOR SECURITY TESTING ONLY
                    </p>

                    <div className="search-container" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <form className="search-form" onSubmit={handleSearch} style={{ display: 'inline-flex', gap: '10px', maxWidth: '600px', width: '100%' }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search dishes... (XSS allowed)"
                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                            />
                            <button type="submit" className="btn-primary">Search</button>
                        </form>

                        {/* VULNERABILITY: XSS - Rendering search term dangerously */}
                        {searchTerm && (
                            <div style={{ marginTop: '20px' }}>
                                <p>Results for: <span dangerouslySetInnerHTML={{ __html: searchTerm }}></span></p>
                            </div>
                        )}
                    </div>

                    <div className="menu-items">
                        {menuItems.map(item => (
                            <div key={item.id} className="menu-item">
                                <img
                                    src="/images/menu-placeholder.jpg"
                                    alt={item.name}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Delicious+Food'; }}
                                />
                                <div className="menu-item-content">
                                    <h3 className="menu-item-title">{item.name}</h3>
                                    <p className="menu-item-price">₹{item.price}</p>

                                    {user && (
                                        <div className="admin-controls">
                                            {/* Simplified order flow for this demo */}
                                            <button
                                                className="btn-sm"
                                                style={{ backgroundColor: 'var(--primary-color)', border: 'none', cursor: 'pointer' }}
                                                onClick={() => handleOrder(item.id)}
                                            >
                                                Order Now
                                            </button>

                                            {user.role === 'manager' && (
                                                <>
                                                    <Link to={`/menu/edit/${item.id}`} className="btn-sm btn-edit" style={{ marginLeft: '5px' }}>Edit</Link>
                                                    <button
                                                        className="btn-sm btn-delete"
                                                        style={{ marginLeft: '5px', border: 'none', cursor: 'pointer' }}
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Menu;
