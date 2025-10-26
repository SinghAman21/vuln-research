# Setting Up Database in AWS Aurora - Step by Step Guide

## Your Aurora Details
- **Host**: `database-1-instance-1.chq66w4ek3xa.ap-south-1.rds.amazonaws.com`
- **Database**: `restaurant-db`
- **User**: `admin`
- **Password**: `admin123456789`

## Method 1: Using AWS RDS Query Editor (Easiest)

### Step 1: Open Query Editor
1. Log into AWS Console
2. Go to **Amazon RDS** service
3. Find your Aurora cluster (it should show as "database-1")
4. Click on your **Writer** instance
5. Click on the **Query Editor** tab (or use the query button)

### Step 2: Connect to Database
1. Click **Connect to database**
2. Choose **Username and password**
3. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin123456789`
   - **Database name**: `restaurant-db`
4. Click **Connect**

### Step 3: Run SQL Commands
Copy and paste the SQL script below into the Query Editor and run it.

---

## Method 2: Using MySQL Command Line

### From your local machine:

```bash
# Connect to Aurora
mysql -h database-1-instance-1.chq66w4ek3xa.ap-south-1.rds.amazonaws.com \
      -u admin -p

# Enter password when prompted: admin123456789

# Then paste and run the SQL commands below
```

---

## SQL Script (Run This)

```sql
-- Create database (if it doesn't exist)
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
```

---

## Verification

After running the SQL, verify the setup:

```sql
-- Check if database exists
SHOW DATABASES;

-- Check if tables are created
USE `restaurant-db`;
SHOW TABLES;

-- Check sample data
SELECT * FROM users;
SELECT * FROM menu_items;
```

You should see:
- 4 users in the `users` table
- 8 menu items in the `menu_items` table

## Security Group Configuration

Make sure your Aurora Security Group allows connections from your IP on port 3306:

1. Go to **RDS** → Your cluster → **Connectivity & security**
2. Click on the Security Group
3. Edit **Inbound rules**
4. Add rule:
   - **Type**: MySQL/Aurora (3306)
   - **Source**: Your IP or `0.0.0.0/0` (for testing only)
   - **Description**: Allow MySQL connections

## Troubleshooting

### Connection refused
- Check Security Group allows your IP
- Verify Aurora is in "Available" state
- Check network connectivity

### Authentication failed
- Verify username and password
- Check if user has proper permissions

### Table already exists
- Run `DROP TABLE IF EXISTS table_name;` before creating
- Or just run the INSERT statements to add data

## Next Steps

After database setup:
1. Update your `src/server.js` (already done ✓)
2. Start the server: `npm start`
3. Test the application: `http://localhost:3000`
4. Test registration: `http://localhost:3000/register`

## Test Credentials

- **Admin/Manager**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`
- **Employee**: `employee1` / `employee123`

