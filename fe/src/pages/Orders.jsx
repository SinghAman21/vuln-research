import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fakeData } from '../data/fakeData';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'manager') {
            setOrders(fakeData.orders.getAll());
        } else {
            setOrders(fakeData.orders.getByUser(user.id));
        }
    }, [user, navigate]);

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '50px' }}>
            <header>
                <h1>Your Orders</h1>
                <p className="warning">⚠️ VULNERABLE APPLICATION - FOR SECURITY TESTING ONLY</p>
            </header>

            <main>
                <h2>Your Order History</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Item</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Qty</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Date</th>
                            {user && user.role === 'manager' && (
                                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>User</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{o.id}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{o.item_name}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{o.quantity}</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{new Date(o.created_at).toLocaleString()}</td>
                                {user && user.role === 'manager' && (
                                    <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{o.username}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default Orders;
