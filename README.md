# 1upHealth Web Application

## Run it yourself
First, create an application from the 1Up Health website [here](https://1up.health/devconsole). 
Make sure you specify http://localhost:8080/callback when creating the application and note down the
client ID and secret when you are done.

Next, setup the repo.  
1. clone the source code from this repo
```
git clone https://github.com/rknizzle/1up-example-app.git
```

2. Create a .env file with your apps client id and secret
```
CLIENT_ID=xxxxxxxxxx
CLIENT_SECRET=xxxxxxxxxx
```

3. Install and run
```
npm install
npm start
```
4. Enter any username on the login page to get started
5. Access the Cerner test data using the following test user:
```
Username: wilmasmart
Password: Cerner01
```
