# 1. Create VPC
resource "aws_vpc" "oneup-vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "1UpExampleApp"
  }
}

# 2. Create internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.oneup-vpc.id
}

# 3. Create custom route table
resource "aws_route_table" "oneup-route-table" {
  vpc_id = aws_vpc.oneup-vpc.id

  route {
    # 0.0.0.0/0 is the default route
    # so all traffic will be sent where this route points
    # which is to the specified internet gateway
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  route {
    # this is the default route for ipv6
    # im not super familiar with networking or ipv6
    # so i dont know exactly why you would also need this route
    ipv6_cidr_block = "::/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  
  tags = {
    Name = "1upExample"
  }
}

# 4. Create a subnet
resource "aws_subnet" "subnet-1" {
  vpc_id = aws_vpc.oneup-vpc.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "1up-subnet"
  }
}

# 5. Associate subnet with route table
resource "aws_route_table_association" "a" {
  subnet_id = aws_subnet.subnet-1.id
  route_table_id = aws_route_table.oneup-route-table.id
}

# 6. Create security group to allow port 22, 80
resource "aws_security_group" "allow_web" {
  name = "allow_web_traffic"
  description = "allow web traffic"
  vpc_id = aws_vpc.oneup-vpc.id

  ingress {
    description = "HTTP"
    from_port = 80
    to_port = 80
    protocol = "tcp"
    # let anyone access the web server over the internet
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port = 22
    to_port = 22
    protocol = "tcp"
    # Allows anyone with a key to access via SSH. In a production environment this should not be
    # opened up to everyone
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    # -1 means any protocol
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "allow_web"
  }
}

# 7. Create a network interface with an ip in the subnet that was created in step 4
resource "aws_network_interface" "web-server-nic" {
  subnet_id = aws_subnet.subnet-1.id
  private_ips = ["10.0.1.50"]
  security_groups = [aws_security_group.allow_web.id]
}

# 8. Assign an elastic IP to the network interface created in step 7
resource "aws_eip" "one" {
  # (optional) Boolean if the EIP is in a VPC or not
  vpc = true
  network_interface = aws_network_interface.web-server-nic.id
  associate_with_private_ip = "10.0.1.50"

  # AWS EIP relies on the deployment of the internet gateway to be spun up
  # first and terraform cant do that automatically for some reason so in this
  # case we need this depends_on value to make sure the internet gateway is
  # created first
  depends_on = [aws_internet_gateway.gw]
}

# 9. Create the EC2 server
resource "aws_instance" "web-server-instance" {
  ami = "ami-0bcc094591f354be2"
  instance_type = "t2.micro"
  # important that this is set to the same availability zone as our subnet above
  availability_zone = "us-east-1a"

  network_interface {
    device_index = 0
    network_interface_id = aws_network_interface.web-server-nic.id
  }

  user_data = data.template_file.init.rendered

  tags = {
    Name = "web-server"
  }
}


# Outputs:
output "server_public_ip" {
  value = aws_eip.one.public_ip
}

output "server_private_ip" {
  value = aws_eip.one.private_ip
}
