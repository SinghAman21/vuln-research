# How to Host the Vulnerable Restaurant Website on AWS (Budget-Friendly)

## ⚠️ Important Security Notice
This application is **DELIBERATELY VULNERABLE** and designed for security testing and educational purposes only. Do NOT expose it to the public internet without proper isolation and security measures.

---

## Overview
This guide will help you deploy the application on AWS using the most cost-effective approach. We'll use:
- **EC2 Free Tier** (t2.micro or t3.micro)
- **RDS Free Tier** (MySQL) - Optional, you can use the fake DB mode
- **Elastic IP** (Free when attached to running instance)

**Estimated Monthly Cost**: $0-$5 (if staying within free tier limits)

---

## Prerequisites
1. AWS Account (Free Tier eligible)
2. Basic knowledge of SSH and Linux commands
3. Your application code (this repository)

---

## Step 1: Set Up EC2 Instance

### 1.1 Launch EC2 Instance
1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instance**
4. Configure as follows:
   - **Name**: `vulnerable-restaurant-app`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance Type**: `t2.micro` (Free tier eligible)
   - **Key Pair**: Create new or use existing (download .pem file)
   - **Network Settings**:
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere (0.0.0.0/0)
     - Allow Custom TCP (port 3000) from anywhere (0.0.0.0/0)
   - **Storage**: 8 GB gp3 (Free tier eligible)
5. Click **Launch Instance**

### 1.2 Allocate Elastic IP (Optional but Recommended)
1. Go to **EC2 > Elastic IPs**
2. Click **Allocate Elastic IP address**
3. Click **Allocate**
4. Select the new IP > **Actions** > **Associate Elastic IP address**
5. Select your instance and associate

---

## Step 2: Connect to Your EC2 Instance

### 2.1 Using SSH (Windows)
```bash
# If using Git Bash or WSL
ssh -i "path/to/your-key.pem" ubuntu@<your-ec2-public-ip>

# If using PuTTY, convert .pem to .ppk first using PuTTYgen
```

### 2.2 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

---

## Step 3: Install Node.js and Dependencies

### 3.1 Install Node.js (v18 LTS)
```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 3.2 Install Git
```bash
sudo apt install -y git
```

---

## Step 4: Deploy Your Application

### 4.1 Clone Your Repository
```bash
cd /home/ubuntu
git clone <your-repository-url>
cd research
```

### 4.2 Install Application Dependencies
```bash
npm install
```

### 4.3 Configure Environment (if using real database)
```bash
# Create .env file
nano .env
```

Add the following (adjust as needed):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=restaurant_db
NODE_ENV=production
PORT=3000
```

---

## Step 5: Set Up MySQL Database (Optional - Skip if using Fake DB)

### 5.1 Option A: Install MySQL Locally (Free)
```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Log in to MySQL
sudo mysql

# Create database and user
CREATE DATABASE restaurant_db;
CREATE USER 'restaurant_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import your schema (if you have one)
mysql -u restaurant_user -p restaurant_db < schema.sql
```

### 5.2 Option B: Use RDS Free Tier (More Complex)
1. Go to **RDS Dashboard**
2. Click **Create Database**
3. Choose **MySQL** (Free tier eligible)
4. Select **Free tier** template
5. Configure:
   - DB instance identifier: `restaurant-db`
   - Master username: `admin`
   - Master password: (set a strong password)
   - DB instance class: `db.t3.micro` or `db.t2.micro`
   - Storage: 20 GB (Free tier limit)
   - Public access: **No** (for security)
6. Update your `.env` file with RDS endpoint

### 5.3 Option C: Use Fake DB Mode (Recommended for Testing)
In `server.js`, ensure:
```javascript
const USE_FAKE_DB = true;
```
This requires **no database setup** and is perfect for testing!

---

## Step 6: Run the Application

### 6.1 Test Run
```bash
# Test the application
node server.js
```

Visit `http://<your-ec2-public-ip>:3000` in your browser.

### 6.2 Set Up PM2 (Process Manager)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start server.js --name "restaurant-app"

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

### 6.3 PM2 Useful Commands
```bash
pm2 status              # Check status
pm2 logs restaurant-app # View logs
pm2 restart restaurant-app # Restart app
pm2 stop restaurant-app    # Stop app
pm2 delete restaurant-app  # Remove from PM2
```

