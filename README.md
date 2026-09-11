# Vehicle Rental & Fleet Management System

A full-stack, enterprise-grade vehicle rental and fleet management platform developed collaboratively.

## Team Contributions & Modules

* **Member 1 (Customer & Rental Management Module)**:
  * Authentication (Customer role, JWT, Bcrypt)
  * Vehicle Browsing & Advanced Search/Filters
  * Reservations & Double-Booking Conflict Prevention
  * Active Rental Management & Return Flow
  * Dynamic Pricing Engine & Detailed Invoicing
  * Rating & Review System
  * Customer Dashboard

* **Member 2 (Fleet & Administration Module)**:
  * Fleet Inventory Management (CRUD operations on vehicles)
  * Maintenance Scheduling & Tracking
  * Admin Analytics & Operational Dashboard

---

## Technology Stack

* **Frontend**: React, Axios, Lucide Icons, Vite
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas, Mongoose
* **Authentication**: JWT, bcryptjs
* **Testing**: Jest, Supertest

---

## Getting Started Locally

### Prerequisites
* Node.js (v18+)
* npm (v9+)
* MongoDB Atlas database connection string

### Server Setup
```bash
cd server
npm install
npm run dev
```
Server will start on `http://localhost:5000`.

### Client Setup
```bash
cd client
npm install
npm run dev
```
Client will run on `http://localhost:3000`.

---

## API Endpoints

### Health & System
* `GET /api/health` — System status & database connection state.
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
