#!/bin/bash
sudo apt update -y

# install nodejs and npm
sudo apt install nodejs -y
sudo apt install npm -y

# clone the 1up example app repo
sudo git clone https://github.com/rknizzle/1up-example-app.git
cd 1up-example-app

# populate the .env file from terraform variables
echo "CLIENT_ID=${CLIENT_ID}" >> .env
echo "CLIENT_SECRET=${CLIENT_SECRET}">> .env

# Redirect port 80 -> the nodejs server running on port 8080
sudo iptables -A INPUT -i eth0 -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -i eth0 -p tcp --dport 8080 -j ACCEPT
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080

# install npm dependencies and start the server
npm install
npm start
