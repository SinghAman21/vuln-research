-- ============================================================================
-- Database Setup for Vulnerable Restaurant Application
-- Compatible with AWS RDS Aurora MySQL and standard MySQL 5.7+
-- ============================================================================
-- WARNING: This database contains intentional security vulnerabilities
-- for educational and testing purposes only. DO NOT use in production!
-- ============================================================================

CREATE DATABASE IF NOT EXISTS restaurant_db;
USE restaurant_db;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- VULNERABILITY: Passwords stored in plaintext (no hashing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL COMMENT 'VULNERABILITY: Stored in plaintext',
  role ENUM('manager', 'employee', 'customer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- MENU ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'Main Course',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_available (available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'preparing', 'completed', 'cancelled') DEFAULT 'pending',
  total_price DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
  INDEX idx_user_orders (user_id),
  INDEX idx_item_orders (item_id),
  INDEX idx_order_time (order_time),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA - USERS
-- ============================================================================
-- VULNERABILITY: All passwords are stored in plaintext
-- ============================================================================
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'manager'),
('demo', 'password', 'customer'),
('manager1', 'manager', 'manager'),
('employee1', 'employee123', 'employee'),
('john_doe', 'john123', 'customer'),
('jane_smith', 'jane456', 'customer'),
('bob_wilson', 'bob789', 'customer'),
('alice_brown', 'alice321', 'employee'),
('charlie_davis', 'charlie654', 'customer'),
('emma_johnson', 'emma987', 'customer');

-- ============================================================================
-- SAMPLE DATA - MENU ITEMS
-- ============================================================================
INSERT INTO menu_items (name, description, price, category, available) VALUES
-- Appetizers
('Truffle Risotto', 'Creamy arborio rice with black truffle and parmesan', 25.00, 'Appetizer', TRUE),
('Lobster Bisque', 'Rich and creamy soup with fresh lobster chunks', 18.00, 'Appetizer', TRUE),
('Caesar Salad', 'Crisp romaine lettuce with house-made Caesar dressing', 12.00, 'Appetizer', TRUE),
('Bruschetta', 'Toasted bread topped with fresh tomatoes, basil, and olive oil', 10.00, 'Appetizer', TRUE),

-- Main Courses
('Beef Wellington', 'Tender beef fillet wrapped in puff pastry with mushroom duxelles', 35.00, 'Main Course', TRUE),
('Coq au Vin', 'Chicken braised with wine, lardons, mushrooms, and garlic', 22.00, 'Main Course', TRUE),
('Grilled Salmon', 'Fresh Atlantic salmon with lemon butter sauce', 28.00, 'Main Course', TRUE),
('Filet Mignon', 'Premium beef tenderloin with red wine reduction', 42.00, 'Main Course', TRUE),
('Vegetarian Pasta', 'Penne with seasonal vegetables in marinara sauce', 18.00, 'Main Course', TRUE),
('Lamb Chops', 'Herb-crusted lamb chops with mint sauce', 38.00, 'Main Course', TRUE),

-- Desserts
('Crème Brûlée', 'Classic French dessert with a caramelized sugar crust', 12.00, 'Dessert', TRUE),
('Chocolate Lava Cake', 'Warm chocolate cake with molten center', 14.00, 'Dessert', TRUE),
('Tiramisu', 'Italian coffee-flavored dessert', 13.00, 'Dessert', TRUE),
('Cheesecake', 'New York style cheesecake with berry compote', 11.00, 'Dessert', TRUE),

-- Beverages
('House Wine', 'Selection of red or white wine', 8.00, 'Beverage', TRUE),
('Craft Beer', 'Local craft beer selection', 6.00, 'Beverage', TRUE),
('Espresso', 'Double shot espresso', 4.00, 'Beverage', TRUE);

-- ============================================================================
-- SAMPLE DATA - ORDERS
-- ============================================================================
INSERT INTO orders (user_id, item_id, quantity, status, total_price) VALUES
-- Demo user orders
(2, 1, 2, 'completed', 50.00),  -- demo orders Truffle Risotto x2
(2, 11, 1, 'completed', 12.00), -- demo orders Crème Brûlée
(2, 5, 1, 'pending', 35.00),    -- demo orders Beef Wellington

-- John Doe orders
(5, 7, 1, 'completed', 28.00),  -- john_doe orders Grilled Salmon
(5, 3, 1, 'completed', 12.00),  -- john_doe orders Caesar Salad
(5, 12, 1, 'pending', 14.00),   -- john_doe orders Chocolate Lava Cake

-- Jane Smith orders
(6, 8, 2, 'completed', 84.00),  -- jane_smith orders Filet Mignon x2
(6, 2, 1, 'completed', 18.00),  -- jane_smith orders Lobster Bisque

-- Bob Wilson orders
(7, 6, 1, 'preparing', 22.00),  -- bob_wilson orders Coq au Vin
(7, 15, 2, 'preparing', 16.00), -- bob_wilson orders House Wine x2

-- Charlie Davis orders
(9, 9, 1, 'completed', 18.00),  -- charlie_davis orders Vegetarian Pasta
(9, 13, 1, 'completed', 13.00), -- charlie_davis orders Tiramisu

-- Emma Johnson orders
(10, 10, 1, 'pending', 38.00),  -- emma_johnson orders Lamb Chops
(10, 4, 1, 'pending', 10.00),   -- emma_johnson orders Bruschetta
(10, 14, 1, 'pending', 11.00);  -- emma_johnson orders Cheesecake

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
SELECT '=== USERS TABLE ===' as Info;
SELECT id, username, role, created_at FROM users ORDER BY id;

SELECT '=== MENU ITEMS TABLE ===' as Info;
SELECT id, name, category, price, available FROM menu_items ORDER BY category, id;

SELECT '=== ORDERS TABLE ===' as Info;
SELECT 
    o.id,
    u.username,
    m.name as item_name,
    o.quantity,
    o.status,
    o.total_price,
    o.order_time
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN menu_items m ON o.item_id = m.id
ORDER BY o.order_time DESC;

SELECT '=== DATABASE STATISTICS ===' as Info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM menu_items) as total_menu_items,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT SUM(total_price) FROM orders WHERE status = 'completed') as total_revenue;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================