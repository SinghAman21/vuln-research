import React, { useState, useEffect } from 'react';

const EditMenuModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name,
                description: item.description || '',
                price: item.price
            });
        }
    }, [item]);

    if (!isOpen || !item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item.id, formData);
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%'
            }}>
                <h3>Edit Menu Item</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Price</label>
                        <input
                            type="text"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            required
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '8px 16px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer'
                        }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{
                            padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'
                        }}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditMenuModal;
