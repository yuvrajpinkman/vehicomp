# 🚗 Vehicle Rental & Fleet Management System

A comprehensive, full-stack enterprise application for vehicle rentals, customer bookings, and fleet administration. Built with modern React, Express.js, and MongoDB Atlas.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Problem Statement](#-problem-statement)
3. [Main Features](#-main-features)
4. [Role-Based Features](#-role-based-features)
   - [Customer Features](#customer-features)
   - [Fleet Manager Features](#fleet-manager-features)
   - [Admin Features](#admin-features)
5. [Vehicle Types](#-vehicle-types)
6. [Vehicle Lifecycle State Machine](#-vehicle-lifecycle-state-machine)
7. [Core Technical Modules](#-core-technical-modules)
   - [Pricing Engine](#pricing-engine)
   - [Double-Booking Prevention](#double-booking-prevention)
   - [Maintenance Management](#maintenance-management)
   - [Vehicle Recommendation System](#vehicle-recommendation-system)
   - [Location Tracking](#location-tracking)
8. [Technology Stack](#-technology-stack)
9. [System Architecture](#-system-architecture)
10. [Project Folder Structure](#-project-folder-structure)
11. [Database — MongoDB Atlas](#-database--mongodb-atlas)
12. [Database Models / Collections](#-database-models--collections)
13. [Authentication and Authorization](#-authentication-and-authorization)
14. [API Overview](#-api-overview)
15. [Error Handling & Validation](#-error-handling--validation)
16. [Search, Filtering, and Sorting](#-search-filtering-and-sorting)
17. [Audit Logging](#-audit-logging)
18. [Testing Suite](#-testing-suite)
19. [Team Division & Responsibilities](#-team-division--responsibilities)
20. [GitHub Collaboration Workflow & Branching Strategy](#-github-collaboration-workflow--branching-strategy)
21. [Local Setup & Environment Configuration](#-local-setup--environment-configuration)
22. [Development Stages](#-development-stages)
23. [Deployment Guidelines](#-deployment-guidelines)
24. [Future Enhancements](#-future-enhancements)

---

## 🌐 Project Overview

The **Vehicle Rental & Fleet Management System** is a unified dual-module enterprise platform designed to manage both ends of the vehicle rental ecosystem:
1. **Customer & Rental Management Module (Member 1)**: Covers customer authentication, vehicle browsing, reservation creation, rental agreement management, recommendation matching, and billing.
2. **Fleet & Administration Module (Member 2)**: Covers fleet inventory CRUD, vehicle lifecycle status controls, automated maintenance locks, repair cost tracking, location tracking, and administrative analytics.

Both modules seamlessly integrate into a single full-stack web application sharing a unified backend REST API and React frontend interface.

---

## 🎯 Problem Statement

Traditional vehicle rental operations suffer from disconnected management systems:
- Customer booking systems often lack real-time synchronization with fleet availability, leading to overbooking and double-booking errors.
- Vehicles undergoing emergency maintenance are sometimes accidentally rented out.
- Fleet managers lack dynamic pricing engines and real-time lifecycle tracking for optimal asset utilization.

This platform resolves these pain points by integrating real-time availability checks, automated state transitions, intelligent recommendation algorithms, and central fleet maintenance workflows into one cohesive architecture.

---

## 🌟 Main Features

- **Unified Single-Page Interface**: Clean dashboard with system diagnostics, health checks, and responsive UX.
- **Dynamic Pricing Engine**: Automated calculation of daily rates based on vehicle category, rental duration, season, and demand.
- **Atomic Double-Booking Guard**: Strict date-range overlap validation ensuring zero conflicting reservations.
- **Automated Vehicle Lifecycle**: Enforced status transitions (`AVAILABLE` → `RESERVED` → `RENTED` → `RETURNED` → `INSPECTION` → `MAINTENANCE`).
- **Smart Recommendations**: Rule-based matching engine delivering optimized vehicle suggestions for customers.
- **Centralized Fleet Diagnostics**: Real-time status indicators for MongoDB Atlas connection and API services.

---

## 👥 Role-Based Features

### Customer Features
- **Account Registration & Login**: Secure authentication with JWT tokens and bcrypt password hashing.
- **Vehicle Catalog Browsing**: Filter by category, seating capacity, transmission, fuel type, and price range.
- **Intelligent Recommendations**: Input travel preferences to receive personalized vehicle recommendations.
- **Reservation Management**: Book vehicles, select pickup/drop-off dates, view estimated costs, and track rental agreements.
- **Rental History**: View active, completed, and cancelled rentals with digital receipts.

### Fleet Manager Features
- **Fleet Inventory Control**: Full CRUD operations for vehicle records (VIN, make, model, year, license plate, status).
- **Status Lifecycle Overrides**: Update vehicle status across maintenance, inspection, and availability pipelines.
- **Maintenance Operations**: Schedule preventive maintenance, lock vehicles from reservation, and track repair expenses.
- **Location Tracking**: Record and monitor current vehicle depot assignments and GPS coordinates.

### Admin Features
- **User Role Management**: Assign and manage roles (`CUSTOMER`, `FLEET_MANAGER`, `ADMIN`).
- **Fleet Analytics**: Monitor revenue, fleet utilization rates, peak rental windows, and maintenance costs.
- **Audit Logs**: Review system-wide action logs for security and operational compliance.

---

## 🚗 Vehicle Types

The system supports a diverse fleet of vehicle classifications:

| Category | Example Models | Seating | Features |
| :--- | :--- | :---: | :--- |
| **Economy / Hatchback** | Toyota Yaris, Honda Fit | 4-5 | High fuel efficiency, urban mobility |
| **Sedan** | Honda Accord, Toyota Camry | 5 | Comfort, trunk space, executive transit |
| **SUV / Crossover** | Toyota RAV4, Ford Explorer | 5-7 | AWD capability, spacious cargo, family trips |
| **Luxury / Executive** | BMW 5 Series, Mercedes C-Class | 5 | Premium interior, advanced safety, prestige |
| **Commercial / Van** | Ford Transit, RAM ProMaster | 2-12 | Heavy load capacity, cargo transport |

---

## 🔄 Vehicle Lifecycle State Machine

Vehicles transition through strict operational states to guarantee data consistency:

```
[ AVAILABLE ] ──(Customer Reserve)──> [ RESERVED ]
      ▲                                   │
      │                               (Check-Out)
 (Inspection                              │
   Passed)                                ▼
      │                              [ RENTED ]
      │                                   │
[ INSPECTION ] <──(Vehicle Return)────────┘
      │
 (Issues Found)
      │
      ▼
[ MAINTENANCE ] ──(Repairs Complete)──> [ AVAILABLE ]
```

1. **AVAILABLE**: Ready for immediate customer reservation.
2. **RESERVED**: Blocked for an upcoming confirmed booking.
3. **RENTED**: Active customer rental currently on the road.
4. **RETURNED / INSPECTION**: Vehicle returned, awaiting condition and fuel inspection.
5. **MAINTENANCE**: Locked out from booking during service/repair.

---

## ⚙️ Core Technical Modules

### Pricing Engine
- **Base Rate**: Category-specific daily rate (e.g., Economy $40/day, Luxury $150/day).
- **Duration Multiplier**: Discounts applied for long-term rentals (7+ days = 10% off, 30+ days = 20% off).
- **Seasonal Adjustments**: Peak holiday multipliers applied automatically.

### Double-Booking Prevention
- Dates are evaluated against existing non-cancelled reservations using MongoDB date range query filters (`$gte`, `$lte`).
- Database atomic transactions guarantee zero double-booking under high concurrency.

### Maintenance Management
- Automatic status lock when mileage threshold or scheduled inspection date is reached.
- Cost tracking logs expenses against individual vehicle IDs for TCO (Total Cost of Ownership) analysis.

### Vehicle Recommendation System
- Algorithmic scoring based on budget, passenger count, luggage requirements, and trip type (city vs off-road).

### Location Tracking
- Tracks vehicle depot location ID, latitude/longitude coordinates, and last check-in timestamp.

---

## 💻 Technology Stack

- **Frontend**: React 18, Axios, Lucide React (Icons), Vite build tool, Vanilla CSS with CSS Variables & Glassmorphic theme.
- **Backend**: Node.js, Express.js REST API framework.
- **Database**: MongoDB Atlas cloud database managed via Mongoose ODM.
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing.
- **Testing**: Jest, Supertest.
- **Version Control**: Git & GitHub.

---

## 🏗️ System Architecture

```
React Frontend (client) ──(HTTP/Axios)──> Express API Server (backend)
                                                 │
                                                 ├── Middleware (Auth JWT, CORS, Errors)
                                                 ├── Routes & Controllers
                                                 └── Services & Mongoose Models
                                                         │
                                                         ▼
                                               MongoDB Atlas (Cloud DB)
```

---

## 📂 Project Folder Structure

```
vehicomp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   └── health.controller.js  # System health check controller
│   │   ├── middlewares/
│   │   │   └── error.middleware.js   # Centralized error handling
│   │   ├── routes/
│   │   │   └── health.routes.js      # Health check router
│   │   ├── scripts/
│   │   │   └── testAtlasConnection.js # Database connectivity tester
│   │   ├── app.js                    # Express application configuration
│   │   └── server.js                 # Backend entry point
│   ├── tests/
│   │   └── health.test.js            # Automated integration tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js                # Central Axios instance & helpers
│   │   ├── App.jsx                   # Consolidated dashboard UI
│   │   ├── main.jsx                  # React DOM entry point
│   │   └── index.css                 # Glassmorphic CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .env.example                      # Environment variables template
├── .gitignore                        # Git exclusion rules
├── LICENSE                           # MIT License
└── README.md                         # Project documentation
```

---

## 🗄️ Database — MongoDB Atlas

The project connects to **MongoDB Atlas** cloud cluster.
Connection string is configured via the `MONGODB_URI` environment variable in `.env`.

### Database Collections Schema Preview
- `users`: User profiles, roles, credentials.
- `vehicles`: VIN, make, model, year, category, dailyRate, status, location.
- `reservations`: customerId, vehicleId, startDate, endDate, totalCost, status.
- `maintenances`: vehicleId, description, cost, status, scheduledDate.
- `auditlogs`: action, userId, details, timestamp.

---

## 🔐 Authentication and Authorization

- Passwords stored securely using `bcryptjs` salt rounds.
- Stateless JWT issuance with configurable expiration (`JWT_EXPIRES_IN`).
- Role-based authorization middleware enforcing access limits (`CUSTOMER`, `FLEET_MANAGER`, `ADMIN`).

---

## 🚀 API Overview

### Health & Diagnostics
- `GET /` — Welcome endpoint.
- `GET /api/health` — Detailed health check for backend API and MongoDB Atlas connection.

---

## 🛡️ Error Handling & Validation

- Centralized Express error handler catches sync & async controller errors.
- Standardized error JSON payload:
  ```json
  {
    "status": "error",
    "message": "Descriptive error message",
    "stack": "Stack trace (development mode only)"
  }
  ```

---

## 🔍 Search, Filtering, and Sorting

- API queries support pagination (`page`, `limit`), sorting (`sort=dailyRate:asc`), and field filters (`category=SUV&status=AVAILABLE`).

---

## 📝 Audit Logging

- Critical operations (status overrides, reservation updates, user role updates) create audit log records for compliance.

---

## 🧪 Testing Suite

Automated integration tests are implemented using Jest and Supertest.

Run tests in backend:
```bash
cd backend
npm test
```

Test MongoDB Atlas connection:
```bash
cd backend
npm run test:atlas
```

---

## 👥 Team Division & Responsibilities

| Developer | Assigned Module | Key Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | **Customer & Rental Management** | Registration/Login, Vehicle Search, Recommendation Engine, Reservations, Agreements, Invoicing |
| **Member 2** | **Fleet & Administration** | Fleet Inventory CRUD, Vehicle Status Lifecycle Controls, Maintenance Locks, Location Tracking, Analytics |

---

## 🌿 GitHub Collaboration Workflow & Branching Strategy

- **Authoritative Main Branch**: `main` contains stable, consolidated code. Standard folder names are permanently `frontend/` and `backend/`.
- **Feature Branches**:
  - Member 1: `feature/customer-rental`
  - Member 2: `feature/fleet-admin`
  - Cleanup / Structure: `chore/consolidate-project-structure`
- **Rule**: Developers pull `main` before starting work and merge via non-conflicting Pull Requests.

---

## ⚙️ Local Setup & Environment Configuration

### 1. Prerequisites
- Node.js (v18+ recommended)
- Git

### 2. Environment Variables (.env)
Create a `.env` file in the root directory (or in `backend/`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vehicomp?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 3. How to Run Backend
```bash
cd backend
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

### 4. How to Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will launch on Vite dev server (e.g. `http://localhost:3000` or `http://localhost:5173`).

---

## 📈 Development Stages

- **Stage 1**: Complete Project Setup, Shared Backend/Frontend Consolidation, MongoDB Atlas Verification, Health API.
- **Stage 2**: Core Authentication, Customer Profiles, Fleet Inventory CRUD.
- **Stage 3**: Vehicle Search, Recommendation Engine, Booking & Double-Booking Guards.
- **Stage 4**: Maintenance Lock Workflows, Invoicing, Location Tracking, Admin Analytics.

---

## 🚢 Deployment Guidelines

- Backend target: Render / Heroku / AWS Elastic Beanstalk.
- Frontend target: Vercel / Netlify.
- Database: MongoDB Atlas Production Cluster.

---

## 🔮 Future Enhancements

- Real-time GPS location streaming via WebSockets.
- Automated OCR license plate scanner for vehicle check-in/out.
- Integrated payment gateway (Stripe/PayPal) for digital security deposits.
- Mobile application (React Native) support.

---

*Vehicle Rental & Fleet Management System — Stage 1 Consolidated.*
