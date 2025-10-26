-- Intentionally vulnerable database schema for Aurora DB
-- This file should be executed on your Aurora MySQL database

CREATE DATABASE IF NOT EXISTS `restaurant-db`;
USE `restaurant-db`;

-- Users table - intentionally vulnerable (passwords stored in plaintext)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'employee', 'manager') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests VARCHAR(10) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@labellecuisine.com', 'admin123', 'manager'),
('manager', 'manager@labellecuisine.com', 'manager123', 'manager'),
('employee1', 'employee1@labellecuisine.com', 'employee123', 'employee');

INSERT INTO menu_items (name, description, price, category) VALUES
('French Onion Soup', 'Classic soup with caramelized onions, beef broth, and melted Gruyère cheese', 12.99, 'starters'),
('Escargots de Bourgogne', 'Burgundy snails in garlic-herb butter', 16.99, 'starters'),
('Coq au Vin', 'Braised chicken in red wine with mushrooms and pearl onions', 28.99, 'main-courses'),
('Beef Bourguignon', 'Classic French beef stew with red wine, mushrooms, and pearl onions', 32.99, 'main-courses'),
('Crème Brûlée', 'Classic vanilla custard with caramelized sugar top', 10.99, 'desserts'),
('Chocolate Soufflé', 'Light and airy chocolate dessert served with vanilla ice cream', 12.99, 'desserts'),
('French Red Wine', 'Selection of premium French red wines', 14.99, 'drinks'),
('Champagne', 'Fine French champagne', 18.99, 'drinks');

-- Create an intentionally vulnerable user for testing
INSERT INTO users (username, email, password, role) VALUES
('test', 'test@example.com', 'password', 'user');

