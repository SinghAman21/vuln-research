# Vulnerable Restaurant App - AWS Deployment Guide

## ⚠️ CRITICAL SECURITY WARNING

**THIS APPLICATION IS INTENTIONALLY VULNERABLE FOR SECURITY TESTING AND EDUCATION ONLY**

- **DO NOT deploy this publicly without strict network isolation**
- **ONLY use in controlled lab environments**
- **Contains deliberate security flaws including SQL Injection, XSS, and more**

---

## Architecture Overview

```
Internet
    ↓
AWS VPC (10.0.0.0/16)
    ├── Public Subnet (10.0.1.0/24)
    │   └── EC2 Instance (Node.js App)
    │       └── Security Group: Allow 22, 80, 3000 from YOUR_IP
    │
    └── Private Subnet (10.0.2.0/24)
        └── Aurora MySQL Cluster
            └── Security Group: Allow 3306 from EC2 only
```

---

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- SSH key pair created in AWS
- Basic knowledge of AWS services

---

## Step 1: Create VPC and Network Infrastructure

### 1.1 Create VPC
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=vulnerable-app-vpc}]'
```

Save the VPC ID from the output.

### 1.2 Create Subnets
```bash
# Public subnet for EC2
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet}]'

# Private subnet for Aurora
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.2.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1}]'

# Second private subnet (required for Aurora)
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.0.3.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-2}]'
```

### 1.3 Create and Attach Internet Gateway
```bash
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=vulnerable-app-igw}]'

aws ec2 attach-internet-gateway --vpc-id <VPC_ID> --internet-gateway-id <IGW_ID>
```

### 1.4 Configure Route Tables
```bash
# Create route table for public subnet
aws ec2 create-route-table --vpc-id <VPC_ID> --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]'

# Add route to internet gateway
aws ec2 create-route --route-table-id <RT_ID> --destination-cidr-block 0.0.0.0/0 --gateway-id <IGW_ID>

# Associate with public subnet
aws ec2 associate-route-table --subnet-id <PUBLIC_SUBNET_ID> --route-table-id <RT_ID>
```

---

## Step 2: Create Security Groups

### 2.1 EC2 Security Group
```bash
aws ec2 create-security-group \
  --group-name vulnerable-app-ec2-sg \
  --description "Security group for vulnerable app EC2" \
  --vpc-id <VPC_ID>

# Allow SSH (replace YOUR_IP with your IP address)
aws ec2 authorize-security-group-ingress \
  --group-id <EC2_SG_ID> \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id <EC2_SG_ID> \
  --protocol tcp \
  --port 80 \
  --cidr YOUR_IP/32

# Allow Node.js app port
aws ec2 authorize-security-group-ingress \
  --group-id <EC2_SG_ID> \
  --protocol tcp \
  --port 3000 \
  --cidr YOUR_IP/32
```

### 2.2 Aurora Security Group
```bash
aws ec2 create-security-group \
  --group-name vulnerable-app-aurora-sg \
  --description "Security group for Aurora database" \
  --vpc-id <VPC_ID>

# Allow MySQL from EC2 security group only
aws ec2 authorize-security-group-ingress \
  --group-id <AURORA_SG_ID> \
  --protocol tcp \
  --port 3306 \
  --source-group <EC2_SG_ID>
```

---

## Step 3: Launch Aurora Database

### 3.1 Create DB Subnet Group
```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name vulnerable-app-subnet-group \
  --db-subnet-group-description "Subnet group for vulnerable app" \
  --subnet-ids <PRIVATE_SUBNET_1_ID> <PRIVATE_SUBNET_2_ID>
```

### 3.2 Create Aurora MySQL Cluster
```bash
aws rds create-db-cluster \
  --db-cluster-identifier vulnerable-app-cluster \
  --engine aurora-mysql \
  --engine-version 8.0.mysql_aurora.3.04.0 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --db-subnet-group-name vulnerable-app-subnet-group \
  --vpc-security-group-ids <AURORA_SG_ID> \
  --database-name restaurant_db
```

### 3.3 Create Aurora Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier vulnerable-app-instance \
  --db-instance-class db.t3.medium \
  --engine aurora-mysql \
  --db-cluster-identifier vulnerable-app-cluster
```

Wait for the cluster to be available (this can take 10-15 minutes).

### 3.4 Get Aurora Endpoint
```bash
aws rds describe-db-clusters \
  --db-cluster-identifier vulnerable-app-cluster \
  --query 'DBClusters[0].Endpoint' \
  --output text
```

Save this endpoint for later use.

---

## Step 4: Launch EC2 Instance

### 4.1 Launch Instance
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t2.micro \
  --key-name YOUR_KEY_PAIR_NAME \
  --subnet-id <PUBLIC_SUBNET_ID> \
  --security-group-ids <EC2_SG_ID> \
  --associate-public-ip-address \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=vulnerable-app-server}]'
```

### 4.2 Get Public IP
```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=vulnerable-app-server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

---

## Step 5: Configure EC2 Instance

