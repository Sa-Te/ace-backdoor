# AceBackdoor - Visitor Tracking & Management Panel

This repository contains the complete source code for the AceBackdoor project, a comprehensive solution for tracking website visitors and managing targeting rules. This document serves as a technical overview and a guide for setting up the local development environment.

# Quick Architecture Overview

The system is composed of three main parts that work together:

The Backend (Node.js / Express): A powerful API that handles all the core logic. It receives data from the tracking script, saves it to the database, and provides data to the admin panel.

The Frontend (React / Vite): A modern, responsive admin panel where you can view all visitor statistics, manage injectable scripts, and create targeting rules for your websites.

The Tracking Script (tracking.js): A small, lightweight JavaScript file that you inject into your own websites. It silently collects visitor information and sends it to your backend.

Here is a simple flow of how the data moves through the system:
Your Website ---> | tracking.js | ---> | Backend API |
+-------------------+ | (Node.js) |
+--------+---------+
|
+-------------------+ +--------+---------+
Your Browser ---->| React Admin Panel | ---> | Database |
+-------------------+ | (MySQL) |
+------------------+

# Technology Stack

Backend:

Runtime: Node.js

Framework: Express.js

Database: MySQL

ORM: Sequelize

Real-time Communication: Socket.IO

Authentication: JSON Web Tokens (JWT)

Frontend:

Framework: React

Build Tool: Vite

Styling: Tailwind CSS

API Communication: Axios

# Local Development Setup Guide

Follow these steps to get the entire project running on your local machine for development and testing.

Step 1: Prerequisites
Ensure you have the following software installed on your computer:

Node.js: The "LTS" version is recommended.

XAMPP: This is the easiest way to run a local MySQL database.

Git: For version control.

Step 2: Start Your Database
Before running the code, your database must be active.

Open the XAMPP Control Panel.

Click Start for both the Apache and MySQL modules. They should turn green.

Step 3: Backend Setup
Navigate to the Backend Folder:

cd backend

Create Environment File: Create a file named .env in the backend folder and paste the following content into it. This connects the app to your local XAMPP database.

# Local Backend Configuration

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=apijquery_local
PORT=3000
JWT_SECRET=a-long-secure-random-string-for-local-dev
CORS_ORIGIN=http://localhost:5173

Create the Database: In XAMPP's phpMyAdmin (http://localhost/phpmyadmin/), run this SQL query to create the empty database:

CREATE DATABASE apijquery_local;

Install Dependencies:

npm install

Run Database Migrations: This command will automatically create all the necessary tables.

npx sequelize-cli db:migrate

Start the Backend Server:

npm start

The backend API is now running on http://localhost:3000.

Step 4: Frontend Setup
Open a new terminal and navigate to the frontend folder:

cd frontend

Create Environment File: Create a file named .env in the frontend folder and paste the following content. This tells the admin panel where to find the backend API.

# Local Frontend Configuration

VITE_API_BASE_URL=http://localhost:3000

Install Dependencies:

npm install

Start the Frontend Server:

npm run dev

The React admin panel is now running on http://localhost:5173. You can log in with:

Username: admin

Password: password123

Step 5: Testing the Tracking Script
To test tracking from a sample website:

Use the tracking.local.js file, which is configured to send data to your local server.

Use the test-website.html file as a sample page.

When you open test-website.html in your browser, you should see the visit appear on your dashboard in real-time.

# Environment Variables Explained

These are the key variables you will need to change when deploying to a live server.

Backend (/backend/.env)
DB_HOST: The IP address or hostname of your database server.

DB_USER: The username for your database.

DB_PASSWORD: The password for your database user.

DB_NAME: The name of the database.

CORS_ORIGIN: Crucial for security. This must be the full URL of your frontend admin panel (e.g., https://my-panel.com).

Frontend (/frontend/.env)
VITE_API_BASE_URL: Crucial for functionality. This must be the full URL of your backend API (e.g., https://api.my-panel.com).
