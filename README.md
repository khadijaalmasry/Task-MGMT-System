### Project Description
The Task Management System is a web-based application that facilitates the organization,
tracking, and management of tasks and projects. It is designed to enhance productivity
and collaboration among users, including students and administrators.

## Environment Variables

To run this project, you'll need to create a `.env` file in the root directory of the backend folder with the following variables:  

```env
MONGO_URI=mongodb+srv://khakhkhekh:password123password@mycluster-00.uwcoc8z.mongodb.net/TaskMgmt?retryWrites=true&w=majority&appName=mycluster-00
PORT=5001
JWT_SECRET=c9a75dc9626432cd3eb5d3f2d4a525654d39ed910921fcdc3ec1cab2dae2e405
```
## How to run: 
After creating the `.env` file, you will need to add the node_modules. 
Simply open a terminal and print:
```npm install```
You'll need to open 2 terminals
  Terminal 1: 
  ```
  cd backend
  npm run dev
```
  The output will look like this:
  ```
Server running on port 5001
Try these endpoints:
  - REST: http://localhost:5001/health
  - GraphQL: http://localhost:5001/graphql
GraphQL server ready at /graphql
MongoDB Connected
  ```
  Terminal 2: 
  ```
  cd frontend
  npm run dev
```
  The output will look like this:
  ```
  VITE v6.3.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```
  

## Log In as Admin
  Default password for all users is 'password123' 
  to log in as an Admin, try username 'John Doe' (case sensitive)
  (you can use the [apollo graphql sandbox url](http://localhost:5001/graphql) to create a user with an admin user role, since that cannot be done using the frontend sign up form. Select the sign up mutation from the documentation, or copy-paste this mutation and fill it with your data to create a new admin user:
  ```
mutation SignUp {
  signUp(name: "your_username", password: "your_password", isAdmin: true) {
    token
    user {
      _id
      name
      isAdmin
      universityId
    }
  }
}
```
  
  -- make sure the backend terminal is running if you want to use the Apollo sandbox
