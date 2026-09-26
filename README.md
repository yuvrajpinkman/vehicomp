# 🚗 VehiComp — Vehicle Rental & Fleet Management System

An enterprise-grade, full-stack web application designed for seamless customer vehicle rentals and comprehensive fleet administration. Built using React, Express.js, Node.js, and MongoDB Atlas.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [System Architecture](#-system-architecture)
4. [Vehicle Lifecycle State Machine](#-vehicle-lifecycle-state-machine)
5. [Core Features & Modules](#-core-features--modules)
6. [Team Division & Responsibilities](#-team-division--responsibilities)
7. [Local Setup & Development](#-local-setup--development)
8. [Environment Variables](#-environment-variables)
9. [API Endpoints Reference](#-api-endpoints-reference)
10. [Automated Testing Suite](#-automated-testing-suite)
11. [Production Deployment Guide](#-production-deployment-guide)

---

## 🌐 Project Overview

**VehiComp** is a unified dual-module enterprise application that handles the complete lifecycle of vehicle rentals:
- **Customer & Rental Management Module (Member 1)**: Powers user registration/authentication, vehicle search & filter (by type, location, price, fuel), double-booking prevention reservations, rental check-out & check-in lifecycle, dynamic pricing engine (peak, weekend, late fees, insurance), invoice generation & payment, vehicle rating, and personal customer dashboard.
- **Fleet & Administration Module (Member 2)**: Powers vehicle inventory management, lifecycle state transitions (`AVAILABLE`, `RENTED`, `MAINTENANCE`, `INSPECTION`, `DAMAGED`), automated maintenance scheduling & lock prevention, live GPS location tracking, fleet analytics, and revenue dashboard.

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, Axios, Lucide React, Leaflet & React-Leaflet
- **Backend**: Node.js, Express.js, Cors, Dotenv
- **Database**: MongoDB Atlas, Mongoose ODM, MongoMemoryServer (In-memory testing)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Testing**: Jest, Supertest

---

## 📐 System Architecture

```
                                    +-----------------------+
                                    |     React UI (Vite)   |
                                    +-----------+-----------+
                                                |
                                           Axios HTTP
                                                |
                                                v
                                    +-----------------------+
                                    |  Express REST API     |
                                    +-----------+-----------+
                                                |
                                       JWT Auth / Middleware
                                                |
                                                v
                                    +-----------------------+
                                    |   Service Layer       |
                                    +-----------+-----------+
                                                |
                                       Mongoose Models
                                                |
                                                v
                                    +-----------------------+
                                    |    MongoDB Atlas      |
                                    +-----------------------+
```

---

## 🚗 Vehicle Lifecycle State Machine

![Vehicle Lifecycle State Machine](./assets/vehicle-lifecycle-state-machine.png)

Valid Status Values: `AVAILABLE`, `RESERVED`, `RENTED`, `RETURNED`, `INSPECTION`, `DAMAGED`, `MAINTENANCE`

---

## ✨ Core Features & Modules

### 👤 Member 1 — Customer & Rental Management Module
- **JWT Authentication & Authorization**: Secure signup, login, password hashing with bcrypt, role-based protection (`CUSTOMER`).
- **Vehicle Browsing & Filtering**: Filter by `vehicleType` (`HATCHBACK`, `SEDAN`, `SUV`, `LUXURY`, `ELECTRIC`), location city, price per day range, and fuel type.
- **Double-Booking Prevention**: Backend validation ensures overlapping reservation date ranges are strictly blocked (409 Conflict) while non-overlapping dates are approved.
- **Rental Lifecycle**: Start rental, track active rentals, calculate actual vs expected return dates, odometer readings, and automated late fees.
- **Dynamic Pricing Engine**: Automated calculation of base daily price, weekend surcharges, peak season surcharges, insurance plans, additional driver fees, late return penalties, and damage fees.
- **Invoice Management**: Automated PDF-style invoice generation, breakdown inspection, and simulated payment processing.
- **Rating & Reviews**: Rate completed vehicle rentals (1–5 stars) with aggregate average rating recalculations.
- **Customer Dashboard**: Centralized hub to access active rentals, reservation history, invoices, and user statistics.

### 🛡️ Member 2 — Fleet & Administration Module
- **Fleet Management**: Add, view, edit, search, and soft-delete vehicles in the fleet.
- **Vehicle Lifecycle Transitions**: Manage state transitions with valid workflow rules and automated maintenance locks.
- **Maintenance Tracking**: Log maintenance requests, track repair costs, assign mechanics, and automatically set vehicle state to `MAINTENANCE`.
- **GPS Location Tracking**: Record and view latitude/longitude history per vehicle with interactive Leaflet map integration.
- **Fleet Analytics Dashboard**: Executive dashboard showing total revenue, vehicle utilization rates, maintenance costs, and active rental status breakdown.
- **Vehicle Recommendation Engine**: AI-assisted vehicle ranking and recommendations based on customer preferences, trip history, and budget.

---

## 👥 Team Division & Responsibilities

| Team Member | Module Assigned | Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | **Customer & Rental Management** | Authentication, Vehicle Browsing, Double-Booking Reservations, Rental Lifecycle, Pricing Engine, Invoices, Customer Dashboard, Vehicle Ratings |
| **Member 2** | **Fleet & Administration** | Fleet Inventory CRUD, Vehicle Lifecycle State Machine, Maintenance & Lock System, GPS Tracking & Maps, Executive Analytics Dashboard, Recommendation Engine |

---

## ⚙️ Local Setup & Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster connection string (or local MongoDB)

### 1. Clone Repository
```bash
git clone https://github.com/yuvrajpinkman/vehicomp.git
cd vehicomp
```

### 2. Backend Installation & Startup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend server will run at `http://localhost:5000`.

### 3. Frontend Installation & Startup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Frontend application will run at `http://localhost:3000` (or `http://localhost:5173`).

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vehicomp?retryWrites=true&w=majority
JWT_SECRET=supersecret_vehicomp_jwt_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Authenticate user and receive JWT
- `GET /api/auth/me` — Fetch currently logged-in user profile

### Vehicles
- `GET /api/vehicles` — List vehicles (with filtering, pagination & search)
- `GET /api/vehicles/:id` — Get vehicle details
- `POST /api/vehicles` — Create vehicle (Admin/Fleet Manager)
- `PUT /api/vehicles/:id` — Update vehicle details
- `PATCH /api/vehicles/:id/status` — Transition vehicle lifecycle status
- `DELETE /api/vehicles/:id` — Soft-delete vehicle

### Reservations & Double-Booking Prevention
- `POST /api/reservations` — Create reservation (with backend double-booking validation)
- `GET /api/reservations/my` — Get customer reservation history
- `GET /api/reservations/:id` — Get reservation details
- `PATCH /api/reservations/:id/cancel` — Cancel active reservation

### Rentals
- `POST /api/rentals` — Start vehicle rental
- `GET /api/rentals/active` — Get active rentals
- `GET /api/rentals/my` — Get user rental history
- `POST /api/rentals/:id/return` — Process vehicle return and calculate late fee

### Pricing & Invoices
- `POST /api/pricing/calculate` — Calculate dynamic pricing breakdown
- `POST /api/invoices/generate` — Generate invoice for completed/active rental
- `GET /api/invoices` — Get customer invoices
- `GET /api/invoices/:id` — Get invoice details
- `POST /api/invoices/:id/pay` — Process invoice payment

### Rating & Dashboard
- `POST /api/ratings` — Submit vehicle rating
- `GET /api/ratings/vehicle/:vehicleId` — Get vehicle aggregate ratings
- `GET /api/customer/dashboard` — Get customer dashboard metrics
- `GET /api/dashboard/stats` — Get fleet manager executive analytics

---

## 🧪 Automated Testing Suite

The project includes unit, integration, validation, authorization, and E2E test suites powered by Jest and Supertest with an isolated in-memory Mongo database (`mongodb-memory-server`).

### Running Tests
```bash
cd backend
npm test
```

### Test Suite Summary
- **Total Test Suites**: 13 / 13 Passed
- **Total Tests**: 129 / 129 Passed
- Coverage includes: Auth, Vehicle CRUD, Reservations, Double-Booking, Rentals, Pricing, Invoices, Ratings, Maintenance, GPS Tracking, Recommendations, Dashboard, and E2E lifecycle workflows.

---

## 🚀 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Create a MongoDB Atlas Cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User and obtain the MongoDB Atlas connection string.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`) or add deployment platform IPs.

### 2. Backend Deployment (Render / Railway / Heroku)
1. Connect GitHub repository to Render/Railway.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Configure Production Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `<secure-production-secret>`
   - `CLIENT_URL`: `https://<your-vercel-app>.vercel.app`
   - `NODE_ENV`: `production`

### 3. Frontend Deployment (Vercel / Netlify)
1. Import repository to Vercel/Netlify.
2. Framework Preset: `Vite`
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variable:
   - `VITE_API_URL`: `https://<your-render-app>.onrender.com/api`

---

## 📝 License

This project is licensed under the MIT License.