### 5.1 SSH into Instance
```bash
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

### 5.2 Install Node.js
```bash
# Update system
sudo yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install MySQL client
sudo yum install -y mysql
```

### 5.3 Clone and Setup Application
```bash
# Create application directory
mkdir -p ~/vulnerable-restaurant
cd ~/vulnerable-restaurant

# Copy application files (upload via SCP or create manually)
# Or clone from your repository

# Install dependencies
npm install
```

### 5.4 Setup Database
```bash
# Connect to Aurora and run setup script
mysql -h <AURORA_ENDPOINT> -u admin -p restaurant_db < setup.sql
```

### 5.5 Configure Environment Variables
```bash
# Create .env file
cat > .env << EOF
DB_HOST=<AURORA_ENDPOINT>
DB_USER=admin
DB_PASSWORD=YourSecurePassword123!
DB_NAME=restaurant_db
NODE_ENV=development
EOF
```

### 5.6 Start Application
```bash
# Test run
node server.js

# For production, use PM2
sudo npm install -g pm2
pm2 start server.js --name vulnerable-app
pm2 save
pm2 startup
```

---

## Step 6: Access the Application

Open your browser and navigate to:
```
http://<EC2_PUBLIC_IP>:3000
```

---

## Security Testing Credentials

- **Manager Account**: `admin` / `admin123`
- **Manager Account**: `manager1` / `manager`
- **Employee Account**: `employee1` / `employee123`

---

## Vulnerability Testing Checklist

### SQL Injection Tests
- [ ] Login bypass: `admin' OR '1'='1`
- [ ] Data extraction via UNION: `' UNION SELECT id,username,password,role FROM users--`
- [ ] Search exploitation: `' OR '1'='1`
- [ ] Menu item manipulation

### XSS Tests
- [ ] Menu name: `<script>alert('XSS')</script>`
- [ ] Description: `<img src=x onerror=alert('XSS')>`
- [ ] Search query XSS

### Access Control Tests
- [ ] Access `/menu/add` as employee
- [ ] Modify session cookie role
- [ ] Direct URL access to restricted routes

### CSRF Tests
- [ ] Create malicious delete request
- [ ] Test form submissions without authentication

---

## Monitoring and Logging

### Enable CloudWatch Logs
```bash
# Install CloudWatch agent on EC2
sudo yum install -y amazon-cloudwatch-agent

# Configure logging for application
pm2 install pm2-logrotate
```

### View Application Logs
```bash
pm2 logs vulnerable-app
```

---

## Cleanup Instructions

### Delete Resources (in order)

1. **Terminate EC2 Instance**
```bash
aws ec2 terminate-instances --instance-ids <INSTANCE_ID>
```

2. **Delete Aurora**
```bash
aws rds delete-db-instance --db-instance-identifier vulnerable-app-instance --skip-final-snapshot
aws rds delete-db-cluster --db-cluster-identifier vulnerable-app-cluster --skip-final-cluster-snapshot
aws rds delete-db-subnet-group --db-subnet-group-name vulnerable-app-subnet-group
```

3. **Delete Security Groups**
```bash
aws ec2 delete-security-group --group-id <EC2_SG_ID>
aws ec2 delete-security-group --group-id <AURORA_SG_ID>
```

4. **Delete Network Components**
```bash
aws ec2 detach-internet-gateway --internet-gateway-id <IGW_ID> --vpc-id <VPC_ID>
aws ec2 delete-internet-gateway --internet-gateway-id <IGW_ID>
aws ec2 delete-subnet --subnet-id <PUBLIC_SUBNET_ID>
aws ec2 delete-subnet --subnet-id <PRIVATE_SUBNET_1_ID>
aws ec2 delete-subnet --subnet-id <PRIVATE_SUBNET_2_ID>
aws ec2 delete-route-table --route-table-id <RT_ID>
aws ec2 delete-vpc --vpc-id <VPC_ID>
```

---

## Cost Estimation

- **EC2 t2.micro**: ~$8.50/month
- **Aurora db.t3.medium**: ~$88/month
- **Data transfer**: Variable
- **Total**: ~$100/month (when running continuously)

**Tip**: Stop instances when not in use to reduce costs.

---

## Troubleshooting

### Cannot Connect to EC2
- Verify security group allows your IP
- Check EC2 instance is running
- Verify key pair permissions: `chmod 400 key.pem`

### Cannot Connect to Aurora
- Ensure EC2 is in correct security group
- Verify Aurora endpoint is correct
- Check Aurora security group rules

### Application Won't Start
- Check Node.js is installed: `node --version`
- Verify environment variables
- Check logs: `pm2 logs`
- Test database connection: `mysql -h <AURORA_ENDPOINT> -u admin -p`

---

## Additional Resources

- [AWS VPC Documentation](https://docs.aws.amazon.com/vpc/)
- [AWS RDS Aurora Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## Legal Disclaimer

This application is for educational and research purposes only. Users are responsible for:
- Ensuring proper authorization before testing
- Complying with applicable laws and regulations
- Securing the environment appropriately
- Not using this for malicious purposes

The authors assume no liability for misuse of this application.