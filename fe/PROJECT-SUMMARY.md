# Intentional Vulnerable Website - Project Summary

## Overview

This is an intentionally vulnerable restaurant website built for research and educational purposes. The application contains multiple security vulnerabilities including SQL injection, XSS, weak authentication, and more.

## ✅ Completed Requirements

### 1. Route-Based Navigation
- ✅ Replaced hash-based scrolling (#sections) with actual routes
- ✅ Homepage accessible at `/`
- ✅ Register page accessible at `/register` (no visible button, manual URL entry required)

### 2. Registration Route
- ✅ Created `/register` route
- ✅ No visible link or button to access it
- ✅ Users must manually type `/register` in the address bar
- ✅ Registration form with vulnerable endpoints

### 3. Aurora DB Configuration
- ✅ Database connection configured for Aurora MySQL
- ✅ SQL setup file provided (`database-setup.sql`)
- ✅ Environment variables support
- ✅ Intentionally vulnerable SQL queries throughout

## Files Created/Modified

### New Files
- `register.html` - Registration page (hidden, manual access only)
- `database-setup.sql` - Database schema with intentional vulnerabilities
- `README-VULNERABILITIES.md` - Documentation of all vulnerabilities
- `SETUP.md` - Setup instructions
- `PROJECT-SUMMARY.md` - This file
- `assets/js/router.js` - Simple router (simplified for basic routing)

### Modified Files
- `src/server.js` - Added vulnerable endpoints, Aurora DB config
- `assets/js/main.js` - Added intentional vulnerabilities (no sanitization)
- `index.html` - Updated navigation to use routes
- `package.json` - Added dotenv dependency

## Key Vulnerabilities Implemented

1. **SQL Injection** - All queries use string interpolation
2. **XSS** - No output encoding or sanitization
3. **Weak Authentication** - Cookie-based with no security flags
4. **Information Disclosure** - Exposed error messages
5. **Missing Access Control** - Insufficient authorization checks
6. **Plaintext Passwords** - No hashing
7. **No Input Validation** - Client or server-side
8. **Exposed Credentials** - Hardcoded in code

## How to Use

### Quick Start
```bash
# Install dependencies
npm install

# Setup database (update credentials in src/server.js)
mysql -h your-aurora-endpoint -u admin -p < database-setup.sql

# Start server
npm start

# Access the application
# Homepage: http://localhost:3000
# Register: http://localhost:3000/register (type manually)
```

### Default Credentials
- **Admin/Manager**: admin / admin123
- **Manager**: manager / manager123
- **Employee**: employee1 / employee123

## Testing the Vulnerabilities

### SQL Injection Test
Login with: `admin' OR '1'='1` / `anything`

### XSS Test
Inject in any text field: `<script>alert('XSS')</script>`

### Hidden Registration Test
Manually navigate to: `http://localhost:3000/register`

## Project Structure

```
research/
├── src/
│   └── server.js              # Vulnerable Express server
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js             # Vulnerable client-side code
│       └── router.js           # Simple router
├── public/
│   ├── script.js
│   └── styles.css
├── database-setup.sql           # Database schema
├── register.html                # Hidden registration page
├── index.html                   # Homepage
├── package.json
├── README-VULNERABILITIES.md   # Vulnerability documentation
└── SETUP.md                     # Setup instructions
```

## Notes

⚠️ **IMPORTANT**: This website is intentionally vulnerable and should:
- NEVER be deployed to production
- ONLY be used in isolated environments
- ONLY be used for educational purposes
- Be protected by proper network security measures

The vulnerabilities are intentionally left in place for research and educational purposes. Do not fix these vulnerabilities as they are the core feature of this project.

## Next Steps

1. Set up your Aurora MySQL database
2. Update connection credentials in `src/server.js`
3. Run `database-setup.sql` on your database
4. Start the server with `npm start`
5. Test the vulnerabilities using the examples in `README-VULNERABILITIES.md`

## Support

For setup help, refer to `SETUP.md`  
For vulnerability details, refer to `README-VULNERABILITIES.md`

