SmartPark Pro – Smart Parking Management System
SmartPark Pro is a MERN‑stack smart parking system that lets users register, log in, view parking slot availability on a map and grid, and book slots for a specific time range with validation. Admins can manage slots and companies via protected APIs.
​
🚗 Smart Parking Management System

A full-stack Smart Parking Management System that allows users to locate parking slots, book parking in real time, make secure payments, and track booking history — all through a modern, responsive web interface.

This project includes:

A React-based frontend

A Node.js + Express backend

MongoDB for data storage

Map integration for parking locations

Authentication, booking, and payment flow

📌 Project Features
👤 User Features
Key Features

### 🔐 Authentication & Authorization

* JWT-based authentication
* Role-based access control (User / Admin)
* Secure protected routes using middleware

### 🅿️ Slot Management

* Add, update, remove parking slots
* State & location-based slot filtering
* Real-time availability tracking
* Infrastructure / maintenance alerts

### 📅 Booking System

* Preview & book parking slots
* 15-minute slab-based billing (₹5 per slab)
* Check-in & check-out flow
* Active booking detection
* Booking history with payment sync

### 💳 Payment Engine (Rule-Based)

* No-show penalty handling
* Late payment penalties (after 24 hours)
* Automatic slab calculation based on actual usage
* Payment preview before checkout
* Fully synced Booking ↔ Payment records

### 📊 User Dashboard APIs

* Profile data
* Booking & payment history
* Aggregated stats (total spent, average duration, active sessions)

### 🧑‍💼 Admin & Business Features

* Event management (CRUD + pagination + search)
* Company management
* Analytics-ready data models

### 🌱 Database Seeders

* Slot seeder (520+ slots across Indian states)
* Full demo data seeder:

  * Users (VIP, flakers, regular)
  * Past, current, and future bookings
  * Payments perfectly synced with bookings

---

## 🏗️ Tech Stack

* *Node.js* (>=18)
* *Express.js*
* *MongoDB + Mongoose*
* *JWT Authentication*
* *Nodemailer* (email support)
* *bcryptjs* (password hashing)
User Registration & Login (JWT-based authentication)

View parking locations on an interactive map

Select state → city → parking slot

Real-time slot booking

Secure payment simulation

Booking history with status (active, completed, paid, unpaid)

Profile dashboard

🅿️ Parking Management

Slot availability tracking

Booking duration calculation

Check-in / Check-out system

💳 Payment System

Payment breakdown view

Multiple payment method UI

Payment status tracking

Payment history

🗺️ Map Integration

Google Maps integration

Location-based parking visualization

🧱 Tech Stack
Frontend

React.js

CSS (Glassmorphism & modern UI)

React Router

Axios

Leaflet / React-Leaflet

Responsive design (mobile & desktop)

Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

Bcrypt (password hashing)

Nodemailer (email support)

CORS & dotenv

Deployment

Frontend: GitHub Pages

Backend: Localhost / Cloud-ready

Database: MongoDB Atlas / Local MongoDB

📂 Project Structure
Smart_Park/
│
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.js
│   │   └── App.css
│   └── public/
│
├── Frontend-static/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── package.json
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/BoomikaSanthos/Smart_Park.git
cd Smart_Park

2️⃣ Backend Setup
cd Backend
npm install

API Base URL


http://localhost:5000/api


---

## 🧭 Major API Endpoints

### Auth

* POST /api/auth/register
* POST /api/auth/login

### Slots

* POST /api/slots/add
* PUT /api/slots/manage/:slotNumber
* GET /api/slots/with-status
* GET /api/slots/states

### Bookings

* POST /api/bookings/preview-and-book
* PUT /api/bookings/checkin/:id
* PUT /api/bookings/checkout/:id
* GET /api/bookings/my-active
* GET /api/bookings/history

### Payments

* POST /api/payments/pay/:bookingId
* GET /api/payments/preview/:bookingId

### Users

* GET /api/user/profile
* GET /api/user/stats
* GET /api/user/bookings
* GET /api/user/profile-dashboard

### Admin / Events

* GET /api/events/events
* POST /api/events/events
* PUT /api/events/events/:id
* DELETE /api/events/events/:id

---

## ⚙️ Environment Variables

Create a .env file in the backend root:


PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password


> ⚠️ *Never commit .env to GitHub*

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

bash
npm install


### 2️⃣ Run Slot Seeder

bash
npm run seed


### 3️⃣ (Optional) Run Full Demo Seeder

bash
node backend/seed/dataSeeder.js


### 4️⃣ Start Server

bash
npm run dev


Server will run at:


http://localhost:5000


---
3️⃣ Frontend Setup (React)
cd Frontend
npm install
npm start


Frontend will run on:

http://localhost:3000

4️⃣ Static Frontend (Optional)

You can directly open:

Frontend-static/index.html

## ⏱️ Timezone Handling

* Server runs in *Asia/Kolkata (IST)*
* All booking & payment calculations follow IST

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


Start backend server:

npm run dev


Backend will run on:

http://localhost:5000


Used mainly for testing login API.

▶️ Usage

Register a new user

Login to access dashboard

Select parking state & location

View parking slots on map

Book a slot

Make payment

Track booking & payment history

Check-in and check-out

🔐 Authentication Flow

Passwords are securely hashed using bcrypt

JWT tokens are used for protected routes

Role-based access ready (user/admin)

🚀 Deployment
Frontend (GitHub Pages)
npm run deploy


Live URL:

https://BoomikaSanthos.github.io/Smart_Park

Backend

Can be deployed to Render / Railway / AWS / Vercel

Just update environment variables

🤝 Contributing

Contributions are welcome!
To contribute:

Fork the repository

Create a new branch (feature/your-feature)

Commit changes

Push to your fork

Open a Pull Request

🧪 Future Enhancements

Real-time slot updates using WebSockets

Admin dashboard

Real payment gateway (Razorpay / Stripe)

QR-based parking entry

Push notifications

📄 License

This project is licensed under the ISC License.

👩‍💻 Author

Boomika Santhos
GitHub: BoomikaSanthos