---

## Step 7: Set Up Nginx as Reverse Proxy (Optional)

This allows you to run the app on port 80 (standard HTTP).

### 7.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 7.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/restaurant-app
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name <your-ec2-public-ip-or-domain>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 7.3 Enable Configuration
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/restaurant-app /etc/nginx/sites-enabled/

# Remove default configuration
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

Now visit `http://<your-ec2-public-ip>` (port 80)

---

## Step 8: Set Up Domain Name (Optional)

### 8.1 Using Route 53 (AWS)
1. Go to **Route 53 Dashboard**
2. Register a domain or use existing
3. Create a **Hosted Zone**
4. Add **A Record** pointing to your Elastic IP

### 8.2 Using External Domain Provider
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add an **A Record**:
   - Host: `@` or `www`
   - Value: Your EC2 Elastic IP
   - TTL: 300

---

## Step 9: Enable HTTPS with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts
# Certbot will automatically configure Nginx

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 10: Monitoring and Maintenance

### 10.1 Monitor Application Logs
```bash
# PM2 logs
pm2 logs restaurant-app

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.2 Update Application
```bash
cd /home/ubuntu/research
git pull origin main
npm install
pm2 restart restaurant-app
```

### 10.3 Monitor EC2 Resources
- Use **CloudWatch** (free tier includes basic monitoring)
- Set up billing alerts in AWS Console

---

## Cost Breakdown (Monthly)

| Service | Configuration | Cost |
|---------|--------------|------|
| EC2 t2.micro | 750 hours/month (Free Tier) | **$0** |
| EBS Storage | 30 GB (Free Tier) | **$0** |
| Elastic IP | Attached to running instance | **$0** |
| Data Transfer | 15 GB out (Free Tier) | **$0** |
| RDS MySQL (Optional) | db.t3.micro, 20GB (Free Tier) | **$0** |
| **Total (First 12 months)** | | **$0-5** |
| **After Free Tier** | | **~$10-15** |

---

## Security Considerations

### ⚠️ CRITICAL: This is a Vulnerable Application!

1. **Isolate the Environment**:
   - Use a separate AWS account or VPC
   - Never connect to production systems
   
2. **Restrict Access**:
   - Use Security Groups to limit IP access
   - Consider using AWS VPN or bastion host
   
3. **Add Warning Banner**:
   - Clearly label this as a vulnerable test environment
   
4. **Monitor Access**:
   - Enable CloudTrail logging
   - Set up CloudWatch alarms
   
5. **Destroy When Done**:
   - Terminate instances when not in use
   - Delete snapshots and backups

---

## Troubleshooting

### Application Won't Start
```bash
# Check Node.js is installed
node --version

# Check if port 3000 is in use
sudo lsof -i :3000

# Check PM2 logs
pm2 logs restaurant-app
```

### Can't Access from Browser
```bash
# Check if app is running
pm2 status

# Check Security Group allows port 3000 or 80
# Check Nginx is running
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

### Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u restaurant_user -p restaurant_db

# Check credentials in .env file
```

---

## Alternative: Deploy to AWS Lightsail (Even Simpler!)

AWS Lightsail is even easier and cheaper for simple apps:

1. Go to [AWS Lightsail](https://lightsail.aws.amazon.com/)
2. Create Instance:
   - Platform: Linux/Unix
   - Blueprint: Node.js
   - Plan: $3.50/month (512 MB RAM, 1 vCPU, 20 GB SSD)
3. SSH into instance and follow Steps 4-6 above
4. Open port 3000 in Lightsail firewall

**Cost**: $3.50/month (first month free)

---

## Quick Start Commands Summary

```bash
# Connect to EC2
ssh -i your-key.pem ubuntu@<ec2-ip>

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs git

# Clone and setup
git clone <your-repo>
cd research
npm install

# Run with PM2
sudo npm install -g pm2
pm2 start server.js --name restaurant-app
pm2 save
pm2 startup
```

---

## Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Good luck with your deployment! Remember to keep costs low by:**
- Stopping instances when not in use
- Using Fake DB mode instead of RDS
- Monitoring your AWS billing dashboard regularly
- Setting up billing alerts
