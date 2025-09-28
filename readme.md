PrimeTrade.ai - Backend Developer Intern Assignment

Project Overview
----------------
PrimeTrade.ai intern assignment project is a task management application with both user and admin functionality.
It uses a React frontend, Node.js/Express backend, and MongoDB as the database.
Supports Docker and Docker Compose for easy deployment.

Features
--------

User Features:
- Create tasks with title, description, due date, and status.
- Update tasks directly from the dashboard.
- Filter tasks by status to track progress effectively.

Admin Features:
- View all registered users.
- Track tasks across multiple users.
- Assign tasks and monitor their status and deadlines.

Setup & Running the Project
---------------------------

1. Running Locally

Backend:
- Navigate to the backend folder:
  cd backend
- Install dependencies:
  npm install

Create a `.env` file with the following content:
PORT=4000
MONGO_URI=mongodb://localhost:27017/intern_assignment
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=15m
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

Run MongoDB locally:
mongod --dbpath /path/to/data

Start the backend:
npm run dev

Frontend:
- Navigate to the frontend folder:
  cd frontend
- Install dependencies:
  npm install
- Start the frontend:
  npm run dev

Open the app in your browser:
http://localhost:5173

2. Running via Docker Compose (Recommended)

Ensure Docker is running, then pull the images:
docker pull rnyn666140/primetrade-backend:latest
docker pull rnyn666140/primetrade-frontend:latest

Start all services:
docker compose -f docker-compose.prod.yml up --build

Access the app:
http://localhost:5173

Docker Images
-------------
Frontend: https://hub.docker.com/r/rnyn666140/primetrade-frontend
Backend: https://hub.docker.com/r/rnyn666140/primetrade-backend

GitHub Repository
-----------------
https://github.com/RVNayan/PrimeT-FB

Notes
-----
- Admin Login Code: LMAO
- JWT token is returned after login for authentication.
- For local setup, MongoDB must be running separately.
- Docker Compose setup is recommended for a consistent environment.
