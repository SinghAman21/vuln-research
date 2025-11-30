import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';

const AddMenu = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'manager') {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await menuAPI.add({ name, description, price });
            navigate('/menu');
        } catch (err) {
            alert('Failed to add menu item');
        }
    };

    return (
        <>
            <section className="hero" style={{ height: '40vh', minHeight: '300px' }}>
                <div className="hero-content">
                    <h1>Add Menu Item</h1>
                    <p>Expand our culinary offerings</p>
                </div>
            </section>

            <section className="reservations">
                <div className="container">
                    <h2 className="section-title">New Dish Details</h2>
                    <p className="warning" style={{ textAlign: 'center', color: 'red', marginBottom: '20px' }}>
                        ⚠️ VULNERABLE APPLICATION - FOR SECURITY TESTING ONLY
                    </p>

                    <form className="reservation-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Dish Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Truffle Risotto"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Dish description"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price</label>
                            <input
                                type="text"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="e.g., 25.00"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Item</button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default AddMenu;
