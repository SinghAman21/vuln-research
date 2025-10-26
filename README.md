# Vulnerable Restaurant Website

An intentionally vulnerable restaurant website built for security research and educational purposes.

## ⚠️ Security Warning

**DO NOT USE IN PRODUCTION**  
This application contains intentional security vulnerabilities and should only be used in isolated, educational environments.

## Features

- Route-based navigation (no hash URLs)
- Hidden `/register` page (manual URL access only)
- Aurora DB integration setup
- Multiple intentional vulnerabilities:
  - SQL Injection
  - Cross-Site Scripting (XSS)
  - Weak Authentication
  - Information Disclosure
  - Missing Access Controls
  - Plaintext Password Storage

## Quick Start

```bash
# Install dependencies
npm install

# Configure database in src/server.js
# Then run database setup
mysql -h your-aurora-endpoint -u admin -p < database-setup.sql

# Start the server
npm start

# Access the application
# Homepage: http://localhost:3000
# Register: http://localhost:3000/register
```

## Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [README-VULNERABILITIES.md](README-VULNERABILITIES.md) - Complete vulnerability documentation
- [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md) - Project overview and structure

## Default Credentials

After running `database-setup.sql`:

- **Admin**: `admin` / `admin123`
- **Manager**: `manager` / `manager123`  
- **Employee**: `employee1` / `employee123`

## Important Notes

- The `/register` route has no visible link—users must type it manually
- All queries are intentionally vulnerable to SQL injection
- No input validation or sanitization anywhere
- Error messages expose database structure
- Passwords stored in plaintext

## Testing Vulnerabilities

See `README-VULNERABILITIES.md` for detailed testing instructions.

## License

This project is for educational and research purposes only.

# vuln-research
# vuln-research
