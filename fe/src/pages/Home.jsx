import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <>
            <section className="hero">
                <div className="hero-content">
                    <h1>La Belle Cuisine</h1>
                    <p>Experience the art of fine dining</p>
                    <Link to="/menu" className="btn-primary">View Menu</Link>
                </div>
            </section>

            <section className="about" id="about">
                <div className="container">
                    <h2 className="section-title">About Us</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <p>Welcome to La Belle Cuisine, where passion meets plate. Our chefs use only the finest ingredients to create culinary masterpieces that will delight your senses.</p>
                            <p>Founded in 2025, we have quickly become a staple in the fine dining community, known for our exquisite French-inspired cuisine and impeccable service.</p>
                        </div>
                        <div className="about-image">
                            <img src="https://via.placeholder.com/600x400?text=Restaurant+Interior" alt="Restaurant Interior" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact" id="contact">
                <div className="container">
                    <h2 className="section-title">Contact Us</h2>
                    <div className="contact-content">
                        <div className="contact-info">
                            <div className="contact-item">
                                <i className="fas fa-map-marker-alt"></i>
                                <p>123 Culinary Avenue, Foodie City, FC 12345</p>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-phone"></i>
                                <p>(555) 123-4567</p>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <p>info@labellecuisine.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>La Belle Cuisine</h3>
                            <p>Experience the art of fine dining in an elegant atmosphere.</p>
                        </div>
                        <div className="footer-section">
                            <h3>Quick Links</h3>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/menu">Menu</Link></li>
                                <li><Link to="/orders">Orders</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 La Belle Cuisine. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Home;
