import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fakeData } from '../data/fakeData';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // VULNERABILITY: SQL Injection Simulation
        // The fakeData.users.find method contains the logic to simulate bypassing auth
        // if the username contains specific SQL injection strings.
        const user = fakeData.users.find(username, password);

        if (user) {
            login({ id: user.id, username: user.username, role: user.role });
            navigate('/menu');
        } else {
            setError('Invalid credentials (try admin/admin123 or demo/password)');
        }
    };

    return (
        <>
            <section className="hero" style={{ height: '30vh', minHeight: '200px' }}>
                <div className="hero-content">
                    <h1>Login</h1>
                </div>
            </section>

            <section className="login-section" style={{ padding: '2rem 0' }}>
                <div className="container" style={{ maxWidth: '400px', margin: 'auto' }}>
                    {error && (
                        <p className="error" style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
                    </form>
                    <div style={{ marginTop: '20px', fontSize: '0.8rem', color: '#666' }}>
                        <p><strong>Tip for Testing:</strong> Try SQL Injection in the username field:</p>
                        <code>admin' OR '1'='1</code>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Login;
