# Setup Guide for Vulnerable Restaurant Website

This is an intentionally vulnerable website built for research and educational purposes.

## Prerequisites

- Node.js (v14 or higher)
- Aurora MySQL database instance
- MySQL client (for running SQL scripts)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd /path/to/research
npm install
```

### 2. Set Up Aurora DB

#### Option A: Using AWS Aurora
1. Create an Aurora MySQL cluster in AWS
2. Note your cluster endpoint
3. Create a database user with appropriate permissions
4. Update the connection details in `src/server.js` or use environment variables

#### Option B: Using Local MySQL (for testing)
1. Install MySQL locally
2. Update connection string in `src/server.js`:
   ```javascript
   const db = mysql.createConnection({
       host: 'localhost',
       user: 'root',
       password: 'your-password',
       database: 'restaurant_db'
   });
   ```

### 3. Create Database Tables

Run the SQL script to create all necessary tables:

```bash
mysql -h your-aurora-endpoint -u admin -p restaurant_db < database-setup.sql
```

Or if using local MySQL:
```bash
mysql -u root -p < database-setup.sql
```

### 4. Configure Server (Optional)

Create a `.env` file in the root directory:

```env
DB_HOST=your-aurora-cluster.cluster-xxxxx.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=restaurant_db
PORT=3000
```

Or modify the credentials directly in `src/server.js`.

### 5. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 6. Access the Application

- **Homepage**: http://localhost:3000
- **Register Page**: http://localhost:3000/register
- **API Endpoints**: http://localhost:3000/api/*

## Routes

- `/` - Homepage
- `/register` - Registration page (no direct link, type manually)

## Default Credentials

After running `database-setup.sql`, you can use these credentials:

- **Admin/M instead of Manager**: 
  - Username: `admin`
  - Password: `admin123`
  
- **Manager**:
  - Username: `manager`
  - Password: `manager123`

- **Employee**:
  - Username: `employee1`
  - Password: `employee123`

## Testing Vulnerabilities

See `README-VULNERABILITIES.md` for detailed vulnerability information and testing examples.

## Features Implemented

✅ Routing system (no hash-based navigation)
✅ `/register` route (hidden, must type manually)
✅ Aurora DB setup configuration
✅ Intentional vulnerabilities:
   - SQL injection in all database queries
   - No input sanitization
   - Exposed credentials
   - Weak authentication
   - Missing access controls
   - XSS vulnerabilities

## Troubleshooting

### Database Connection Error
- Verify your Aurora endpoint is correct
- Check security group rules (allow inbound on port 3306)
- Verify username and password

### Port Already in Use
- Change PORT in `.env` or `src/server.js`
- Or kill the process using port 3000

### SQL Script Errors
- Ensure the database exists before running the script
- Verify you have proper permissions
- Check MySQL version compatibility (requires MySQL 5.7+)

## Security Warning

⚠️ **This application is intentionally vulnerable and should NEVER be used in production or exposed to the public internet without proper network isolation.**

