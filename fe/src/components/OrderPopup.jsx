import React, { useState, useEffect } from 'react';

const OrderPopup = ({ isOpen, onClose, onConfirm, item }) => {
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen) setQuantity(1);
    }, [isOpen]);

    if (!isOpen || !item) return null;

    const finalAmount = (item.price * quantity).toFixed(2);

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(item.id, quantity);
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '300px', maxWidth: '90%'
            }}>
                <h3>Order {item.name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Quantity</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>
                        Final Amount: ₹{finalAmount}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer'
                        }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{
                            padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>Confirm Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderPopup;
