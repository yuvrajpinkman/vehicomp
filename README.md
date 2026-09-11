# Vehicomp - Vehicle Rental & Fleet Management System

A full-stack solution for vehicle rentals and fleet administration.

## Architecture

* **Frontend:** React, Axios, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** JWT, bcrypt

## Module Responsibilities

* **MEMBER 1:** Customer & Rental Management (`feature/customer-rental`)
* **MEMBER 2:** Fleet & Administration Management (`feature/fleet-admin`)

---

## Stage 1 Completed: Project & Database Setup

* Modular `/backend` and `/frontend` architecture.
* MongoDB Atlas connection verified with live read/write capability.
* Centralized error handling and health-check API (`GET /api/health`).
* Central Axios client with interceptors and Vite proxy configured.
* Automated testing configured with Jest & Supertest.

---

## Running the Application

### 1. Backend Server
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Client runs on http://localhost:3000
```
