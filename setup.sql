-- Database Setup for Vulnerable Restaurant Application
-- For Aurora MySQL or standard MySQL

CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('manager', 'employee', 'customer') NOT NULL DEFAULT 'customer',
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
('demo', 'password', 'customer'),
('manager1', 'manager', 'manager'),
('employee1', 'employee123', 'employee');

-- Insert sample menu items
INSERT INTO menu_items (name, description, price) VALUES
('Truffle Risotto', 'Creamy arborio rice with black truffle and parmesan', 25.00),
('Lobster Bisque', 'Rich and creamy soup with fresh lobster chunks', 18.00),
('Beef Wellington', 'Tender beef fillet wrapped in puff pastry with mushroom duxelles', 35.00),
('Crème Brûlée', 'Classic French dessert with a caramelized sugar crust', 12.00),
('Coq au Vin', 'Chicken braised with wine, lardons, mushrooms, and garlic', 22.00);

-- Insert sample orders
INSERT INTO orders (user_id, item_id, quantity) VALUES
(2, 1, 2), -- demo user orders Truffle Risotto
(2, 4, 1); -- demo user orders Creme Brulee

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