terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1"
  profile = "Aman"
}

data "aws_availability_zones" "available" {
  state = "available"
}

variable "github_repo" {
  default = "https://github.com/SinghAman21/vuln-research.git"
}

variable "db_name" {
  default = "restaurant"
}

variable "db_user" {
  default = "postgres"
}

variable "db_pass" {
  default = "admin1234"
}

resource "aws_vpc" "vuln_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vuln-research-vpc"
  }
}

resource "aws_internet_gateway" "vuln_igw" {
  vpc_id = aws_vpc.vuln_vpc.id

  tags = {
    Name = "vuln-igw"
  }
}

resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.vuln_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "vuln-public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.vuln_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "vuln-public-subnet-2"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.vuln_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.vuln_igw.id
  }

  tags = {
    Name = "vuln-public-rt"
  }
}

resource "aws_route_table_association" "public_rta" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rta_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_security_group" "eb_sg" {
  name_prefix = "vuln-eb-"
  vpc_id      = aws_vpc.vuln_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vuln-eb-sg"
  }
}

resource "aws_security_group" "rds_sg" {
  name_prefix = "vuln-rds-"
  vpc_id      = aws_vpc.vuln_vpc.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vuln-rds-sg"
  }
}

resource "aws_db_subnet_group" "vuln_subnet_group" {
  name       = "vuln-subnet-group"
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}

resource "aws_db_instance" "vuln_postgres" {
  identifier              = "vuln-postgres"
  engine                  = "postgres"
  engine_version          = "17.6"
  instance_class          = "db.t3.micro"
  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp3"
  db_name                 = var.db_name
  username                = var.db_user
  password                = var.db_pass
  vpc_security_group_ids  = [aws_security_group.rds_sg.id]
  db_subnet_group_name    = aws_db_subnet_group.vuln_subnet_group.name
  skip_final_snapshot     = true
  publicly_accessible     = true
  backup_retention_period = 1

  tags = {
    Name = "vuln-postgres"
  }
}

resource "aws_elastic_beanstalk_application" "vuln_app" {
  name = "vuln-research-app"
}

resource "aws_s3_bucket" "backend_bucket" {
  bucket = "vuln-research-backend-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "vuln-research-frontend-${random_id.bucket_suffix.hex}"
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}

resource "aws_elastic_beanstalk_application_version" "vuln_backend" {
  name        = "vuln-backend-v1"
  application = aws_elastic_beanstalk_application.vuln_app.name
  bucket      = aws_s3_bucket.backend_bucket.id
  key         = "backend.zip"
}

resource "aws_elastic_beanstalk_environment" "vuln_env" {
  name                = "vuln-research-env"
  application         = aws_elastic_beanstalk_application.vuln_app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.1.5 running Node.js 20"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service_role.name
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.vuln_vpc.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = aws_subnet.public_subnet_1.id
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Port"
    value     = "3000"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:proxy:staticfiles"
    name      = "StaticFiles"
    value     = "/public/*"
  }

  setting {
    namespace = "AWS::ElasticBeanstalk::CloudWatchLogs"
    name      = "StreamLogs"
    value     = "true"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = aws_db_instance.vuln_postgres.endpoint
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = var.db_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = var.db_user
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PASSWORD"
    value     = var.db_pass
  }

  depends_on = [
    aws_db_instance.vuln_postgres,
    aws_elastic_beanstalk_application_version.vuln_backend
  ]
}

resource "null_resource" "setup_database" {
  depends_on = [aws_db_instance.vuln_postgres]

  provisioner "local-exec" {
    command = <<EOT
      psql -h ${aws_db_instance.vuln_postgres.endpoint} \
           -U ${var.db_user} \
           -d ${var.db_name} \
           -f fe/setup.sql
    EOT
    interpreter = ["bash", "-c"]
  }

  provisioner "local-exec" {
    when    = destroy
    command = "echo 'Database setup complete - no cleanup needed'"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role" "eb_service_role" {
  name = "vuln-eb-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role" "eb_instance_role" {
  name = "vuln-eb-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "vuln-eb-ec2-profile"
  role = aws_iam_role.eb_instance_role.name
}

resource "aws_iam_role_policy_attachment" "eb_service_policy" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_instance_policy" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

output "frontend_url" {
  value = "http://${aws_s3_bucket.frontend_bucket.bucket}.s3-website-ap-southeast-1.amazonaws.com"
}

output "backend_url" {
  value = aws_elastic_beanstalk_environment.vuln_env.cname
}

output "rds_endpoint" {
  value = aws_db_instance.vuln_postgres.endpoint
}

output "db_password" {
  value     = var.db_pass
  sensitive = true
}
