# Intentionally Vulnerable Restaurant Website

This website has been intentionally built with multiple vulnerabilities for research and educational purposes. **DO NOT USE IN PRODUCTION.**

## Vulnerabilities Implemented

### 1. SQL Injection Vulnerabilities
- **Location**: All API endpoints in `src/server.js`
- **Issue**: Direct string interpolation in SQL queries without parameterization
- **Example**: `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
- **Impact**: Attackers can execute arbitrary SQL queries, potentially accessing or modifying data

### 2. Cross-Site Scripting (XSS)
- **Location**: User input display throughout the application
- **Issue**: No output encoding or sanitization
- **Impact**: Malicious scripts can be injected and executed in users' browsers

### 3. Authentication Bypass
- **Location**: Cookie-based authentication in server.js
- **Issue**: User credentials stored in cookies without proper security (httpOnly: false)
- **Impact**: User data accessible via JavaScript, vulnerable to XSS theft

### 4. No Input Validation
- **Location**: All input fields in forms
- **Issue**: No client or server-side validation
- **Impact**: Invalid or malicious data can be submitted and processed

### 5. Exposed Error Messages
- **Location**: All database query error handlers
- **Issue**: Internal error messages exposed to users
- **Impact**: Reveals database structure and implementation details

### 6. Plaintext Password Storage
- **Location**: database-setup.sql
- **Issue**: Passwords stored in plaintext
- **Impact**: If database is compromised, all passwords are exposed

### 7. Missing Access Controls
- **Location**: Menu management endpoints
- **Issue**: Insufficient authorization checks
- **Impact**: Unauthorized users may access or modify data

## How to Set Up

### Prerequisites
- Node.js installed
- Aurora MySQL database instance

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Aurora DB Connection**
   - Update `src/server.js` with your Aurora endpoint
   - Or set environment variables:
     ```bash
     export DB_HOST=your-aurora-cluster.cluster-xxxxx.region.rds.amazonaws.com
     export DB_USER=admin
     export DB_PASSWORD=your-password
     export DB_NAME=restaurant_db
     ```

3. **Setup Database**
   - Connect to your Aurora MySQL instance
   - Run `database-setup.sql` to create tables and sample data:
     ```bash
     mysql -h your-aurora-endpoint -u admin -p < database-setup.sql
     ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Access the Application**
   - Homepage: http://localhost:3000
   - Register page: http://localhost:3000/register

## Testing Vulnerabilities

### SQL Injection Testing
Try these payloads in the login form:
```
Username: admin' OR '1'='1
Password: anything
```

### XSS Testing
Try this in any text input field:
```html
<script>alert('XSS')</script>
```

### Registration Testing
Access the register page manually by typing:
```
http://localhost:3000/register
```

## Security Notes

⚠️ **WARNING**: This application is intentionally vulnerable and should:
- NEVER be deployed to production
- ONLY be used in isolated environments
- ONLY be used for educational purposes
- Be protected by proper network security

## Legal Notice

This software is provided for educational and research purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations regarding security testing and vulnerability disclosure.

