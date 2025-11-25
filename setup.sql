-- Database Setup for Vulnerable Restaurant Application
-- For Aurora MySQL or standard MySQL

CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Insert sample users (passwords stored in plain text - VULNERABILITY)
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'manager'),
('manager1', 'manager', 'manager'),
('employee1', 'employee123', 'employee'),
('employee2', 'pass123', 'employee'),
('testuser', 'test', 'employee');

-- Insert sample menu items
INSERT INTO menu_items (name, description, price) VALUES
('Margherita Pizza', 'Classic tomato and mozzarella pizza', 12.99),
('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99),
('Spaghetti Carbonara', 'Pasta with bacon, eggs, and parmesan', 14.99),
('Grilled Chicken Breast', 'Seasoned chicken with vegetables', 16.99),
('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 6.99),
('Garlic Bread', 'Toasted bread with garlic butter', 4.99),
('Mushroom Risotto', 'Creamy Italian rice with mushrooms', 13.99),
('Fish and Chips', 'Battered cod with french fries', 15.99);

-- Insert sample orders
INSERT INTO orders (user_id, item_id, quantity) VALUES
(3, 1, 2),
(3, 5, 1),
(4, 2, 1),
(4, 3, 1),
(5, 1, 1),
(5, 4, 1);

-- Create indexes for better performance
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_item ON orders(item_id);

-- Display table information
SELECT 'Users Table' as Info;
SELECT * FROM users;

SELECT 'Menu Items Table' as Info;
SELECT * FROM menu_items;

SELECT 'Orders Table' as Info;
SELECT * FROM orders;